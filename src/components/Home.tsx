import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DatePicker } from './ui/date-picker';
import { Label } from './ui/label';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Package, CheckCircle, XCircle, Home as HomeIcon } from 'lucide-react';

const vqcStatusData = [
  { name: 'ACCEPTED', value: 950, color: '#10b981' },
  { name: 'RT CONVERTED', value: 150, color: '#3b82f6' },
  { name: 'WABI SABI', value: 50, color: '#f59e0b' },
  { name: 'SCRAP', value: 20, color: '#ef4444' },
];

const ftStatusData = [
  { name: 'ACCEPTED', value: 680, color: '#10b981' },
  { name: 'RT CONVERTED', value: 70, color: '#3b82f6' },
  { name: 'WABI SABI', value: 30, color: '#f59e0b' },
  { name: 'SCRAP', value: 10, color: '#ef4444' },
];

const rejectionReasonData = [
    { reason: 'Scratched', count: 55 },
    { reason: 'Bent', count: 40 },
    { reason: 'Discoloration', count: 33 },
    { reason: 'Wrong Size', count: 20 },
    { reason: 'Other', count: 52 },
];

const ringsBySizeData = [
  { size: '5', count: 150 },
  { size: '6', count: 250 },
  { size: '7', count: 400 },
  { size: '8', count: 350 },
  { size: '9', count: 200 },
  { size: '10', count: 100 },
];

const ringsBySkuData = [
    { sku: 'AG05', count: 50 },
    { sku: 'AS05', count: 45 },
    { sku: 'RT05', count: 30 },
    { sku: 'MG05', count: 25 },
    { sku: 'AA05', count: 20 },
    { sku: 'BR05', count: 15 },
];

const moSummaryData = [
    { mo: 'MO-001', ACCEPTED: 200, 'RT CONVERTED': 30, 'WABI SABI': 10, SCRAP: 5 },
    { mo: 'MO-002', ACCEPTED: 180, 'RT CONVERTED': 25, 'WABI SABI': 8, SCRAP: 3 },
    { mo: 'MO-003', ACCEPTED: 220, 'RT CONVERTED': 35, 'WABI SABI': 12, SCRAP: 7 },
    { mo: 'MO-004', ACCEPTED: 150, 'RT CONVERTED': 20, 'WABI SABI': 5, SCRAP: 2 },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VQC Ring Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>VQC Ring Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vqcStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {vqcStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* FT Ring Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>FT Ring Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ftStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {ftStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rejection Reason Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Rejection Reasons</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rejectionReasonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="reason" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" name="Total Rejections" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rings by Size */}
        <Card>
          <CardHeader>
            <CardTitle>Rings by Size</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ringsBySizeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="size" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rings by SKU */}
        <Card>
          <CardHeader>
            <CardTitle>Rings by SKU</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ringsBySkuData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sku" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* MO Summary */}
      <Card>
        <CardHeader>
          <CardTitle>MO Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={moSummaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ACCEPTED" stackId="a" fill="#10b981" />
              <Bar dataKey="RT CONVERTED" stackId="a" fill="#3b82f6" />
              <Bar dataKey="WABI SABI" stackId="a" fill="#f59e0b" />
              <Bar dataKey="SCRAP" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}