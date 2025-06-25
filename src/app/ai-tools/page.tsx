"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import {
  optimizeProductionSchedule,
  OptimizeProductionScheduleInput,
  OptimizeProductionScheduleOutput,
} from "@/ai/flows/optimize-production-schedule";
import {
  predictProductionBottlenecks,
  PredictProductionBottlenecksInput,
  PredictProductionBottlenecksOutput,
} from "@/ai/flows/predict-production-bottlenecks";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Sparkles } from "lucide-react";

type OptimizerState = {
  result: OptimizeProductionScheduleOutput | null;
  error: string | null;
};

type PredictorState = {
  result: PredictProductionBottlenecksOutput | null;
  error: string | null;
};

export default function AiToolsPage() {
  const { toast } = useToast();

  const [optimizerState, setOptimizerState] = useState<OptimizerState>({
    result: null,
    error: null,
  });
  const [isOptimizing, setIsOptimizing] = useState(false);

  const [predictorState, setPredictorState] = useState<PredictorState>({
    result: null,
    error: null,
  });
  const [isPredicting, setIsPredicting] = useState(false);

  const handleOptimizeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsOptimizing(true);
    setOptimizerState({ result: null, error: null });

    const formData = new FormData(event.currentTarget);
    const input: OptimizeProductionScheduleInput = {
      productionData: formData.get("productionData") as string,
      constraints: formData.get("constraints") as string,
      optimizationGoals: formData.get("optimizationGoals") as string,
    };

    try {
      const result = await optimizeProductionSchedule(input);
      setOptimizerState({ result, error: null });
    } catch (e: any) {
      const errorMessage = e.message || "An unknown error occurred.";
      setOptimizerState({ result: null, error: errorMessage });
      toast({
        variant: "destructive",
        title: "Optimization Failed",
        description: errorMessage,
      });
    }
    setIsOptimizing(false);
  };

  const handlePredictorSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPredicting(true);
    setPredictorState({ result: null, error: null });

    const formData = new FormData(event.currentTarget);
    const input: PredictProductionBottlenecksInput = {
      currentPerformanceData: formData.get("currentPerformanceData") as string,
      historicalData: formData.get("historicalData") as string,
      productionSchedule: formData.get("productionSchedule") as string,
    };

    try {
      const result = await predictProductionBottlenecks(input);
      setPredictorState({ result, error: null });
    } catch (e: any) {
      const errorMessage = e.message || "An unknown error occurred.";
      setPredictorState({ result: null, error: errorMessage });
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: errorMessage,
      });
    }
    setIsPredicting(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">AI-Powered Tools</h1>
        <p className="text-muted-foreground">
          Leverage AI to optimize your production and anticipate challenges.
        </p>
      </header>
      <Tabs defaultValue="optimizer" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="optimizer">Schedule Optimizer</TabsTrigger>
          <TabsTrigger value="bottleneck">Bottleneck Predictor</TabsTrigger>
        </TabsList>
        <TabsContent value="optimizer">
          <Card>
            <form onSubmit={handleOptimizeSubmit}>
              <CardHeader>
                <CardTitle>Optimize Production Schedule</CardTitle>
                <CardDescription>
                  Input real-time data to generate an optimized schedule.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productionData">Production Data</Label>
                  <Textarea
                    id="productionData"
                    name="productionData"
                    placeholder="e.g., Line 1: 80 units/hr, Line 2: 95 units/hr. 5 workers available."
                    defaultValue="Machine A: online, 98% efficiency. Machine B: offline for maintenance until 3 PM. Employee performance: 95% avg. Material X: 1000 units available. Material Y: 500 units available."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="constraints">Constraints</Label>
                  <Textarea
                    id="constraints"
                    name="constraints"
                    placeholder="e.g., Order #123 must be finished by EOD. Max 8-hour shifts."
                    defaultValue="Deadline for Order #556 is tomorrow. Priority for Style #ABC. Machine A maintenance scheduled for 4 PM."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="optimizationGoals">
                    Optimization Goals
                  </Label>
                  <Textarea
                    id="optimizationGoals"
                    name="optimizationGoals"
                    placeholder="e.g., Minimize idle time, maximize throughput."
                    defaultValue="Minimize bottlenecks, maximize overall efficiency, reduce production costs by 5%."
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isOptimizing}>
                  {isOptimizing ? "Optimizing..." : "Optimize Schedule"}
                </Button>
              </CardFooter>
            </form>
          </Card>
          {isOptimizing && <LoadingResult />}
          {optimizerState.result && (
            <OptimizerResult result={optimizerState.result} />
          )}
        </TabsContent>
        <TabsContent value="bottleneck">
          <Card>
            <form onSubmit={handlePredictorSubmit}>
              <CardHeader>
                <CardTitle>Predict Production Bottlenecks</CardTitle>
                <CardDescription>
                  Analyze data to predict and mitigate potential bottlenecks.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPerformanceData">
                    Current Performance Data
                  </Label>
                  <Textarea
                    id="currentPerformanceData"
                    name="currentPerformanceData"
                    placeholder="e.g., Cutting: 110 units/hr, Sewing: 100 units/hr, QC: 95 units/hr."
                    defaultValue="Cutting: 120 units/hour. Sewing Line 1: 90 units/hour (1 worker absent). Sewing Line 2: 105 units/hour. QC: 100 units/hour. Defect rate: 3%."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="historicalData">Historical Data</Label>
                  <Textarea
                    id="historicalData"
                    name="historicalData"
                    placeholder="e.g., Last month, sewing was a bottleneck due to machine failure. High demand for Style XYZ."
                    defaultValue="Last week, Sewing Line 1 had 5 hours of downtime due to machine issues. Similar styles in the past showed a 10% higher defect rate at the start of production."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productionSchedule">
                    Production Schedule
                  </Label>
                  <Textarea
                    id="productionSchedule"
                    name="productionSchedule"
                    placeholder="e.g., Order #123 (Style ABC, 1000 units) due Friday. Order #124 (Style DEF, 500 units) due Monday."
                    defaultValue="Order #789 (Style: Complex Denim, 2000 units) starts today, due in 3 days. Order #790 (Style: Simple T-shirt, 5000 units) starts tomorrow."
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isPredicting}>
                  {isPredicting ? "Predicting..." : "Predict Bottlenecks"}
                </Button>
              </CardFooter>
            </form>
          </Card>
          {isPredicting && <LoadingResult />}
          {predictorState.result && (
            <PredictorResult result={predictorState.result} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingResult() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

function OptimizerResult({
  result,
}: {
  result: OptimizeProductionScheduleOutput;
}) {
  return (
    <div className="mt-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            Optimized Production Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-md text-sm font-code whitespace-pre-wrap">
            {result.optimizedSchedule}
          </pre>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive" />
            Predicted Bottlenecks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-md text-sm font-code whitespace-pre-wrap">
            {result.predictedBottlenecks}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

function PredictorResult({
  result,
}: {
  result: PredictProductionBottlenecksOutput;
}) {
  return (
    <div className="mt-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive" />
            Predicted Bottlenecks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-md text-sm font-code whitespace-pre-wrap">
            {result.predictedBottlenecks}
          </pre>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-md text-sm font-code whitespace-pre-wrap">
            {result.recommendations}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
