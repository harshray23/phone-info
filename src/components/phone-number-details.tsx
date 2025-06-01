
import type { ParsePhoneNumberOutput } from "@/ai/flows/parse-phone-number";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Globe, 
  MapPin, 
  Phone,
  Hash,
  Signal,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  Smartphone,
  LocateFixed, 
  Compass,    
} from "lucide-react";

interface PhoneNumberDetailsProps {
  details: ParsePhoneNumberOutput;
  latitude: number | null;
  longitude: number | null;
  locationScope: 'Region' | 'Country' | null;
}

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value: string | number | boolean | null | undefined; valueClassName?: string }> = ({
  icon: Icon,
  label,
  value,
  valueClassName
}) => {
  let displayValue: string | React.ReactNode = String(value);
  let iconColorClass = "text-primary";

  if (value === null || value === undefined || value === "" || (typeof value === 'number' && isNaN(value))) {
    displayValue = "Not available";
    iconColorClass = "text-muted-foreground";
  } else if (typeof value === 'boolean') {
    displayValue = value ? "Yes" : "No";
  } else if (typeof value === 'number') {
    if (label.toLowerCase().includes("latitude") || label.toLowerCase().includes("longitude")) {
      displayValue = value.toFixed(4); 
    } else {
      displayValue = String(value); 
    }
  }

  return (
    <div className="flex items-start space-x-3 py-3">
      <Icon className={`h-5 w-5 ${iconColorClass} mt-0.5 shrink-0`} />
      <div className="flex flex-col sm:flex-row sm:items-start w-full">
        <span className="font-medium text-sm w-full sm:w-2/5 md:w-1/3 shrink-0">{label}:</span>
        <span className={`text-sm text-foreground break-words min-w-0 ${displayValue === "Not available" ? "text-muted-foreground" : ""} ${valueClassName}`}>
          {displayValue}
        </span>
      </div>
    </div>
  );
};


export function PhoneNumberDetails({ details, latitude, longitude, locationScope }: PhoneNumberDetailsProps) {
  const latLabel = `Approx. Latitude (${locationScope || 'N/A'})`;
  const lngLabel = `Approx. Longitude (${locationScope || 'N/A'})`;

  return (
    <Card className="w-full shadow-lg overflow-hidden">
      <CardHeader className="bg-gray-50 dark:bg-gray-800">
        <CardTitle className="text-2xl font-headline text-primary">Phone Number Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 p-6">
        <DetailItem icon={Globe} label="Country Code" value={details.countryCode} />
        <Separator />
        <DetailItem icon={MapPin} label="State/Region" value={details.regionDescription} />
        <Separator />
        <DetailItem icon={Phone} label="E.164 Format" value={details.e164Format} />
        <Separator />
        <DetailItem icon={Hash} label="National Number" value={details.nationalNumber} />
        <Separator />
        <DetailItem icon={Signal} label="Carrier" value={details.carrier} />
        <Separator />
        <DetailItem icon={Clock} label="Timezone(s)" value={details.timezone} />
        <Separator />
        <DetailItem icon={LocateFixed} label={latLabel} value={latitude} />
        <Separator />
        <DetailItem icon={Compass} label={lngLabel} value={longitude} />
        <Separator />
        <div className="flex items-start space-x-3 py-3">
          {details.isValidNumber === null ? <HelpCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" /> : details.isValidNumber ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" /> : <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />}
          <div className="flex flex-col sm:flex-row sm:items-start w-full">
            <span className="font-medium text-sm w-full sm:w-2/5 md:w-1/3 shrink-0">Is Valid:</span>
            <span className={`text-sm ${details.isValidNumber === null ? "text-muted-foreground" : details.isValidNumber ? 'text-green-700 dark:text-green-500' : 'text-destructive'}`}>
              {details.isValidNumber === null ? "Not available" : details.isValidNumber ? "Yes" : "No"}
            </span>
          </div>
        </div>
        <Separator />
        <div className="flex items-start space-x-3 py-3">
           {details.isPossibleNumber === null ? <HelpCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" /> : details.isPossibleNumber ? <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" /> : <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />}
          <div className="flex flex-col sm:flex-row sm:items-start w-full">
            <span className="font-medium text-sm w-full sm:w-2/5 md:w-1/3 shrink-0">Is Possible:</span>
            <span className={`text-sm ${details.isPossibleNumber === null ? "text-muted-foreground" : details.isPossibleNumber ? 'text-blue-700 dark:text-blue-500' : 'text-yellow-700 dark:text-yellow-500'}`}>
              {details.isPossibleNumber === null ? "Not available" : details.isPossibleNumber ? "Yes" : "No"}
            </span>
          </div>
        </div>
        <Separator />
        <DetailItem icon={Smartphone} label="Number Type" value={details.numberType ? String(details.numberType).replace(/_/g, ' ') : null} />
      </CardContent>
    </Card>
  );
}

