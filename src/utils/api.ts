const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const accessToken = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token might be expired, try to refresh
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      // Retry the original request with the new token
      return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } else {
      // Refresh failed, clear tokens and force re-login
      clearTokens();
      window.location.href = '/'; // Or redirect to login page
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    setTokens(data.access, refreshToken); // Keep the same refresh token
    return data.access;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

export const startMigration = async (mode: 'FAST' | 'SLOW') => {
  return fetchWithAuth('/etl/migration/start/', {
    method: 'POST',
    body: JSON.stringify({ mode }),
  });
};

export const getMigrationHistory = async () => {
  return fetchWithAuth('/etl/migration/history/');
};

export const getMigrationStatus = async () => {
  return fetchWithAuth('/etl/migration/status/');
};

export const saveGoogleSheetsConfig = async (config: any) => {
  return fetchWithAuth('/configuration/google-sheets/', {
    method: 'POST',
    body: JSON.stringify(config),
  });
};

export const savePostgresConfig = async (config: any) => {
  return fetchWithAuth('/configuration/postgresql/', {
    method: 'POST',
    body: JSON.stringify(config),
  });
};
