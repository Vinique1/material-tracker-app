import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogTable from './LogTable';
import { useAuth } from '../context/authContext';
import { runTransaction } from 'firebase/firestore';
import toast from 'react-hot-toast';

// --- Mocks ---
jest.mock('../context/authContext');
jest.mock('react-hot-toast');
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  runTransaction: jest.fn(),
  doc: jest.fn(),
}));

// Mock data
const mockLogs = [
  { id: 'log1', materialId: 'mat1', materialDescription: 'Log Entry One', quantity: 10, date: { toDate: () => new Date() } },
  { id: 'log2', materialId: 'mat2', materialDescription: 'Log Entry Two', quantity: 5, date: { toDate: () => new Date() } },
];

const mockAllMaterials = [
    { id: 'mat1', description: 'Material One' },
    { id: 'mat2', description: 'Material Two' },
];

describe('LogTable Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for Admin user
    useAuth.mockReturnValue({
      currentUser: { isViewer: false },
      ADMIN_UID: 'test-admin-uid',
    });
    // Mock runTransaction to always succeed
    runTransaction.mockImplementation(async (db, transactionCallback) => {
      const transaction = {
        get: jest.fn().mockResolvedValue({ exists: () => true, data: () => ({ delivered: 10, issued: 0 }) }),
        delete: jest.fn(),
        update: jest.fn(),
      };
      await transactionCallback(transaction);
      return Promise.resolve();
    });
  });

  test('renders logs correctly', () => {
    render(<LogTable logs={mockLogs} type="delivery" onEdit={() => {}} currentPage={1} itemsPerPage={10} allMaterials={mockAllMaterials} />);
    expect(screen.getByText('Log Entry One')).toBeInTheDocument();
    expect(screen.getByText('Log Entry Two')).toBeInTheDocument();
  });

  test('hides action buttons for viewer users', () => {
    // Override mock for viewer user
    useAuth.mockReturnValue({ currentUser: { isViewer: true } });
    render(<LogTable logs={mockLogs} type="delivery" onEdit={() => {}} currentPage={1} itemsPerPage={10} allMaterials={mockAllMaterials} />);
    
    // queryBy... returns null if not found, which is what we want
    const editButtons = screen.queryAllByTitle(/Edit Log/i);
    const deleteButtons = screen.queryAllByTitle(/Delete Log/i);

    expect(editButtons.length).toBe(0);
    expect(deleteButtons.length).toBe(0);
  });

  test('shows action buttons for admin users', () => {
    render(<LogTable logs={mockLogs} type="delivery" onEdit={() => {}} currentPage={1} itemsPerPage={10} allMaterials={mockAllMaterials} />);
    
    const editButtons = screen.getAllByTitle(/Edit Log/i);
    const deleteButtons = screen.getAllByTitle(/Delete Log/i);

    expect(editButtons.length).toBe(mockLogs.length);
    expect(deleteButtons.length).toBe(mockLogs.length);
  });

  test('calls delete transaction when delete button is clicked and confirmed', async () => {
    // Mock the window.confirm dialog to return true (user clicks "OK")
    window.confirm = jest.fn(() => true);
    
    render(<LogTable logs={mockLogs} type="delivery" onEdit={() => {}} currentPage={1} itemsPerPage={10} allMaterials={mockAllMaterials} />);

    // Find the delete button for the first log entry
    const deleteButtons = screen.getAllByTitle(/Delete Log/i);
    await userEvent.click(deleteButtons[0]);

    // Check that the confirmation was shown
    expect(window.confirm).toHaveBeenCalledTimes(1);
    
    // Check that the database transaction was called
    await waitFor(() => {
      expect(runTransaction).toHaveBeenCalledTimes(1);
    });

    // Check that the success toast was shown
    await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Log deleted successfully.', expect.any(Object));
    });
  });
});