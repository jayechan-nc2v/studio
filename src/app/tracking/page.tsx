
"use client";

import * as React from "react";
import { useBundleHistoryStore } from "@/lib/store";
import { type BundleHistory } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChevronsUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BundleHistoryPage() {
    const { history } = useBundleHistoryStore();
    const [filters, setFilters] = React.useState({ qrCodeId: '', workOrderId: '' });
    const [sortConfig, setSortConfig] = React.useState<{ key: keyof BundleHistory, direction: 'ascending' | 'descending' } | null>({ key: 'timestamp', direction: 'descending' });
    const [visibleCount, setVisibleCount] = React.useState(50);

    const handleFilterChange = (filterName: string, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setVisibleCount(50);
    }

    const requestSort = (key: keyof BundleHistory) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredHistory = React.useMemo(() => {
        return history
            .filter((item) => {
                const qrCodeMatch = filters.qrCodeId ? item.qrCodeId.toLowerCase().includes(filters.qrCodeId.toLowerCase()) : true;
                const workOrderMatch = filters.workOrderId ? item.workOrderId.toLowerCase().includes(filters.workOrderId.toLowerCase()) : true;
                return qrCodeMatch && workOrderMatch;
            })
            .sort((a, b) => {
                if (!sortConfig) return 0;
                const { key, direction } = sortConfig;
                
                const aValue = a[key];
                const bValue = b[key];

                if (aValue < bValue) {
                    return direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
    }, [history, filters, sortConfig]);

    const SortableHeader = ({ label, sortKey }: { label: string; sortKey: keyof BundleHistory; }) => {
        const isSorted = sortConfig?.key === sortKey;
        return (
            <Button variant="ghost" onClick={() => requestSort(sortKey)} className="px-2">
                {label}
                {isSorted ? (
                    sortConfig?.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                ) : (
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                )}
            </Button>
        );
    };

    return (
        <div className="flex flex-col gap-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Bundle History</h1>
                <p className="text-muted-foreground">
                    A complete log of all bundle scanning activities.
                </p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Filter History</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="qr-code-filter">QR Code ID</Label>
                        <Input
                            id="qr-code-filter"
                            placeholder="Search by QR code..."
                            value={filters.qrCodeId}
                            onChange={(e) => handleFilterChange('qrCodeId', e.target.value)}
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="wo-filter">Work Order No.</Label>
                        <Input
                            id="wo-filter"
                            placeholder="Search by work order..."
                            value={filters.workOrderId}
                            onChange={(e) => handleFilterChange('workOrderId', e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Scan Log</CardTitle>
                    <CardDescription>
                        Showing the {Math.min(visibleCount, filteredHistory.length)} most recent of {filteredHistory.length} records.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead><SortableHeader label="Timestamp" sortKey="timestamp" /></TableHead>
                                    <TableHead><SortableHeader label="QR Code ID" sortKey="qrCodeId" /></TableHead>
                                    <TableHead><SortableHeader label="Work Order" sortKey="workOrderId" /></TableHead>
                                    <TableHead><SortableHeader label="Checkpoint" sortKey="checkPointName" /></TableHead>
                                    <TableHead><SortableHeader label="Status" sortKey="status" /></TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead><SortableHeader label="User" sortKey="user" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.slice(0, visibleCount).map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{format(item.timestamp, "PPP p")}</TableCell>
                                            <TableCell className="font-mono">{item.qrCodeId}</TableCell>
                                            <TableCell className="font-mono">{item.workOrderId}</TableCell>
                                            <TableCell>{item.checkPointName}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.status === 'Passed' ? 'secondary' : 'destructive'}>{item.status}</Badge>
                                            </TableCell>
                                            <TableCell>{item.details || 'N/A'}</TableCell>
                                            <TableCell>{item.user}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No history records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {visibleCount < filteredHistory.length && (
                        <div className="mt-4 flex justify-center">
                            <Button variant="secondary" onClick={() => setVisibleCount(prev => prev + 50)}>
                                Load More
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
