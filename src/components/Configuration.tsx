import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Database, Sheet, Key, Server, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function Configuration() {
  const [googleSheetsConfig, setGoogleSheetsConfig] = useState({
    serviceAccountJson: '',
    serviceAccountFile: null as File | null,
    serviceAccountPath: '',
    vendorDataUrl: '',
    vqcDataUrl: '',
    ftDataUrl: '',
    csDataUrl: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [postgresConfig, setPostgresConfig] = useState({
    host: 'localhost',
    port: '5432',
    database: 'rings_production',
    username: 'postgres',
    password: ''
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setGoogleSheetsConfig(prev => ({
          ...prev,
          serviceAccountFile: file,
          serviceAccountPath: file.name
        }));
        
        // Read file content for future use
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setGoogleSheetsConfig(prev => ({
            ...prev,
            serviceAccountJson: content
          }));
        };
        reader.readAsText(file);
        
        toast.success(`Service account file "${file.name}" loaded successfully!`);
      } else {
        toast.error('Please select a valid JSON file');
        event.target.value = '';
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = () => {
    setGoogleSheetsConfig(prev => ({
      ...prev,
      serviceAccountFile: null,
      serviceAccountPath: '',
      serviceAccountJson: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Service account file cleared');
  };

  const handleGoogleSheetsTest = () => {
    if (!googleSheetsConfig.serviceAccountFile) {
      toast.error('Please select a service account JSON file first');
      return;
    }
    // Mock test connection
    toast.success('Google Sheets connection test successful!');
  };

  const handlePostgresTest = () => {
    // Mock test connection
    toast.success('PostgreSQL connection test successful!');
  };

  const handleSaveConfig = () => {
    if (!googleSheetsConfig.serviceAccountFile) {
      toast.error('Please select a service account JSON file before saving');
      return;
    }
    // Mock save configuration
    toast.success('Configuration saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuration</h2>
        <p className="text-muted-foreground">
          Configure your Google Sheets and PostgreSQL database connections
        </p>
      </div>

      {/* Google Sheets Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sheet className="h-5 w-5" />
            Google Sheets Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serviceAccount">Service Account JSON File</Label>
            <div className="space-y-3">
              {/* File Input (Hidden) */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {/* File Path Display */}
              <div className="flex gap-2">
                <Input
                  id="serviceAccount"
                  placeholder="No file selected - Click Browse to select JSON file"
                  value={googleSheetsConfig.serviceAccountPath}
                  readOnly
                  className="flex-1 bg-gray-50 cursor-pointer"
                  onClick={handleBrowseClick}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBrowseClick}
                  className="flex items-center gap-2 px-4"
                >
                  <Upload className="h-4 w-4" />
                  Browse
                </Button>
                {googleSheetsConfig.serviceAccountFile && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClearFile}
                    className="px-3"
                    title="Clear selected file"
                  >
                    ✕
                  </Button>
                )}
              </div>
              
              {/* File Info */}
              {googleSheetsConfig.serviceAccountFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-50 p-2 rounded border">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span>
                    <strong>{googleSheetsConfig.serviceAccountFile.name}</strong> 
                    ({(googleSheetsConfig.serviceAccountFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendorUrl">Vendor Data URL</Label>
              <Input
                id="vendorUrl"
                placeholder="https://docs.google.com/spreadsheets/..."
                value={googleSheetsConfig.vendorDataUrl}
                onChange={(e) => setGoogleSheetsConfig(prev => ({ ...prev, vendorDataUrl: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vqcUrl">VQC Data URL</Label>
              <Input
                id="vqcUrl"
                placeholder="https://docs.google.com/spreadsheets/..."
                value={googleSheetsConfig.vqcDataUrl}
                onChange={(e) => setGoogleSheetsConfig(prev => ({ ...prev, vqcDataUrl: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ftUrl">FT Data URL</Label>
              <Input
                id="ftUrl"
                placeholder="https://docs.google.com/spreadsheets/..."
                value={googleSheetsConfig.ftDataUrl}
                onChange={(e) => setGoogleSheetsConfig(prev => ({ ...prev, ftDataUrl: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="csUrl">CS Data URL</Label>
              <Input
                id="csUrl"
                placeholder="https://docs.google.com/spreadsheets/..."
                value={googleSheetsConfig.csDataUrl}
                onChange={(e) => setGoogleSheetsConfig(prev => ({ ...prev, csDataUrl: e.target.value }))}
              />
            </div>
          </div>

          <Button onClick={handleGoogleSheetsTest} variant="outline" className="w-full">
            Test Google Sheets Connection
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* PostgreSQL Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            PostgreSQL Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                placeholder="localhost"
                value={postgresConfig.host}
                onChange={(e) => setPostgresConfig(prev => ({ ...prev, host: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                placeholder="5432"
                value={postgresConfig.port}
                onChange={(e) => setPostgresConfig(prev => ({ ...prev, port: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="database">Database Name</Label>
              <Input
                id="database"
                placeholder="rings_production"
                value={postgresConfig.database}
                onChange={(e) => setPostgresConfig(prev => ({ ...prev, database: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="postgres"
                value={postgresConfig.username}
                onChange={(e) => setPostgresConfig(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter database password"
                value={postgresConfig.password}
                onChange={(e) => setPostgresConfig(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>

          <Button onClick={handlePostgresTest} variant="outline" className="w-full">
            Test PostgreSQL Connection
          </Button>
        </CardContent>
      </Card>

      {/* Save Configuration */}
      <div className="flex justify-end">
        <Button onClick={handleSaveConfig} className="px-8">
          Save Configuration
        </Button>
      </div>
    </div>
  );
}