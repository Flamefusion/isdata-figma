import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Eye, RefreshCw, Download, Database } from 'lucide-react';

interface PreviewData {
  id: string;
  ringId: string;
  size: string;
  vendor: string;
  receivedDate: string;
  vqcStatus: string;
  ftStatus: string;
  batch: string;
  source: string;
}

const mockPreviewData: PreviewData[] = [
  {
    id: '1',
    ringId: 'RNG-2024-006',
    size: '7.0',
    vendor: 'Vendor A',
    receivedDate: '2024-01-16',
    vqcStatus: 'Pending',
    ftStatus: 'Pending',
    batch: 'B004',
    source: 'Google Sheets'
  },
  {
    id: '2',
    ringId: 'RNG-2024-007',
    size: '6.5',
    vendor: 'Vendor B',
    receivedDate: '2024-01-16',
    vqcStatus: 'Pending',
    ftStatus: 'Pending',
    batch: 'B004',
    source: 'Google Sheets'
  },
  {
    id: '3',
    ringId: 'RNG-2024-008',
    size: '8.0',
    vendor: 'Vendor C',
    receivedDate: '2024-01-16',
    vqcStatus: 'Pending',
    ftStatus: 'Pending',
    batch: 'B004',
    source: 'Google Sheets'
  }
];

export function Preview() {
  const [dataSource, setDataSource] = useState('google-sheets');
  const [previewData, setPreviewData] = useState(mockPreviewData);
  const [isLoading, setIsLoading] = useState(false);

  const refreshPreview = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const loadToDatabase = async () => {
    setIsLoading(true);
    // Simulate loading to database
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsLoading(false);
    alert('Data successfully loaded to database!');
  };

  const getSourceBadge = (source: string) => {
    const colors = {
      'Google Sheets': 'bg-green-100 text-green-800',
      'Database': 'bg-blue-100 text-blue-800',
      'CSV Upload': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {source}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Preview</h2>
          <p className="text-muted-foreground">
            Preview data before migrating to the database
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshPreview} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={loadToDatabase} disabled={isLoading}>
            <Database className="h-4 w-4 mr-2" />
            Load to Database
          </Button>
        </div>
      </div>

      {/* Data Source Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Data Source Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={dataSource} onValueChange={setDataSource}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google-sheets">Google Sheets</SelectItem>
                <SelectItem value="csv-upload">CSV Upload</SelectItem>
                <SelectItem value="database">Database</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={refreshPreview} disabled={isLoading}>
              Load Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Records</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{previewData.length}</div>
            <p className="text-xs text-muted-foreground">Ready for migration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>New Records</CardTitle>
            <Database className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{previewData.length}</div>
            <p className="text-xs text-muted-foreground">Not in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Duplicates</CardTitle>
            <RefreshCw className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">0</div>
            <p className="text-xs text-muted-foreground">Duplicate entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Data Quality</CardTitle>
            <Badge className="bg-green-100 text-green-800">Good</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <p className="text-xs text-muted-foreground">Complete fields</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Preview Table */}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ring ID</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Received Date</TableHead>
                  <TableHead>VQC Status</TableHead>
                  <TableHead>FT Status</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.ringId}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell>{item.vendor}</TableCell>
                    <TableCell>{item.receivedDate}</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-800">{item.vqcStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-800">{item.ftStatus}</Badge>
                    </TableCell>
                    <TableCell>{item.batch}</TableCell>
                    <TableCell>{getSourceBadge(item.source)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Data Validation */}
      <Card>
        <CardHeader>
          <CardTitle>Data Validation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Required fields validation</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Passed</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Data format validation</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Passed</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Duplicate check</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Passed</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Reference data validation</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Warning: 2 records</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Migration Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={loadToDatabase} disabled={isLoading}>
              <Database className="h-4 w-4 mr-2" />
              Migrate to Database
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Preview
            </Button>
            <Button variant="outline" onClick={refreshPreview} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}