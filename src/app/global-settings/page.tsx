
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useGlobalSettingsStore } from "@/lib/store";
import { type GlobalSettingsFormValues, globalSettingsSchema } from "@/lib/schemas";
import { Save } from "lucide-react";

export default function GlobalSettingsPage() {
    const { toast } = useToast();
    const { settings, updateSettings } = useGlobalSettingsStore();

    const form = useForm<GlobalSettingsFormValues>({
        resolver: zodResolver(globalSettingsSchema),
        defaultValues: settings,
    });

    React.useEffect(() => {
        form.reset(settings);
    }, [settings, form]);

    const onSubmit = (data: GlobalSettingsFormValues) => {
        updateSettings(data);
        toast({
            title: "Settings Saved",
            description: "Your global settings have been successfully updated.",
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Global Settings</h1>
                <p className="text-muted-foreground">
                    Manage factory-wide information and targets.
                </p>
            </header>
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Factory Information</CardTitle>
                            <CardDescription>
                                These settings apply to the entire application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                                <FormField
                                    control={form.control}
                                    name="factoryName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Factory Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., BFN Garment Factory" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="factoryInCharge"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Factory In-charge</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Mr. Budi" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="efficiencyTarget"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Efficiency Target (%)</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    min="0"
                                                    max="100"
                                                    placeholder="e.g., 85" 
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormDescription>The target production efficiency for the factory.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="overtimePaid"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Overtime Paid (per hour)</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="e.g., 2.50" 
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormDescription>The monetary value for overtime pay.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit">
                                <Save className="mr-2 h-4 w-4" />
                                Save Settings
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
