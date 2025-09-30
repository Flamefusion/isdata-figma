import React from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Database } from 'lucide-react';

interface HeaderProps {
  username?: string;
  onSettingsClick: () => void;
  onLoginClick: () => void;
  isLoggedIn: boolean;
}

export function Header({ username, onSettingsClick, onLoginClick, isLoggedIn }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 p-2 bg-blue-100 rounded-lg">
          <Database className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rings Dashboard</h1>
          <p className="text-sm text-gray-600">Production Data Management System</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <Button
            variant="ghost"
            onClick={onSettingsClick}
            className="flex items-center gap-2 p-2"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-600 text-white">
                {username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">{username}</span>
          </Button>
        ) : (
          <Button onClick={onLoginClick}>
            Login
          </Button>
        )}
      </div>
    </div>
  );
}