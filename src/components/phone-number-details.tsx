
import type { ParsePhoneNumberOutput } from "@/ai/flows/parse-phone-number";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Phone,
  Hash,
  Signal,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  Smartphone,
  Info,
} from "lucide-react";

interface PhoneNumberDetailsProps {
  details: ParsePhoneNumberOutput;
}

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value: string | number | null | undefined; valueClassName?: string }> = ({
  icon: Icon,
  label,
  value,
  valueClassName
}) => {
  if (value === null || value === undefined || value === "") {
    return (
       <div className="flex items-center space-x-3 py-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium text-sm w-1/3">{label}:</span>
        <span className={`text-sm text-muted-foreground ${valueClassName}`}>Not available</span>
      </div>
    );
  }
  return (
    <div className="flex items-start space-x-3 py-2">
      <Icon className="h-5 w-5 text-primary mt-1" />
      <div className="flex flex-col sm:flex-row sm:items-center w-full">
        <span className="font-medium text-sm w-full sm:w-1/3">{label}:</span>
        <span className={`text-sm text-foreground break-all ${valueClassName}`}>{String(value)}</span>
      </div>
    </div>
  );
};


export function PhoneNumberDetails({ details }: PhoneNumberDetailsProps) {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Phone Number Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <DetailItem icon={Globe} label="Region" value={details.countryCode} />
        <Separator />
        <DetailItem icon={Phone} label="E.164 Format" value={details.e164Format} />
        <Separator />
        <DetailItem icon={Hash} label="National Number" value={details.nationalNumber} />
        <Separator />
        <DetailItem icon={Signal} label="Carrier" value={details.carrier} />
        <Separator />
        <DetailItem icon={Clock} label="Timezone(s)" value={details.timezone} />
        <Separator />
        <div className="flex items-center space-x-3 py-2">
          {details.isValidNumber ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-destructive" />}
          <span className="font-medium text-sm w-1/3">Is Valid:</span>
          <span className={`text-sm ${details.isValidNumber ? 'text-green-700' : 'text-destructive'}`}>
            {details.isValidNumber ? "Yes" : "No"}
          </span>
        </div>
        <Separator />
        <div className="flex items-center space-x-3 py-2">
          {details.isPossibleNumber ? <HelpCircle className="h-5 w-5 text-blue-600" /> : <AlertCircle className="h-5 w-5 text-yellow-600" />}
          <span className="font-medium text-sm w-1/3">Is Possible:</span>
          <span className={`text-sm ${details.isPossibleNumber ? 'text-blue-700' : 'text-yellow-700'}`}>
            {details.isPossibleNumber ? "Yes" : "No"}
          </span>
        </div>
        <Separator />
        <DetailItem icon={Smartphone} label="Number Type" value={details.numberType ? String(details.numberType).replace(/_/g, ' ') : null} />
      </CardContent>
    </Card>
  );
}
