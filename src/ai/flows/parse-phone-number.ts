
'use server';

/**
 * @fileOverview Parses a phone number and extracts relevant information.
 *
 * - parsePhoneNumber - A function that parses a phone number and extracts information.
 * - ParsePhoneNumberInput - The input type for the parsePhoneNumber function.
 * - ParsePhoneNumberOutput - The return type for the parsePhoneNumber function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PhoneNumberUtil, PhoneNumberFormat, PhoneNumberType } from 'google-libphonenumber';

const ParsePhoneNumberInputSchema = z.object({
  phoneNumber: z
    .string()
    .describe('The phone number to parse, in international format (e.g., +16502530000).'),
});
export type ParsePhoneNumberInput = z.infer<typeof ParsePhoneNumberInputSchema>;

const ParsePhoneNumberOutputSchema = z.object({
  countryCode: z.string().describe('The ISO country code of the phone number (e.g., US, IN).').nullable(),
  regionDescription: z.string().describe('The descriptive name of the State or Region associated with the phone number (e.g., California, West Bengal). This is not just the country name.').nullable(),
  nationalNumber: z.string().describe('The national significant number (e.g., 6502530000).').nullable(),
  e164Format: z.string().describe('The phone number in E.164 format (e.g., +16502530000).').nullable(),
  carrier: z.string().describe('The carrier of the phone number (e.g., Verizon, Reliance Jio), if available.').nullable(),
  timezone: z.string().describe('The timezone(s) associated with the phone number (e.g., America/Los_Angeles, Asia/Kolkata).').nullable(),
  isValidNumber: z.boolean().describe('Whether the phone number is a valid number.').nullable(),
  numberType: z.string().describe('The type of the phone number (e.g., MOBILE, FIXED_LINE).').nullable(),
  isPossibleNumber: z.boolean().describe('Whether the phone number is a possible number (a looser check than isValidNumber).').nullable(),
});
export type ParsePhoneNumberOutput = z.infer<typeof ParsePhoneNumberOutputSchema>;

export async function parsePhoneNumber(input: ParsePhoneNumberInput): Promise<ParsePhoneNumberOutput> {
  return parsePhoneNumberFlow(input);
}

const getPhoneNumberTypeString = (type: PhoneNumberType | undefined): string | null => {
  if (type === undefined || type === null) return null;
  switch (type) {
    case PhoneNumberType.FIXED_LINE: return 'FIXED_LINE';
    case PhoneNumberType.MOBILE: return 'MOBILE';
    case PhoneNumberType.FIXED_LINE_OR_MOBILE: return 'FIXED_LINE_OR_MOBILE';
    case PhoneNumberType.TOLL_FREE: return 'TOLL_FREE';
    case PhoneNumberType.PREMIUM_RATE: return 'PREMIUM_RATE';
    case PhoneNumberType.SHARED_COST: return 'SHARED_COST';
    case PhoneNumberType.VOIP: return 'VOIP';
    case PhoneNumberType.PERSONAL_NUMBER: return 'PERSONAL_NUMBER';
    case PhoneNumberType.PAGER: return 'PAGER';
    case PhoneNumberType.UAN: return 'UAN';
    case PhoneNumberType.VOICEMAIL: return 'VOICEMAIL';
    case PhoneNumberType.UNKNOWN: return 'UNKNOWN';
    default: return 'OTHER'; // Fallback for any other type not explicitly listed
  }
};

const parsePhoneNumberTool = ai.defineTool({
    name: 'parsePhoneNumberLibTool', // Renamed to avoid conflict if a flow is also named parsePhoneNumber
    description: 'Parses a phone number using google-libphonenumber to get basic details. This tool provides countryCode, nationalNumber, e164Format, timezone, isValidNumber, numberType, and isPossibleNumber. It returns null for regionDescription and carrier, which should be determined by the LLM.',
    inputSchema: ParsePhoneNumberInputSchema,
    outputSchema: ParsePhoneNumberOutputSchema, // Tool must conform to the final output schema
  },
  async (input: ParsePhoneNumberInput) => {
    const phoneUtil = PhoneNumberUtil.getInstance();

    try {
      const phoneNumber = phoneUtil.parse(input.phoneNumber);
      const countryCode = phoneUtil.getRegionCodeForNumber(phoneNumber);
      const nationalNumber = String(phoneNumber.getNationalNumber());
      const e164Format = phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);
      const timezones = phoneUtil.getTimeZonesForNumber(phoneNumber);
      const isValidNumber = phoneUtil.isValidNumber(phoneNumber);
      const numberType = phoneUtil.getNumberType(phoneNumber);
      const isPossibleNumber = phoneUtil.isPossibleNumber(phoneNumber);

      return {
        countryCode: countryCode || null,
        regionDescription: null, // This tool cannot provide detailed region/state. LLM should fill this.
        nationalNumber: nationalNumber || null,
        e164Format: e164Format || null,
        carrier: null, // This tool cannot reliably provide carrier. LLM should fill this.
        timezone: timezones && timezones.length > 0 ? timezones.join(', ') : null,
        isValidNumber: isValidNumber,
        numberType: getPhoneNumberTypeString(numberType),
        isPossibleNumber: isPossibleNumber,
      };
    } catch (error: any) {
      console.error('Error parsing phone number with google-libphonenumber:', error.message);
      // Return schema-compliant nulls for error cases
      return {
        countryCode: null,
        regionDescription: null,
        nationalNumber: null,
        e164Format: null,
        carrier: null,
        timezone: null,
        isValidNumber: false,
        numberType: null,
        isPossibleNumber: false,
      };
    }
  }
);


const parsePhoneNumberPrompt = ai.definePrompt({
  name: 'parsePhoneNumberPrompt',
  prompt: `You are a phone number analysis expert.
Your task is to parse the provided phone number and extract comprehensive details.

Phone Number to analyze: {{{phoneNumber}}}

First, use the 'parsePhoneNumberLibTool' to get foundational information. This tool will provide:
- countryCode (e.g., 'US', 'IN')
- nationalNumber
- e164Format
- timezone (if available from the library)
- isValidNumber
- numberType
- isPossibleNumber

The 'parsePhoneNumberLibTool' will return 'null' for 'regionDescription' and 'carrier'.

After getting the tool's output, your main responsibility is to:
1. Determine the 'regionDescription': This is the specific State or Region name (e.g., "California", "West Bengal", "New South Wales"), not just the country name. Use the 'countryCode' and 'nationalNumber' from the tool's output and your general knowledge to deduce this.
2. Determine the 'carrier': This is the telecommunications company providing service for the number (e.g., "Verizon", "Reliance Jio", "Vodafone"). Use the 'countryCode', 'nationalNumber', and your general knowledge.

Combine the information from the tool with your determined 'regionDescription' and 'carrier'.
Return all fields as defined in the ParsePhoneNumberOutputSchema.
If you cannot confidently determine 'regionDescription' or 'carrier', you may return them as null.
Ensure the output strictly adheres to the ParsePhoneNumberOutputSchema.
`,
  input: {schema: ParsePhoneNumberInputSchema},
  output: {schema: ParsePhoneNumberOutputSchema},
  tools: [parsePhoneNumberTool], // Provide the tool to the prompt
});

const parsePhoneNumberFlow = ai.defineFlow(
  {
    name: 'parsePhoneNumberFlow',
    inputSchema: ParsePhoneNumberInputSchema,
    outputSchema: ParsePhoneNumberOutputSchema,
  },
  async (input: ParsePhoneNumberInput): Promise<ParsePhoneNumberOutput> => {
    const {output} = await parsePhoneNumberPrompt(input);
    if (!output) {
        // This case should ideally be handled by Zod schema validation if the LLM returns non-compliant output.
        // However, if the LLM literally returns nothing, this error is appropriate.
        throw new Error("The AI prompt did not return a valid output for parsing the phone number.");
    }
    // Ensure all fields are present, defaulting to null if necessary, to match the schema.
    // Zod parsing of the output in definePrompt should handle this, but defensive coding is good.
    return {
        countryCode: output.countryCode || null,
        regionDescription: output.regionDescription || null,
        nationalNumber: output.nationalNumber || null,
        e164Format: output.e164Format || null,
        carrier: output.carrier || null,
        timezone: output.timezone || null,
        isValidNumber: typeof output.isValidNumber === 'boolean' ? output.isValidNumber : null,
        numberType: output.numberType || null,
        isPossibleNumber: typeof output.isPossibleNumber === 'boolean' ? output.isPossibleNumber : null,
    };
  }
);
