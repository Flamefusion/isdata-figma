import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TrendingDown, Calendar, Download, Database, Users, Layers, Loader2 } from 'lucide-react';
import { DatePicker } from './ui/date-picker';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import { getVendors, getRejectionTrends } from '../services/api';
import { format } from 'date-fns';

interface RejectionData {
  dateRange: string[];
  vendor: string;
  dateFrom: string;
  dateTo: string;
  rejectionData: any[];
  summary: {
    totalRejections: number;
    stageWiseTotals: { [key: string]: number };
    dateRange: number;
  };
}

export function RejectionTrends() {
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [vendor, setVendor] = useState('all');
  const [vendors, setVendors] = useState<string[]>(['all']);
  const [rejectionStage, setRejectionStage] = useState<'both' | 'vqc' | 'ft'>('both');
  const [reportData, setReportData] = useState<RejectionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const vendorList = await getVendors();
        setVendors(vendorList);
        if (vendorList.length > 1) {
            setVendor(vendorList[1]); // Select the first vendor by default
        }
      } catch (error: any) {
        toast.error(`Failed to fetch vendors: ${error.message}`);
      }
    };
    fetchVendors();
  }, []);

  const handleLoadData = async () => {
    if (!fromDate || !toDate || !vendor) {
      toast.error('Please select from date, to date, and vendor.');
      return;
    }
    setIsLoading(true);
    try {
      const config = {
        dateFrom: format(fromDate, 'yyyy-MM-dd'),
        dateTo: format(toDate, 'yyyy-MM-dd'),
        vendor: vendor,
        rejectionStage: rejectionStage,
      };
      const data = await getRejectionTrends(config);
      setReportData(data);
      toast.success('Rejection trends data loaded successfully.');
    } catch (error: any) {
      toast.error(`Failed to load data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-transparent';
    if (count <= 3) return 'bg-green-100 dark:bg-green-900/30';
    if (count <= 7) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm">From Date</label>
              <DatePicker date={fromDate} onDateChange={setFromDate} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">To Date</label>
              <DatePicker date={toDate} onDateChange={setToDate} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Vendor</label>
              <Select value={vendor} onValueChange={setVendor}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {vendors.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Rejection Stage</label>
              <Select value={rejectionStage} onValueChange={(value: 'both' | 'vqc' | 'ft') => setRejectionStage(value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="vqc">VQC</SelectItem>
                  <SelectItem value="ft">FT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm opacity-0">Actions</label>
              <Button onClick={handleLoadData} className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
                Load Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Object.entries(reportData.summary.stageWiseTotals).map(([stage, total]) => (
              <Card key={stage}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">{stage}</p>
                  <div className="text-3xl">{total}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rejection Trends for {reportData.vendor}</CardTitle>
              <p className="text-sm text-muted-foreground">
                From {reportData.dateFrom} to {reportData.dateTo}
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 z-20 bg-background w-[120px]">Stage</TableHead>
                      <TableHead className="sticky left-[120px] z-20 bg-background w-[300px]">Rejection Type</TableHead>
                      {reportData.dateRange.map(date => <TableHead key={date} className="text-center">{format(new Date(date), 'MMM dd')}</TableHead>)}
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.rejectionData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="sticky left-0 z-10 bg-background">{row.stage}</TableCell>
                        <TableCell className="sticky left-[120px] z-10 bg-background">{row.rejection}</TableCell>
                        {reportData.dateRange.map(date => (
                          <TableCell key={date} className={`text-center ${getCellColor(row.dateWiseData[date])}`}>
                            {row.dateWiseData[date] || '-'}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{row.totals.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}