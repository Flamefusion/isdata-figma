// A central place for all API calls

const API_BASE_URL = '/api'; // Using proxy

// Generic fetch wrapper
async function apiFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// DB Configuration
export const testDbConnection = (config: any) => apiFetch('/db/test', {
  method: 'POST',
  body: JSON.stringify(config),
});

export const createDbSchema = () => apiFetch('/db/schema', {
  method: 'POST',
});

export const clearDb = () => apiFetch('/db/clear', {
  method: 'DELETE',
});

// Google Sheets Configuration
export const testSheetsConnection = (config: any) => apiFetch('/test_sheets_connection', {
    method: 'POST',
    body: JSON.stringify(config),
});

// Migration
export const startMigration = async (config: any, onProgress: (log: string) => void) => {
    const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
    });

    if (!response.body) {
        throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // SSE format is "data: message\n\n"
        const lines = chunk.split('\n\n');
        lines.forEach(line => {
            if (line.startsWith('data: ')) {
                onProgress(line.substring(6));
            }
        });
    }
};

// Preview Data
export const getPreviewData = () => apiFetch('/data');

// Search
export const getSearchFilters = () => apiFetch('/search/filters');
export const searchRings = (filters: any) => apiFetch('/search', {
    method: 'POST',
    body: JSON.stringify(filters),
});
export const exportSearchResults = async (filters: any) => {
    const response = await fetch('/api/search/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'search_results.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
};


// Reports
export const getVendors = () => apiFetch('/vendors');
export const getDailyReport = (config: any) => apiFetch('/daily_report', {
    method: 'POST',
    body: JSON.stringify(config),
});
export const getRejectionTrends = (config: any) => apiFetch('/rejection_trends', {
    method: 'POST',
    body: JSON.stringify(config),
});

// Home
export const getHomeSummary = (params: { startDate: string, endDate: string }) => {
    const urlParams = new URLSearchParams(params);
    return apiFetch(`/home/summary?${urlParams.toString()}`);
};
