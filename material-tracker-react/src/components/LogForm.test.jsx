import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogForm from './LogForm';
import { runTransaction } from 'firebase/firestore';

// --- Mocks ---
jest.mock('react-hot-toast');
jest.mock('../context/authContext', () => ({
  useAuth: () => ({
    currentUser: { isViewer: false, email: 'test@example.com' },
    ADMIN_UID: 'test-admin-uid',
  }),
}));
// The jest.mock for firebase is now handled globally in jest.config.cjs
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  runTransaction: jest.fn(),
  doc: jest.fn(),
  collection: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-server-timestamp'),
  Timestamp: {
    fromDate: jest.fn(date => ({
      toDate: () => date,
    })),
  },
}));

describe('LogForm Component', () => {
  const mockOnClose = jest.fn();
  const mockAllMaterials = [
    { id: 'mat1', description: 'Material One', category: 'Pipes', delivered: 10, issued: 2, expectedQty: 10, materialGrade: 'A', boreSize1: '1"' },
    { id: 'mat2', description: 'Material Two', category: 'Valves', delivered: 5, issued: 5, expectedQty: 5, materialGrade: 'B', boreSize1: '2"' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    runTransaction.mockImplementation(async (db, transactionCallback) => {
      const transaction = {
        get: jest.fn().mockResolvedValue({ exists: () => true, data: () => mockAllMaterials[0] }),
        update: jest.fn(),
        set: jest.fn(),
      };
      await transactionCallback(transaction);
      return Promise.resolve();
    });
  });

  test('renders in "Add New Delivery Log" mode', async () => {
    render(<LogForm type="delivery" onClose={mockOnClose} allMaterials={mockAllMaterials} />);
    expect(await screen.findByText(/Add New delivery Log/i)).toBeInTheDocument();
  });
  
  test('renders in "Edit Issuance Log" mode with pre-filled data', async () => {
    const mockLog = {
      type: 'issuance',
      materialId: 'mat1',
      quantity: 5,
      remarks: 'Test remark',
      date: { toDate: () => new Date('2025-06-24') },
    };
    render(<LogForm type="issuance" log={mockLog} onClose={mockOnClose} allMaterials={mockAllMaterials} />);
    
    expect(await screen.findByText(/Edit issuance Log/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quantity/i)).toHaveValue(5);
  });

  test('shows validation error if form is submitted without a material or quantity', async () => {
    render(<LogForm type="delivery" onClose={mockOnClose} allMaterials={mockAllMaterials} />);
    
    const saveButton = screen.getByRole('button', { name: /Save Log/i });
    await userEvent.click(saveButton);

    expect(await screen.findByText('Please select a material and enter a valid quantity.')).toBeInTheDocument();
    expect(runTransaction).not.toHaveBeenCalled();
  });

  test('handles successful submission for a new delivery log', async () => {
    render(<LogForm type="delivery" onClose={mockOnClose} allMaterials={mockAllMaterials} />);
    
    const materialInput = screen.getByPlaceholderText('Select a material...');
    await userEvent.type(materialInput, 'Material One');
    await userEvent.click(await screen.findByText('Material One'));

    const quantityInput = screen.getByLabelText(/Quantity/i);
    await userEvent.clear(quantityInput);
    await userEvent.type(quantityInput, '15');
    
    const saveButton = screen.getByRole('button', { name: /Save Log/i });
    await userEvent.click(saveButton);
    
    await waitFor(() => {
      expect(runTransaction).toHaveBeenCalledTimes(1);
    });
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});