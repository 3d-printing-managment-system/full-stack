"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

function Dashboard() {
  // KPI DATA
  const kpiData = {
    totalJobs: 128,
    activePrinters: 12,
    totalFilament: 245.6, // kg
    filamentCost: 18450, // $
    failureRate: 8.5,
  };

  // PRINT JOB STATUS
  const jobStatusData = [
    { name: "Completed", value: 85 },
    { name: "Printing", value: 18 },
    { name: "Failed", value: 10 },
    { name: "Queued", value: 15 },
  ];

  // MATERIAL CONSUMPTION
  const materialData = [
    { material: "PLA", consumption: 120 },
    { material: "ABS", consumption: 65 },
    { material: "PETG", consumption: 40 },
    { material: "Resin", consumption: 20 },
  ];

  // PRINTER UTILIZATION
  const printerUtilization = [
    { printer: "P1", utilization: 92 },
    { printer: "P2", utilization: 78 },
    { printer: "P3", utilization: 65 },
    { printer: "P4", utilization: 88 },
    { printer: "P5", utilization: 54 },
  ];

  // FILAMENT COST TREND
  const filamentCostTrend = [
    { month: "Jan", cost: 1200 },
    { month: "Feb", cost: 1500 },
    { month: "Mar", cost: 1700 },
    { month: "Apr", cost: 1400 },
    { month: "May", cost: 2100 },
  ];

  const printTimeComparison = [
    { job: "Job 1", estimated: 5, actual: 6 },
    { job: "Job 2", estimated: 8, actual: 7.5 },
    { job: "Job 3", estimated: 4, actual: 5 },
    { job: "Job 4", estimated: 10, actual: 12 },
    { job: "Job 5", estimated: 6, actual: 6.2 },
  ];

  const queueLoadData = [
    { time: "08:00", queuedJobs: 4, printingJobs: 2 },
    { time: "10:00", queuedJobs: 7, printingJobs: 5 },
    { time: "12:00", queuedJobs: 12, printingJobs: 8 },
    { time: "14:00", queuedJobs: 9, printingJobs: 10 },
    { time: "16:00", queuedJobs: 6, printingJobs: 7 },
    { time: "18:00", queuedJobs: 3, printingJobs: 4 },
  ];

  const COLORS = ["#22c55e", "#3b82f6", "#ef4444", "#f59e0b"];

  return (
    <div className="min-h-screen bg-white p-6 rounded-md ring-1 ring-foreground/10">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 text-slate-800">
        3D Printing Dashboard
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-[#f6f6f6bd] rounded-2xl shadow p-4 rounded-md ring-1 ring-foreground/10">
          <h2 className="text-sm text-gray-500">Total Jobs</h2>
          <p className="text-2xl font-bold">{kpiData.totalJobs}</p>
        </div>

        <div className="bg-[#f6f6f6bd] rounded-2xl shadow p-4 rounded-md ring-1 ring-foreground/10">
          <h2 className="text-sm text-gray-500">Active Printers</h2>
          <p className="text-2xl font-bold">{kpiData.activePrinters}</p>
        </div>

        <div className="bg-[#f6f6f6bd] rounded-2xl shadow p-4 rounded-md ring-1 ring-foreground/10">
          <h2 className="text-sm text-gray-500">Total Filament (kg)</h2>
          <p className="text-2xl font-bold">{kpiData.totalFilament}</p>
        </div>

        <div className="bg-[#f6f6f6bd] rounded-2xl shadow p-4 rounded-md ring-1 ring-foreground/10">
          <h2 className="text-sm text-gray-500">Filament Cost ($)</h2>
          <p className="text-2xl font-bold">${kpiData.filamentCost}</p>
        </div>

        <div className="bg-[#f6f6f6bd] rounded-2xl shadow p-4 rounded-md ring-1 ring-foreground/10">
          <h2 className="text-sm text-gray-500">Failure Rate</h2>
          <p className="text-2xl font-bold text-red-500">
            {kpiData.failureRate}%
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Job Status Pie */}
        <div className="bg-[#f6f6f6bd] rounded-2xl shadow p-6 rounded-md ring-1 ring-foreground/10">
          <h2 className="text-lg font-semibold mb-4">
            Print Jobs Status Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={jobStatusData} dataKey="value" outerRadius={100} label>
                {jobStatusData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Printer Utilization */}
        <div className="bg-[#f6f6f6bd] rounded-2xl shadow p-6 rounded-md ring-1 ring-foreground/10">
          <h2 className="text-lg font-semibold mb-4">
            Printer Utilization Rate (%)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={printerUtilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="printer" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="utilization" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        {/* Material Consumption */}
        <div className="bg-[#f6f6f6bd] rounded-2xl shadow p-6 rounded-md ring-1 ring-foreground/10">
          <h2 className="text-lg font-semibold mb-4">
            Material Consumption by Type (kg)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={materialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="material" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="consumption" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Filament Cost Trend */}
        <div className="bg-[#f6f6f6bd] rounded-2xl shadow p-6 rounded-md ring-1 ring-foreground/10">
          <h2 className="text-lg font-semibold mb-4">
            Filament Cost Trend ($)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filamentCostTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#f59e0b"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Estimated vs Actual Print Time */}
        <div className="bg-white rounded-2xl shadow p-6 border border-black/10">
          <h2 className="text-lg font-semibold mb-4">
            Estimated vs Actual Print Time (hrs)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={printTimeComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="job" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="estimated" fill="#3b82f6" name="Estimated" />
              <Bar dataKey="actual" fill="#f97316" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-black/10">
          {" "}
          <h2 className="text-lg font-semibold mb-4">
            {" "}
            Queue vs Active Printing Over Time{" "}
          </h2>{" "}
          <ResponsiveContainer width="100%" height={300}>
            {" "}
            <LineChart data={queueLoadData}>
              {" "}
              <CartesianGrid strokeDasharray="3 3" /> <XAxis dataKey="time" />{" "}
              <YAxis /> <Tooltip /> <Legend /> {/* Waiting in Queue */}{" "}
              <Line
                type="monotone"
                dataKey="queuedJobs"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="Queued Jobs"
              />{" "}
              {/* Currently Printing */}{" "}
              <Line
                type="monotone"
                dataKey="printingJobs"
                stroke="#14b8a6"
                strokeWidth={3}
                name="Printing Jobs"
              />{" "}
            </LineChart>{" "}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
