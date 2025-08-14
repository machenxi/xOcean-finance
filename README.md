# xOcean - XRPL DeFi Lending Protocol

![xOcean Logo](https://via.placeholder.com/200x80/0066CC/FFFFFF?text=xOcean)

> A decentralized finance (DeFi) lending protocol built on the XRP Ledger (XRPL) that enables users to lend and borrow digital assets in a trustless, automated manner.

## 🌊 Overview

xOcean leverages XRPL's native features including trustlines, escrows, and automated market makers (AMM) to create a secure and efficient lending ecosystem. Users can:

- **Lend** digital assets to earn interest
- **Borrow** assets against collateral
- **Manage** lending positions through an intuitive dashboard
- **Connect** multiple wallet types seamlessly

## ✨ Features

### Core Functionality
- 🏦 **Decentralized Lending**: Lend your assets to earn competitive interest rates
- 💰 **Collateralized Borrowing**: Borrow assets by providing collateral
- 📊 **Real-time Dashboard**: Monitor your positions, earnings, and market data
- 🔗 **Multi-Wallet Support**: Connect with various XRPL wallets
- 🌐 **Network Flexibility**: Support for mainnet, testnet, and devnet

### Technical Features
- ⚡ **Fast Transactions**: Leverage XRPL's 3-5 second settlement times
- 🔒 **Secure Escrows**: Time-locked lending agreements using XRPL escrows
- 💎 **Low Fees**: Minimal transaction costs on XRPL
- 🔄 **Automated Market Making**: Integrated AMM for liquidity and price discovery
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- An XRPL wallet (Xumm, Crossmark, etc.)
- Basic understanding of DeFi concepts

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/xOcean.git
   cd xOcean
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   VITE_XRPL_NETWORK=testnet
   VITE_XRPL_SERVER=wss://s.altnet.rippletest.net:51233
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
xOcean/
├── docs/                    # Documentation
│   ├── PRD.md              # Product Requirements Document
│   └── technical-design.md  # Technical Design Document
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components
│   │   ├── ConnectWalletButton.tsx
│   │   └── NetworkBadge.tsx
│   ├── pages/             # Main application pages
│   │   ├── Home.tsx       # Dashboard
│   │   ├── Lend.tsx       # Lending interface
│   │   └── Borrow.tsx     # Borrowing interface
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Business logic services
│   ├── wallets/           # Wallet integration layer
│   ├── config/            # Configuration files
│   └── types/             # TypeScript definitions
├── package.json
└── README.md
```

## 💡 Usage

### Connecting Your Wallet

1. Click "Connect Wallet" in the top navigation
2. Select your preferred wallet type (Xumm, Crossmark, etc.)
3. Follow the wallet-specific connection flow
4. Once connected, your address and balance will be displayed

### Lending Assets

1. Navigate to the "Lend" page
2. Select the asset you want to lend
3. Enter the amount to lend
4. Review the estimated APY and terms
5. Confirm the transaction in your wallet
6. Monitor your lending position on the dashboard

### Borrowing Assets

1. Navigate to the "Borrow" page
2. Select the asset you want to borrow
3. Choose and deposit collateral
4. Enter the borrow amount (respecting collateral ratio)
5. Review interest rates and liquidation threshold
6. Confirm the transaction in your wallet
7. Manage your borrowed position on the dashboard

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **XRPL Integration**: xrpl.js library
- **Build Tool**: Vite with custom polyfills
- **Testing**: Vitest, React Testing Library

### Environment Configuration

| Variable | Description | Default |
|----------|-------------|----------|
| `VITE_XRPL_NETWORK` | XRPL network (mainnet/testnet/devnet) | `testnet` |
| `VITE_XRPL_SERVER` | XRPL server WebSocket URL | `wss://s.altnet.rippletest.net:51233` |
| `VITE_EXPLORER_URL` | Block explorer base URL | `https://testnet.xrpl.org` |

## 🔒 Security

### Smart Contract Security
- ✅ Escrow-based lending with cryptographic conditions
- ✅ Multi-signature support for administrative functions
- ✅ Time-locked agreements for enhanced security
- ✅ Comprehensive input validation and sanitization

### Frontend Security
- ✅ Secure wallet integration with signature verification
- ✅ HTTPS enforcement and secure WebSocket connections
- ✅ Input validation and XSS protection
- ✅ No private key storage or handling

### Risk Management
- ✅ Collateral ratio monitoring and liquidation protection
- ✅ Interest rate models with utilization-based adjustments
- ✅ Reserve factors for protocol sustainability
- ✅ Emergency pause mechanisms

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Categories

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: Wallet and XRPL integration testing
- **E2E Tests**: Complete user journey testing
- **Security Tests**: Transaction validation and security testing

## 🌐 Supported Networks

| Network | Status | Purpose |
|---------|--------|---------|
| **Mainnet** | 🟢 Supported | Production use |
| **Testnet** | 🟢 Supported | Development and testing |
| **Devnet** | 🟡 Experimental | Latest features testing |

## 🔗 Supported Wallets

- **Xumm** - Mobile and desktop wallet
- **Crossmark** - Browser extension wallet
- **Gem Wallet** - Browser extension wallet
- **XRPL Toolkit** - Web-based wallet
- **Ledger** - Hardware wallet (coming soon)

## 📚 Documentation

- [Product Requirements Document](./docs/PRD.md) - Detailed product specifications
- [Technical Design Document](./docs/technical-design.md) - Architecture and implementation details
- [XRPL Documentation](https://xrpl.org/docs.html) - Official XRPL documentation
- [API Reference](./docs/api.md) - API documentation (coming soon)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm run test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

### Getting Help

- 📖 Check the [documentation](./docs/)
- 🐛 Report bugs via [GitHub Issues](https://github.com/your-org/xOcean/issues)
- 💬 Join our [Discord community](https://discord.gg/xocean)
- 📧 Email us at support@xocean.finance

### FAQ

**Q: What is the minimum amount I can lend?**
A: The minimum lending amount varies by asset but is typically equivalent to 10 XRP.

**Q: How are interest rates determined?**
A: Interest rates are determined algorithmically based on supply and demand, following a utilization-based model.

**Q: What happens if I get liquidated?**
A: If your collateral ratio falls below the liquidation threshold, your position may be liquidated with a penalty fee.

**Q: Are there any fees?**
A: xOcean charges minimal protocol fees (typically 0.1-0.5%) plus standard XRPL transaction fees.

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic lending and borrowing functionality
- ✅ Multi-wallet support
- ✅ Responsive web interface
- ✅ Testnet deployment

### Phase 2 (Q2 2024)
- 🔄 Flash loans implementation
- 🔄 Yield farming and liquidity mining
- 🔄 Advanced analytics dashboard
- 🔄 Mobile app development

### Phase 3 (Q3 2024)
- 📋 Cross-chain bridge integration
- 📋 Governance token and DAO
- 📋 Advanced trading features
- 📋 Institutional features

## 🏆 Acknowledgments

- [XRPL Foundation](https://foundation.xrpl.org/) for the amazing XRP Ledger
- [Ripple](https://ripple.com/) for XRPL development and support
- The XRPL developer community for tools and libraries
- All contributors and early adopters of xOcean

---

<div align="center">
  <strong>Built with ❤️ for the XRPL ecosystem</strong>
  <br>
  <a href="https://xocean.finance">Website</a> •
  <a href="https://twitter.com/xOceanFinance">Twitter</a> •
  <a href="https://discord.gg/xocean">Discord</a> •
  <a href="https://github.com/your-org/xOcean">GitHub</a>
</div>