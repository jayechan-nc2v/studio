
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";


// --- Mock Data Generation ---
const generateHourlyPerformanceData = () => {
  const data = [];
  const hours = [
    "07:30 - 08:30", "08:30 - 09:30", "09:30 - 10:30", "10:30 - 11:30", 
    "12:30 - 13:30", "13:30 - 14:30", "14:30 - 15:30", "15:30 - 16:30"
  ];

  for (const hourRange of hours) {
    const isFuture = new Date().getHours() < parseInt(hourRange.split(':')[0]);
    const target = 100;
    const qcQty = isFuture ? 0 : Math.floor(target * (0.9 + Math.random() * 0.25));
    const passedQty = isFuture ? 0 : Math.floor(qcQty * (0.95 - Math.random() * 0.1));
    data.push({ hour: hourRange, target, qcQty, passedQty });
  }
  return data;
};

const generateWipWorkOrderData = () => {
  const styles = [
    { order: "A0001", qty: 24, output: 20, wip: 4 },
    { order: "A0002", qty: 24, output: 23, wip: 1 },
    { order: "A0003", qty: 24, output: 10, wip: 14 },
    { order: "A0004", qty: 24, output: 0, wip: 24 },
    { order: "A0005", qty: 24, output: 15, wip: 9 },
    { order: "A0006", qty: 24, output: 5, wip: 19 },

  ];
  return styles.map(style => ({
    ...style,
    output: Math.min(style.qty, style.output + Math.floor(Math.random() * 2)),
    wip: Math.max(0, style.qty - (style.output + Math.floor(Math.random() * 2))),
  }));
};


// --- Main Component ---
export default function TvDashboardPage() {
    const [data, setData] = React.useState({
        hourly: generateHourlyPerformanceData(),
        styles: generateWipWorkOrderData(),
    });
    const [currentTime, setCurrentTime] = React.useState<Date | null>(null);

    React.useEffect(() => {
        // Set initial time on mount
        setCurrentTime(new Date());

        const interval = setInterval(() => {
            setData({
                hourly: generateHourlyPerformanceData(),
                styles: generateWipWorkOrderData(),
            });
            setCurrentTime(new Date());
        }, 30000); // Auto-refresh every 30 seconds

        return () => clearInterval(interval);
    }, []);
    
    const hourlySummary = React.useMemo(() => {
        const totalTarget = data.hourly.reduce((acc, hour) => acc + hour.target, 0);
        const totalQc = data.hourly.reduce((acc, hour) => acc + hour.qcQty, 0);
        const totalPassed = data.hourly.reduce((acc, hour) => acc + hour.passedQty, 0);
        const passRate = totalQc > 0 ? (totalPassed / totalQc) * 100 : 0;
        return { totalTarget, totalQc, totalPassed, passRate };
    }, [data.hourly]);

    const efficiencySummary = {
        target: 35.0,
        daily: 34.0,
        month: 33.0,
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen p-4 font-sans flex flex-col">
            <header className="flex justify-between items-baseline mb-4">
                <h1 className="text-3xl font-bold tracking-tight">Line 1 Dashboard</h1>
                <p className="text-lg text-muted-foreground">
                    {currentTime ? (
                        <>
                            {currentTime.toLocaleDateString('en-CA')}
                            {' | '}
                            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </>
                    ) : (
                        'Loading time...'
                    )}
                </p>
            </header>
            <div className="flex-1 grid grid-cols-2 grid-rows-[3fr_1fr] gap-4">
                {/* 1. Hourly Performance (Top Left) */}
                <Card className="bg-gray-800 border-gray-700 text-white flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl">📊 Hourly Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2">
                         <Table>
                            <TableHeader>
                                <TableRow className="border-gray-600 hover:bg-gray-800">
                                    <TableHead className="text-white">Hour</TableHead>
                                    <TableHead className="text-white text-right">Target</TableHead>
                                    <TableHead className="text-white text-right">QC Qty</TableHead>
                                    <TableHead className="text-white text-right">Passed Qty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.hourly.map((hourData) => (
                                    <TableRow key={hourData.hour} className="border-gray-700 text-lg hover:bg-gray-700/50">
                                        <TableCell className="font-mono">{hourData.hour}</TableCell>
                                        <TableCell className="text-right">{hourData.target}</TableCell>
                                        <TableCell className="text-right font-bold text-cyan-400">{hourData.qcQty}</TableCell>
                                        <TableCell className={cn("text-right font-bold", hourData.passedQty >= hourData.target ? "text-green-400" : "text-yellow-400")}>{hourData.passedQty}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow className="border-gray-600 font-bold text-lg hover:bg-gray-800">
                                    <TableCell>Total</TableCell>
                                    <TableCell className="text-right">{hourlySummary.totalTarget}</TableCell>
                                    <TableCell className="text-right text-cyan-400">{hourlySummary.totalQc}</TableCell>
                                    <TableCell className="text-right text-green-400">{hourlySummary.totalPassed}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </CardContent>
                </Card>

                {/* 2. WIP Work Order (Top Right) */}
                <Card className="bg-gray-800 border-gray-700 text-white flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl">🧵 WIP Work Order</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-600 hover:bg-gray-800">
                                    <TableHead className="text-white">Work Order</TableHead>
                                    <TableHead className="text-white text-right">Qty</TableHead>
                                    <TableHead className="text-white text-right">Output Qty</TableHead>
                                    <TableHead className="text-white text-right">WIP Qty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.styles.map((style) => (
                                    <TableRow key={style.order} className="border-gray-700 text-lg hover:bg-gray-700/50">
                                        <TableCell className="font-mono">{style.order}</TableCell>
                                        <TableCell className="text-right">{style.qty.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-bold text-cyan-400">{style.output.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{style.wip.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* 3. QC Performance Summary (Bottom Left) */}
                <Card className="bg-gray-800 border-gray-700 text-white flex flex-col justify-center p-2">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl">✅ QC Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-around gap-4 w-full text-center">
                        <div>
                            <p className="text-lg text-muted-foreground">Total QC</p>
                            <p className="text-4xl font-bold">{hourlySummary.totalQc.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-lg text-muted-foreground">Passed</p>
                            <p className="text-4xl font-bold text-green-400">{hourlySummary.totalPassed.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-lg text-muted-foreground">Pass Rate</p>
                            <p className={cn("text-4xl font-bold", hourlySummary.passRate >= 95 ? "text-green-400" : "text-red-400")}>
                                {hourlySummary.passRate.toFixed(1)}%
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Efficiency Overview (Bottom Right) */}
                <Card className="bg-gray-800 border-gray-700 text-white flex flex-col justify-center p-2">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl">⚙️ Efficiency Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-around gap-4 w-full text-center">
                         <div>
                            <p className="text-lg text-muted-foreground">Target</p>
                            <p className="text-4xl font-semibold text-cyan-400">{efficiencySummary.target.toFixed(1)}%</p>
                        </div>
                        <div>
                            <p className="text-lg text-muted-foreground">Daily</p>
                             <p className={cn("text-4xl font-bold", efficiencySummary.daily >= efficiencySummary.target ? "text-green-400" : "text-yellow-400")}>
                                {efficiencySummary.daily.toFixed(1)}%
                            </p>
                        </div>
                        <div>
                            <p className="text-lg text-muted-foreground">Average Month</p>
                            <p className="text-4xl font-semibold">{efficiencySummary.month.toFixed(1)}%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
