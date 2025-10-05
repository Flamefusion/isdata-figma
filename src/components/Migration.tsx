import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Play, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { startMigration } from '../services/api';
import { useAppState } from '../context/AppStateContext';

export function Migration() {
  const { state } = useAppState();
  const [isMigrating, setIsMigrating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'success' | 'failure'>('idle');
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const handleStartMigration = async () => {
    setIsMigrating(true);
    setLogs(['🚀 Migration started...']);
    setMigrationStatus('running');
    toast.success('Migration started!');

    try {
      const { googleSheetsConfig } = state.configuration;
      const config = {
        serviceAccountContent: JSON.parse(googleSheetsConfig.serviceAccountJson),
        vendorDataUrl: googleSheetsConfig.vendorDataUrl,
        vqcDataUrl: googleSheetsConfig.vqcDataUrl,
        ftDataUrl: googleSheetsConfig.ftDataUrl,
      };

      await startMigration(config, (log) => {
        setLogs(prevLogs => [...prevLogs, log]);
      });

      setMigrationStatus('success');
      toast.success('Migration completed successfully!');
    } catch (error: any) {
      setMigrationStatus('failure');
      setLogs(prevLogs => [...prevLogs, `❌ Error: ${error.message}`]);
      toast.error(`Migration failed: ${error.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const getStatusCard = () => {
    switch (migrationStatus) {
      case 'running':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Status</CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Running</div>
              <p className="text-xs text-muted-foreground">Migration is in progress...</p>
            </CardContent>
          </Card>
        );
      case 'success':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Success</div>
              <p className="text-xs text-muted-foreground">Migration completed successfully.</p>
            </CardContent>
          </Card>
        );
      case 'failure':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Status</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">Failure</div>
              <p className="text-xs text-muted-foreground">Migration failed. Check logs for details.</p>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Idle</div>
              <p className="text-xs text-muted-foreground">Ready to start migration.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Migration</h2>
          <p className="text-muted-foreground">
            Migrate data from Google Sheets to PostgreSQL database
          </p>
        </div>
        <Button onClick={handleStartMigration} disabled={isMigrating}>
          <Play className="h-4 w-4 mr-2" />
          {isMigrating ? 'Migrating...' : 'Start Migration'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
            {getStatusCard()}
        </div>

        <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Live Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted text-muted font-mono text-xs rounded p-4 h-96 overflow-y-auto">
                  {logs.length > 0 ? logs.map((log, index) => (
                    <div key={index}>{log}</div>
                  )) : (
                    <div className="text-gray-500">Waiting for migration to start...</div>
                  )}
                  <div ref={logsEndRef} />
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}