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

interface User {
  username: string;
  role: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for saved login state on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedTheme = localStorage.getItem('darkMode');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedTheme) {
      const isDark = JSON.parse(savedTheme);
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  const handleLogin = (username: string, password: string) => {
    // Mock authentication - in real app, this would call an API
    const mockUsers = [
      { username: 'admin', password: 'admin123', role: 'Administrator' },
      { username: 'testuser', password: 'test123', role: 'User' },
      { username: 'manager', password: 'manager123', role: 'Manager' }
    ];

    const foundUser = mockUsers.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      const newUser = { username: foundUser.username, role: foundUser.role };
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setIsLoginModalOpen(false);
      toast.success(`Welcome back, ${foundUser.username}!`);
    } else {
      toast.error('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
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
          onSettingsClick={() => setIsSettingsOpen(!isSettingsOpen)}
          onLoginClick={() => setIsLoginModalOpen(true)}
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
              <Configuration />
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
                onClick={() => setIsLoginModalOpen(true)}
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