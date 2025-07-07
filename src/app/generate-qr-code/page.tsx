
"use client";

import * as React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Loader2, QrCode, FileDown } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
import { useToast } from "@/hooks/use-toast";
import { useQrCodeStore } from "@/lib/store";

interface GeneratedCode {
  id: string;
}

// Component to render a single page for PDF generation
const PdfPage = React.forwardRef<HTMLDivElement, { codes: { id: string, uniqueKey: string }[] }>(({ codes }, ref) => (
  <div ref={ref} className="p-4 bg-white" style={{ width: '210mm', height: '297mm' }}>
    <div className="grid grid-cols-2 grid-rows-4 gap-x-4 gap-y-6 h-full w-full">
      {codes.map((code) => (
        <div key={code.uniqueKey} className="flex flex-col items-center justify-center p-2 border border-black rounded-lg">
          <QRCodeCanvas value={code.id} size={150} />
          <span className="mt-2 font-mono text-xs text-center break-all">{code.id}</span>
        </div>
      ))}
    </div>
  </div>
));
PdfPage.displayName = 'PdfPage';


export default function GenerateQrCodePage() {
  const { toast } = useToast();
  const addQrCodesToStore = useQrCodeStore((state) => state.addQrCodes);

  const [numberOfCodes, setNumberOfCodes] = React.useState<number>(10);
  const [numberOfCopies, setNumberOfCopies] = React.useState<number>(1);
  const [generatedCodes, setGeneratedCodes] = React.useState<GeneratedCode[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  // This state will hold the chunk of codes to be rendered for PDF generation
  const [codesForPdfPage, setCodesForPdfPage] = React.useState<{id: string, uniqueKey: string}[]>([]);
  const pdfPageRef = React.useRef<HTMLDivElement>(null);


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

    setTimeout(() => {
      const newCodes: GeneratedCode[] = Array.from({ length: numberOfCodes }, () => ({
        id: `BNDL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      }));
      setGeneratedCodes(newCodes);
      addQrCodesToStore(newCodes.map(c => c.id));
      setIsGenerating(false);
      toast({
        title: "QR Codes Generated",
        description: `${numberOfCodes} new unique QR codes have been created and are ready to export.`,
      });
    }, 500);
  };

  const handleExportPdf = async () => {
    if (generatedCodes.length === 0) {
        toast({
            variant: "destructive",
            title: "No Codes Generated",
            description: "Please generate QR codes first before exporting.",
        });
        return;
    }
    setIsExporting(true);
    
    const allCodesToPrint = generatedCodes.flatMap(code =>
        Array.from({ length: numberOfCopies }, (_, i) => ({
          ...code,
          uniqueKey: `${code.id}-${i}`,
        }))
    );
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const codesPerPage = 8;
    const totalPages = Math.ceil(allCodesToPrint.length / codesPerPage);

    for (let i = 0; i < totalPages; i++) {
        const chunk = allCodesToPrint.slice(i * codesPerPage, (i + 1) * codesPerPage);
        
        await new Promise<void>((resolve) => {
            setCodesForPdfPage(chunk);
            setTimeout(() => {
                if(pdfPageRef.current) {
                    html2canvas(pdfPageRef.current, { scale: 2 }).then(canvas => {
                        const imgData = canvas.toDataURL('image/png');
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = pdf.internal.pageSize.getHeight();
                        
                        if (i > 0) {
                            pdf.addPage();
                        }
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                        resolve();
                    });
                } else {
                    resolve();
                }
            }, 100);
        });
    }

    pdf.save("qr-codes.pdf");
    setCodesForPdfPage([]);
    setIsExporting(false);
    toast({
      title: "PDF Exported",
      description: "Your QR codes have been saved to qr-codes.pdf.",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Generate QR Code</h1>
        <p className="text-muted-foreground">
          Create and export unique QR codes for tracking production bundles.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Generation Settings</CardTitle>
          <CardDescription>
            Specify how many unique QR codes you need and how many copies of each to generate.
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
                disabled={isGenerating || isExporting}
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
                disabled={isGenerating || isExporting}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={isGenerating || isExporting}>
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
                {numberOfCopies > 1 ? `${numberOfCopies} copies of each will be created in the PDF.` : 'Click Export to get a PDF.'}
              </CardDescription>
            </div>
             <Button onClick={handleExportPdf} disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="mr-2 h-4 w-4" />
                )}
                Export PDF
             </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {generatedCodes.slice(0, 16).map((code) => (
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
             {generatedCodes.length > 16 && (
                <p className="text-center text-sm text-muted-foreground mt-4">...and {generatedCodes.length - 16} more.</p>
            )}
          </CardContent>
        </Card>
      )}
      
      <div className="fixed left-[-9999px] top-[-9999px]">
        <PdfPage ref={pdfPageRef} codes={codesForPdfPage} />
      </div>
    </div>
  );
}
