import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { DatePicker } from './ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search as SearchIcon, Filter, Download, FilterX, Loader2 } from 'lucide-react';
import { getSearchFilters, searchRings, exportSearchResults } from '../services/api';
import { toast } from 'sonner';

type RingData = any;

interface FilterOptions {
  vendors: string[];
  vqc_statuses: string[];
  ft_statuses: string[];
  reasons: string[];
  pcbs: string[];
  qccodes: string[];
  qcpersons: string[];
}

export function Search() {
  const [filters, setFilters] = useState({
    serialNumbers: '',
    moNumbers: '',
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    vendor: [] as string[],
    vqcStatus: [] as string[],
    ftStatus: [] as string[],
    rejectionReason: [] as string[],
    pcb: [] as string[],
    qccode: [] as string[],
    qcperson: [] as string[],
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    vendors: [],
    vqc_statuses: [],
    ft_statuses: [],
    reasons: [],
    pcbs: [],
    qccodes: [],
    qcpersons: [],
  });
  const [searchResults, setSearchResults] = useState<RingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const options = await getSearchFilters();
        setFilterOptions(options);
      } catch (error: any) {
        toast.error(`Failed to load filter options: ${error.message}`);
      }
    };
    fetchFilters();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const searchParams = {
        ...filters,
        dateFrom: filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : undefined,
        dateTo: filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : undefined,
      };
      const results = await searchRings(searchParams);
      setSearchResults(results);
      toast.success(`Found ${results.length} records.`);
    } catch (error: any) {
      toast.error(`Search failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
        const searchParams = {
            ...filters,
            dateFrom: filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : undefined,
            dateTo: filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : undefined,
          };
      await exportSearchResults(searchParams);
      toast.success('Export started successfully.');
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  const clearFilters = () => {
    setFilters({
      serialNumbers: '',
      moNumbers: '',
      dateFrom: undefined,
      dateTo: undefined,
      vendor: [],
      vqcStatus: [],
      ftStatus: [],
      rejectionReason: [],
      pcb: [],
      qccode: [],
      qcperson: [],
    });
    setSearchResults([]);
    toast.info('Filters cleared.');
  };

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serial-numbers">Serial Numbers</Label>
              <Input
                id="serial-numbers"
                placeholder="RNG001, RNG002..."
                value={filters.serialNumbers}
                onChange={(e) => setFilters(f => ({ ...f, serialNumbers: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mo-numbers">MO Numbers</Label>
              <Input
                id="mo-numbers"
                placeholder="MO001, MO002..."
                value={filters.moNumbers}
                onChange={(e) => setFilters(f => ({ ...f, moNumbers: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Date From</Label>
              <DatePicker
                date={filters.dateFrom}
                onDateChange={(date) => setFilters(f => ({ ...f, dateFrom: date }))}
                placeholder="Select from date"
              />
            </div>
            <div className="space-y-2">
              <Label>Date To</Label>
              <DatePicker
                date={filters.dateTo}
                onDateChange={(date) => setFilters(f => ({ ...f, dateTo: date }))}
                placeholder="Select to date"
              />
            </div>
          </div>

          {/* Dropdown filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Vendor */}
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select onValueChange={(value) => setFilters(f => ({ ...f, vendor: value === 'All' ? [] : [value] }))}>
                <SelectTrigger><SelectValue placeholder="All Vendors" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Vendors</SelectItem>
                  {filterOptions.vendors.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* VQC Status */}
            <div className="space-y-2">
              <Label>VQC Status</Label>
              <Select onValueChange={(value) => setFilters(f => ({ ...f, vqcStatus: value === 'All' ? [] : [value] }))}>
                <SelectTrigger><SelectValue placeholder="All VQC Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All VQC Statuses</SelectItem>
                  {filterOptions.vqc_statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* FT Status */}
            <div className="space-y-2">
              <Label>FT Status</Label>
              <Select onValueChange={(value) => setFilters(f => ({ ...f, ftStatus: value === 'All' ? [] : [value] }))}>
                <SelectTrigger><SelectValue placeholder="All FT Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All FT Statuses</SelectItem>
                  {filterOptions.ft_statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Rejection Reason */}
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Select onValueChange={(value) => setFilters(f => ({ ...f, rejectionReason: value === 'All' ? [] : [value] }))}>
                <SelectTrigger><SelectValue placeholder="All Reasons" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Reasons</SelectItem>
                  {filterOptions.reasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4 mr-2" />}
              Search
            </Button>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={clearFilters} variant="outline">
              <FilterX className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Results ({searchResults.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>MO Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>VQC Status</TableHead>
                <TableHead>FT Status</TableHead>
                <TableHead>VQC Reason</TableHead>
                <TableHead>FT Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchResults.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.serial_number}</TableCell>
                  <TableCell>{item.vendor}</TableCell>
                  <TableCell>{item.mo_number}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{getStatusBadge(item.vqc_status)}</TableCell>
                  <TableCell>{getStatusBadge(item.ft_status)}</TableCell>
                  <TableCell>{item.vqc_reason || '-'}</TableCell>
                  <TableCell>{item.ft_reason || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}