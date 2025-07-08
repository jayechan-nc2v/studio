
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { useUserStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { mockFactories, type User } from "@/lib/data";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
  factory: z.string().min(1, "You must select a factory."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, setSelectedCheckpoint, currentUser } = useUserStore();

  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  
  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (currentUser) {
      router.replace('/');
    }
  }, [currentUser, router]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    const user = await login(data.username, data.password, data.factory);
    setIsLoading(false);

    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid username, password, or factory selection.",
      });
      form.setError("root", { message: "Invalid credentials" });
      return;
    }
    
    // For all users, set the default checkpoint and proceed to the dashboard.
    // The first assigned checkpoint will be the default.
    let checkpointToSet: string | null = null;
    if (user.assignedCheckpoints && user.assignedCheckpoints.length > 0) {
      checkpointToSet = user.assignedCheckpoints[0];
    }
    
    setSelectedCheckpoint(checkpointToSet);
    toast({ title: "Login Successful", description: `Welcome back, ${user.displayName}!` });
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4">
      <div className="mb-6 flex items-center gap-2 text-primary">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
        >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <h1 className="text-3xl font-bold">BFN Production</h1>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            Login
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...form.register("username")} disabled={isLoading} />
                {form.formState.errors.username && <p className="text-sm font-medium text-destructive">{form.formState.errors.username.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register("password")} disabled={isLoading} />
                 {form.formState.errors.password && <p className="text-sm font-medium text-destructive">{form.formState.errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="factory">Factory</Label>
                <Controller
                    control={form.control}
                    name="factory"
                    render={({ field }) => (
                         <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                            <SelectTrigger id="factory">
                                <SelectValue placeholder="Select a factory" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockFactories.map((factory) => (
                                    <SelectItem key={factory} value={factory}>{factory}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                 {form.formState.errors.factory && <p className="text-sm font-medium text-destructive">{form.formState.errors.factory.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Login
              </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
