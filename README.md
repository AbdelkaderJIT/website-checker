## Installation & Setup

1. **Install the DeepSeek model**  
   It is crucial to have the DeepSeek model installed for the application to work. Run the following command:  
   ```bash
   ollama run deepseek-r1:latest
   ```

2. **Install project dependencies**  
   Install all the required dependencies listed in `package.json` by running:  
   ```bash
   npm install
   ```

3. **Start the application**  
   Once dependencies are installed, start the app using:  
   ```bash
   npm run dev
   ```

## Lite AI analysis

To reduce local AI workload and test faster, enable the lightweight analysis mode:

- Set the environment variable `LITE_ANALYSIS=true` and restart the Next server to make the app use the smaller AI flow for all analysis runs.
- For quick testing without restarting, POST to the API `POST /api/analyze` with JSON body `{ "url": "https://example.com", "lite": true }` to force a lite run for that request.

This mode truncates page text (default 4000 chars) and runs a compact prompt to return only a few fields (scores and short feedback), which reduces model time and token usage.

Environment variables to tune timeouts:

- `AI_TIMEOUT_LITE_MS` — timeout for lite AI runs (ms). Default: 60000 (1 minute).
- `AI_TIMEOUT_LITE_EXTENDED_MS` — extended retry timeout for lite runs when the first attempt times out (ms). Default: 180000 (3 minutes).
- `AI_TIMEOUT_SUPERLITE_MS` — timeout for super-lite AI runs (ms). Default: 30000 (30s).
- `AI_TIMEOUT_FULL_MS` — timeout for full analysis runs (ms). Default: 300000 (5 minutes).

Adjust these values if your local model needs more time to respond.

## Notes
- Ensure the DeepSeek model is running before using the application.
- If you encounter any issues during installation or startup, double-check that **Ollama** and **Node.js** are properly installed and configured.

