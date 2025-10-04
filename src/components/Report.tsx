import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePicker } from './ui/date-picker';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, FileText, TrendingUp, Info, CheckCircle2, XCircle, Clock, AlertTriangle, Users, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getVendors, getDailyReport } from '../services/api';

// Type for the report data, based on backend response
interface DailyReport {
  date: string;
  vendor: string;
  totalReceived: number;
  totalAccepted: number;
  totalRejected: number;
  totalPending: number;
  yield: number;
  vqcBreakdown: {
    accepted: number;
    rejected: number;
    pending: number;
    rejectionReasons: { reason: string; count: number; percentage: number }[];
  };
  ftBreakdown: {
    accepted: number;
    rejected: number;
    pending: number;
    rejectionReasons: { reason: string; count: number; percentage: number }[];
  };
  hourlyData: { hour: string; received: number; accepted: number; rejected: number; pending: number }[];
  vendorBreakdown: any[];
}

export function Report() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [vendors, setVendors] = useState<string[]>(['all']);
  const [reportData, setReportData] = useState<DailyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const vendorList = await getVendors();
        setVendors(vendorList);
      } catch (error: any) {
        toast.error(`Failed to fetch vendors: ${error.message}`);
      }
    };
    fetchVendors();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedDate) {
      toast.error('Please select a date.');
      return;
    }
    setIsLoading(true);
    try {
      const config = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        vendor: selectedVendor,
      };
      const data = await getDailyReport(config);
      setReportData(data);
      toast.success('Report generated successfully');
    } catch (error: any) {
      toast.error(`Failed to generate report: ${error.message}`);
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Select Date</label>
              <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Select Vendor</label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {vendors.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm opacity-0">Actions</label>
              <Button onClick={handleGenerateReport} className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Total Received</p>
                <div className="text-3xl">{reportData.totalReceived.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Total Accepted</p>
                <div className="text-3xl text-green-600">{reportData.totalAccepted.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Total Rejected</p>
                <div className="text-3xl text-red-600">{reportData.totalRejected}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Total Pending</p>
                <div className="text-3xl text-yellow-600">{reportData.totalPending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Overall Yield</p>
                <div className="text-3xl text-purple-600">{reportData.yield}%</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>VQC Stage</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span>Accepted</span><span>{reportData.vqcBreakdown.accepted}</span></div>
                <div className="flex justify-between"><span>Rejected</span><span>{reportData.vqcBreakdown.rejected}</span></div>
                <div className="flex justify-between"><span>Pending</span><span>{reportData.vqcBreakdown.pending}</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>FT Stage</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span>Accepted</span><span>{reportData.ftBreakdown.accepted}</span></div>
                <div className="flex justify-between"><span>Rejected</span><span>{reportData.ftBreakdown.rejected}</span></div>
                <div className="flex justify-between"><span>Pending</span><span>{reportData.ftBreakdown.pending}</span></div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>VQC Rejection Reasons</CardTitle></CardHeader>
              <CardContent>
                {reportData.vqcBreakdown.rejectionReasons.map((item, index) => (
                  <div key={index} className="space-y-2 mb-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.reason}</span>
                      <span>{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${item.percentage}%` }} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>FT Rejection Reasons</CardTitle></CardHeader>
              <CardContent>
                {reportData.ftBreakdown.rejectionReasons.map((item, index) => (
                  <div key={index} className="space-y-2 mb-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.reason}</span>
                      <span>{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${item.percentage}%` }} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Hourly Production Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="received" fill="#8884d8" name="Received" />
                  <Bar dataKey="accepted" fill="#82ca9d" name="Accepted" />
                  <Bar dataKey="rejected" fill="#ff6b6b" name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}