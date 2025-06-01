
"use client";

import type { ParsePhoneNumberOutput } from "@/ai/flows/parse-phone-number";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getPhoneNumberDetailsAction } from "@/lib/actions";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Phone number is required.")
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid international phone number (e.g., +12025550123).")
});

type FormValues = z.infer<typeof formSchema>;

interface PhoneNumberFormProps {
  onSuccess: (data: ParsePhoneNumberOutput) => void;
  onError: (message: string) => void;
  onLoading: (loading: boolean) => void;
}

export function PhoneNumberForm({ onSuccess, onError, onLoading }: PhoneNumberFormProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const {formState: {isSubmitting}} = form;

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    onLoading(true);
    onError(""); // Clear previous errors
    try {
      const result = await getPhoneNumberDetailsAction(data);
      if (result.error) {
        onError(result.error);
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.data) {
        onSuccess(result.data);
         toast({
          title: "Success!",
          description: "Phone number details retrieved.",
        });
      } else {
        onError("No data received from the server.");
         toast({
          title: "Error",
          description: "No data received from the server.",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      onError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      onLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="phoneNumber" className="text-base">Enter Phone Number</FormLabel>
              <FormControl>
                <Input 
                  id="phoneNumber"
                  type="tel" 
                  placeholder="+1 202 555 0111" 
                  {...field} 
                  className="text-base"
                  aria-describedby="phoneNumber-message"
                />
              </FormControl>
              <FormMessage id="phoneNumber-message" />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-base py-3" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Get Info"
          )}
        </Button>
      </form>
    </Form>
  );
}
