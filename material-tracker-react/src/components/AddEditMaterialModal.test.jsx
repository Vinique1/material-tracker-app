import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddEditMaterialModal from './AddEditMaterialModal';

// Mock the dependencies of the component
jest.mock('../context/authContext', () => ({
  useAuth: () => ({
    currentUser: { isViewer: false, email: 'test@example.com' },
    ADMIN_UID: 'test-admin-uid',
    appMetadata: {
      categories: ['Pipes', 'Valves'],
      suppliers: ['Supplier A', 'Supplier B'],
      materialGrades: ['Grade 1', 'Grade 2'],
      boreSize1Options: ['1"', '2"'],
      boreSize2Options: ['1.5"'],
    },
  }),
}));

// Mock the firebase services used in the component
jest.mock('../firebase', () => ({
  db: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(() => Promise.resolve()),
  addDoc: jest.fn(() => Promise.resolve()),
  collection: jest.fn(),
  arrayUnion: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));

describe('AddEditMaterialModal Component', () => {
  const mockOnClose = jest.fn();

  // Clear mock history before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders in "Add New Material" mode correctly', () => {
    render(<AddEditMaterialModal onClose={mockOnClose} />);

    expect(screen.getByText('Add New Material')).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toHaveValue('');
    expect(screen.getByLabelText(/Expected Quantity/i)).toHaveValue(1);
  });

  test('renders in "Edit Material" mode and populates fields', () => {
    const mockMaterial = {
      id: '123',
      description: 'Test Pipe',
      expectedQty: 50,
      category: 'Pipes',
      supplier: 'Supplier A',
      materialGrade: 'Grade 1',
      boreSize1: '1"',
    };

    render(<AddEditMaterialModal material={mockMaterial} onClose={mockOnClose} />);

    expect(screen.getByText('Edit Material')).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Test Pipe');
    expect(screen.getByLabelText(/Expected Quantity/i)).toHaveValue(50);
    // Test a combobox/dropdown value
    expect(screen.getByDisplayValue('Pipes')).toBeInTheDocument();
  });

  test('shows validation errors for required fields on submit', async () => {
    render(<AddEditMaterialModal onClose={mockOnClose} />);
    
    // Clear default values to trigger validation
    await userEvent.clear(screen.getByLabelText(/Expected Quantity/i));
    
    const saveButton = screen.getByRole('button', { name: /Save Material/i });
    fireEvent.click(saveButton);

    // Use findByText to wait for async validation messages to appear
    expect(await screen.findByText('Description is required.')).toBeInTheDocument();
    expect(await screen.findByText('Bore Size 1 is required.')).toBeInTheDocument();
    expect(await screen.findByText('Category is required.')).toBeInTheDocument();
    expect(await screen.findByText('Supplier is required.')).toBeInTheDocument();
    expect(await screen.findByText('Material Grade is required.')).toBeInTheDocument();
  });
  
  test('allows user to type in the description field', async () => {
    render(<AddEditMaterialModal onClose={mockOnClose} />);
    const descriptionInput = screen.getByLabelText(/Description/i);

    await userEvent.type(descriptionInput, 'A new gate valve');
    
    expect(descriptionInput).toHaveValue('A new gate valve');
  });

});