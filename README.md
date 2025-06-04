# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
# phone-info

## Local Development

1.  Create a `.env` file in the root of your project.
2.  Add your Google AI API key to the `.env` file:
    ```
    GOOGLE_API_KEY=AIzaSyAMWGGAarWjYltqTf2fPG-SfBcG-_Kl3W0
    ```
    Replace `YOUR_API_KEY_HERE` with your actual API key.

## Deployment

### Vercel

When deploying to Vercel (or a similar platform), ensure you set the `GOOGLE_API_KEY` (or `GEMINI_API_KEY`) as an environment variable in your Vercel project settings. The application needs this key at runtime to access Google AI services via Genkit.

Without this environment variable set in Vercel, you will encounter a `FAILED_PRECONDITION` error related to the missing API key.
