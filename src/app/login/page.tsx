
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
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
import { useUserStore, useCheckPointStore } from "@/lib/store";
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
  const { checkPoints } = useCheckPointStore();

  const [isLoading, setIsLoading] = React.useState(false);
  const [validatedUser, setValidatedUser] = React.useState<User | null>(null);
  const [adminCheckpoint, setAdminCheckpoint] = React.useState<string>("");

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

    if (user) {
      if (user.role === 'Admin' && user.assignedCheckpoints.length > 1) {
        setValidatedUser(user);
        // Pre-select the first assigned checkpoint
        if (user.assignedCheckpoints.length > 0) {
            setAdminCheckpoint(user.assignedCheckpoints[0]);
        }
      } else {
        // System Admins have all checkpoints, Users have one.
        // For these roles, we can automatically determine the checkpoint.
        if (user.role === 'User' && user.assignedCheckpoints.length > 0) {
             setSelectedCheckpoint(user.assignedCheckpoints[0]);
        } else {
             setSelectedCheckpoint(null); // System admin or admin with 0/1 checkpoints
        }
        toast({ title: "Login Successful", description: `Welcome back, ${user.displayName}!` });
        router.push("/");
      }
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid username, password, or factory selection.",
      });
      form.setError("root", { message: "Invalid credentials" });
    }
  };
  
  const handleAdminCheckpointSelect = () => {
      if (!adminCheckpoint) {
          toast({ variant: "destructive", title: "Selection Required", description: "Please select a default checkpoint." });
          return;
      }
      setSelectedCheckpoint(adminCheckpoint);
      toast({ title: "Login Successful", description: `Welcome back, ${validatedUser?.displayName}!` });
      router.push("/");
  }

  const userAssignedCheckpoints = React.useMemo(() => {
      if (!validatedUser) return [];
      return checkPoints.filter(cp => validatedUser.assignedCheckpoints.includes(cp.id));
  }, [validatedUser, checkPoints]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {validatedUser ? "Select Checkpoint" : "Login"}
          </CardTitle>
          <CardDescription>
            {validatedUser
              ? `Welcome, ${validatedUser.displayName}. Please select your default station for this session.`
              : "Enter your credentials to access your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!validatedUser ? (
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
          ) : (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="checkpoint">Default Checkpoint Station</Label>
                     <Select value={adminCheckpoint} onValueChange={setAdminCheckpoint}>
                        <SelectTrigger id="checkpoint">
                            <SelectValue placeholder="Select a checkpoint" />
                        </SelectTrigger>
                        <SelectContent>
                            {userAssignedCheckpoints.map((cp) => (
                                <SelectItem key={cp.id} value={cp.id}>
                                    {cp.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleAdminCheckpointSelect} className="w-full">
                    Proceed to Dashboard
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
