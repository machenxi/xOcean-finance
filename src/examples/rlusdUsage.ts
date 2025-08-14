// Example usage of RLUSD deployment functions in xOcean Protocol
// This file demonstrates how to integrate RLUSD functionality into the lending protocol

import {
  deployRLUSDStablecoin,
  buildRLUSDTrustSetTransaction,
  buildRLUSDMintTransaction,
  formatRLUSDAmount,
  getRLUSDTokenInfo
} from '../services/rlusdDeployment';
import { XRPLService } from '../services/xrpl';
import { buildDepositTx, buildRepayTx, xrpToDrops } from '../services/txBuilders';

/**
 * Example 1: Complete RLUSD Setup for New User
 */
export async function setupNewUserWithRLUSD(
  userAddress: string,
  initialRLUSDAmount: string = '1000'
): Promise<void> {
  console.log(`🔧 Setting up RLUSD for user: ${userAddress}`);
  
  try {
    // Get current RLUSD configuration
    const tokenInfo = getRLUSDTokenInfo();
    console.log(`Token: ${tokenInfo.tokenCode}`);
    console.log(`Issuer: ${tokenInfo.issuerAddress}`);
    
    // Step 1: Create trust line for the user
    const trustLineTx = buildRLUSDTrustSetTransaction(
      userAddress,
      tokenInfo.issuerAddress,
      '100000' // 100,000 RLUSD limit
    );
    
    console.log('📝 Trust line transaction prepared');
    console.log('   User must sign and submit this transaction first');
    
    // Step 2: Mint initial RLUSD (issuer signs this)
    const mintTx = buildRLUSDMintTransaction(
      tokenInfo.issuerAddress,
      userAddress,
      initialRLUSDAmount
    );
    
    console.log(`💰 Minting ${formatRLUSDAmount(initialRLUSDAmount)} RLUSD`);
    console.log('   Issuer must sign and submit this transaction');
    
    console.log('✅ User setup complete!');
    
  } catch (error) {
    console.error('❌ User setup failed:', error);
    throw error;
  }
}

/**
 * Example 2: Lending Protocol Integration
 */
export async function demonstrateLendingFlow(
  lenderAddress: string,
  borrowerAddress: string,
  lendAmount: string = '5000',
  collateralXRP: number = 10000
): Promise<void> {
  console.log('🏦 Demonstrating xOcean Lending Flow with RLUSD');
  
  try {
    const xrplService = new XRPLService('testnet');
    await xrplService.connect();
    
    // Step 1: Lender deposits RLUSD to pool
    console.log(`💰 Lender depositing ${formatRLUSDAmount(lendAmount)} RLUSD`);
    const depositTx = buildDepositTx(lenderAddress, lendAmount);
    
    console.log('📝 Deposit transaction prepared');
    console.log(`   Amount: ${formatRLUSDAmount(lendAmount)} RLUSD`);
    console.log(`   Pool: ${process.env.VITE_POOL_ADDRESS}`);
    
    // Step 2: Borrower locks XRP collateral
    console.log(`🔒 Borrower locking ${collateralXRP} XRP as collateral`);
    const collateralDrops = xrpToDrops(collateralXRP);
    
    // Create escrow for collateral (30 days from now)
    const finishAfter = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
    const cancelAfter = finishAfter + (7 * 24 * 60 * 60); // 7 days grace period
    
    const escrowTx = {
      TransactionType: 'EscrowCreate',
      Account: borrowerAddress,
      Destination: process.env.VITE_POOL_ADDRESS,
      Amount: collateralDrops,
      FinishAfter: finishAfter,
      CancelAfter: cancelAfter,
      Fee: '12'
    };
    
    console.log('🔐 Escrow transaction prepared');
    console.log(`   Collateral: ${collateralXRP} XRP (${collateralDrops} drops)`);
    console.log(`   Duration: 30 days`);
    
    // Step 3: Protocol issues RLUSD loan to borrower
    const tokenInfo = getRLUSDTokenInfo();
    const loanAmount = (parseFloat(lendAmount) * 0.8).toString(); // 80% LTV
    
    const loanTx = buildRLUSDMintTransaction(
      tokenInfo.issuerAddress,
      borrowerAddress,
      loanAmount
    );
    
    console.log(`📤 Loan issuance prepared`);
    console.log(`   Loan Amount: ${formatRLUSDAmount(loanAmount)} RLUSD`);
    console.log(`   LTV Ratio: 80%`);
    
    // Step 4: Borrower repays loan (with interest)
    const interestRate = 0.08; // 8% annual interest
    const loanDuration = 30; // 30 days
    const interest = parseFloat(loanAmount) * interestRate * (loanDuration / 365);
    const repayAmount = (parseFloat(loanAmount) + interest).toString();
    
    const repayTx = buildRepayTx(borrowerAddress, repayAmount);
    
    console.log(`💸 Repayment transaction prepared`);
    console.log(`   Principal: ${formatRLUSDAmount(loanAmount)} RLUSD`);
    console.log(`   Interest: ${formatRLUSDAmount(interest.toString())} RLUSD`);
    console.log(`   Total Repay: ${formatRLUSDAmount(repayAmount)} RLUSD`);
    
    console.log('✅ Lending flow demonstration complete!');
    
    await xrplService.disconnect();
    
  } catch (error) {
    console.error('❌ Lending flow failed:', error);
    throw error;
  }
}

/**
 * Example 3: Batch User Onboarding
 */
export async function batchUserOnboarding(
  userAddresses: string[],
  initialAmounts: string[]
): Promise<void> {
  console.log(`👥 Onboarding ${userAddresses.length} users to RLUSD`);
  
  try {
    const tokenInfo = getRLUSDTokenInfo();
    
    // Create trust line transactions for all users
    const trustLineTxs = userAddresses.map(address => 
      buildRLUSDTrustSetTransaction(address, tokenInfo.issuerAddress, '50000')
    );
    
    // Create minting transactions for all users
    const mintTxs = userAddresses.map((address, index) => 
      buildRLUSDMintTransaction(
        tokenInfo.issuerAddress,
        address,
        initialAmounts[index] || '1000'
      )
    );
    
    console.log(`📝 Prepared ${trustLineTxs.length} trust line transactions`);
    console.log(`💰 Prepared ${mintTxs.length} minting transactions`);
    
    // Log summary
    userAddresses.forEach((address, index) => {
      const amount = initialAmounts[index] || '1000';
      console.log(`   ${index + 1}. ${address}: ${formatRLUSDAmount(amount)} RLUSD`);
    });
    
    console.log('✅ Batch onboarding prepared!');
    
  } catch (error) {
    console.error('❌ Batch onboarding failed:', error);
    throw error;
  }
}

/**
 * Example 4: Check RLUSD Balances
 */
export async function checkRLUSDBalances(
  addresses: string[]
): Promise<{ [address: string]: string }> {
  console.log(`🔍 Checking RLUSD balances for ${addresses.length} addresses`);
  
  const balances: { [address: string]: string } = {};
  
  try {
    const xrplService = new XRPLService('testnet');
    await xrplService.connect();
    
    const tokenInfo = getRLUSDTokenInfo();
    
    for (const address of addresses) {
      try {
        const accountLines = await xrplService.getAccountLines(address);
        
        // Find RLUSD trust line
        const rlusdLine = accountLines.lines.find(
          line => line.currency === tokenInfo.tokenCode && 
                  line.account === tokenInfo.issuerAddress
        );
        
        if (rlusdLine) {
          balances[address] = rlusdLine.balance;
          console.log(`   ${address}: ${formatRLUSDAmount(rlusdLine.balance)} RLUSD`);
        } else {
          balances[address] = '0';
          console.log(`   ${address}: No RLUSD trust line`);
        }
        
      } catch (error) {
        console.error(`   ❌ Failed to check balance for ${address}:`, error);
        balances[address] = 'ERROR';
      }
    }
    
    await xrplService.disconnect();
    
    console.log('✅ Balance check complete!');
    return balances;
    
  } catch (error) {
    console.error('❌ Balance check failed:', error);
    throw error;
  }
}

/**
 * Example 5: Protocol Health Check
 */
export async function protocolHealthCheck(): Promise<{
  rlusdConfigured: boolean;
  poolConfigured: boolean;
  networkConnected: boolean;
  issuerActive: boolean;
}> {
  console.log('🏥 Running xOcean Protocol Health Check');
  
  const health = {
    rlusdConfigured: false,
    poolConfigured: false,
    networkConnected: false,
    issuerActive: false
  };
  
  try {
    // Check RLUSD configuration
    const tokenInfo = getRLUSDTokenInfo();
    health.rlusdConfigured = !!(tokenInfo.issuerAddress && tokenInfo.tokenCode);
    console.log(`   RLUSD Config: ${health.rlusdConfigured ? '✅' : '❌'}`);
    
    // Check pool configuration
    health.poolConfigured = !!process.env.VITE_POOL_ADDRESS;
    console.log(`   Pool Config: ${health.poolConfigured ? '✅' : '❌'}`);
    
    // Check network connection
    try {
      const xrplService = new XRPLService('testnet');
      await xrplService.connect();
      health.networkConnected = xrplService.isConnected();
      
      // Check issuer account
      if (health.rlusdConfigured && health.networkConnected) {
        const accountInfo = await xrplService.getAccountInfo(tokenInfo.issuerAddress);
        health.issuerActive = !!accountInfo.account_data;
      }
      
      await xrplService.disconnect();
      
    } catch (error) {
      console.error('   Network connection failed:', error);
    }
    
    console.log(`   Network: ${health.networkConnected ? '✅' : '❌'}`);
    console.log(`   Issuer Active: ${health.issuerActive ? '✅' : '❌'}`);
    
    const overallHealth = Object.values(health).every(status => status);
    console.log(`\n🏥 Overall Health: ${overallHealth ? '✅ HEALTHY' : '❌ ISSUES DETECTED'}`);
    
    return health;
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    throw error;
  }
}

/**
 * Example 6: Development Environment Setup
 */
export async function setupDevelopmentEnvironment(): Promise<void> {
  console.log('🛠️ Setting up xOcean Development Environment');
  
  try {
    // Create test accounts for development
    const testAccounts = [
      'rDev1234567890123456789012345678901234', // Developer account 1
      'rDev2345678901234567890123456789012345', // Developer account 2
      'rDev3456789012345678901234567890123456', // Developer account 3
    ];
    
    const mintAmounts = ['50000', '25000', '10000']; // Different amounts for testing
    
    console.log('🚀 Deploying RLUSD for development...');
    const deploymentResult = await deployRLUSDStablecoin(testAccounts, mintAmounts);
    
    if (!deploymentResult.success) {
      throw new Error(`Deployment failed: ${deploymentResult.error}`);
    }
    
    console.log('\n📋 Development Environment Ready!');
    console.log('=' .repeat(50));
    console.log(`Issuer Address: ${deploymentResult.issuerAddress}`);
    console.log(`Token Code: ${deploymentResult.tokenCode}`);
    console.log('\nTest Accounts:');
    testAccounts.forEach((account, index) => {
      console.log(`   ${index + 1}. ${account}: ${formatRLUSDAmount(mintAmounts[index])} RLUSD`);
    });
    
    console.log('\n🔧 Add to your .env file:');
    console.log(`VITE_RLUSD_ISSUER=${deploymentResult.issuerAddress}`);
    
    console.log('\n✅ Development environment setup complete!');
    
  } catch (error) {
    console.error('❌ Development setup failed:', error);
    throw error;
  }
}

// Export all example functions
export {
  setupNewUserWithRLUSD,
  demonstrateLendingFlow,
  batchUserOnboarding,
  checkRLUSDBalances,
  protocolHealthCheck,
  setupDevelopmentEnvironment
};

// Example usage if run directly
if (require.main === module) {
  console.log('🧪 Running RLUSD Usage Examples...');
  
  // Uncomment the example you want to run:
  
  // setupDevelopmentEnvironment().catch(console.error);
  
  // protocolHealthCheck().catch(console.error);
  
  // checkRLUSDBalances([
  //   'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
  //   'rDNvpJKvhWjKKKKKKKKKKKKKKKKKKKKKKK'
  // ]).catch(console.error);
}