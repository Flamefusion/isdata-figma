import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { LoginModal } from './components/LoginModal';
import { UserSettings } from './components/UserSettings';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { Configuration } from './components/Configuration';
import { Migration } from './components/Migration';
import { Preview } from './components/Preview';
import { Report } from './components/Report';
import { Search } from './components/Search';
import { RejectionTrends } from './components/RejectionTrends';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

import { fetchWithAuth, setTokens, clearTokens, getAccessToken } from './utils/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'NORMAL' | 'ADMIN' | 'SUPER';
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoginModalOpen, setIsLoginModal] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for saved login state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken();
      const savedTheme = localStorage.getItem('darkMode');

      if (token) {
        try {
          const response = await fetchWithAuth('/users/profile/');
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            clearTokens();
            console.error('Failed to fetch user profile:', response.statusText);
          }
        } catch (error) {
          clearTokens();
          console.error('Error fetching user profile:', error);
        }
      }

      if (savedTheme) {
        const isDark = JSON.parse(savedTheme);
        setIsDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
      }
    };
    initializeAuth();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await fetchWithAuth('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.access, data.refresh);
        
        // Fetch user profile after successful login
        const profileResponse = await fetchWithAuth('/users/profile/');
        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          setUser(userData);
          setIsLoginModal(false);
          toast.success(`Welcome back, ${userData.username}!`);
        } else {
          throw new Error('Failed to fetch user profile after login.');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred during login.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    clearTokens();
    setIsSettingsOpen(false);
    toast.success('Logged out successfully');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <Header
          username={user?.username}
          role={user?.role} // Pass user role to Header
          onSettingsClick={() => setIsSettingsOpen(!isSettingsOpen)}
          onLoginClick={() => setIsLoginModal(true)}
          isLoggedIn={isLoggedIn}
        />

        {isLoggedIn ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="migration">Migration</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="report">Report</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="rejection-trends">Rejection Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="home" className="mt-6">
              <Home />
            </TabsContent>

            <TabsContent value="configuration" className="mt-6">
              <Configuration userRole={user?.role} />
            </TabsContent>

            <TabsContent value="migration" className="mt-6">
              <Migration />
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              <Preview />
            </TabsContent>

            <TabsContent value="report" className="mt-6">
              <Report />
            </TabsContent>

            <TabsContent value="search" className="mt-6">
              <Search />
            </TabsContent>

            <TabsContent value="rejection-trends" className="mt-6">
              <RejectionTrends />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Welcome to Rings Dashboard</h2>
              <p className="text-muted-foreground">Please log in to access the production dashboard</p>
              <button
                onClick={() => setIsLoginModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login to Continue
              </button>
              <div className="text-sm text-muted-foreground mt-4">
                <p>Demo credentials:</p>
                <p>admin / admin123 • testuser / test123 • manager / manager123</p>
              </div>
            </div>
          </div>
        )}

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
        />

        <UserSettings
          username={user?.username || ''}
          email={user?.email || ''} // Pass user email to UserSettings
          role={user?.role || ''} // Pass user role to UserSettings
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onLogout={handleLogout}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
        
        <Toaster />
      </div>
    </div>
  );
}