
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";


// --- Mock Data Generation ---
const generateHourlyPerformanceData = () => {
  const data = [];
  const hours = [
    "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", 
    "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00"
  ];

  for (const hourRange of hours) {
    const target = 100;
    const qcQty = Math.floor(target * (0.9 + Math.random() * 0.15)); // 90% to 105% of target
    const passedQty = Math.floor(qcQty * (0.95 - Math.random() * 0.1)); // 85% to 95% pass rate
    data.push({ hour: hourRange, target, qcQty, passedQty });
  }
  return data;
};

const generateStyleStatusData = () => {
  const styles = [
    { order: "WO-00125", target: 800, output: 550, wip: 250 },
    { order: "WO-00124", target: 400, output: 390, wip: 10 },
    { order: "WO-00123", target: 1200, output: 700, wip: 500 },
    { order: "WO-00126", target: 600, output: 150, wip: 450 },
    { order: "WO-00127", target: 900, output: 890, wip: 10 },
  ];
  return styles.map(style => ({
    ...style,
    output: style.output + Math.floor(Math.random() * 10),
  }));
};


// --- Main Component ---
export default function TvDashboardPage() {
    const [data, setData] = React.useState({
        hourly: generateHourlyPerformanceData(),
        styles: generateStyleStatusData(),
    });
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const interval = setInterval(() => {
            setData({
                hourly: generateHourlyPerformanceData(),
                styles: generateStyleStatusData(),
            });
            setCurrentTime(new Date());
        }, 30000); // Auto-refresh every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const qcSummary = React.useMemo(() => {
        const totalQc = data.hourly.reduce((acc, hour) => acc + hour.qcQty, 0);
        const totalPassed = data.hourly.reduce((acc, hour) => acc + hour.passedQty, 0);
        const passRate = totalQc > 0 ? (totalPassed / totalQc) * 100 : 0;
        return { totalQc, totalPassed, passRate };
    }, [data.hourly]);

    const efficiencySummary = {
        daily: 92.5,
        target: 90.0,
        month: 91.8,
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen p-4 font-body flex flex-col">
            <header className="text-center mb-4">
                <h1 className="text-3xl font-bold tracking-tight">Line 1 Dashboard</h1>
                <p className="text-lg text-muted-foreground">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    {' | '}
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </header>
            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4">
                {/* 1. Hourly Performance (Top Left) */}
                <Card className="bg-gray-800 border-gray-700 text-white flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl">📊 Hourly Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                         <Table>
                            <TableHeader>
                                <TableRow className="border-gray-600">
                                    <TableHead className="text-white">Hour</TableHead>
                                    <TableHead className="text-white text-right">Target</TableHead>
                                    <TableHead className="text-white text-right">QC Qty</TableHead>
                                    <TableHead className="text-white text-right">Passed</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.hourly.map((hourData) => (
                                    <TableRow key={hourData.hour} className="border-gray-700 text-lg">
                                        <TableCell className="font-mono">{hourData.hour}</TableCell>
                                        <TableCell className="text-right">{hourData.target}</TableCell>
                                        <TableCell className="text-right font-bold text-cyan-400">{hourData.qcQty}</TableCell>
                                        <TableCell className={cn("text-right font-bold", hourData.passedQty >= hourData.target ? "text-green-400" : "text-yellow-400")}>{hourData.passedQty}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* 2. Style & Order Status (Top Right) */}
                <Card className="bg-gray-800 border-gray-700 text-white flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl">🧵 Style & Order Status</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-600">
                                    <TableHead className="text-white">Order</TableHead>
                                    <TableHead className="text-white text-right">Target</TableHead>
                                    <TableHead className="text-white text-right">Output</TableHead>
                                    <TableHead className="text-white text-right">WIP</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.styles.map((style) => (
                                    <TableRow key={style.order} className="border-gray-700 text-lg">
                                        <TableCell className="font-mono">{style.order}</TableCell>
                                        <TableCell className="text-right">{style.target.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-bold text-cyan-400">{style.output.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{style.wip.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* 3. QC Performance Summary (Bottom Left) */}
                <Card className="bg-gray-800 border-gray-700 text-white flex flex-col justify-center items-center p-2">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl">✅ QC Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4 w-full text-center">
                        <div className="flex-1">
                            <p className="text-lg text-muted-foreground">Total QC</p>
                            <p className="text-4xl font-bold">{qcSummary.totalQc.toLocaleString()}</p>
                        </div>
                        <div className="flex-1">
                            <p className="text-lg text-muted-foreground">Passed</p>
                            <p className="text-4xl font-bold text-green-400">{qcSummary.totalPassed.toLocaleString()}</p>
                        </div>
                        <div className="flex-1">
                            <p className="text-lg text-muted-foreground">Pass Rate</p>
                            <p className={cn("text-5xl font-bold", qcSummary.passRate >= 95 ? "text-green-400" : "text-red-400")}>
                                {qcSummary.passRate.toFixed(1)}%
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Efficiency Overview (Bottom Right) */}
                <Card className="bg-gray-800 border-gray-700 text-white flex flex-col justify-center p-2">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl">⚙️ Efficiency Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center w-full">
                        <div className="mb-2">
                            <p className="text-lg text-muted-foreground">Daily Efficiency</p>
                             <p className={cn("text-5xl font-bold", efficiencySummary.daily >= efficiencySummary.target ? "text-green-400" : "text-yellow-400")}>
                                {efficiencySummary.daily.toFixed(1)}%
                            </p>
                        </div>
                        <div className="flex justify-around items-center">
                             <div>
                                <p className="text-md text-muted-foreground">Target</p>
                                <p className="text-2xl font-semibold text-cyan-400">{efficiencySummary.target.toFixed(1)}%</p>
                            </div>
                            <div>
                                <p className="text-md text-muted-foreground">This Month</p>
                                <p className="text-2xl font-semibold">{efficiencySummary.month.toFixed(1)}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
