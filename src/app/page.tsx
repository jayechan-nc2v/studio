"use client";

import { Badge } from "@/components/ui/badge";
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Users, Warehouse } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const kpiData = [
  {
    title: "Total Factory Output",
    value: "12,450 units",
    change: "+12.5% this month",
    icon: Warehouse,
  },
  {
    title: "Production Efficiency",
    value: "89.5%",
    change: "+1.2% this week",
    icon: LineChart,
  },
  {
    title: "Employee Performance",
    value: "95.2%",
    change: "-0.5% today",
    icon: Users,
  },
];

const chartData = [
  { month: "January", efficiency: 82 },
  { month: "February", efficiency: 85 },
  { month: "March", efficiency: 88 },
  { month: "April", efficiency: 86 },
  { month: "May", efficiency: 90 },
  { month: "June", efficiency: 89 },
];

const chartConfig: ChartConfig = {
  efficiency: {
    label: "Efficiency",
    color: "hsl(var(--primary))",
  },
};

const recentWorkOrders = [
  {
    id: "WO-00125",
    style: "Men's Classic Tee",
    quantity: 500,
    line: "Line 3",
    status: "Sewing",
  },
  {
    id: "WO-00124",
    style: "Women's Denim Jacket",
    quantity: 250,
    line: "Line 1",
    status: "QC",
  },
  {
    id: "WO-00123",
    style: "Kids Graphic Hoodie",
    quantity: 700,
    line: "Line 2",
    status: "Cutting",
  },
  {
    id: "WO-00122",
    style: "Men's Classic Tee",
    quantity: 500,
    line: "Line 3",
    status: "Completed",
  },
  {
    id: "WO-00121",
    style: "Women's Leggings",
    quantity: 1200,
    line: "Line 1",
    status: "Failed QC",
  },
];

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    Sewing: 'secondary',
    QC: 'default',
    Cutting: 'outline',
    Completed: 'default',
    'Failed QC': 'destructive'
};


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time overview of your production floor.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Production Efficiency</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar
                  dataKey="efficiency"
                  fill="var(--color-efficiency)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Work Orders</CardTitle>
            <CardDescription>
              An overview of the latest work orders in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Style</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentWorkOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium font-code">{order.id}</TableCell>
                    <TableCell>{order.style}</TableCell>
                    <TableCell className="text-right">
                       <Badge variant={statusVariantMap[order.status] || 'default'} className="capitalize">{order.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
