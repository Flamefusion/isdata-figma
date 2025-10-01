import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Download, Upload, RefreshCw, CheckCircle, AlertCircle, Play, History } from 'lucide-react';
import { toast } from 'sonner';
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

const MOCK_HISTORY: MigrationHistory[] = [
  {
    id: 1,
    user: 'admin@example.com',
    start_time: new Date(Date.now() - 3600000).toISOString(),
    end_time: new Date(Date.now() - 3000000).toISOString(),
    mode: 'FAST',
    status: 'SUCCESS',
    total_records: 1500,
    migrated_records: 1500,
  },
  {
    id: 2,
    user: 'admin@example.com',
    start_time: new Date(Date.now() - 86400000).toISOString(),
    end_time: new Date(Date.now() - 86000000).toISOString(),
    mode: 'SLOW',
    status: 'FAILURE',
    total_records: 2500,
    migrated_records: 1250,
  },
];

export function Migration() {
  const [migrationJobs, setMigrationJobs] = useState<MigrationJob[]>([]);
  const [migrationHistory, setMigrationHistory] = useState<MigrationHistory[]>(MOCK_HISTORY);
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

  const runAllMigrations = async () => {
    setIsRunningMigration(true);
    setLogs(['🚀 Migration start']);
    toast.success(`Migration started in ${migrationMode} mode!`);

    const mockJobs: MigrationJob[] = [
      { id: '1', task_name: 'Migrating Users', status: 'PENDING', total_records: 1000, processed_records: 0 },
      { id: '2', task_name: 'Migrating Products', status: 'PENDING', total_records: 5000, processed_records: 0 },
      { id: '3', task_name: 'Migrating Orders', status: 'PENDING', total_records: 2500, processed_records: 0 },
    ];

    setMigrationJobs(mockJobs);

    // Simulate migration progress
    let totalProcessed = 0;
    const totalRecords = mockJobs.reduce((acc, job) => acc + job.total_records, 0);

    const interval = setInterval(() => {
      setMigrationJobs(prevJobs => {
        return prevJobs.map(job => {
          if (job.status !== 'SUCCESS' && job.status !== 'FAILURE') {
            const remaining = job.total_records - job.processed_records;
            const processed = Math.min(remaining, Math.floor(Math.random() * 500));
            job.processed_records += processed;
            totalProcessed += processed;
            if (job.processed_records >= job.total_records) {
              job.status = Math.random() > 0.1 ? 'SUCCESS' : 'FAILURE'; // 10% chance of failure
              if (job.status === 'FAILURE') {
                job.error = 'A simulated error occurred.';
              }
            } else {
              job.status = 'IN_PROGRESS';
            }
          }
          return { ...job };
        });
      });
      
      setLogs(prev => [...prev, `[INFO] Processed ${totalProcessed}/${totalRecords} records...`]);

      if (migrationJobs.every(j => j.status === 'SUCCESS' || j.status === 'FAILURE')) {
        clearInterval(interval);
        setIsRunningMigration(false);
        setLogs(prev => [...prev, '✅ Migration finished.']);
        toast.info('Migration complete!');
      }
    }, 1000);
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