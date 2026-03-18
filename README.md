# BetterFund Crowdfunding

A Next.js + Solidity crowdfunding app with an environment-driven Ethereum workflow.

## What changed

- Updated the app to use a direct EIP-1193 wallet connection instead of the deprecated `use-wallet` package.
- Modernized the Solidity contract to `0.8.x` and tightened request / contribution validation.
- Reworked compilation and deployment scripts so the frontend reads the factory address from environment variables instead of a hard-coded value.
- Added a contract test that covers the happy-path flow: create campaign, contribute, create request, approve request, finalize request.

## End-to-end local workflow

1. Install dependencies.
2. Start a local JSON-RPC node, for example Ganache, on `http://127.0.0.1:8545`.
3. Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_RPC_URL`
   - `PRIVATE_KEY`
   - `DEPLOY_RPC_URL`
4. Compile the contracts:

   ```bash
   npm run contracts:compile
   ```

5. Deploy the factory:

   ```bash
   npm run contracts:deploy
   ```

6. After deployment, read the `factoryAddress` from `smart-contract/deployment.json`. The app now auto-uses that file in local development, so you only need `NEXT_PUBLIC_FACTORY_ADDRESS` if you want to override it manually.
7. Start the web app:

   ```bash
   npm run dev
   ```

With the factory address configured, the UI supports:
- creating campaigns,
- contributing to campaigns,
- creating withdrawal requests,
- approving requests as a contributor,
- finalizing requests as the campaign manager.


## Where do I get `NEXT_PUBLIC_FACTORY_ADDRESS`?

Run:

```bash
npm run contracts:deploy
```

Then open `smart-contract/deployment.json` and copy the value of `factoryAddress`. Example:

```json
{
  "factoryAddress": "0x1234...abcd"
}
```

If you are running locally and `smart-contract/deployment.json` exists, the frontend will already pick it up automatically.
