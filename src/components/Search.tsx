import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { DatePicker } from './ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search as SearchIcon, Filter, Download, Eye, FilterX } from 'lucide-react';

interface RingData {
  id: string;
  ringId: string;
  size: string;
  vendor: string;
  receivedDate: string;
  vqcStatus: 'Accepted' | 'Rejected' | 'Pending';
  ftStatus: 'Accepted' | 'Rejected' | 'Pending' | 'N/A';
  rejectionReason?: string;
  batch: string;
}

const mockData: RingData[] = [
  {
    id: '1',
    ringId: 'RNG-2024-001',
    size: '7.0',
    vendor: 'Vendor A',
    receivedDate: '2024-01-15',
    vqcStatus: 'Accepted',
    ftStatus: 'Accepted',
    batch: 'B001'
  },
  {
    id: '2',
    ringId: 'RNG-2024-002',
    size: '6.5',
    vendor: 'Vendor B',
    receivedDate: '2024-01-15',
    vqcStatus: 'Rejected',
    ftStatus: 'N/A',
    rejectionReason: 'Surface defects',
    batch: 'B001'
  },
  {
    id: '3',
    ringId: 'RNG-2024-003',
    size: '8.0',
    vendor: 'Vendor A',
    receivedDate: '2024-01-14',
    vqcStatus: 'Accepted',
    ftStatus: 'Rejected',
    rejectionReason: 'Dimensional issues',
    batch: 'B002'
  },
  {
    id: '4',
    ringId: 'RNG-2024-004',
    size: '7.5',
    vendor: 'Vendor C',
    receivedDate: '2024-01-14',
    vqcStatus: 'Pending',
    ftStatus: 'Pending',
    batch: 'B002'
  },
  {
    id: '5',
    ringId: 'RNG-2024-005',
    size: '6.0',
    vendor: 'Vendor B',
    receivedDate: '2024-01-13',
    vqcStatus: 'Accepted',
    ftStatus: 'Accepted',
    batch: 'B003'
  }
];

export function Search() {
  const [serialNumbers, setSerialNumbers] = useState('');
  const [moNumbers, setMoNumbers] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [vendorFilter, setVendorFilter] = useState('All');
  const [vqcStatusFilter, setVqcStatusFilter] = useState('All');
  const [ftStatusFilter, setFtStatusFilter] = useState('All');
  const [rejectionReasonFilter, setRejectionReasonFilter] = useState('All');
  const [pcbFilter, setPcbFilter] = useState('All');
  const [qcCodeFilter, setQcCodeFilter] = useState('All');
  const [qcPersonFilter, setQcPersonFilter] = useState('All');
  const [filteredData, setFilteredData] = useState(mockData);

  const handleSearch = () => {
    let filtered = mockData;

    if (serialNumbers) {
      const serialList = serialNumbers.split(',').map(s => s.trim().toLowerCase());
      filtered = filtered.filter(item => 
        serialList.some(serial => item.ringId.toLowerCase().includes(serial))
      );
    }

    if (moNumbers) {
      const moList = moNumbers.split(',').map(s => s.trim().toLowerCase());
      filtered = filtered.filter(item => 
        moList.some(mo => item.batch.toLowerCase().includes(mo))
      );
    }

    if (dateFrom && dateTo) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.receivedDate);
        return itemDate >= dateFrom && itemDate <= dateTo;
      });
    }

    if (vendorFilter !== 'All') {
      filtered = filtered.filter(item => item.vendor === vendorFilter);
    }

    if (vqcStatusFilter !== 'All') {
      filtered = filtered.filter(item => item.vqcStatus === vqcStatusFilter);
    }

    if (ftStatusFilter !== 'All') {
      filtered = filtered.filter(item => item.ftStatus === ftStatusFilter);
    }

    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setSerialNumbers('');
    setMoNumbers('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setVendorFilter('All');
    setVqcStatusFilter('All');
    setFtStatusFilter('All');
    setRejectionReasonFilter('All');
    setPcbFilter('All');
    setQcCodeFilter('All');
    setQcPersonFilter('All');
    setFilteredData(mockData);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Accepted': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'N/A': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const exportData = () => {
    // Mock export functionality
    const csvContent = [
      ['Ring ID', 'Size', 'Vendor', 'Received Date', 'VQC Status', 'FT Status', 'Rejection Reason', 'Batch'],
      ...filteredData.map(item => [
        item.ringId,
        item.size,
        item.vendor,
        item.receivedDate,
        item.vqcStatus,
        item.ftStatus,
        item.rejectionReason || '',
        item.batch
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rings_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Search Filters Panel */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Filter className="h-5 w-5" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* First Row - Text Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serial-numbers">Serial Numbers</Label>
              <Input
                id="serial-numbers"
                placeholder="RNG000001, RNG000002..."
                value={serialNumbers}
                onChange={(e) => setSerialNumbers(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mo-numbers">MO Numbers</Label>
              <Input
                id="mo-numbers"
                placeholder="MO001, MO002..."
                value={moNumbers}
                onChange={(e) => setMoNumbers(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date From</Label>
              <DatePicker
                date={dateFrom}
                onDateChange={setDateFrom}
                placeholder="Select from date"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date To</Label>
              <DatePicker
                date={dateTo}
                onDateChange={setDateTo}
                placeholder="Select to date"
              />
            </div>
          </div>

          {/* Second Row - Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Vendor A">Vendor A</SelectItem>
                  <SelectItem value="Vendor B">Vendor B</SelectItem>
                  <SelectItem value="Vendor C">Vendor C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>VQC Status</Label>
              <Select value={vqcStatusFilter} onValueChange={setVqcStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>FT Status</Label>
              <Select value={ftStatusFilter} onValueChange={setFtStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="N/A">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Select value={rejectionReasonFilter} onValueChange={setRejectionReasonFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Surface defects">Surface defects</SelectItem>
                  <SelectItem value="Dimensional issues">Dimensional issues</SelectItem>
                  <SelectItem value="Material Quality">Material Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Third Row - Additional Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>PCB</Label>
              <Select value={pcbFilter} onValueChange={setPcbFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="PCB001">PCB001</SelectItem>
                  <SelectItem value="PCB002">PCB002</SelectItem>
                  <SelectItem value="PCB003">PCB003</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>QC Code</Label>
              <Select value={qcCodeFilter} onValueChange={setQcCodeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="QC001">QC001</SelectItem>
                  <SelectItem value="QC002">QC002</SelectItem>
                  <SelectItem value="QC003">QC003</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>QC Person</Label>
              <Select value={qcPersonFilter} onValueChange={setQcPersonFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="John Doe">John Doe</SelectItem>
                  <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                  <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              <SearchIcon className="h-4 w-4 mr-2" />
              Search Rings
            </Button>
            <Button onClick={exportData} variant="outline" className="bg-green-100 text-green-700 border-green-300 hover:bg-green-200">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={clearFilters} variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200">
              <FilterX className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Search Results ({filteredData.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ring ID</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Received Date</TableHead>
                <TableHead>VQC Status</TableHead>
                <TableHead>FT Status</TableHead>
                <TableHead>Rejection Reason</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.ringId}</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{item.vendor}</TableCell>
                  <TableCell>{item.receivedDate}</TableCell>
                  <TableCell>{getStatusBadge(item.vqcStatus)}</TableCell>
                  <TableCell>{getStatusBadge(item.ftStatus)}</TableCell>
                  <TableCell>{item.rejectionReason || '-'}</TableCell>
                  <TableCell>{item.batch}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}