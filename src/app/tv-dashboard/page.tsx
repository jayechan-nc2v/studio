
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
  let isFuture = false;

  for (const hourRange of hours) {
    const currentHour = new Date().getHours();
    const rangeStartHour = parseInt(hourRange.split(':')[0]);
    if (currentHour < rangeStartHour) {
      isFuture = true;
    }

    const target = 35;
    const qc = isFuture ? null : Math.floor(Math.random() * (target - 15) + 15);
    const defect = isFuture || qc === null ? null : Math.floor(Math.random() * 3);
    const output = isFuture || qc === null || defect === null ? null : qc - defect;

    data.push({
      hour: hourRange,
      target,
      qc,
      defect,
      defectPercent: qc ? ((defect ?? 0) / qc * 100) : null,
      output,
      effPercent: output ? (output / target * 100) : null,
    });
  }
  return data;
};

const wipDetailData = {
    pnNo: "JOC25-S00001-1",
    styleNo: "JOC2345",
    color: "BK0001",
    pnQty: 3500,
    smv: 21.62,
    supervisor: "Some One",
};

// --- Main Component ---
export default function TvDashboardPage() {
    const [hourlyData, setHourlyData] = React.useState(generateHourlyPerformanceData());
    const [currentTime, setCurrentTime] = React.useState<Date | null>(null);

    React.useEffect(() => {
        setCurrentTime(new Date());
        const interval = setInterval(() => {
            setHourlyData(generateHourlyPerformanceData());
            setCurrentTime(new Date());
        }, 30000); // Auto-refresh every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const hourlySummary = React.useMemo(() => {
        const initial = { target: 0, qc: 0, defect: 0, output: 0 };
        const totals = hourlyData.reduce((acc, hour) => {
            acc.target += hour.target || 0;
            acc.qc += hour.qc || 0;
            acc.defect += hour.defect || 0;
            acc.output += hour.output || 0;
            return acc;
        }, initial);
        
        const totalDefectPercent = totals.qc > 0 ? (totals.defect / totals.qc * 100) : 0;
        const totalEffPercent = totals.target > 0 ? (totals.output / totals.target * 100) : 0;

        return { ...totals, totalDefectPercent, totalEffPercent };
    }, [hourlyData]);

    return (
        <div className="bg-white text-black min-h-screen p-4 font-sans flex flex-col">
            <header className="flex justify-between items-baseline mb-4">
                <h1 className="text-xl font-bold tracking-tight">
                    Line 1 Dashboard
                    <span className="ml-4 font-normal text-gray-600">
                        {currentTime ? (
                            <>
                                {currentTime.toLocaleDateString('en-CA')}
                                {' | '}
                                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </>
                        ) : (
                            'Loading time...'
                        )}
                    </span>
                </h1>
            </header>
            
            <div className="flex-1 grid grid-cols-3 gap-4">
                {/* Left Column */}
                <div className="col-span-2 flex flex-col">
                    <Card className="border-gray-400 flex-1 flex flex-col">
                        <CardHeader className="p-2 border-b border-gray-400">
                            <CardTitle className="text-base flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="4" height="16" fill="#4CAF50"/><rect x="6" width="4" height="16" fill="#2196F3"/><rect x="12" width="4" height="16" fill="#FFC107"/></svg>
                                Hourly Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            <Table className="border-collapse">
                                <TableHeader>
                                    <TableRow className="bg-gray-100 hover:bg-gray-100">
                                        {['Hour', 'Target', 'QC', 'Defect', 'Defect %', 'Output', 'Eff %'].map(h => 
                                            <TableHead key={h} className="border border-gray-400 text-black font-semibold text-center h-8 px-2 text-base">{h}</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hourlyData.map((row) => (
                                        <TableRow key={row.hour} className="hover:bg-gray-50">
                                            <TableCell className="border border-gray-400 text-center font-mono h-8 px-2 text-base">{row.hour}</TableCell>
                                            <TableCell className="border border-gray-400 text-center h-8 px-2 text-base">{row.target}</TableCell>
                                            <TableCell className="border border-gray-400 text-center h-8 px-2 text-base">{row.qc}</TableCell>
                                            <TableCell className="border border-gray-400 text-center h-8 px-2 text-base">{row.defect}</TableCell>
                                            <TableCell className="border border-gray-400 text-center h-8 px-2 text-base">{row.defectPercent?.toFixed(1)}%</TableCell>
                                            <TableCell className="border border-gray-400 text-center h-8 px-2 text-base">{row.output}</TableCell>
                                            <TableCell className="border border-gray-400 text-center h-8 px-2 text-base">{row.effPercent?.toFixed(1)}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="bg-gray-200 font-bold hover:bg-gray-200">
                                        <TableCell className="border border-gray-400 text-center h-8 px-2 text-base">Total</TableCell>
                                        <TableCell className="border border-gray-400 text-center h-8 px-2 text-base">{hourlySummary.target}</TableCell>
                                        <TableCell className="border border-gray-400 text-center h-8 px-2 text-base">{hourlySummary.qc}</TableCell>
                                        <TableCell className="border border-gray-400 text-center h-8 px-2 text-base">{hourlySummary.defect}</TableCell>
                                        <TableCell className="border border-gray-400 text-center h-8 px-2 text-base">{hourlySummary.totalDefectPercent.toFixed(1)}%</TableCell>
                                        <TableCell className="border border-gray-400 text-center h-8 px-2 text-base">{hourlySummary.output}</TableCell>
                                        <TableCell className="border border-gray-400 text-center h-8 px-2 text-base">{hourlySummary.totalEffPercent.toFixed(1)}%</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="col-span-1 flex flex-col gap-4">
                    <Card className="border-gray-400">
                         <CardHeader className="p-2 border-b border-gray-400">
                            <CardTitle className="text-base flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="4" fill="#2196F3"/><rect y="6" width="16" height="4" fill="#4CAF50"/><rect y="12" width="16" height="4" fill="#FFC107"/></svg>
                                WIP Detail
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2">
                            <table className="w-full border-collapse">
                                <tbody>
                                    {Object.entries({
                                        "PN No.": wipDetailData.pnNo,
                                        "Style No.": wipDetailData.styleNo,
                                        "Color": wipDetailData.color,
                                        "PN Qty.": wipDetailData.pnQty,
                                        "SMV": wipDetailData.smv,
                                        "Supervisor": wipDetailData.supervisor,
                                    }).map(([key, value]) => (
                                        <tr key={key} className="border-b border-gray-400">
                                            <td className="font-bold p-1 border-r border-gray-400 w-1/3">{key}</td>
                                            <td className="p-1" colSpan={3}>{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-400 flex-1 flex flex-col">
                        <CardHeader className="p-2 border-b border-gray-400">
                            <CardTitle className="text-base flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 0L9.94975 6.05025L16 8L9.94975 9.94975L8 16L6.05025 9.94975L0 8L6.05025 6.05025L8 0Z" fill="#9C27B0"/></svg>
                                Efficiency Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-around text-center">
                             <div>
                                <p className="text-lg text-gray-600">Target</p>
                                <p className="text-4xl font-bold">35%</p>
                            </div>
                            <div>
                                <p className="text-lg text-gray-600">Daily</p>
                                <p className="text-5xl font-bold text-green-600">34%</p>
                            </div>
                            <div>
                                <p className="text-lg text-gray-600">Average Month</p>
                                <p className="text-4xl font-bold text-orange-600">33%</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
