# RLUSD Stablecoin Deployment Guide

This guide explains how to deploy and mint RLUSD stablecoin tokens on the XRPL Testnet for the xOcean lending protocol.

## Overview

The RLUSD deployment system provides a comprehensive solution for:
- Creating RLUSD token issuer accounts
- Setting up trust lines for token holders
- Minting RLUSD tokens for testing
- Configuring the lending protocol environment

## Files Structure

```
src/
├── services/
│   ├── rlusdDeployment.ts    # Core deployment functions
│   ├── xrpl.ts               # XRPL service integration
│   └── txBuilders.ts         # Transaction builders
├── scripts/
│   └── deployRLUSD.ts        # Deployment script
└── config/
    └── env.ts                # Environment configuration
```

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- XRPL Testnet access
- Test accounts with XRP for transaction fees

### 2. Environment Setup

Create or update your `.env` file:

```env
# XRPL Configuration
VITE_XRPL_NETWORK=testnet
VITE_XRPL_WSS=wss://s.altnet.rippletest.net:51233

# RLUSD Configuration (will be set after deployment)
VITE_RLUSD_ISSUER=rYourIssuerAddressHere
VITE_RLUSD_CODE=RLUSD

# Pool Configuration
VITE_POOL_ADDRESS=rYourPoolAddressHere
```

### 3. Run Deployment

```bash
# Basic deployment
npm run deploy:rlusd

# Interactive deployment
npm run deploy:rlusd -- --interactive

# Or run directly with ts-node
npx ts-node src/scripts/deployRLUSD.ts
```

## Core Functions

### 1. Create Issuer Account

```typescript
import { createIssuerAccount } from '@/services/rlusdDeployment';

// Create a new issuer account on testnet
const issuerAccount = await createIssuerAccount();
console.log('Issuer Address:', issuerAccount.address);
console.log('Issuer Secret:', issuerAccount.secret); // Keep secure!
```

### 2. Build Trust Line Transaction

```typescript
import { buildRLUSDTrustSetTransaction } from '@/services/rlusdDeployment';

// Create trust line for RLUSD
const trustLineTx = buildRLUSDTrustSetTransaction(
  'rHolderAddress123456789012345678901234', // Holder address
  'rIssuerAddress123456789012345678901234', // Issuer address
  '100000' // Trust limit (100,000 RLUSD)
);

// Submit transaction using XRPL service
const result = await xrplService.submitTransaction(trustLineTx);
```

### 3. Build Minting Transaction

```typescript
import { buildRLUSDMintTransaction } from '@/services/rlusdDeployment';

// Mint RLUSD tokens
const mintTx = buildRLUSDMintTransaction(
  'rIssuerAddress123456789012345678901234', // Issuer address
  'rRecipientAddress123456789012345678901', // Recipient address
  '5000' // Amount to mint (5,000 RLUSD)
);

// Submit transaction
const result = await xrplService.submitTransaction(mintTx);
```

### 4. Batch Operations

```typescript
import { 
  buildBatchTrustLineTransactions,
  buildBatchMintTransactions 
} from '@/services/rlusdDeployment';

// Create multiple trust lines
const accounts = [
  'rAccount1234567890123456789012345678',
  'rAccount2345678901234567890123456789',
  'rAccount3456789012345678901234567890'
];

const trustLineTxs = buildBatchTrustLineTransactions(
  'rIssuerAddress123456789012345678901234',
  accounts,
  '50000' // 50,000 RLUSD limit each
);

// Create multiple minting transactions
const recipients = [
  { address: 'rAccount1234567890123456789012345678', amount: '10000' },
  { address: 'rAccount2345678901234567890123456789', amount: '5000' },
  { address: 'rAccount3456789012345678901234567890', amount: '2500' }
];

const mintTxs = buildBatchMintTransactions(
  'rIssuerAddress123456789012345678901234',
  recipients
);
```

## Integration with xOcean Protocol

### 1. Update Environment Variables

After deployment, update your `.env` file with the issuer address:

```env
VITE_RLUSD_ISSUER=rNewIssuerAddress123456789012345678
```

### 2. Use in Lending Operations

```typescript
import { buildDepositTx, buildRepayTx } from '@/services/txBuilders';

// Deposit RLUSD to lending pool
const depositTx = buildDepositTx(
  'rUserAddress123456789012345678901234',
  '1000' // 1,000 RLUSD
);

// Repay RLUSD loan
const repayTx = buildRepayTx(
  'rBorrowerAddress123456789012345678901',
  '1050' // 1,050 RLUSD (principal + interest)
);
```

### 3. Check Token Balances

```typescript
import { XRPLService } from '@/services/xrpl';

const xrplService = new XRPLService('testnet');
await xrplService.connect();

// Get account trust lines (including RLUSD balance)
const accountLines = await xrplService.getAccountLines(
  'rUserAddress123456789012345678901234'
);

// Find RLUSD balance
const rlusdLine = accountLines.lines.find(
  line => line.currency === 'RLUSD' && 
          line.account === 'rIssuerAddress123456789012345678901234'
);

if (rlusdLine) {
  console.log(`RLUSD Balance: ${rlusdLine.balance}`);
}
```

## Testing Scenarios

### 1. Basic Token Flow

```typescript
// 1. Create issuer account
const issuer = await createIssuerAccount();

// 2. Create test user account (use faucet)
const testUser = 'rTestUser123456789012345678901234';

// 3. Set up trust line
const trustTx = buildRLUSDTrustSetTransaction(testUser, issuer.address);
// Submit trustTx...

// 4. Mint tokens
const mintTx = buildRLUSDMintTransaction(issuer.address, testUser, '1000');
// Submit mintTx...

// 5. Use in lending protocol
const depositTx = buildDepositTx(testUser, '500');
// Submit depositTx...
```

### 2. Multi-User Testing

```typescript
const testAccounts = [
  'rTest1234567890123456789012345678901',
  'rTest2345678901234567890123456789012',
  'rTest3456789012345678901234567890123'
];

const mintAmounts = ['10000', '5000', '2500'];

// Deploy with multiple test accounts
const result = await deployRLUSDStablecoin(testAccounts, mintAmounts);

if (result.success) {
  console.log('Multi-user deployment successful!');
  // Proceed with lending protocol testing
}
```

## Transaction Examples

### Trust Line Setup

```json
{
  "TransactionType": "TrustSet",
  "Account": "rHolderAddress123456789012345678901234",
  "LimitAmount": {
    "currency": "RLUSD",
    "issuer": "rIssuerAddress123456789012345678901234",
    "value": "100000"
  },
  "Flags": 131072,
  "Fee": "12",
  "Memos": [{
    "Memo": {
      "MemoType": "524C5553445F54525553544C494E45",
      "MemoData": "784F6365616E20524C55534420547275737420..."
    }
  }]
}
```

### Token Minting

```json
{
  "TransactionType": "Payment",
  "Account": "rIssuerAddress123456789012345678901234",
  "Destination": "rRecipientAddress123456789012345678901",
  "Amount": {
    "currency": "RLUSD",
    "issuer": "rIssuerAddress123456789012345678901234",
    "value": "5000"
  },
  "Fee": "12",
  "Memos": [{
    "Memo": {
      "MemoType": "524C5553445F4D494E54",
      "MemoData": "4D696E74696E6720352C30303020524C555344..."
    }
  }]
}
```

## Security Considerations

### 1. Testnet Only
- This deployment script is designed for XRPL Testnet only
- Never use on mainnet without proper security audits
- Test accounts and secrets should not be used in production

### 2. Key Management
- Issuer account secrets should be stored securely
- Use hardware wallets or secure key management systems in production
- Never commit secrets to version control

### 3. Token Supply
- Monitor total token supply
- Implement proper access controls for minting
- Consider implementing supply caps

## Troubleshooting

### Common Issues

1. **Connection Failed**
   ```
   Error: Failed to connect to any XRPL testnet server
   ```
   - Check internet connection
   - Verify testnet servers are operational
   - Try different testnet endpoints

2. **Account Not Found**
   ```
   Error: Account not found
   ```
   - Ensure account has been funded via faucet
   - Verify account address format
   - Check if account exists on the correct network

3. **Trust Line Issues**
   ```
   Error: Trust line not found
   ```
   - Ensure trust line transaction was successful
   - Check trust line limit is sufficient
   - Verify issuer address is correct

4. **Insufficient Funds**
   ```
   Error: Insufficient XRP for transaction fee
   ```
   - Fund account via testnet faucet
   - Ensure minimum XRP reserve is maintained

### Debug Mode

Enable debug logging:

```typescript
// Set environment variable
process.env.DEBUG = 'xocean:rlusd';

// Or add to your script
console.log('Debug mode enabled');
```

## API Reference

### Core Functions

- `createIssuerAccount()`: Creates new issuer account
- `buildRLUSDTrustSetTransaction()`: Builds trust line transaction
- `buildRLUSDMintTransaction()`: Builds minting transaction
- `buildIssuerConfigTransaction()`: Configures issuer account
- `deployRLUSDStablecoin()`: Complete deployment orchestration
- `validateRLUSDConfig()`: Validates configuration
- `formatRLUSDAmount()`: Formats amounts with proper decimals

### Utility Functions

- `getRLUSDTokenInfo()`: Returns token configuration
- `buildBatchTrustLineTransactions()`: Creates multiple trust lines
- `buildBatchMintTransactions()`: Creates multiple minting transactions

## Contributing

When contributing to the RLUSD deployment system:

1. Test all changes on testnet first
2. Update documentation for new features
3. Add proper error handling
4. Include unit tests for new functions
5. Follow existing code style and patterns

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review XRPL documentation
3. Test on XRPL testnet explorer
4. Create an issue in the project repository

---

**⚠️ Important**: This deployment system is for testing purposes only. Always conduct thorough security audits before using in production environments.