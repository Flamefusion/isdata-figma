import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Eye, RefreshCw } from 'lucide-react';
import { getPreviewData } from '../services/api';
import { toast } from 'sonner';

// Data structure will be inferred from the API response
type RingData = any;

export function Preview() {
  const [previewData, setPreviewData] = useState<RingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getPreviewData();
      setPreviewData(data);
      toast.success(`Successfully fetched ${data.length} records.`);
    } catch (error: any) {
      toast.error(`Failed to fetch data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge variant="secondary">N/A</Badge>;
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('accept') || lowerStatus.includes('pass')) {
      return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
    }
    if (lowerStatus.includes('reject') || lowerStatus.includes('fail')) {
      return <Badge variant="destructive">{status}</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Database Preview</h2>
          <p className="text-muted-foreground">
            A preview of the most recent data in the database.
          </p>
        </div>
        <Button onClick={fetchData} disabled={isLoading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Total Records</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{previewData.length}</div>
          <p className="text-xs text-muted-foreground">Records currently in the database</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Loading preview data...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>MO Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>VQC Status</TableHead>
                    <TableHead>FT Status</TableHead>
                    <TableHead>PCB</TableHead>
                    <TableHead>QC Person</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {previewData.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.serial_number}</TableCell>
                        <TableCell>{item.vendor}</TableCell>
                        <TableCell>{item.mo_number}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{getStatusBadge(item.vqc_status)}</TableCell>
                        <TableCell>{getStatusBadge(item.ft_status)}</TableCell>
                        <TableCell>{item.pcb}</TableCell>
                        <TableCell>{item.qc_person}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}