import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePicker } from './ui/date-picker';
import { Button } from './ui/button';
import { Database, Users, Loader2, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { getVendors, getRejectionTrends } from '../services/api';
import { format } from 'date-fns';
import { useAppState } from '../context/AppStateContext';
import { motion } from 'framer-motion';

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

const SortableHeader = ({ children, className }: { children: React.ReactNode; sortKey: string; className?: string }) => (
  <th className={`px-6 py-8 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd');
};

const getStageColor = (stage: string) => {
  switch (stage.toLowerCase()) {
    case 'vqc':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'ft':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export function RejectionTrends() {
  const { state, dispatch } = useAppState();
  const { fromDate, toDate, vendor, rejectionStage, reportData } = state.rejectionTrends;
  const [vendors, setVendors] = useState<string[]>(['all']);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const vendorList = await getVendors();
        setVendors(vendorList);
        if (vendorList.length > 1 && vendor === 'all') {
            dispatch({ type: 'SET_REJECTION_TRENDS_STATE', payload: { vendor: vendorList[1] } });
        }
      } catch (error: any) {
        toast.error(`Failed to fetch vendors: ${error.message}`);
      }
    };
    fetchVendors();
  }, [dispatch, vendor]);

  const handleLoadData = async () => {
    if (!fromDate || !toDate || !vendor) {
      toast.error('Please select from date, to date, and vendor.');
      return;
    }
    setIsLoadingData(true);
    setError(null);
    try {
      const config = {
        dateFrom: format(fromDate, 'yyyy-MM-dd'),
        dateTo: format(toDate, 'yyyy-MM-dd'),
        vendor: vendor,
        rejectionStage: rejectionStage,
      };
      const data = await getRejectionTrends(config);
      dispatch({ type: 'SET_REJECTION_TRENDS_STATE', payload: { reportData: data } });
      toast.success('Rejection trends data loaded successfully.');
    } catch (error: any) {
      setError(error.message);
      toast.error(`Failed to load data: ${error.message}`);
    } finally {
      setIsLoadingData(false);
    }
  };
  
  const { sortedData, dateRange = [] } = useMemo(() => {
    if (!reportData?.rejectionData) return { sortedData: [], dateRange: [] };
    return {
      sortedData: reportData.rejectionData,
      dateRange: reportData.dateRange,
    };
  }, [reportData]);

  const rejectionData = reportData?.rejectionData;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
              <DatePicker date={fromDate} onDateChange={(date) => dispatch({ type: 'SET_REJECTION_TRENDS_STATE', payload: { fromDate: date } })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
              <DatePicker date={toDate} onDateChange={(date) => dispatch({ type: 'SET_REJECTION_TRENDS_STATE', payload: { toDate: date } })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Vendor</label>
              <Select value={vendor} onValueChange={(value) => dispatch({ type: 'SET_REJECTION_TRENDS_STATE', payload: { vendor: value } }) }>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {vendors.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rejection Stage</label>
              <Select value={rejectionStage} onValueChange={(value: 'both' | 'vqc' | 'ft') => dispatch({ type: 'SET_REJECTION_TRENDS_STATE', payload: { rejectionStage: value } }) }>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="vqc">VQC</SelectItem>
                  <SelectItem value="ft">FT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <Button onClick={handleLoadData} className="w-full" disabled={isLoadingData}>
                {isLoadingData ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
                Load Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoadingData && (
        <div className="flex justify-center items-center py-16 bg-gray-50 dark:bg-black/90 rounded-2xl">
          <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-red-50 dark:bg-red-900/20 rounded-2xl"
        >
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
            Error Loading Data
          </h3>
          <p className="text-sm text-red-500 dark:text-red-400 mb-4">
            {error}
          </p>
        </motion.div>
      )}

      {reportData && !isLoadingData && !error && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <div className="text-3xl">{reportData.summary.totalRejections}</div>
            </CardContent>
          </Card>
          {Object.entries(reportData.summary.stageWiseTotals).map(([stage, total]) => (
            <Card key={stage}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">{stage}</p>
                <div className="text-3xl">{total as number}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {rejectionData && rejectionData.length > 0 && !isLoadingData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="pt-6 overflow-x-auto max-h-[600px]">
              <table className="w-full text-xs border-separate border-spacing-y-2">
                <thead className="bg-gray-100 dark:bg-gray-900 sticky top-0 z-10">
                  <tr>
                    <SortableHeader sortKey="stage" className="sticky left-0 bg-gray-100 dark:bg-gray-900 z-20 min-w-[120px]">
                      Stage
                    </SortableHeader>
                    <SortableHeader sortKey="rejection" className="sticky left-[120px] bg-gray-100 dark:bg-gray-900 z-20 min-w-[450px]">
                      Rejection Type
                    </SortableHeader>
                    {dateRange.map(date => (
                      <SortableHeader key={date} sortKey={date} className="min-w-[80px] text-center">
                        {formatDate(date)}
                      </SortableHeader>
                    ))}
                    <SortableHeader sortKey="total" className="min-w-[80px] text-center bg-gray-200 dark:bg-gray-800">
                      Total
                    </SortableHeader>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((row, index) => (
                    <motion.tr
                      key={`${row.stage}-${row.rejection}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                    >
                      <td className="px-6 py-16 sticky left-0 bg-white dark:bg-black z-10 border-r border-gray-200 dark:border-gray-700">
                        <span className={`inline-flex px-2 py-1 rounded-full ${getStageColor(row.stage)}`}>
                          {row.stage}
                        </span>
                      </td>
                      <td className="px-6 py-16 sticky left-[120px] bg-white dark:bg-black z-10 border-r border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-gray-200">
                          {row.rejection}
                        </span>
                      </td>
                      {dateRange.map(date => {
                        const count = row.dateWiseData[date] || 0;
                        return (
                          <td key={date} className="px-6 py-16 text-center">
                            <motion.span
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.02 + 0.1 }}
                              className={`inline-flex items-center justify-center min-w-[2rem] h-8 rounded-lg font-semibold ${
                                count === 0 
                                  ? 'text-gray-400 dark:text-gray-500' 
                                  : count <= 2 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : count <= 5
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}
                            >
                              {count}
                            </motion.span>
                          </td>
                        );
                      })}
                      <td className="px-6 py-16 text-center bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
                        <motion.span
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.02 + 0.2 }}
                          className="inline-flex items-center justify-center min-w-[3rem] h-8 px-3 rounded-lg font-bold bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        >
                          {row.totals.total}
                        </motion.span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {(!rejectionData || rejectionData.length === 0) && !isLoadingData && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-gray-50 dark:bg-black rounded-2xl"
        >
          <TrendingDown className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
            No Rejection Data Available
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
            Select filters and click "Load Data" to see the rejection trends.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}