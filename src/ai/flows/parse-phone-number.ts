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
  countryCode: z.string().describe('The country code of the phone number (e.g., US).').nullable(),
  countryName: z.string().describe('The name of the country of the phone number (e.g., United States).').nullable(),
  nationalNumber: z.string().describe('The national number (e.g., 6502530000).').nullable(),
  e164Format: z.string().describe('The phone number in E.164 format (e.g., +16502530000).').nullable(),
  carrier: z.string().describe('The carrier of the phone number, if available.').nullable(),
  timezone: z.string().describe('The timezone(s) associated with the phone number.').nullable(),
  isValidNumber: z.boolean().describe('Whether the phone number is a valid number.').nullable(),
  numberType: z.string().describe('The type of the phone number (e.g., MOBILE, FIXED_LINE).').nullable(),
  isPossibleNumber: z.boolean().describe('Whether the phone number is a possible number.').nullable(),
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
    default: return null;
  }
};

const parsePhoneNumberTool = ai.defineTool({
    name: 'parsePhoneNumber',
    description: 'Parses a phone number and returns information about it using the google-libphonenumber library.',
    inputSchema: ParsePhoneNumberInputSchema,
    outputSchema: ParsePhoneNumberOutputSchema,
  },
  async input => {
    const phoneUtil = PhoneNumberUtil.getInstance();

    try {
      const phoneNumber = phoneUtil.parse(input.phoneNumber);

      const countryCode = phoneUtil.getRegionCodeForNumber(phoneNumber);
      // const countryName = phoneUtil.getCountryCodeForRegion(countryCode); // This gives country calling code, not name
      const nationalNumber = String(phoneNumber.getNationalNumber());
      const e164Format = phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);
      // const carrier = phoneUtil.getNameForNumber(phoneNumber, 'en'); // This is often inaccurate or not available
      const timezones = phoneUtil.getTimeZonesForNumber(phoneNumber);
      const isValidNumber = phoneUtil.isValidNumber(phoneNumber);
      const numberType = phoneUtil.getNumberType(phoneNumber);
      const isPossibleNumber = phoneUtil.isPossibleNumber(phoneNumber);

      // For carrier and country name, we'll rely on the LLM's general knowledge or skip if not critical
      // Or, we can set them to null if not reliably obtainable from this library.

      return {
        countryCode: countryCode || null,
        countryName: null, // Set to null as libphonenumber doesn't provide a reliable way to get full country name
        nationalNumber: nationalNumber || null,
        e164Format: e164Format || null,
        carrier: null, // Set to null as libphonenumber carrier info is limited
        timezone: timezones && timezones.length > 0 ? timezones.join(', ') : null,
        isValidNumber: isValidNumber,
        numberType: getPhoneNumberTypeString(numberType),
        isPossibleNumber: isPossibleNumber,
      };
    } catch (error: any) {
      console.error('Error parsing phone number with google-libphonenumber:', error.message);
      return {
        countryCode: null,
        countryName: null,
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
  prompt: `Parse the provided phone number and extract its details. Use the parsePhoneNumber tool to get the information.
If the country name or carrier is not provided by the tool (null), try to determine it based on the phone number and country code.
Return all available data from the parsePhoneNumber tool, supplemented with country name and carrier if you can determine them.

Phone Number: {{{phoneNumber}}}`, // Access phone number from input
  input: {schema: ParsePhoneNumberInputSchema},
  output: {schema: ParsePhoneNumberOutputSchema},
  tools: [parsePhoneNumberTool],
});

const parsePhoneNumberFlow = ai.defineFlow(
  {
    name: 'parsePhoneNumberFlow',
    inputSchema: ParsePhoneNumberInputSchema,
    outputSchema: ParsePhoneNumberOutputSchema,
  },
  async input => {
    const {output} = await parsePhoneNumberPrompt(input);
    if (!output) {
        throw new Error("The AI prompt did not return an output for parsing the phone number.");
    }
    return output;
  }
);
