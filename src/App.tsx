// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { WalletProvider } from '@/context/WalletProvider';
import { Toaster } from '@/components/ui/toaster';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import NetworkBadge from '@/components/NetworkBadge';
import Home from '@/pages/Home';
import LendBorrow from '@/pages/LendBorrow';
import ProfilePage from '@/pages/ProfilePage';
import './App.css';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">xO</span>
              </div>
              <span className="font-bold text-xl">xOcean</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/') ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/lending" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/lending') ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                Lending & Borrowing
              </Link>
              <Link 
                to="/profile" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/profile') ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                Profile
              </Link>
            </div>
          </div>
          
          {/* Right side - Network Badge and Connect Wallet */}
          <div className="flex items-center space-x-4">
            <NetworkBadge />
            <ConnectWalletButton />
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/lending" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/lending') ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Lending & Borrowing
            </Link>
            <Link 
              to="/profile" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/profile') ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">xO</span>
            </div>
            <span className="text-sm text-muted-foreground">
              xOcean - XRPL Lending Protocol
            </span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <a 
              href="https://xrpl.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              XRPL.org
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <span>v1.0.0-beta</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
          <p>
            ⚠️ This is a beta version for testing purposes only. 
            Do not use with mainnet funds.
          </p>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-background">
          <Navigation />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lending" element={<LendBorrow />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
          
          <Footer />
          
          {/* Toast Notifications */}
          <Toaster />
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;