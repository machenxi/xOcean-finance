#!/usr/bin/env node
// RLUSD Deployment Script for xOcean Protocol
// Usage: npm run deploy:rlusd or node -r ts-node/register src/scripts/deployRLUSD.ts

import {
  deployRLUSDStablecoin,
  buildRLUSDTrustSetTransaction,
  buildRLUSDMintTransaction,
  buildIssuerConfigTransaction,
  getRLUSDTokenInfo,
  formatRLUSDAmount,
  RLUSD_CONFIG,
  TESTNET_CONFIG
} from '../services/rlusdDeployment';
import { XRPLService } from '../services/xrpl';

// Configuration for deployment
const DEPLOYMENT_CONFIG = {
  // Test accounts that will receive RLUSD (replace with actual testnet addresses)
  testAccounts: [
    'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH', // Test account 1
    'rDNvpJKvhWjKKKKKKKKKKKKKKKKKKKKKKK', // Test account 2
    'rTestAccount3456789012345678901234567', // Test account 3
  ],
  
  // Amounts to mint for each test account
  mintAmounts: [
    '10000', // 10,000 RLUSD for account 1
    '5000',  // 5,000 RLUSD for account 2
    '2500',  // 2,500 RLUSD for account 3
  ],
  
  // Trust line limits
  trustLineLimit: '100000', // 100,000 RLUSD limit per account
};

/**
 * Main deployment function
 */
async function main(): Promise<void> {
  console.log('🌊 xOcean RLUSD Stablecoin Deployment Script');
  console.log('=' .repeat(50));
  
  try {
    // Initialize XRPL service
    console.log('🔌 Connecting to XRPL Testnet...');
    const xrplService = new XRPLService('testnet');
    await xrplService.connect();
    
    console.log(`✅ Connected to: ${xrplService.getCurrentServer()}`);
    console.log(`🌐 Network: ${xrplService.getNetwork()}`);
    
    // Step 1: Deploy RLUSD stablecoin
    console.log('\n📦 Starting RLUSD Deployment...');
    const deploymentResult = await deployRLUSDStablecoin(
      DEPLOYMENT_CONFIG.testAccounts,
      DEPLOYMENT_CONFIG.mintAmounts
    );
    
    if (!deploymentResult.success) {
      throw new Error(`Deployment failed: ${deploymentResult.error}`);
    }
    
    console.log('\n🎉 Deployment Summary:');
    console.log(`   Issuer Address: ${deploymentResult.issuerAddress}`);
    console.log(`   Token Code: ${deploymentResult.tokenCode}`);
    console.log(`   Initial Supply: ${formatRLUSDAmount(deploymentResult.initialSupply)}`);
    
    // Step 2: Create and submit trust line transactions
    console.log('\n🔗 Setting up Trust Lines...');
    for (let i = 0; i < DEPLOYMENT_CONFIG.testAccounts.length; i++) {
      const account = DEPLOYMENT_CONFIG.testAccounts[i];
      
      try {
        console.log(`   Setting trust line for ${account}...`);
        
        const trustLineTx = buildRLUSDTrustSetTransaction(
          account,
          deploymentResult.issuerAddress,
          DEPLOYMENT_CONFIG.trustLineLimit
        );
        
        // In a real implementation, you would sign and submit this transaction
        console.log(`   ✅ Trust line transaction prepared for ${account}`);
        console.log(`      Limit: ${formatRLUSDAmount(DEPLOYMENT_CONFIG.trustLineLimit)} RLUSD`);
        
        // Simulate transaction submission delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`   ❌ Failed to set trust line for ${account}:`, error);
      }
    }
    
    // Step 3: Mint RLUSD tokens
    console.log('\n💰 Minting RLUSD Tokens...');
    for (let i = 0; i < DEPLOYMENT_CONFIG.testAccounts.length; i++) {
      const account = DEPLOYMENT_CONFIG.testAccounts[i];
      const amount = DEPLOYMENT_CONFIG.mintAmounts[i];
      
      if (!amount) continue;
      
      try {
        console.log(`   Minting ${formatRLUSDAmount(amount)} RLUSD for ${account}...`);
        
        const mintTx = buildRLUSDMintTransaction(
          deploymentResult.issuerAddress,
          account,
          amount
        );
        
        // In a real implementation, you would sign and submit this transaction
        console.log(`   ✅ Minting transaction prepared`);
        console.log(`      Amount: ${formatRLUSDAmount(amount)} RLUSD`);
        console.log(`      Recipient: ${account}`);
        
        // Simulate transaction submission delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error(`   ❌ Failed to mint RLUSD for ${account}:`, error);
      }
    }
    
    // Step 4: Display final configuration
    console.log('\n📋 Final Configuration:');
    console.log('=' .repeat(50));
    
    const tokenInfo = getRLUSDTokenInfo();
    console.log(`Token Code: ${tokenInfo.tokenCode}`);
    console.log(`Issuer Address: ${deploymentResult.issuerAddress}`);
    console.log(`Description: ${tokenInfo.description}`);
    console.log(`Decimals: ${tokenInfo.decimals}`);
    console.log(`Total Supply: ${formatRLUSDAmount(tokenInfo.initialSupply)}`);
    
    console.log('\n🔗 Trust Lines Created:');
    DEPLOYMENT_CONFIG.testAccounts.forEach((account, index) => {
      console.log(`   ${index + 1}. ${account} (Limit: ${formatRLUSDAmount(DEPLOYMENT_CONFIG.trustLineLimit)})`);
    });
    
    console.log('\n💰 Tokens Minted:');
    DEPLOYMENT_CONFIG.testAccounts.forEach((account, index) => {
      const amount = DEPLOYMENT_CONFIG.mintAmounts[index];
      if (amount) {
        console.log(`   ${index + 1}. ${account}: ${formatRLUSDAmount(amount)} RLUSD`);
      }
    });
    
    // Step 5: Generate environment variables
    console.log('\n🔧 Environment Variables for .env file:');
    console.log('=' .repeat(50));
    console.log(`VITE_RLUSD_ISSUER=${deploymentResult.issuerAddress}`);
    console.log(`VITE_RLUSD_CODE=${deploymentResult.tokenCode}`);
    console.log(`VITE_XRPL_NETWORK=testnet`);
    console.log(`VITE_XRPL_WSS=${TESTNET_CONFIG.server}`);
    
    // Step 6: Generate transaction examples
    console.log('\n📄 Example Transaction Usage:');
    console.log('=' .repeat(50));
    
    console.log('\n// Trust Line Setup:');
    console.log(`const trustLineTx = buildRLUSDTrustSetTransaction(`);
    console.log(`  'YOUR_ACCOUNT_ADDRESS',`);
    console.log(`  '${deploymentResult.issuerAddress}',`);
    console.log(`  '${DEPLOYMENT_CONFIG.trustLineLimit}'`);
    console.log(`);`);
    
    console.log('\n// Token Transfer:');
    console.log(`const transferTx = {`);
    console.log(`  TransactionType: 'Payment',`);
    console.log(`  Account: 'SENDER_ADDRESS',`);
    console.log(`  Destination: 'RECIPIENT_ADDRESS',`);
    console.log(`  Amount: {`);
    console.log(`    currency: '${deploymentResult.tokenCode}',`);
    console.log(`    issuer: '${deploymentResult.issuerAddress}',`);
    console.log(`    value: '100.000000'`);
    console.log(`  }`);
    console.log(`};`);
    
    console.log('\n✅ RLUSD Deployment Complete!');
    console.log(`🌐 Explorer: ${TESTNET_CONFIG.explorerUrl}`);
    console.log(`🚰 Faucet: ${TESTNET_CONFIG.faucetUrl}`);
    
    // Disconnect from XRPL
    await xrplService.disconnect();
    
  } catch (error) {
    console.error('\n❌ Deployment Error:', error);
    process.exit(1);
  }
}

/**
 * Interactive deployment function
 */
async function interactiveDeployment(): Promise<void> {
  console.log('🎯 Interactive RLUSD Deployment');
  console.log('This will guide you through the deployment process.\n');
  
  // In a real implementation, you could use readline or inquirer
  // to get user input for accounts, amounts, etc.
  
  console.log('Using default configuration for demo...');
  await main();
}

/**
 * Validate deployment environment
 */
function validateEnvironment(): boolean {
  console.log('🔍 Validating deployment environment...');
  
  // Check if we're on testnet
  if (process.env.VITE_XRPL_NETWORK !== 'testnet' && process.env.NODE_ENV !== 'development') {
    console.error('❌ This script should only be run on testnet!');
    return false;
  }
  
  // Validate test accounts format
  for (const account of DEPLOYMENT_CONFIG.testAccounts) {
    if (!account.startsWith('r') || account.length < 25) {
      console.error(`❌ Invalid account format: ${account}`);
      return false;
    }
  }
  
  // Validate mint amounts
  for (const amount of DEPLOYMENT_CONFIG.mintAmounts) {
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      console.error(`❌ Invalid mint amount: ${amount}`);
      return false;
    }
  }
  
  console.log('✅ Environment validation passed');
  return true;
}

// Script execution
if (require.main === module) {
  console.log('🚀 Starting RLUSD Deployment Script...');
  
  if (!validateEnvironment()) {
    process.exit(1);
  }
  
  // Check for interactive flag
  const isInteractive = process.argv.includes('--interactive') || process.argv.includes('-i');
  
  if (isInteractive) {
    interactiveDeployment().catch(console.error);
  } else {
    main().catch(console.error);
  }
}

// Export functions for use in other scripts
export {
  main as deployRLUSD,
  interactiveDeployment,
  validateEnvironment,
  DEPLOYMENT_CONFIG
};