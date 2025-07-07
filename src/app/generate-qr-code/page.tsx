
"use client";

import * as React from "react";
import ReactToPrint from "react-to-print";
import { QRCodeCanvas } from "qrcode.react";
import { Loader2, Printer, QrCode } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { useQrCodeStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface GeneratedCode {
  id: string;
}

const PrintableQrCodes = React.forwardRef<
  HTMLDivElement,
  { codes: GeneratedCode[]; numberOfCopies: number }
>(({ codes, numberOfCopies }, ref) => {
  if (codes.length === 0 || numberOfCopies <= 0) {
    return null;
  }

  const allCodesToPrint = React.useMemo(() => {
    return codes.flatMap(code =>
      Array.from({ length: numberOfCopies }, (_, i) => ({
        ...code,
        uniqueKey: `${code.id}-${i}`,
      }))
    );
  }, [codes, numberOfCopies]);

  return (
    <div ref={ref} className="p-10">
      <style type="text/css" media="print">
        {`
          @page { size: auto;  margin: 0mm; }
          body { -webkit-print-color-adjust: exact; }
          .printable-area {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
          .qr-code-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            page-break-inside: avoid;
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 8px;
          }
          .qr-code-id {
            margin-top: 8px;
            font-family: monospace;
            font-size: 10px;
          }
        `}
      </style>
      <div className="printable-area">
        {allCodesToPrint.map((code) => (
          <div key={code.uniqueKey} className="qr-code-item">
            <QRCodeCanvas value={code.id} size={100} />
            <span className="qr-code-id">{code.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
PrintableQrCodes.displayName = "PrintableQrCodes";

export default function GenerateQrCodePage() {
  const { toast } = useToast();
  const addQrCodesToStore = useQrCodeStore((state) => state.addQrCodes);

  const [numberOfCodes, setNumberOfCodes] = React.useState<number>(10);
  const [numberOfCopies, setNumberOfCopies] = React.useState<number>(1);
  const [generatedCodes, setGeneratedCodes] = React.useState<GeneratedCode[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const printComponentRef = React.useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    if (numberOfCodes <= 0 || numberOfCodes > 500) {
      toast({
        variant: "destructive",
        title: "Invalid Quantity",
        description: "Please enter a number of unique codes between 1 and 500.",
      });
      return;
    }
    if (numberOfCopies <= 0 || numberOfCopies > 100) {
      toast({
        variant: "destructive",
        title: "Invalid Copies",
        description: "Please enter a number of copies between 1 and 100.",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate async generation
    setTimeout(() => {
      const newCodes: GeneratedCode[] = Array.from({ length: numberOfCodes }, () => ({
        id: `BNDL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      }));
      setGeneratedCodes(newCodes);
      addQrCodesToStore(newCodes.map(c => c.id));
      setIsGenerating(false);
      toast({
        title: "QR Codes Generated",
        description: `${numberOfCodes} new unique QR codes have been created and are ready to print.`,
      });
    }, 500);
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Generate QR Code</h1>
        <p className="text-muted-foreground">
          Create and print unique QR codes for tracking production bundles.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Generation Settings</CardTitle>
          <CardDescription>
            Specify how many unique QR codes you need and how many copies of each to print.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="number-of-codes">Number of Unique QR Codes</Label>
              <Input
                id="number-of-codes"
                type="number"
                value={numberOfCodes}
                onChange={(e) => setNumberOfCodes(parseInt(e.target.value, 10) || 0)}
                min="1"
                max="500"
                disabled={isGenerating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number-of-copies">Copies per Code</Label>
              <Input
                id="number-of-copies"
                type="number"
                value={numberOfCopies}
                onChange={(e) => setNumberOfCopies(parseInt(e.target.value, 10) || 1)}
                min="1"
                max="100"
                disabled={isGenerating}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <QrCode className="mr-2 h-4 w-4" />
            )}
            Generate Codes
          </Button>
        </CardFooter>
      </Card>

      {generatedCodes.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Generated QR Codes</CardTitle>
              <CardDescription>
                A preview of the {generatedCodes.length} unique codes generated.{' '}
                {numberOfCopies > 1 ? `${numberOfCopies} copies of each will be printed.` : 'Click Print to get physical copies.'}
              </CardDescription>
            </div>
             <ReactToPrint
              trigger={() => (
                <button className={cn(buttonVariants())}>
                  <Printer />
                  Print
                </button>
              )}
              content={() => printComponentRef.current}
              documentTitle="QR_Codes"
              onAfterPrint={() => toast({ title: "Print complete." })}
            />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {generatedCodes.map((code) => (
                <div
                  key={code.id}
                  className="flex flex-col items-center gap-2 p-2 border rounded-lg"
                >
                  <QRCodeCanvas value={code.id} size={80} />
                  <p className="text-xs font-mono break-all text-center">
                    {code.id.split('-')[2]}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* This component is hidden from view and only used for printing */}
      <div className="hidden">
        <PrintableQrCodes ref={printComponentRef} codes={generatedCodes} numberOfCopies={numberOfCopies} />
      </div>
    </div>
  );
}
