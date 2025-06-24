import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import { signInWithEmailAndPassword } from 'firebase/auth';

// --- Mocks ---
jest.mock('../firebase', () => ({
  auth: {}, // The auth object itself can be an empty object for this test
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
}));

describe('Login Component', () => {

  beforeEach(() => {
    // Clear mock history before each test
    signInWithEmailAndPassword.mockClear();
  });

  test('renders the login form correctly', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/EMAIL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/PASSWORD/i)).toBeInTheDocument();
  });

  test('shows validation errors for empty fields before submitting', async () => {
    render(<Login />);
    const loginButton = screen.getByRole('button', { name: /Login/i });
    
    await userEvent.click(loginButton);
    
    // Check that Firebase was NOT called
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();

    // Check that error messages appeared
    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(await screen.findByText('Password is required.')).toBeInTheDocument();
  });

  test('calls signInWithEmailAndPassword with correct credentials on successful submission', async () => {
    render(<Login />);

    const emailInput = screen.getByLabelText(/EMAIL/i);
    const passwordInput = screen.getByLabelText(/PASSWORD/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    await userEvent.type(emailInput, 'test@user.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.any(Object), 'test@user.com', 'password123');
    });
  });
});