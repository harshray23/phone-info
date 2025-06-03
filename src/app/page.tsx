
"use client";

import { useState, useEffect } from "react";
import type { ParsePhoneNumberOutput } from "@/ai/flows/parse-phone-number";
import { PhoneNumberForm } from "@/components/phone-number-form";
import { PhoneNumberDetails } from "@/components/phone-number-details";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Globe2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


export default function HomePage() {
  const [phoneNumberDetails, setPhoneNumberDetails] = useState<ParsePhoneNumberOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userTimezone, setUserTimezone] = useState<string | null>(null);

  useEffect(() => {
    // Get user's timezone on the client side after hydration
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const handleSuccess = (data: ParsePhoneNumberOutput) => {
    setPhoneNumberDetails(data);
    setError(null);
  };

  const handleError = (message: string) => {
    setError(message);
    setPhoneNumberDetails(null);
  };

  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setError(null); 
      setPhoneNumberDetails(null);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
      <div className="w-full max-w-2xl space-y-8">
        <Card className="w-full shadow-2xl overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-3xl font-headline text-center">
               <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 text-transparent bg-clip-text">
                TraceIt
              </span>
            </CardTitle>
            <CardDescription className="text-primary-foreground/90 text-center font-body text-sm pt-1">
              Enter an international phone number to get its details.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <PhoneNumberForm 
              onSuccess={handleSuccess} 
              onError={handleError}
              onLoading={handleLoading}
            />

            {error && (
              <Alert variant="destructive" className="mt-6">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        {isLoading && (
          <div className="space-y-6">
            <Card className="w-full shadow-lg">
              <CardHeader>
                <Skeleton className="h-8 w-3/5" /> {/* For Title "Phone Number Details" */}
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(8)].map((_, i) => ( 
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    {i < 7 && <Skeleton className="h-px w-full mt-2" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {!isLoading && phoneNumberDetails && (
          <div className="space-y-6">
            <PhoneNumberDetails 
              details={phoneNumberDetails} 
            />
          </div>
        )}
      </div>

      {userTimezone && (
        <div className="text-center text-sm text-muted-foreground mt-8 py-2 font-body flex items-center justify-center">
          <Globe2 className="h-4 w-4 mr-2 text-primary" />
          Your current timezone: <span className="font-semibold ml-1">{userTimezone}</span>
        </div>
      )}

      <footer className="text-center text-sm text-muted-foreground pt-2 pb-8 font-body">
        Powered by Next.js, Genkit, and ShadCN UI.
      </footer>
    </main>
  );
}
