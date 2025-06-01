
"use client";

import { useState, useEffect } from "react";
import type { ParsePhoneNumberOutput } from "@/ai/flows/parse-phone-number";
import { PhoneNumberForm } from "@/components/phone-number-form";
import { PhoneNumberDetails } from "@/components/phone-number-details";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, LocateFixed, Compass } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { countryCoordinates } from "@/lib/country-coordinates";
import type { Coordinates } from "@/lib/country-coordinates";


export default function HomePage() {
  const [phoneNumberDetails, setPhoneNumberDetails] = useState<ParsePhoneNumberOutput | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = (data: ParsePhoneNumberOutput) => {
    setPhoneNumberDetails(data);
    setError(null);
    if (data.countryCode) {
      const coords = countryCoordinates[data.countryCode.toUpperCase()];
      setCoordinates(coords || null);
    } else {
      setCoordinates(null);
    }
  };

  const handleError = (message: string) => {
    setError(message);
    setPhoneNumberDetails(null);
    setCoordinates(null);
  };

  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setError(null); 
      setPhoneNumberDetails(null);
      setCoordinates(null);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
      <div className="w-full max-w-2xl space-y-8">
        <Card className="w-full shadow-2xl overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-3xl font-headline text-center">Phone Number Info Lookup</CardTitle>
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
                <Skeleton className="h-8 w-3/5" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(8)].map((_, i) => ( // Increased array size for more skeleton items if needed
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
              latitude={coordinates?.lat || null}
              longitude={coordinates?.lng || null}
            />
          </div>
        )}
      </div>
      <footer className="text-center text-sm text-muted-foreground py-8 font-body">
        Powered by Next.js, Genkit, and ShadCN UI.
      </footer>
    </main>
  );
}
