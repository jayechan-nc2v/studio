
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQrCodeStore, useWorkOrderStore, useCheckPointStore, useBundleHistoryStore } from "@/lib/store";
import type { QrCode, WorkOrderFormValues, CheckPoint } from "@/lib/store";
import { Loader2, Search, ScanCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FoundBundleInfo {
  qrCode: QrCode;
  workOrder: WorkOrderFormValues;
}

export default function CheckPointScanningPage() {
  const { toast } = useToast();
  const [qrCodeInput, setQrCodeInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [foundBundle, setFoundBundle] = React.useState<FoundBundleInfo | null>(null);
  const [selectedCheckPointId, setSelectedCheckPointId] = React.useState<string>("");

  const { qrCodes, updateQrCodeStatus } = useQrCodeStore();
  const { workOrders } = useWorkOrderStore();
  const { checkPoints } = useCheckPointStore();
  const { addHistoryRecord } = useBundleHistoryStore();
  
  React.useEffect(() => {
    // Pre-select the first entry point as a default
    const entryPoint = checkPoints.find(cp => cp.isProductionEntry);
    if (entryPoint) {
      setSelectedCheckPointId(entryPoint.id);
    } else if (checkPoints.length > 0) {
      setSelectedCheckPointId(checkPoints[0].id);
    }
  }, [checkPoints]);


  const handleFindBundle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCodeInput) return;

    setIsLoading(true);
    setFoundBundle(null);

    setTimeout(() => {
        const qrCode = qrCodes.find(c => c.id.toLowerCase() === qrCodeInput.toLowerCase() && c.workOrderId);
        if (!qrCode) {
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
        setIsLoading(false);
    }, 500);
  };
  
  const handleConfirmPass = () => {
    if (!foundBundle || !selectedCheckPointId) return;

    const checkPoint = checkPoints.find(cp => cp.id === selectedCheckPointId);
    if (!checkPoint) {
      toast({ variant: "destructive", title: "Error", description: "Invalid checkpoint selected." });
      return;
    }

    const newStatus = checkPoint.name;
    updateQrCodeStatus(foundBundle.qrCode.id, newStatus);
    
    addHistoryRecord({
        qrCodeId: foundBundle.qrCode.id,
        workOrderId: foundBundle.workOrder.workOrderNo,
        checkPointName: checkPoint.name,
        status: 'Passed'
    });

    toast({
      title: "Checkpoint Passed!",
      description: `Bundle ${foundBundle.qrCode.id} status updated to "${newStatus}".`,
    });

    setFoundBundle(null);
    setQrCodeInput("");
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
        <h1 className="text-3xl font-bold tracking-tight">Check Point Scanning</h1>
        <p className="text-muted-foreground">
          Scan bundles to update their status as they move through production.
        </p>
      </header>

      <Card>
        <form onSubmit={handleFindBundle}>
            <CardHeader>
                <CardTitle>Find Bundle</CardTitle>
                <CardDescription>Select your current checkpoint, then scan the bundle QR code.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row w-full max-w-xl items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-2">
                    <div className="space-y-2 flex-1 w-full">
                        <Label htmlFor="check-point">Check Point Station</Label>
                        <Select value={selectedCheckPointId} onValueChange={setSelectedCheckPointId} required>
                            <SelectTrigger id="check-point">
                                <SelectValue placeholder="Select a checkpoint" />
                            </SelectTrigger>
                            <SelectContent>
                                {checkPoints.map((cp) => (
                                    <SelectItem key={cp.id} value={cp.id}>
                                        {cp.name} ({cp.type})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 flex-1 w-full">
                        <Label htmlFor="qr-code-input">Bundle QR Code</Label>
                         <Input
                            id="qr-code-input"
                            placeholder="Scan or enter QR code..."
                            value={qrCodeInput}
                            onChange={(e) => setQrCodeInput(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading || !qrCodeInput || !selectedCheckPointId} className="w-full sm:w-auto">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Find Bundle
                    </Button>
                </div>
            </CardContent>
        </form>
      </Card>
      
      {isLoading && <Skeleton className="h-64 w-full" />}

      {foundBundle && (
        <Card>
            <CardHeader>
                <CardTitle>Bundle Information</CardTitle>
                <CardDescription>
                    Review bundle details before confirming. Current Status: <span className="font-semibold text-primary">{foundBundle.qrCode.status}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem label="Work Order No." value={foundBundle.workOrder.workOrderNo} />
                <InfoItem label="Style No." value={foundBundle.workOrder.styleNo} />
                <InfoItem label="QR Code ID" value={foundBundle.qrCode.id} />
                <InfoItem label="Line" value={foundBundle.workOrder.productionLine} />
                <InfoItem label="Size" value={foundBundle.qrCode.size} />
                <InfoItem label="Color" value={foundBundle.workOrder.garmentType} />
                <InfoItem label="Bundle Qty" value={foundBundle.qrCode.bundleQty} />
                <InfoItem label="Bundle No." value={foundBundle.qrCode.bundleNo} />
            </CardContent>
            <CardFooter>
                <Button onClick={handleConfirmPass}>
                    <ScanCheck className="mr-2 h-4 w-4" />
                    Confirm & Pass Checkpoint
                </Button>
            </CardFooter>
        </Card>
      )}
    </div>
  );
}
