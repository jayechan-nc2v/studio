
"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useQrCodeStore, useWorkOrderStore, useQcFailureReasonStore } from "@/lib/store";
import type { QrCode, WorkOrderFormValues } from "@/lib/store";
import { Loader2, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FoundBundleInfo {
  qrCode: QrCode;
  workOrder: WorkOrderFormValues;
}

const qcItemSchema = z.object({
  isPassed: z.boolean(),
  isFailed: z.boolean(),
  failureReason: z.string().optional(),
}).refine(data => !(data.isPassed && data.isFailed), {
    message: "An item cannot be both passed and failed.",
    path: ["isPassed"], // or isFailed, doesn't matter much
}).refine(data => !data.isFailed || (data.isFailed && data.failureReason), {
    message: "A failure reason is required.",
    path: ["failureReason"],
});

const qcFormSchema = z.object({
  items: z.array(qcItemSchema),
});

type QcFormValues = z.infer<typeof qcFormSchema>;

export default function FinishSewingQcPage() {
  const { toast } = useToast();
  const [qrCodeInput, setQrCodeInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [foundBundle, setFoundBundle] = React.useState<FoundBundleInfo | null>(null);

  const { qrCodes } = useQrCodeStore();
  const { workOrders } = useWorkOrderStore();
  const { reasons: qcFailureReasons } = useQcFailureReasonStore();

  const form = useForm<QcFormValues>();

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleFindBundle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCodeInput) return;

    setIsLoading(true);
    setFoundBundle(null);
    form.reset({ items: [] });

    setTimeout(() => {
        const qrCode = qrCodes.find(c => c.id.toLowerCase() === qrCodeInput.toLowerCase() && c.status !== 'Unassigned');
        if (!qrCode || !qrCode.workOrderId) {
            toast({ variant: "destructive", title: "Not Found", description: "This QR code is not assigned to any work order." });
            setIsLoading(false);
            return;
        }

        const workOrder = workOrders.find(wo => wo.workOrderNo === qrCode.workOrderId);
        if (!workOrder) {
            toast({ variant: "destructive", title: "Error", description: "Could not find the work order associated with this QR code." });
            setIsLoading(false);
            return;
        }

        setFoundBundle({ qrCode, workOrder });
        const bundleQty = qrCode.bundleQty || 0;
        const initialItems = Array.from({ length: bundleQty }, () => ({
            isPassed: false,
            isFailed: false,
            failureReason: "",
        }));
        replace(initialItems); // useFieldArray's replace method
        setIsLoading(false);
    }, 500);
  };
  
  const onSubmit = (data: QcFormValues) => {
    console.log("QC Results:", data);
    toast({
      title: "QC Results Submitted",
      description: `Results for bundle ${foundBundle?.qrCode.id} have been recorded.`,
    });
  };

  const InfoItem = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="font-semibold">{value || "N/A"}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Finish Sewing QC</h1>
        <p className="text-muted-foreground">
          Scan a bundle QR code to perform quality control checks.
        </p>
      </header>

      <Card>
        <form onSubmit={handleFindBundle}>
            <CardHeader>
                <CardTitle>Find Bundle</CardTitle>
                <CardDescription>Scan or enter the QR code to load bundle information.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                        placeholder="Scan or enter QR code..."
                        value={qrCodeInput}
                        onChange={(e) => setQrCodeInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !qrCodeInput}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Find Bundle
                    </Button>
                </div>
            </CardContent>
        </form>
      </Card>
      
      {isLoading && <Skeleton className="h-96 w-full" />}

      {foundBundle && (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Bundle Information</CardTitle>
                        <CardDescription>Details for QR Code: <span className="font-mono">{foundBundle.qrCode.id}</span></CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <InfoItem label="Work Order No." value={foundBundle.workOrder.workOrderNo} />
                        <InfoItem label="Style No." value={foundBundle.workOrder.styleNo} />
                        <InfoItem label="Pre-Production No." value={foundBundle.workOrder.preProductionNo} />
                        <InfoItem label="Line" value={foundBundle.workOrder.productionLine} />
                        <InfoItem label="Size" value={foundBundle.qrCode.size} />
                        <InfoItem label="Color" value={foundBundle.workOrder.garmentType} />
                        <InfoItem label="Bundle Qty" value={foundBundle.qrCode.bundleQty} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>QC Checklist</CardTitle>
                        <CardDescription>Mark each item in the bundle as passed or failed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Item</TableHead>
                                        <TableHead className="w-[120px]">QC Passed</TableHead>
                                        <TableHead className="w-[120px]">QC Failure</TableHead>
                                        <TableHead>Fail Reason</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.isPassed`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value}
                                                                    onCheckedChange={(checked) => {
                                                                        field.onChange(checked);
                                                                        if (checked) {
                                                                            form.setValue(`items.${index}.isFailed`, false);
                                                                        }
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                 <FormField
                                                    control={form.control}
                                                    name={`items.${index}.isFailed`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value}
                                                                    onCheckedChange={(checked) => {
                                                                        field.onChange(checked);
                                                                        if (checked) {
                                                                            form.setValue(`items.${index}.isPassed`, false);
                                                                        }
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                 <FormField
                                                    control={form.control}
                                                    name={`items.${index}.failureReason`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Select 
                                                                onValueChange={field.onChange} 
                                                                value={field.value}
                                                                disabled={!form.watch(`items.${index}.isFailed`)}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select a reason" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {qcFailureReasons.map(reason => (
                                                                        <SelectItem key={reason.id} value={reason.reason}>
                                                                            {reason.reason}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                             <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Submit QC Results</Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
      )}
    </div>
  );
}
