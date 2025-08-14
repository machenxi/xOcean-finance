// Polyfills for browser environment
import { Buffer } from 'buffer';
import process from 'process';

// Make Buffer available globally
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = Buffer;
  (globalThis as any).process = process;
}

if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).process = process;
}

// Also make it available as a global variable
if (typeof global === 'undefined') {
  (globalThis as any).global = globalThis;
}

// WebSocket polyfill for XRPL
if (typeof window !== 'undefined' && !window.WebSocket) {
  // Use native WebSocket if available, otherwise provide a mock
  (window as any).WebSocket = window.WebSocket || class MockWebSocket {
    constructor() {
      console.warn('WebSocket not available in this environment');
    }
  };
}

export {};