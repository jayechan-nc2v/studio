
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from "recharts";


// --- Mock Data Generation ---
const generateHourlyPerformanceData = () => {
  const data = [];
  for (let i = 7; i <= 16; i++) {
    const hour = `${String(i).padStart(2, '0')}:00`;
    const target = 100;
    const qcQty = Math.floor(target * (0.9 + Math.random() * 0.15)); // 90% to 105% of target
    const passedQty = Math.floor(qcQty * (0.95 - Math.random() * 0.1)); // 85% to 95% pass rate
    data.push({ hour, target, qcQty, passedQty });
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

const chartConfig: ChartConfig = {
  target: {
    label: "Target",
    color: "hsl(var(--muted))",
  },
  qcQty: {
    label: "QC Qty",
    color: "hsl(var(--primary))",
  },
  passedQty: {
    label: "Passed",
    color: "hsl(var(--chart-2))",
  },
};


// --- Main Component ---
export default function TvDashboardPage() {
    const [data, setData] = React.useState({
        hourly: generateHourlyPerformanceData(),
        styles: generateStyleStatusData(),
    });

    React.useEffect(() => {
        const interval = setInterval(() => {
            setData({
                hourly: generateHourlyPerformanceData(),
                styles: generateStyleStatusData(),
            });
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
                <h1 className="text-5xl font-bold tracking-tight">Production Dashboard</h1>
                <p className="text-2xl text-muted-foreground">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            </header>
            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4">
                {/* 1. Hourly Performance (Top Left) */}
                <Card className="bg-gray-800 border-gray-700 text-white flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-3xl">📊 Hourly Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                         <ChartContainer config={chartConfig} className="w-full h-full">
                            <BarChart data={data.hourly} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="hour" tick={{ fill: '#fff' }} />
                                <YAxis tick={{ fill: '#fff' }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                    contentStyle={{
                                        backgroundColor: '#2d3748',
                                        borderColor: '#4a5568',
                                    }}
                                />
                                <Legend wrapperStyle={{ color: '#fff' }} />
                                <Bar dataKey="target" fill="var(--color-target)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="qcQty" fill="var(--color-qcQty)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="passedQty" fill="var(--color-passedQty)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* 2. Style & Order Status (Top Right) */}
                <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader>
                        <CardTitle className="text-3xl">🧵 Style & Order Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-600">
                                    <TableHead className="text-white text-lg">Order</TableHead>
                                    <TableHead className="text-white text-lg text-right">Target</TableHead>
                                    <TableHead className="text-white text-lg text-right">Output</TableHead>
                                    <TableHead className="text-white text-lg text-right">WIP</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.styles.map((style) => (
                                    <TableRow key={style.order} className="border-gray-700">
                                        <TableCell className="font-mono text-xl">{style.order}</TableCell>
                                        <TableCell className="text-right text-xl">{style.target.toLocaleString()}</TableCell>
                                        <TableCell className="text-right text-xl font-bold text-cyan-400">{style.output.toLocaleString()}</TableCell>
                                        <TableCell className="text-right text-xl">{style.wip.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* 3. QC Performance Summary (Bottom Left) */}
                <Card className="bg-gray-800 border-gray-700 text-white flex flex-col justify-center items-center">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">✅ QC Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-8 w-full text-center">
                        <div className="flex-1">
                            <p className="text-2xl text-muted-foreground">Total QC</p>
                            <p className="text-6xl font-bold">{qcSummary.totalQc.toLocaleString()}</p>
                        </div>
                        <div className="flex-1">
                            <p className="text-2xl text-muted-foreground">Passed</p>
                            <p className="text-6xl font-bold text-green-400">{qcSummary.totalPassed.toLocaleString()}</p>
                        </div>
                        <div className="flex-1">
                            <p className="text-2xl text-muted-foreground">Pass Rate</p>
                            <p className={cn("text-8xl font-bold", qcSummary.passRate >= 95 ? "text-green-400" : "text-red-400")}>
                                {qcSummary.passRate.toFixed(1)}%
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Efficiency Overview (Bottom Right) */}
                <Card className="bg-gray-800 border-gray-700 text-white flex flex-col justify-center">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">⚙️ Efficiency Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="mb-4">
                            <p className="text-2xl text-muted-foreground">Daily Efficiency</p>
                             <p className={cn("text-8xl font-bold", efficiencySummary.daily >= efficiencySummary.target ? "text-green-400" : "text-yellow-400")}>
                                {efficiencySummary.daily.toFixed(1)}%
                            </p>
                        </div>
                        <div className="flex justify-around items-center">
                             <div>
                                <p className="text-xl text-muted-foreground">Target</p>
                                <p className="text-4xl font-semibold text-cyan-400">{efficiencySummary.target.toFixed(1)}%</p>
                            </div>
                            <div>
                                <p className="text-xl text-muted-foreground">This Month</p>
                                <p className="text-4xl font-semibold">{efficiencySummary.month.toFixed(1)}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
