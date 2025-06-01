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
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

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
      const countryName = phoneUtil.getCountryCodeForRegion(countryCode);
      const nationalNumber = String(phoneNumber.getNationalNumber());
      const e164Format = phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);
      const carrier = phoneUtil.getNameForNumber(phoneNumber, 'en');
      const timezones = phoneUtil.getTimeZonesForNumber(phoneNumber);
      const isValidNumber = phoneUtil.isValidNumber(phoneNumber);
      const numberType = phoneUtil.getNumberType(phoneNumber);
      const isPossibleNumber = phoneUtil.isPossibleNumber(phoneNumber);

      return {
        countryCode: countryCode || null,
        countryName: phoneUtil.getRegionCodeForNumber(phoneNumber) || null,
        nationalNumber: nationalNumber || null,
        e164Format: e164Format || null,
        carrier: carrier || null,
        timezone: timezones.length > 0 ? timezones.join(', ') : null,
        isValidNumber: isValidNumber || null,
        numberType: PhoneNumberUtil.getNumberType(phoneNumber).toString() || null,
        isPossibleNumber: isPossibleNumber || null,
      };
    } catch (error: any) {
      console.error('Error parsing phone number:', error);
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
  prompt: `Parse the provided phone number and extract its details. Use the parsePhoneNumber tool to get the information. Return the data from the parsePhoneNumber tool.

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
    return output!;
  }
);
