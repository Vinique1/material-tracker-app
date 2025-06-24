import '@testing-library/jest-dom';

// NEW: Add a global mock for ResizeObserver to prevent errors in JSDOM
const ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

window.ResizeObserver = ResizeObserver;