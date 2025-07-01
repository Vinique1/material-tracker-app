import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from './Header';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/ThemeContext';
import { signOut } from 'firebase/auth';

// --- Mocks ---
jest.mock('../context/authContext');
jest.mock('../context/ThemeContext');
jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'), // keep other exports
  signOut: jest.fn(() => Promise.resolve()),
}));

describe('Header Component', () => {
  // Create a mock function for toggling the theme
  const mockToggleTheme = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Default mock setup for useAuth
    useAuth.mockReturnValue({
      currentUser: { email: 'stakeholder@project.com' },
    });
    
    // Default mock setup for useTheme
    useTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    });
  });

  test('renders the header with user email', () => {
    render(<Header />);
    expect(screen.getByText('GBARAN GBCD MATERIAL PROCUREMENT TRACKER')).toBeInTheDocument();
    expect(screen.getByText('stakeholder@project.com')).toBeInTheDocument();
  });

  test('calls signOut when the logout button is clicked', async () => {
    render(<Header />);
    const logoutButton = screen.getByTitle(/Sign Out/i);
    await userEvent.click(logoutButton);
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  test('shows dark mode button and calls toggleTheme with "dark" when in light mode', async () => {
    render(<Header />);
    // The button to switch TO dark mode is present
    const themeButton = screen.getByTitle(/Switch to Dark Mode/i);
    await userEvent.click(themeButton);
    expect(mockToggleTheme).toHaveBeenCalledWith('dark');
  });

  test('shows system mode button and calls toggleTheme with "system" when in dark mode', async () => {
    // Override the theme context for this specific test
    useTheme.mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
    });
    render(<Header />);
    const themeButton = screen.getByTitle(/Switch to System Preference/i);
    await userEvent.click(themeButton);
    expect(mockToggleTheme).toHaveBeenCalledWith('system');
  });

  test('shows light mode button and calls toggleTheme with "light" when in system mode', async () => {
    // Override the theme context for this specific test
    useTheme.mockReturnValue({
      theme: 'system',
      toggleTheme: mockToggleTheme,
    });
    render(<Header />);
    const themeButton = screen.getByTitle(/Switch to Light Mode/i);
    await userEvent.click(themeButton);
    expect(mockToggleTheme).toHaveBeenCalledWith('light');
  });
});