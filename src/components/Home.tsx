import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DatePicker } from './ui/date-picker';
import { Label } from './ui/label';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Home as HomeIcon, Loader2 } from 'lucide-react';
import { getHomeSummary } from '../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAppState } from '../context/AppStateContext';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8884d8', '#ffc658'];

export function Home() {
  const { state, dispatch } = useAppState();
  const { startDate, endDate } = state.home;
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!startDate || !endDate) return;

      setIsLoading(true);
      try {
        const params = {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
        };
        const data = await getHomeSummary(params);
        setSummaryData(data);
      } catch (error: any) {
        toast.error(`Failed to load summary: ${error.message}`);
        setSummaryData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [startDate, endDate]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HomeIcon className="h-8 w-8" />
          <h1 className="text-3xl font-semibold">Home</h1>
        </div>
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="flex items-center gap-2">
            <Label>Start Date</Label>
            <DatePicker date={startDate} onDateChange={(date) => dispatch({ type: 'SET_HOME_STATE', payload: { startDate: date } })} />
          </div>
          <div className="flex items-center gap-2">
            <Label>End Date</Label>
            <DatePicker date={endDate} onDateChange={(date) => dispatch({ type: 'SET_HOME_STATE', payload: { endDate: date } })} />
          </div>
        </div>
      </div>

      {summaryData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader><CardTitle>VQC Received</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{summaryData.ringLifecycleData.vqc_received}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>VQC Closed</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{summaryData.ringLifecycleData.vqc_closed}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>FT Received</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{summaryData.ringLifecycleData.ft_received}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>FT Closed</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{summaryData.ringLifecycleData.ft_closed}</div></CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Ring Status Overview</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={summaryData.ringStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {summaryData.ringStatusData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Rejection Reasons</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={summaryData.rejectionReasonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ef4444" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Rings by Size</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={summaryData.ringSizeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Rings by SKU</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={summaryData.ringSkuData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>MO Summary</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summaryData.moSummaryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accepted" stackId="a" fill="#10b981" name="Accepted" />
                  <Bar dataKey="wabi_sabi" stackId="a" fill="#f59e0b" name="Wabi Sabi" />
                  <Bar dataKey="scrap" stackId="a" fill="#ef4444" name="Scrap" />
                  <Bar dataKey="rt_conversion" stackId="a" fill="#3b82f6" name="RT Conversion" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}