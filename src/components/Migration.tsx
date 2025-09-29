import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Download, Upload, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MigrationJob {
  id: string;
  source: string;
  destination: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  records: number;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

export function Migration() {
  const [migrationJobs, setMigrationJobs] = useState<MigrationJob[]>([
    {
      id: '1',
      source: 'Vendor Data Sheet',
      destination: 'rings_vendor_data',
      status: 'completed',
      progress: 100,
      records: 1250,
      startTime: new Date('2024-01-15T10:00:00'),
      endTime: new Date('2024-01-15T10:05:30')
    },
    {
      id: '2',
      source: 'VQC Data Sheet',
      destination: 'rings_vqc_data',
      status: 'running',
      progress: 65,
      records: 890,
      startTime: new Date('2024-01-15T10:30:00')
    },
    {
      id: '3',
      source: 'FT Data Sheet',
      destination: 'rings_ft_data',
      status: 'pending',
      progress: 0,
      records: 0
    }
  ]);

  const [isRunningMigration, setIsRunningMigration] = useState(false);

  const startMigration = async (jobId: string) => {
    setIsRunningMigration(true);
    
    setMigrationJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: 'running', startTime: new Date(), progress: 0 }
        : job
    ));

    // Simulate migration progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMigrationJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, progress: i, records: Math.floor((i / 100) * 1000) }
          : job
      ));
    }

    setMigrationJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: 'completed', endTime: new Date(), progress: 100 }
        : job
    ));

    setIsRunningMigration(false);
    toast.success('Migration completed successfully!');
  };

  const runAllMigrations = async () => {
    for (const job of migrationJobs.filter(j => j.status === 'pending')) {
      await startMigration(job.id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Upload className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Migration</h2>
          <p className="text-muted-foreground">
            Migrate data from Google Sheets to PostgreSQL database
          </p>
        </div>
        <Button onClick={runAllMigrations} disabled={isRunningMigration}>
          <Download className="h-4 w-4 mr-2" />
          Run All Migrations
        </Button>
      </div>

      {/* Migration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Jobs</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{migrationJobs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {migrationJobs.filter(job => job.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Records</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {migrationJobs.reduce((sum, job) => sum + job.records, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Migration Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {migrationJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <h4 className="font-medium">{job.source}</h4>
                      <p className="text-sm text-muted-foreground">
                        → {job.destination}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                    {job.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => startMigration(job.id)}
                        disabled={isRunningMigration}
                      >
                        Start
                      </Button>
                    )}
                  </div>
                </div>

                {job.status === 'running' && (
                  <div className="space-y-2">
                    <Progress value={job.progress} />
                    <p className="text-sm text-muted-foreground">
                      {job.progress}% complete • {job.records} records processed
                    </p>
                  </div>
                )}

                {job.status === 'completed' && (
                  <div className="text-sm text-muted-foreground">
                    Completed {job.records.toLocaleString()} records in{' '}
                    {job.startTime && job.endTime && 
                      Math.round((job.endTime.getTime() - job.startTime.getTime()) / 1000)
                    } seconds
                  </div>
                )}

                {job.error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    Error: {job.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Migration History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Migration History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <span className="font-medium">Vendor Data Sheet</span>
                <span className="text-sm text-muted-foreground ml-2">→ rings_vendor_data</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Jan 15, 2024 10:05 AM • 1,250 records
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <span className="font-medium">VQC Data Sheet</span>
                <span className="text-sm text-muted-foreground ml-2">→ rings_vqc_data</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Jan 14, 2024 3:20 PM • 890 records
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <div>
                <span className="font-medium">FT Data Sheet</span>
                <span className="text-sm text-muted-foreground ml-2">→ rings_ft_data</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Jan 14, 2024 11:45 AM • 750 records
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}