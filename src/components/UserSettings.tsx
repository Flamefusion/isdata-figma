import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { User, LogOut, Settings, Mail, Tag } from 'lucide-react'; // Added Mail and Tag icons

interface UserSettingsProps {
  username: string;
  email: string; // Added email
  role: string; // Added role
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function UserSettings({ 
  username, 
  email,
  role,
  isDarkMode, 
  onToggleDarkMode, 
  onLogout, 
  isOpen, 
  onClose 
}: UserSettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute top-16 right-6" onClick={(e) => e.stopPropagation()}>
        <Card className="w-72 shadow-lg border">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Settings</h3>
              <Settings className="h-4 w-4" />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex items-center gap-2 cursor-pointer">
                Dark Mode
              </Label>
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={onToggleDarkMode}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{username}</span>
              </div>
              {email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{email}</span>
                </div>
              )}
              {role && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>{role}</span>
                </div>
              )}
            </div>
            
            <Button 
              onClick={onLogout}
              variant="destructive"
              className="w-full flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}