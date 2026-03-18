# BetterFund Crowdfunding

A Next.js + Solidity crowdfunding app with an environment-driven Ethereum workflow.

## What changed

- Updated the app to use a direct EIP-1193 wallet connection instead of the deprecated `use-wallet` package.
- Modernized the Solidity contract to `0.8.x` and tightened request / contribution validation.
- Reworked compilation and deployment scripts so the frontend reads the factory address from environment variables instead of a hard-coded value.
- Added a contract test that covers the happy-path flow: create campaign, contribute, create request, approve request, finalize request.
- Refreshed the UI with a more polished gradient-based visual style and clearer deployment guidance.

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

## Hosted deployment on Vercel or Netlify

For hosted deployments, do **not** rely on `smart-contract/deployment.json` as your only source of configuration. Vercel and Netlify build your frontend remotely, so you should explicitly set environment variables in the hosting dashboard.

### Recommended network

Use **Sepolia** for test deployments. Rinkeby is an old testnet workflow and should not be used for new deployments.

### RPC provider options

You can use any Ethereum RPC provider that gives you an HTTPS endpoint for Sepolia, for example:
- Alchemy
- Infura
- QuickNode
- Ankr
- Your own node

What you need from the provider dashboard:
- an HTTPS RPC URL for Sepolia, such as `https://...`
- the API key/token is usually already embedded in that URL

Use that same Sepolia URL for:
- `NEXT_PUBLIC_RPC_URL`
- `DEPLOY_RPC_URL`

### How to get `NEXT_PUBLIC_FACTORY_ADDRESS`

1. Fund a wallet on Sepolia.
2. Put that wallet's private key in `PRIVATE_KEY` locally.
3. Set `DEPLOY_RPC_URL` to your provider's Sepolia HTTPS URL.
4. Run:

   ```bash
   npm run contracts:deploy
   ```

5. Open `smart-contract/deployment.json` and copy the value of `factoryAddress`.

Example:

```json
{
  "factoryAddress": "0x1234...abcd"
}
```

That `factoryAddress` value is what you set as:

```bash
NEXT_PUBLIC_FACTORY_ADDRESS=0x1234...abcd
```

### Environment variables for Vercel / Netlify

Set these in your hosting dashboard before redeploying:

```bash
NEXT_PUBLIC_RPC_URL=https://your-sepolia-rpc-url
NEXT_PUBLIC_FACTORY_ADDRESS=0x-your-factory-address
NEXT_PUBLIC_BLOCK_EXPLORER_ADDRESS_URL=https://sepolia.etherscan.io/address
```

Important:
- `NEXT_PUBLIC_*` variables are safe for the browser and are used by the frontend.
- `PRIVATE_KEY` must **never** be exposed as a `NEXT_PUBLIC_*` variable.
- Use `PRIVATE_KEY` only locally when running `npm run contracts:deploy`, unless you build a secure server-side deployment workflow.

### Vercel / Netlify deployment sequence

1. Deploy the factory contract to Sepolia from your local machine.
2. Copy the deployed `factoryAddress` from `smart-contract/deployment.json`.
3. Add the hosted environment variables in Vercel or Netlify.
4. Redeploy the site.
5. Connect MetaMask to Sepolia and use the hosted UI.

## MetaMask setup

- Add or switch MetaMask to **Sepolia**.
- Fund your wallet with test ETH from a Sepolia faucet.
- Use the same wallet to deploy the factory and to interact with campaigns if desired.

## Quick answers

### Can I use something other than Infura?

Yes. You can use Alchemy, QuickNode, Ankr, or any compatible Ethereum RPC provider. The app only needs a valid HTTPS RPC URL and the deployed factory contract address.

### Where do I get the RPC URL and key?

From your chosen RPC provider's dashboard after you create a Sepolia app/project. In most cases the API key is already part of the URL they give you.

### Where do I get the contract address?

From the `factoryAddress` field written by `npm run contracts:deploy` into `smart-contract/deployment.json`.
