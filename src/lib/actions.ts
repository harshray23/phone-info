
'use server';

import { parsePhoneNumber, type ParsePhoneNumberInput, type ParsePhoneNumberOutput } from '@/ai/flows/parse-phone-number';
import { z } from 'zod';

const ActionInputSchema = z.object({
  phoneNumber: z.string(),
});

export async function getPhoneNumberDetailsAction(data: ParsePhoneNumberInput): Promise<{ data: ParsePhoneNumberOutput | null; error: string | null }> {
  const validatedInput = ActionInputSchema.safeParse(data);
  if (!validatedInput.success) {
    return { data: null, error: "Invalid input." };
  }

  try {
    const result = await parsePhoneNumber(validatedInput.data);
    if (!result) {
        return { data: null, error: "Failed to parse phone number. No details returned."};
    }
    return { data: result, error: null };
  } catch (error) {
    console.error("Error in getPhoneNumberDetailsAction:", error);
    // Check if error is an instance of Error to safely access message
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while parsing the phone number.";
    return { data: null, error: errorMessage };
  }
}
