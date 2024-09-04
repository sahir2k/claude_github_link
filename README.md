# Claude GitHub Chrome Extension

This Chrome extension allows users to access their GitHub repositories and files directly from the Claude projects.

## Setup and Installation

1. Clone this repository:

   ```
   git clone https://github.com/your-username/github-oauth-extension.git
   cd github-oauth-extension
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up GitHub OAuth App:

   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Click "New OAuth App"
   - Fill in the application details:
     - Application name: Choose a name for your app
     - Homepage URL: https://github.com
     - Authorization callback URL: https://<your-extension-id>.chromiumapp.org/
   - Click "Register application"
   - Note down the Client ID and generate a new Client Secret

4. Set up Cloudflare Worker:

   - Visit https://github.com/sahir2k/claude_github_cloudflare_worker
   - Follow the instructions to create a Cloudflare Worker
   - Note down the Worker URL (e.g., https://your-worker-name.your-subdomain.workers.dev)

5. Replace the `CLIENT_ID` and `WORKER_URL` in the `public/background.js` file:

   ```javascript:public/background.js
   const CLIENT_ID = "your-github-client-id";
   const WORKER_URL = "https://your-worker-name.your-subdomain.workers.dev";
   ```

6. Build the extension:

   ```
   npm run build
   ```

7. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `dist` folder in your project directory

## Usage

1. Click on the extension icon in your Chrome toolbar
2. Log in with your GitHub account
3. Access your repositories and files directly from the extension popup

## Development

To run the extension in development mode:

1. Start the development server:

   ```
   npm run dev
   ```

2. Load the `dist` folder as an unpacked extension in Chrome (as described in step 7 of the Setup and Installation section)

3. The extension will automatically reload when you make changes to the code

## Important Notes

- Keep your `CLIENT_ID`, Client Secret, and `WORKER_URL` private and do not commit them to version control
- Ensure your Cloudflare Worker is properly configured to handle the OAuth flow
- The extension ID mentioned in the GitHub OAuth App setup will be available after you load the extension in Chrome for the first time

## License

[MIT License](LICENSE)
