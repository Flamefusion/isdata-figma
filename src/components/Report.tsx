import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePicker } from './ui/date-picker';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, FileText, TrendingUp, Package, Info, CheckCircle2, XCircle, Clock, AlertTriangle, Eye, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';

const dailyReportData = [
  {
    date: '2024-01-10',
    received: 45,
    vqcAccepted: 38,
    vqcRejected: 7,
    ftAccepted: 32,
    ftRejected: 6,
    pending: 5
  },
  {
    date: '2024-01-11',
    received: 52,
    vqcAccepted: 44,
    vqcRejected: 8,
    ftAccepted: 39,
    ftRejected: 5,
    pending: 8
  },
  {
    date: '2024-01-12',
    received: 38,
    vqcAccepted: 32,
    vqcRejected: 6,
    ftAccepted: 28,
    ftRejected: 4,
    pending: 6
  },
  {
    date: '2024-01-13',
    received: 41,
    vqcAccepted: 35,
    vqcRejected: 6,
    ftAccepted: 31,
    ftRejected: 4,
    pending: 6
  },
  {
    date: '2024-01-14',
    received: 35,
    vqcAccepted: 30,
    vqcRejected: 5,
    ftAccepted: 26,
    ftRejected: 4,
    pending: 5
  },
  {
    date: '2024-01-15',
    received: 48,
    vqcAccepted: 41,
    vqcRejected: 7,
    ftAccepted: 36,
    ftRejected: 5,
    pending: 7
  },
  {
    date: '2024-01-16',
    received: 55,
    vqcAccepted: 47,
    vqcRejected: 8,
    ftAccepted: 42,
    ftRejected: 5,
    pending: 8
  }
];

const todayData = {
  date: '2024-01-16',
  received: 55,
  vqcAccepted: 47,
  vqcRejected: 8,
  ftAccepted: 42,
  ftRejected: 5,
  pending: 8,
  vqcAcceptanceRate: 85.5,
  ftAcceptanceRate: 89.4,
  overallEfficiency: 87.3
};

// Mock production data based on screenshot
const productionData = {
  totalReceived: 3788,
  totalAccepted: 3442,
  totalRejected: 346,
  totalPending: 0,
  overallYield: 90.87,
  vqcStage: {
    accepted: 3507,
    rejected: 281,
    pending: 0
  },
  ftStage: {
    accepted: 3442,
    rejected: 66,
    pending: 280
  },
  finalStatus: {
    accepted: 3442,
    rejected: 346,
    pending: 0
  }
};

// VQC Rejection Reasons
const vqcRejectionReasons = [
  { reason: 'MICRO BUBBLES', count: 52, percentage: 18.6 },
  { reason: 'SIDE SCRATCH (EMERY)', count: 29, percentage: 10.4 },
  { reason: 'SIDE SCRATCH', count: 23, percentage: 8.2 },
  { reason: 'SCRATCHES ON SHELL & SIDE SHELL', count: 21, percentage: 7.5 },
  { reason: 'WHITE PATCH ON BLACK TAPE', count: 17, percentage: 6.1 },
  { reason: 'NOT ADVERTISING (WINGLESS PCB)', count: 17, percentage: 6.1 },
  { reason: 'RESIN DAMAGE', count: 16, percentage: 5.7 },
  { reason: 'IMPROPER RESIN FINISH', count: 15, percentage: 5.4 }
];

// FT Rejection Reasons
const ftRejectionReasons = [
  { reason: 'NOT ADVERTISING (WINGLESS PCB)', count: 56, percentage: 84.8 },
  { reason: 'SENSOR ISSUE', count: 5, percentage: 7.6 },
  { reason: 'CURRENT ISSUE', count: 3, percentage: 4.5 },
  { reason: 'ALIGNMENT ISSUE', count: 1, percentage: 1.5 },
  { reason: 'NO NOTIFICATION IN CDT', count: 1, percentage: 1.5 }
];

export function Report() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2025, 8, 1)); // Sept 1, 2025
  const [selectedVendor, setSelectedVendor] = useState('all-vendors');
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState('7days');

  const handleGenerateReport = () => {
    toast.success('Report generated successfully');
  };

  const exportReport = () => {
    // Mock export functionality
    const reportData = {
      reportType,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      data: productionData
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rings_report_${selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'report'}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Daily Production Report Header */}
      <Card className="bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="mb-1">Daily Production Report</h2>
              <p className="text-sm text-muted-foreground mb-4">Real-time tracking with correct VQC/FT logic</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">Select Date</label>
                  <DatePicker
                    date={selectedDate}
                    onDateChange={setSelectedDate}
                    placeholder="01-09-2025"
                  />
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
                      <SelectItem value="all-vendors">All Vendors</SelectItem>
                      <SelectItem value="vendor-a">Vendor A</SelectItem>
                      <SelectItem value="vendor-b">Vendor B</SelectItem>
                      <SelectItem value="vendor-c">Vendor C</SelectItem>
                      <SelectItem value="3de-tech">3DE TECH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm opacity-0">Actions</label>
                  <Button
                    onClick={handleGenerateReport}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Received</p>
                <div className="text-3xl text-blue-600">{productionData.totalReceived.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-2">rings processed</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Accepted</p>
                <div className="text-3xl text-green-600">{productionData.totalAccepted.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-2">quality passed</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Rejected</p>
                <div className="text-3xl text-red-600">{productionData.totalRejected}</div>
                <p className="text-xs text-muted-foreground mt-2">quality failed</p>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Pending</p>
                <div className="text-3xl text-yellow-600">{productionData.totalPending}</div>
                <p className="text-xs text-muted-foreground mt-2">awaiting process</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Overall Yield</p>
                <div className="text-3xl text-purple-600">{productionData.overallYield}%</div>
                <p className="text-xs text-muted-foreground mt-2">acceptance rate</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stage Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* VQC Stage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Eye className="w-5 h-5" />
              VQC Stage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-green-600">Accepted</span>
              <span>{productionData.vqcStage.accepted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-600">Rejected</span>
              <span>{productionData.vqcStage.rejected}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-yellow-600">Pending</span>
              <span>{productionData.vqcStage.pending}</span>
            </div>
          </CardContent>
        </Card>

        {/* FT Stage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <CheckCircle2 className="w-5 h-5" />
              FT Stage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-green-600">Accepted</span>
              <span>{productionData.ftStage.accepted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-600">Rejected</span>
              <span>{productionData.ftStage.rejected}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-yellow-600">Pending</span>
              <span>{productionData.ftStage.pending}</span>
            </div>
          </CardContent>
        </Card>

        {/* Final Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Clock className="w-5 h-5" />
              Final Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-green-600">Accepted</span>
              <span>{productionData.finalStatus.accepted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-600">Rejected</span>
              <span>{productionData.finalStatus.rejected}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-yellow-600">Pending</span>
              <span>{productionData.finalStatus.pending}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rejection Reasons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VQC Rejection Reasons */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <CardTitle>VQC Rejection Reasons</CardTitle>
                <p className="text-sm text-muted-foreground">({productionData.vqcStage.rejected} total)</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {vqcRejectionReasons.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.reason}</span>
                  <span className="text-muted-foreground">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-orange-500 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* FT Rejection Reasons */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <CardTitle>FT Rejection Reasons</CardTitle>
                <p className="text-sm text-muted-foreground">({productionData.ftStage.rejected} total)</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {ftRejectionReasons.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.reason}</span>
                  <span className="text-muted-foreground">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-orange-500 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Daily Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Production Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailyReportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
              />
              <Line type="monotone" dataKey="received" stroke="#8884d8" name="Received" strokeWidth={2} />
              <Line type="monotone" dataKey="vqcAccepted" stroke="#10b981" name="VQC Accepted" strokeWidth={2} />
              <Line type="monotone" dataKey="ftAccepted" stroke="#3b82f6" name="FT Accepted" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Acceptance Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Acceptance Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyReportData.map(item => ({
                ...item,
                vqcRate: ((item.vqcAccepted / (item.vqcAccepted + item.vqcRejected)) * 100).toFixed(1),
                ftRate: ((item.ftAccepted / (item.ftAccepted + item.ftRejected)) * 100).toFixed(1)
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="vqcRate" fill="#10b981" name="VQC Rate %" />
                <Bar dataKey="ftRate" fill="#3b82f6" name="FT Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyReportData.slice(-3).map((day, index) => (
                <div key={index} className="border-b pb-3 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{format(new Date(day.date), 'MMM dd, yyyy')}</h4>
                    <div className="text-sm text-muted-foreground">
                      {day.received} received
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-green-600">VQC: {day.vqcAccepted} accepted</div>
                      <div className="text-red-600">VQC: {day.vqcRejected} rejected</div>
                    </div>
                    <div>
                      <div className="text-blue-600">FT: {day.ftAccepted} accepted</div>
                      <div className="text-orange-600">FT: {day.ftRejected} rejected</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Report Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={handleGenerateReport}>
              <FileText className="h-4 w-4 mr-2" />
              Generate PDF Report
            </Button>
            <Button variant="outline" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Email Report
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Reports are automatically generated daily at 11:59 PM and sent to configured recipients.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}