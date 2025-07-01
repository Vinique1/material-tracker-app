import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImportCSV from './ImportCSV';
import Papa from 'papaparse';
import { writeBatch } from 'firebase/firestore';
import toast from 'react-hot-toast';

// --- Mocks ---
jest.mock('papaparse');
jest.mock('react-hot-toast');

jest.mock('../context/authContext', () => ({
  useAuth: () => ({
    currentUser: { isViewer: false },
    ADMIN_UID: 'test-admin-uid',
  }),
}));

const mockCommit = jest.fn(() => Promise.resolve());
const mockBatch = {
  update: jest.fn(),
  set: jest.fn(),
  commit: mockCommit,
};
jest.mock('firebase/firestore', () => ({
  writeBatch: jest.fn(() => mockBatch),
  doc: jest.fn(),
  collection: jest.fn(),
  arrayUnion: jest.fn(),
  serverTimestamp: jest.fn(),
}));

const fireFileUpload = async (file, mockData, parseError = null) => {
  Papa.parse.mockImplementation((_file, config) => {
    if (parseError) {
      config.error(parseError);
    } else {
      config.complete({ data: mockData });
    }
  });

  const fileInput = screen.getByTestId('csv-input');
  await userEvent.upload(fileInput, file);
};

describe('ImportCSV Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not render the button for viewer users', () => {
    jest.spyOn(require('../context/authContext'), 'useAuth').mockReturnValueOnce({
      currentUser: { isViewer: true }
    });
    const { container } = render(<ImportCSV />);
    expect(container).toBeEmptyDOMElement();
  });

  test('shows an error toast if the CSV is missing required headers', async () => {
    render(<ImportCSV />);
    const file = new File(['bad,data\n1,2'], 'test.csv', { type: 'text/csv' });
    const badData = [{ bad: '1', data: '2' }];

    await fireFileUpload(file, badData);

    await waitFor(() => {
      // FIX: Expect the full, correct error message
      const expectedError = 'Missing required columns: Description, ExpectedQuantity, Category, Supplier, MaterialGrade, BoreSize1';
      expect(toast.error).toHaveBeenCalledWith(expectedError, expect.any(Object));
    });
  });

  test('handles a successful import of a small CSV file', async () => {
    render(<ImportCSV />);
    const file = new File(['...'], 'test.csv', { type: 'text/csv' });
    const mockCSVData = [{ Description: 'Test', ExpectedQuantity: '10', Category: 'Pipes', Supplier: 'SupA', MaterialGrade: 'G1', BoreSize1: '1"' }];

    await fireFileUpload(file, mockCSVData);

    await waitFor(() => {
      // FIX: Expect the success toast to be called with the message and an options object
      expect(toast.success).toHaveBeenCalledWith('Successfully imported 1 materials!', expect.any(Object));
    });
  });
});