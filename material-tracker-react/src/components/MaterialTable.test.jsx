import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MaterialTable from './MaterialTable';
import { collection, query, onSnapshot } from 'firebase/firestore';

// --- Mocks ---
jest.mock('../context/authContext', () => ({
  useAuth: () => ({
    currentUser: { isViewer: false },
    ADMIN_UID: 'test-admin-uid',
  }),
}));

// Mock child components that render modals to prevent them from interfering
jest.mock('./AddEditMaterialModal', () => () => <div>Add/Edit Modal</div>);
jest.mock('./ImportCSV', () => () => <button>Import CSV</button>);

// Mock the onSnapshot function from Firestore
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'), // keep other exports
  onSnapshot: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  doc: jest.fn(),
  deleteDoc: jest.fn(),
}));

const mockMaterials = [
  { id: '1', description: 'Surplus Special Pipe', category: 'Pipes', expectedQty: 10, delivered: 15, issued: 2 },
  { id: '2', description: 'Deficit Gate Valve', category: 'Valves', expectedQty: 20, delivered: 5, issued: 1 },
  { id: '3', description: 'Exact Flange', category: 'Fittings', expectedQty: 5, delivered: 5, issued: 3 },
  { id: '4', description: 'Untouched Bolt', category: 'Fittings', expectedQty: 100, delivered: 0, issued: 0 },
];

// Helper to set up the onSnapshot mock
const setupOnSnapshotMock = (data) => {
  onSnapshot.mockImplementation((_query, callback) => {
    const mockSnapshot = {
      docs: data.map(doc => ({
        id: doc.id,
        data: () => doc,
      })),
    };
    callback(mockSnapshot);
    // Return a mock unsubscribe function
    return jest.fn();
  });
};

describe('MaterialTable Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupOnSnapshotMock(mockMaterials);
  });

  test('renders the table with initial materials', async () => {
    render(<MaterialTable />);
    // Check for a material from each category to ensure they all render
    expect(await screen.findByText('Surplus Special Pipe')).toBeInTheDocument();
    expect(await screen.findByText('Deficit Gate Valve')).toBeInTheDocument();
    expect(await screen.findByText('Exact Flange')).toBeInTheDocument();
  });

  test('filters materials based on search term', async () => {
    render(<MaterialTable />);
    
    const searchInput = screen.getByPlaceholderText(/Search descriptions.../i);
    await userEvent.type(searchInput, 'Surplus');

    // After searching, only the "Surplus" pipe should be visible
    await waitFor(() => {
      expect(screen.getByText('Surplus Special Pipe')).toBeInTheDocument();
    });
    expect(screen.queryByText('Deficit Gate Valve')).not.toBeInTheDocument();
    expect(screen.queryByText('Exact Flange')).not.toBeInTheDocument();
  });

  test('filters materials correctly when given a "surplus" statusFilter prop', async () => {
    render(<MaterialTable statusFilter="surplus" />);

    // Only the material where delivered > expected should be shown
    await waitFor(() => {
      expect(screen.getByText('Surplus Special Pipe')).toBeInTheDocument();
    });
    expect(screen.queryByText('Deficit Gate Valve')).not.toBeInTheDocument();
    expect(screen.queryByText('Exact Flange')).not.toBeInTheDocument();
  });

  test('filters materials correctly when given a "deficit" statusFilter prop', async () => {
    render(<MaterialTable statusFilter="deficit" />);

    // Only the material where delivered < expected should be shown
    await waitFor(() => {
      expect(screen.getByText('Deficit Gate Valve')).toBeInTheDocument();
    });
    expect(screen.queryByText('Surplus Special Pipe')).not.toBeInTheDocument();
    expect(screen.queryByText('Exact Flange')).not.toBeInTheDocument();
  });
});