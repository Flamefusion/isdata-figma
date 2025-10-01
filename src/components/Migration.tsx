import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Download, Upload, RefreshCw, CheckCircle, AlertCircle, Play, History } from 'lucide-react';
import { toast } from 'sonner';
import { getMigrationHistory, getMigrationStatus, startMigration } from '../utils/api';
import { Label } from './ui/label';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

interface MigrationJob {
  id: string;
  task_name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILURE';
  total_records: number;
  processed_records: number;
  start_time?: string;
  end_time?: string;
  error?: string;
}

interface MigrationHistory {
  id: number;
  user: string;
  start_time: string;
  end_time: string;
  mode: 'FAST' | 'SLOW';
  status: 'SUCCESS' | 'FAILURE';
  total_records: number;
  migrated_records: number;
}

export function Migration() {
  const [migrationJobs, setMigrationJobs] = useState<MigrationJob[]>([]);
  const [migrationHistory, setMigrationHistory] = useState<MigrationHistory[]>([]);
  const [isRunningMigration, setIsRunningMigration] = useState(false);
  const [migrationMode, setMigrationMode] = useState<'FAST' | 'SLOW'>('FAST');
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const fetchMigrationHistory = async () => {
    try {
      const response = await getMigrationHistory();
      if (response.ok) {
        const data = await response.json();
        setMigrationHistory(data);
      } else {
        toast.error('Failed to fetch migration history.');
      }
    } catch (error) {
      toast.error('An error occurred while fetching migration history.');
    }
  };

  const fetchMigrationStatus = async () => {
    try {
      const response = await getMigrationStatus();
      if (response.ok) {
        const data = await response.json();
        if (data.is_running) {
          setIsRunningMigration(true);
          setMigrationJobs(data.tasks);
          setLogs(data.logs || []);
        } else {
          setIsRunningMigration(false);
          setMigrationJobs([]);
          if (logs.length > 0) { // If there were logs, it means a migration just finished
            fetchMigrationHistory(); // Refresh history
          }
          setLogs([]);
        }
      }
    } catch (error) {
      // Don't show toast here to avoid spamming on polling errors
      console.error('Error fetching migration status:', error);
    }
  };

  useEffect(() => {
    fetchMigrationHistory();
    const interval = setInterval(fetchMigrationStatus, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const runAllMigrations = async () => {
    try {
      const response = await startMigration(migrationMode);
      if (response.ok) {
        toast.success(`Migration started in ${migrationMode} mode!`);
        setIsRunningMigration(true);
        setLogs(['🚀 Migration start']);
      } else {
        const errorData = await response.json();
        toast.error('Failed to start migration.', {
          description: errorData.error || 'Unknown error',
        });
      }
    } catch (error) {
      toast.error('An error occurred while starting the migration.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'IN_PROGRESS':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'FAILURE':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Upload className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'FAILURE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const totalRecords = migrationJobs.reduce((sum, job) => sum + (job.total_records || 0), 0);
  const processedRecords = migrationJobs.reduce((sum, job) => sum + (job.processed_records || 0), 0);
  const overallProgress = totalRecords > 0 ? (processedRecords / totalRecords) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Migration</h2>
          <p className="text-muted-foreground">
            Migrate data from Google Sheets to PostgreSQL database
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Migration Mode:</Label>
            <ToggleGroup 
              type="single" 
              value={migrationMode}
              onValueChange={(value: 'FAST' | 'SLOW') => value && setMigrationMode(value)}
              disabled={isRunningMigration}
            >
              <ToggleGroupItem value="FAST">Fast</ToggleGroupItem>
              <ToggleGroupItem value="SLOW">Slow</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Button onClick={runAllMigrations} disabled={isRunningMigration}>
            <Play className="h-4 w-4 mr-2" />
            Run All Migrations
          </Button>
        </div>
      </div>

      {/* Migration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Overall Progress</CardTitle>
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRunningMigration ? 'animate-spin' : ''}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {processedRecords.toLocaleString()} / {totalRecords.toLocaleString()} records
            </p>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Status</CardTitle>
            {isRunningMigration 
              ? <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
              : <CheckCircle className="h-4 w-4 text-green-600" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isRunningMigration ? 'text-blue-600' : 'text-green-600'}`}>
              {isRunningMigration ? 'Running' : 'Idle'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isRunningMigration ? 'Migration is in progress...' : 'Ready to start migration.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Active Jobs</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{migrationJobs.length}</div>
             <p className="text-xs text-muted-foreground">
              {migrationJobs.filter(j => j.status === 'IN_PROGRESS').length} currently running
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Migration Jobs & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Migration Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isRunningMigration && migrationJobs.length > 0 ? (
                migrationJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <h4 className="font-medium">{job.task_name}</h4>
                        </div>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <Progress value={(job.processed_records / job.total_records) * 100} />
                      <p className="text-sm text-muted-foreground">
                        {((job.processed_records / job.total_records) * 100 || 0).toFixed(0)}% complete • {job.processed_records.toLocaleString()} / {job.total_records.toLocaleString()} records
                      </p>
                    </div>
                    
                    {job.error && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded mt-2">
                        Error: {job.error}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No active migration jobs.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Live Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-white font-mono text-xs rounded p-4 h-64 overflow-y-auto">
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


      {/* Migration History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Migration History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {migrationHistory.length > 0 ? migrationHistory.map(h => (
              <div key={h.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <span className={`font-medium ${h.status === 'FAILURE' ? 'text-red-600' : ''}`}>
                    Migration on {new Date(h.start_time).toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">by {h.user}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant={h.status === 'FAILURE' ? 'destructive' : 'default'}>
                    {h.status}
                  </Badge>
                  <span className="mx-2">|</span>
                  Mode: {h.mode}
                  <span className="mx-2">|</span>
                  {h.migrated_records.toLocaleString()} / {h.total_records.toLocaleString()} records
                </div>
              </div>
            )) : (
              <div className="text-center text-muted-foreground py-4">
                No migration history found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}