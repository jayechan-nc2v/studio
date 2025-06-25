import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

export default function QualityControlPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Quality Control</h1>
        <p className="text-muted-foreground">
          Input QC results and manage rework for failed items.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>QC Checkpoint</CardTitle>
          <CardDescription>
            This feature is under development. The form below is a preview.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bundle-id">Bundle/Item QR Code</Label>
            <Input id="bundle-id" placeholder="Scan or enter QR code..." />
          </div>
          <div className="space-y-2">
            <Label>QC Result</Label>
            <RadioGroup defaultValue="pass" className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pass" id="pass" />
                <Label htmlFor="pass">Pass</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fail" id="fail" />
                <Label htmlFor="fail">Fail</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fail-reason">Reason for Failure (if any)</Label>
            <Textarea id="fail-reason" placeholder="e.g., Stitching error on left sleeve..." />
          </div>
           <Button>Submit QC Result</Button>
        </CardContent>
      </Card>
    </div>
  );
}
