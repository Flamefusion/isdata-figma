import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TrendingDown, AlertTriangle, Target, Calendar, Download, Database, Users, Layers } from 'lucide-react';
import { DatePicker } from './ui/date-picker';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner@2.0.3';

const rejectionTrendData = [
  { month: 'Jan', vqcRejected: 45, ftRejected: 12, total: 57 },
  { month: 'Feb', vqcRejected: 52, ftRejected: 18, total: 70 },
  { month: 'Mar', vqcRejected: 38, ftRejected: 15, total: 53 },
  { month: 'Apr', vqcRejected: 41, ftRejected: 8, total: 49 },
  { month: 'May', vqcRejected: 35, ftRejected: 14, total: 49 },
  { month: 'Jun', vqcRejected: 48, ftRejected: 16, total: 64 }
];

const rejectionReasons = [
  { reason: 'Surface Defects', count: 128, percentage: 42.1, color: '#ef4444' },
  { reason: 'Dimensional Issues', count: 89, percentage: 29.3, color: '#f97316' },
  { reason: 'Material Quality', count: 52, percentage: 17.1, color: '#eab308' },
  { reason: 'Finish Problems', count: 35, percentage: 11.5, color: '#84cc16' }
];

const vendorRejectionData = [
  { vendor: 'Vendor A', rejected: 45, total: 280, rate: 16.1 },
  { vendor: 'Vendor B', rejected: 78, total: 320, rate: 24.4 },
  { vendor: 'Vendor C', rejected: 32, total: 180, rate: 17.8 },
  { vendor: 'Vendor D', rejected: 28, total: 220, rate: 12.7 }
];

const sizeRejectionData = [
  { size: '6.0', rejected: 28, total: 180, rate: 15.6 },
  { size: '6.5', rejected: 35, total: 220, rate: 15.9 },
  { size: '7.0', rejected: 42, total: 280, rate: 15.0 },
  { size: '7.5', rejected: 38, total: 250, rate: 15.2 },
  { size: '8.0', rejected: 25, total: 180, rate: 13.9 },
  { size: '8.5', rejected: 15, total: 140, rate: 10.7 }
];

// Detailed rejection data by stage, type, and date
const detailedRejectionData = [
  // ASSEMBLY
  { stage: 'ASSEMBLY', rejectionType: 'BLACK GLUE', sep1: 0, sep2: 0, sep3: 0, sep4: 0, sep5: 0, sep6: 0, sep7: 0, sep8: 0, sep9: 0, sep10: 0 },
  { stage: 'ASSEMBLY', rejectionType: 'ULTRAHUMAN TEXT SMUDGED', sep1: 0, sep2: 0, sep3: 0, sep4: 0, sep5: 0, sep6: 0, sep7: 0, sep8: 0, sep9: 0, sep10: 0 },
  { stage: 'ASSEMBLY', rejectionType: 'WHITE PATCH ON BATTERY', sep1: 8, sep2: 0, sep3: 1, sep4: 0, sep5: 5, sep6: 0, sep7: 0, sep8: 4, sep9: 6, sep10: 7 },
  { stage: 'ASSEMBLY', rejectionType: 'WHITE PATCH ON BLACK TAPE', sep1: 17, sep2: 11, sep3: 4, sep4: 7, sep5: 0, sep6: 5, sep7: 0, sep8: 0, sep9: 0, sep10: 7 },
  { stage: 'ASSEMBLY', rejectionType: 'WHITE PATCH ON PCB', sep1: 7, sep2: 2, sep3: 0, sep4: 1, sep5: 0, sep6: 1, sep7: 0, sep8: 0, sep9: 0, sep10: 1 },
  { stage: 'ASSEMBLY', rejectionType: 'WHITE PATCH ON TAPE NEAR BATTERY', sep1: 0, sep2: 0, sep3: 0, sep4: 0, sep5: 0, sep6: 0, sep7: 0, sep8: 0, sep9: 0, sep10: 0 },
  { stage: 'ASSEMBLY', rejectionType: 'WRONG RX COIL', sep1: 0, sep2: 0, sep3: 1, sep4: 0, sep5: 0, sep6: 0, sep7: 0, sep8: 0, sep9: 0, sep10: 0 },
  // CASTING
  { stage: 'CASTING', rejectionType: 'MICRO BUBBLES', sep1: 52, sep2: 15, sep3: 7, sep4: 11, sep5: 1, sep6: 4, sep7: 0, sep8: 1, sep9: 1, sep10: 5 },
  { stage: 'CASTING', rejectionType: 'ALIGNMENT ISSUE', sep1: 3, sep2: 0, sep3: 0, sep4: 0, sep5: 2, sep6: 0, sep7: 0, sep8: 0, sep9: 0, sep10: 0 },
  { stage: 'CASTING', rejectionType: 'DENT ON RESIN', sep1: 1, sep2: 1, sep3: 1, sep4: 2, sep5: 1, sep6: 1, sep7: 2, sep8: 0, sep9: 0, sep10: 1 },
  { stage: 'CASTING', rejectionType: 'DUST INSIDE RESIN', sep1: 9, sep2: 3, sep3: 2, sep4: 1, sep5: 0, sep6: 2, sep7: 1, sep8: 0, sep9: 1, sep10: 0 },
  { stage: 'CASTING', rejectionType: 'RESIN CURING ISSUE', sep1: 4, sep2: 2, sep3: 0, sep4: 3, sep5: 1, sep6: 0, sep7: 1, sep8: 2, sep9: 0, sep10: 1 },
  { stage: 'CASTING', rejectionType: 'SHORT FILL ON CHARGER', sep1: 6, sep2: 1, sep3: 3, sep4: 0, sep5: 2, sep6: 1, sep7: 0, sep8: 1, sep9: 0, sep10: 2 },
  { stage: 'CASTING', rejectionType: 'SPM REJECTION', sep1: 0, sep2: 0, sep3: 0, sep4: 0, sep5: 0, sep6: 0, sep7: 0, sep8: 0, sep9: 0, sep10: 0 },
  { stage: 'CASTING', rejectionType: 'TIGHT FIT FOR CHARGER', sep1: 3, sep2: 0, sep3: 2, sep4: 1, sep5: 0, sep6: 1, sep7: 0, sep8: 0, sep9: 1, sep10: 0 },
  { stage: 'CASTING', rejectionType: 'LOOSE FITTING ON CHARGER', sep1: 2, sep2: 1, sep3: 0, sep4: 0, sep5: 1, sep6: 0, sep7: 1, sep8: 0, sep9: 0, sep10: 1 },
  { stage: 'CASTING', rejectionType: 'RESIN SHRINKAGE', sep1: 1, sep2: 0, sep3: 1, sep4: 0, sep5: 0, sep6: 1, sep7: 0, sep8: 0, sep9: 0, sep10: 0 },
  { stage: 'CASTING', rejectionType: 'WRONG MOULD', sep1: 0, sep2: 0, sep3: 0, sep4: 0, sep5: 0, sep6: 0, sep7: 0, sep8: 0, sep9: 0, sep10: 0 },
  { stage: 'CASTING', rejectionType: 'GLOP TOP ISSUE', sep1: 2, sep2: 1, sep3: 0, sep4: 1, sep5: 0, sep6: 0, sep7: 1, sep8: 0, sep9: 0, sep10: 0 },
  // FUNCTIONAL
  { stage: 'FUNCTIONAL', rejectionType: '100% ISSUE', sep1: 12, sep2: 8, sep3: 5, sep4: 7, sep5: 9, sep6: 6, sep7: 4, sep8: 11, sep9: 8, sep10: 5 },
  { stage: 'FUNCTIONAL', rejectionType: '3 SENSORS ISSUE', sep1: 4, sep2: 2, sep3: 1, sep4: 3, sep5: 2, sep6: 1, sep7: 0, sep8: 2, sep9: 1, sep10: 3 },
  { stage: 'FUNCTIONAL', rejectionType: 'BATTERY ISSUE', sep1: 8, sep2: 5, sep3: 3, sep4: 6, sep5: 4, sep6: 2, sep7: 3, sep8: 5, sep9: 4, sep10: 6 },
  { stage: 'FUNCTIONAL', rejectionType: 'BLUETOOTH HEIGHT ISSUE', sep1: 3, sep2: 1, sep3: 2, sep4: 1, sep5: 0, sep6: 2, sep7: 1, sep8: 0, sep9: 2, sep10: 1 },
  { stage: 'FUNCTIONAL', rejectionType: 'CT TYPE ISSUE', sep1: 2, sep2: 0, sep3: 1, sep4: 0, sep5: 1, sep6: 0, sep7: 2, sep8: 1, sep9: 0, sep10: 1 },
  { stage: 'FUNCTIONAL', rejectionType: 'CHARGING CODE ISSUE', sep1: 5, sep2: 3, sep3: 2, sep4: 4, sep5: 1, sep6: 3, sep7: 0, sep8: 2, sep9: 3, sep10: 2 },
  { stage: 'FUNCTIONAL', rejectionType: 'COIL THICKNESS ISSUE/BATTERY THICKNESS', sep1: 1, sep2: 0, sep3: 0, sep4: 1, sep5: 0, sep6: 1, sep7: 0, sep8: 0, sep9: 1, sep10: 0 },
  { stage: 'FUNCTIONAL', rejectionType: 'COMPONENT HEIGHT ISSUE', sep1: 3, sep2: 2, sep3: 1, sep4: 2, sep5: 0, sep6: 1, sep7: 1, sep8: 0, sep9: 2, sep10: 1 },
  { stage: 'FUNCTIONAL', rejectionType: 'CURRENT ISSUE', sep1: 6, sep2: 4, sep3: 3, sep4: 5, sep5: 2, sep6: 4, sep7: 1, sep8: 3, sep9: 4, sep10: 2 },
  { stage: 'FUNCTIONAL', rejectionType: 'DISCONNECTED ISSUE', sep1: 2, sep2: 1, sep3: 0, sep4: 1, sep5: 1, sep6: 0, sep7: 1, sep8: 0, sep9: 1, sep10: 0 },
  { stage: 'FUNCTIONAL', rejectionType: 'HRS BUBBLE', sep1: 4, sep2: 2, sep3: 3, sep4: 1, sep5: 2, sep6: 1, sep7: 0, sep8: 2, sep9: 1, sep10: 3 },
  { stage: 'FUNCTIONAL', rejectionType: 'HRS COATING HEIGHT ISSUE', sep1: 1, sep2: 0, sep3: 1, sep4: 0, sep5: 1, sep6: 0, sep7: 0, sep8: 1, sep9: 0, sep10: 0 },
  { stage: 'FUNCTIONAL', rejectionType: 'HRS DOUBLE LIGHT ISSUE', sep1: 2, sep2: 1, sep3: 0, sep4: 1, sep5: 0, sep6: 1, sep7: 1, sep8: 0, sep9: 1, sep10: 0 },
  { stage: 'FUNCTIONAL', rejectionType: 'HRS HEIGHT ISSUE', sep1: 3, sep2: 2, sep3: 1, sep4: 2, sep5: 1, sep6: 0, sep7: 2, sep8: 1, sep9: 0, sep10: 2 },
  { stage: 'FUNCTIONAL', rejectionType: 'NO NOTIFICATION IN CDT', sep1: 5, sep2: 3, sep3: 2, sep4: 4, sep5: 1, sep6: 3, sep7: 0, sep8: 2, sep9: 3, sep10: 1 },
  { stage: 'FUNCTIONAL', rejectionType: 'NOT ADVERTISING (WIRELESS PCB)', sep1: 1, sep2: 0, sep3: 1, sep4: 0, sep5: 0, sep6: 1, sep7: 0, sep8: 0, sep9: 1, sep10: 0 },
  { stage: 'FUNCTIONAL', rejectionType: 'NOT CHARGING', sep1: 7, sep2: 5, sep3: 4, sep4: 6, sep5: 3, sep6: 5, sep7: 2, sep8: 4, sep9: 5, sep10: 3 },
  { stage: 'FUNCTIONAL', rejectionType: 'SENSOR ISSUE', sep1: 4, sep2: 2, sep3: 3, sep4: 1, sep5: 2, sep6: 1, sep7: 3, sep8: 0, sep9: 2, sep10: 1 },
  { stage: 'FUNCTIONAL', rejectionType: 'STC ISSUE', sep1: 2, sep2: 1, sep3: 0, sep4: 1, sep5: 1, sep6: 0, sep7: 1, sep8: 1, sep9: 0, sep10: 1 },
  { stage: 'FUNCTIONAL', rejectionType: 'R&D REJECTION', sep1: 3, sep2: 0, sep3: 2, sep4: 1, sep5: 0, sep6: 2, sep7: 0, sep8: 1, sep9: 2, sep10: 0 },
  // POLISHING
  { stage: 'POLISHING', rejectionType: 'IMPROPER RESIN FINISH', sep1: 15, sep2: 9, sep3: 6, sep4: 11, sep5: 7, sep6: 8, sep7: 4, sep8: 10, sep9: 6, sep10: 9 },
  { stage: 'POLISHING', rejectionType: 'RESIN DAMAGE', sep1: 8, sep2: 5, sep3: 3, sep4: 6, sep5: 4, sep6: 2, sep7: 5, sep8: 3, sep9: 7, sep10: 4 },
  { stage: 'POLISHING', rejectionType: 'RX COIL SCRATCH', sep1: 2, sep2: 1, sep3: 0, sep4: 1, sep5: 1, sep6: 0, sep7: 1, sep8: 0, sep9: 1, sep10: 0 },
  { stage: 'POLISHING', rejectionType: 'SCRATCHES ON RESIN', sep1: 5, sep2: 3, sep3: 4, sep4: 2, sep5: 3, sep6: 1, sep7: 2, sep8: 4, sep9: 2, sep10: 3 },
  { stage: 'POLISHING', rejectionType: 'SIDE SCRATCH', sep1: 3, sep2: 2, sep3: 1, sep4: 2, sep5: 0, sep6: 2, sep7: 1, sep8: 0, sep9: 2, sep10: 1 },
  { stage: 'POLISHING', rejectionType: 'SIDE SCRATCH (EMERY)', sep1: 1, sep2: 0, sep3: 1, sep4: 0, sep5: 1, sep6: 0, sep7: 0, sep8: 1, sep9: 0, sep10: 1 },
  { stage: 'POLISHING', rejectionType: 'SHELL COATING REMOVED', sep1: 4, sep2: 2, sep3: 3, sep4: 1, sep5: 2, sep6: 1, sep7: 3, sep8: 0, sep9: 2, sep10: 1 },
  { stage: 'POLISHING', rejectionType: 'UNEVEN POLISHING', sep1: 2, sep2: 1, sep3: 0, sep4: 1, sep5: 1, sep6: 0, sep7: 1, sep8: 1, sep9: 0, sep10: 1 },
  { stage: 'POLISHING', rejectionType: 'WHITE PATCH ON SHELL AFTER POLISHING', sep1: 6, sep2: 3, sep3: 4, sep4: 2, sep5: 3, sep6: 1, sep7: 2, sep8: 3, sep9: 1, sep10: 2 },
  { stage: 'POLISHING', rejectionType: 'SCRATCHES ON SHELL & SIDE SHELL', sep1: 3, sep2: 2, sep3: 1, sep4: 2, sep5: 0, sep6: 2, sep7: 1, sep8: 0, sep9: 2, sep10: 1 },
  // SHELL
  { stage: 'SHELL', rejectionType: 'BLACK MARKS ON SHELL', sep1: 18, sep2: 11, sep3: 8, sep4: 13, sep5: 9, sep6: 7, sep7: 10, sep8: 6, sep9: 12, sep10: 8 },
  { stage: 'SHELL', rejectionType: 'DENT ON SHELL', sep1: 7, sep2: 4, sep3: 5, sep4: 3, sep5: 6, sep6: 2, sep7: 4, sep8: 5, sep9: 3, sep10: 6 },
  { stage: 'SHELL', rejectionType: 'DISCOLORATION', sep1: 4, sep2: 2, sep3: 3, sep4: 1, sep5: 2, sep6: 1, sep7: 3, sep8: 0, sep9: 2, sep10: 1 },
  { stage: 'SHELL', rejectionType: 'IRREGULAR SHELL SHAPE', sep1: 2, sep2: 1, sep3: 0, sep4: 1, sep5: 1, sep6: 0, sep7: 1, sep8: 1, sep9: 0, sep10: 1 },
  { stage: 'SHELL', rejectionType: 'SHRINKAGE', sep1: 3, sep2: 0, sep3: 2, sep4: 1, sep5: 0, sep6: 2, sep7: 0, sep8: 1, sep9: 2, sep10: 0 },
  { stage: 'SHELL', rejectionType: 'WHITE MARKS ON SHELL', sep1: 5, sep2: 3, sep3: 2, sep4: 4, sep5: 1, sep6: 3, sep7: 0, sep8: 2, sep9: 3, sep10: 2 }
];

export function RejectionTrends() {
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date(2025, 8, 1)); // Sept 1, 2025
  const [toDate, setToDate] = useState<Date | undefined>(new Date(2025, 8, 30)); // Sept 30, 2025
  const [vendor, setVendor] = useState('3de-tech');
  const [rejectionStage, setRejectionStage] = useState<'BOTH' | 'VOC' | 'FT'>('BOTH');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleLoadData = () => {
    toast.success('Data loaded successfully');
  };

  const handleExportCSV = () => {
    toast.success('CSV exported successfully');
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Calculate totals by stage
  const calculateStageTotals = () => {
    const totals: { [key: string]: number } = {};
    detailedRejectionData.forEach(item => {
      if (!totals[item.stage]) totals[item.stage] = 0;
      totals[item.stage] += item.sep1 + item.sep2 + item.sep3 + item.sep4 + item.sep5 + 
                            item.sep6 + item.sep7 + item.sep8 + item.sep9 + item.sep10;
    });
    return totals;
  };

  const stageTotals = calculateStageTotals();
  const totalRejections = Object.values(stageTotals).reduce((sum, val) => sum + val, 0);

  // Helper function to get cell background color based on count
  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-transparent';
    if (count <= 3) return 'bg-green-100 dark:bg-green-900/30';
    if (count <= 7) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (count <= 10) return 'bg-red-100 dark:bg-red-900/30';
    return 'bg-red-200 dark:bg-red-900/50';
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card className="bg-orange-50 dark:bg-orange-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="flex items-center justify-center w-16 h-16 bg-red-500 rounded-lg">
              <TrendingDown className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="mb-1">Rejection Trends Analysis</h2>
              <p className="text-sm text-muted-foreground mb-4">Stage-wise rejection tracking over time</p>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">From Date</label>
                  <DatePicker
                    date={fromDate}
                    onDateChange={setFromDate}
                    placeholder="Select start date"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm">To Date</label>
                  <DatePicker
                    date={toDate}
                    onDateChange={setToDate}
                    placeholder="Select end date"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Vendor</label>
                  <Select value={vendor} onValueChange={setVendor}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3de-tech">3DE TECH</SelectItem>
                      <SelectItem value="vendor-a">Vendor A</SelectItem>
                      <SelectItem value="vendor-b">Vendor B</SelectItem>
                      <SelectItem value="vendor-c">Vendor C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Rejection Stage</label>
                  <div className="flex gap-2">
                    <Button
                      variant={rejectionStage === 'BOTH' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRejectionStage('BOTH')}
                      className="flex-1"
                    >
                      BOTH
                    </Button>
                    <Button
                      variant={rejectionStage === 'VOC' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRejectionStage('VOC')}
                      className="flex-1"
                    >
                      VOC
                    </Button>
                    <Button
                      variant={rejectionStage === 'FT' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRejectionStage('FT')}
                      className="flex-1"
                    >
                      FT
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm opacity-0">Actions</label>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleLoadData}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Load Data
                    </Button>
                    <Button
                      onClick={handleExportCSV}
                      variant="outline"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white border-green-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Rejections</p>
                <div className="text-3xl text-red-600">{totalRejections}</div>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">100%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">ASSEMBLY</p>
                <div className="text-3xl">{stageTotals['ASSEMBLY'] || 0}</div>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {((stageTotals['ASSEMBLY'] / totalRejections) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">CASTING</p>
                <div className="text-3xl">{stageTotals['CASTING'] || 0}</div>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {((stageTotals['CASTING'] / totalRejections) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">FUNCTIONAL</p>
                <div className="text-3xl">{stageTotals['FUNCTIONAL'] || 0}</div>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {((stageTotals['FUNCTIONAL'] / totalRejections) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">POLISHING</p>
                <div className="text-3xl">{stageTotals['POLISHING'] || 0}</div>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {((stageTotals['POLISHING'] / totalRejections) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">SHELL</p>
                <div className="text-3xl">{stageTotals['SHELL'] || 0}</div>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {((stageTotals['SHELL'] / totalRejections) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Rejection Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rejection Trends - 3DE TECH</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                From Sep 1 to Sep 30 • 55 rejection types
              </p>
            </div>
            <p className="text-sm text-muted-foreground">Click column headers to sort</p>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="sticky left-0 z-20 bg-background w-[120px] cursor-pointer"
                    onClick={() => handleSort('stage')}
                  >
                    STAGE
                  </TableHead>
                  <TableHead 
                    className="sticky left-[120px] z-20 bg-background w-[300px] cursor-pointer"
                    onClick={() => handleSort('rejectionType')}
                  >
                    REJECTION TYPE
                  </TableHead>
                  <TableHead className="text-center cursor-pointer" onClick={() => handleSort('sep1')}>SEP 1</TableHead>
                  <TableHead className="text-center cursor-pointer" onClick={() => handleSort('sep2')}>SEP 2</TableHead>
                  <TableHead className="text-center cursor-pointer" onClick={() => handleSort('sep3')}>SEP 3</TableHead>
                  <TableHead className="text-center cursor-pointer" onClick={() => handleSort('sep4')}>SEP 4</TableHead>
                  <TableHead className="text-center cursor-pointer" onClick={() => handleSort('sep5')}>SEP 5</TableHead>
                  <TableHead className="text-center cursor-pointer" onClick={() => handleSort('sep6')}>SEP 6</TableHead>
                  <TableHead className="text-center cursor-pointer" onClick={() => handleSort('sep7')}>SEP 7</TableHead>
                  <TableHead className="text-center cursor-pointer" onClick={() => handleSort('sep8')}>SEP 8</TableHead>
                  <TableHead className="text-center cursor-pointer" onClick={() => handleSort('sep9')}>SEP 9</TableHead>
                  <TableHead className="text-center cursor-pointer" onClick={() => handleSort('sep10')}>SEP 10</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailedRejectionData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="sticky left-0 z-10 bg-background">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        row.stage === 'ASSEMBLY' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                        row.stage === 'CASTING' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                        row.stage === 'FUNCTIONAL' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        row.stage === 'POLISHING' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {row.stage}
                      </span>
                    </TableCell>
                    <TableCell className="sticky left-[120px] z-10 bg-background">{row.rejectionType}</TableCell>
                    <TableCell className={`text-center ${getCellColor(row.sep1)}`}>{row.sep1 || '-'}</TableCell>
                    <TableCell className={`text-center ${getCellColor(row.sep2)}`}>{row.sep2 || '-'}</TableCell>
                    <TableCell className={`text-center ${getCellColor(row.sep3)}`}>{row.sep3 || '-'}</TableCell>
                    <TableCell className={`text-center ${getCellColor(row.sep4)}`}>{row.sep4 || '-'}</TableCell>
                    <TableCell className={`text-center ${getCellColor(row.sep5)}`}>{row.sep5 || '-'}</TableCell>
                    <TableCell className={`text-center ${getCellColor(row.sep6)}`}>{row.sep6 || '-'}</TableCell>
                    <TableCell className={`text-center ${getCellColor(row.sep7)}`}>{row.sep7 || '-'}</TableCell>
                    <TableCell className={`text-center ${getCellColor(row.sep8)}`}>{row.sep8 || '-'}</TableCell>
                    <TableCell className={`text-center ${getCellColor(row.sep9)}`}>{row.sep9 || '-'}</TableCell>
                    <TableCell className={`text-center ${getCellColor(row.sep10)}`}>{row.sep10 || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="reasons">Rejection Reasons</TabsTrigger>
          <TabsTrigger value="vendors">By Vendor</TabsTrigger>
          <TabsTrigger value="sizes">By Size</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Rejection Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={rejectionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="vqcRejected" stroke="#f97316" name="VQC Rejected" strokeWidth={2} />
                  <Line type="monotone" dataKey="ftRejected" stroke="#3b82f6" name="FT Rejected" strokeWidth={2} />
                  <Line type="monotone" dataKey="total" stroke="#ef4444" name="Total Rejected" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reasons" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rejection Reasons Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={rejectionReasons}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ reason, percentage }) => `${reason}: ${percentage}%`}
                    >
                      {rejectionReasons.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rejection Reasons Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rejectionReasons.map((reason, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: reason.color }}
                        ></div>
                        <span className="font-medium">{reason.reason}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{reason.count}</div>
                        <div className="text-sm text-muted-foreground">{reason.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Rejection Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={vendorRejectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vendor" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendorRejectionData.map((vendor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{vendor.vendor}</h4>
                      <p className="text-sm text-muted-foreground">
                        {vendor.rejected} rejected out of {vendor.total} total
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${vendor.rate > 20 ? 'text-red-600' : vendor.rate > 15 ? 'text-orange-600' : 'text-green-600'}`}>
                        {vendor.rate}%
                      </div>
                      <div className="text-sm text-muted-foreground">Rejection Rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sizes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Size-wise Rejection Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sizeRejectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="size" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="rejected" fill="#f97316" name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Size Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sizeRejectionData.map((size, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Size {size.size}</h4>
                      <p className="text-sm text-muted-foreground">
                        {size.rejected} rejected out of {size.total} total
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${size.rate > 15 ? 'text-red-600' : size.rate > 12 ? 'text-orange-600' : 'text-green-600'}`}>
                        {size.rate}%
                      </div>
                      <div className="text-sm text-muted-foreground">Rejection Rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}