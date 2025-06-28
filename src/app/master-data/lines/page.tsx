"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  productionLines,
  type ProductionLine,
  mockLineWorkerHistory,
  mockLinePerformanceData,
} from "@/lib/data";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig: ChartConfig = {
  output: {
    label: "Output (units)",
    color: "hsl(var(--primary))",
  },
  efficiency: {
    label: "Efficiency (%)",
    color: "hsl(var(--accent))",
  },
};

export default function ProductionLinesPage() {
  const [selectedLineId, setSelectedLineId] = React.useState<string>(
    productionLines[0]?.id || ""
  );

  const selectedLine = React.useMemo(() => {
    return productionLines.find((line) => line.id === selectedLineId);
  }, [selectedLineId]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Production Lines
          </h1>
          <p className="text-muted-foreground">
            Configure and manage your factory's production lines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedLineId} onValueChange={setSelectedLineId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a line" />
            </SelectTrigger>
            <SelectContent>
              {productionLines.map((line) => (
                <SelectItem key={line.id} value={line.id}>
                  {line.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Line
          </Button>
        </div>
      </header>

      {selectedLine ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Line Information</CardTitle>
              <CardDescription>
                Core details for "{selectedLine.name}".
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>System ID</Label>
                  <Input value={selectedLine.id} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Line Name</Label>
                  <Input value={selectedLine.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Line Manager</Label>
                  <Input value={selectedLine.lineManager} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="workers" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="workers">Workers Assigned</TabsTrigger>
              <TabsTrigger value="history">Assignment History</TabsTrigger>
              <TabsTrigger value="performance">Line Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="workers">
              <Card>
                <CardHeader>
                  <CardTitle>Current Workers Assigned</CardTitle>
                  <CardDescription>
                    List of workers currently assigned to stations on this line.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Station ID</TableHead>
                          <TableHead>Machine Type</TableHead>
                          <TableHead>Assigned Worker</TableHead>
                          <TableHead>Worker ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedLine.stations.map((station) => (
                          <TableRow key={station.id}>
                            <TableCell className="font-code">{station.id}</TableCell>
                            <TableCell>{station.machineType}</TableCell>
                            <TableCell>{station.assignedWorker}</TableCell>
                            <TableCell className="font-code">{station.workerId}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>History of Assigned Workers</CardTitle>
                  <CardDescription>
                    A log of all worker assignments and removals for this line.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                           <TableHead>Action</TableHead>
                          <TableHead>Worker Name</TableHead>
                          <TableHead>Worker ID</TableHead>
                          <TableHead>Station ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockLineWorkerHistory.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>{format(record.date, "PPP")}</TableCell>
                            <TableCell>
                                <Badge variant={record.action === "Assigned" ? "secondary" : "outline"}>
                                    {record.action}
                                </Badge>
                            </TableCell>
                            <TableCell>{record.workerName}</TableCell>
                             <TableCell className="font-code">{record.workerId}</TableCell>
                            <TableCell className="font-code">{record.stationId}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Line Performance</CardTitle>
                  <CardDescription>
                    Daily output and efficiency over the last 7 days.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                   <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <BarChart accessibilityLayer data={mockLinePerformanceData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                        />
                        <YAxis yAxisId="left" orientation="left" stroke="var(--color-output)" />
                        <YAxis yAxisId="right" orientation="right" stroke="var(--color-efficiency)" tickFormatter={(value) => `${value}%`}/>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent indicator="dashed" />}
                        />
                        <Bar yAxisId="left" dataKey="output" fill="var(--color-output)" radius={4} />
                         <Bar yAxisId="right" dataKey="efficiency" fill="var(--color-efficiency)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
         <Card>
            <CardHeader>
            <CardTitle>No Line Selected</CardTitle>
            <CardDescription>
                Please select a production line to view its details.
            </CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}
