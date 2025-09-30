import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DatePicker } from './ui/date-picker';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, CheckCircle, XCircle, Clock, TrendingUp, Home as HomeIcon } from 'lucide-react';

const ringLifecycleData = [
  { name: 'Received', vqc: 1250, ft: 890 },
  { name: 'Closed', vqc: 1100, ft: 750 },
  { name: 'Pending', vqc: 150, ft: 140 }
];

const statusData = [
  { name: 'VQC Accepted', value: 950, color: '#10b981' },
  { name: 'VQC Rejected', value: 150, color: '#ef4444' },
  { name: 'FT Accepted', value: 680, color: '#3b82f6' },
  { name: 'FT Rejected', value: 70, color: '#f59e0b' }
];

const sizeDistribution = [
  { size: '6.0', received: 180, accepted: 150, rejected: 30 },
  { size: '6.5', received: 220, accepted: 195, rejected: 25 },
  { size: '7.0', received: 280, accepted: 260, rejected: 20 },
  { size: '7.5', received: 250, accepted: 220, rejected: 30 },
  { size: '8.0', received: 180, accepted: 155, rejected: 25 },
  { size: '8.5', received: 140, accepted: 120, rejected: 20 }
];

const trendData = [
  { date: 'Jan', received: 180, accepted: 160, rejected: 20 },
  { date: 'Feb', received: 220, accepted: 195, rejected: 25 },
  { date: 'Mar', received: 280, accepted: 250, rejected: 30 },
  { date: 'Apr', received: 250, accepted: 220, rejected: 30 },
  { date: 'May', received: 180, accepted: 155, rejected: 25 },
  { date: 'Jun', received: 320, accepted: 290, rejected: 30 }
];

export function Home() {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(2025, 8, 22)); // September 22, 2025
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(2025, 8, 29)); // September 29, 2025

  return (
    <div className="space-y-6">
      {/* Page Header with Home Icon */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HomeIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-semibold text-blue-600">Home</h1>
        </div>
        
        {/* Date Filters */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Start Date</Label>
            <DatePicker
              date={startDate}
              onDateChange={setStartDate}
              placeholder="Select start date"
              className="w-44"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">End Date</Label>
            <DatePicker
              date={endDate}
              onDateChange={setEndDate}
              placeholder="Select end date"
              className="w-44"
            />
          </div>
        </div>
      </div>


      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Received</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,140</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>VQC Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">950</div>
            <p className="text-xs text-muted-foreground">86.4% acceptance rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>FT Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">680</div>
            <p className="text-xs text-muted-foreground">90.7% acceptance rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">220</div>
            <p className="text-xs text-muted-foreground">10.3% rejection rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Ring Lifecycle Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Ring Lifecycle Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ringLifecycleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="vqc" fill="#10b981" name="VQC" />
              <Bar dataKey="ft" fill="#3b82f6" name="FT" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ring Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Ring Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rings by Size */}
        <Card>
          <CardHeader>
            <CardTitle>Rings by Size</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sizeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="size" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="accepted" fill="#10b981" name="Accepted" />
                <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="received" stroke="#8884d8" name="Received" />
              <Line type="monotone" dataKey="accepted" stroke="#10b981" name="Accepted" />
              <Line type="monotone" dataKey="rejected" stroke="#ef4444" name="Rejected" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}