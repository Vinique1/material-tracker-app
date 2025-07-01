// src/components/Pagination.test.jsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination Component', () => {
  test('renders correctly when there are multiple pages', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />);
    // MODIFIED: Use getByTestId and toHaveTextContent for a more robust test
    const paginationInfo = screen.getByTestId('pagination-info');
    expect(paginationInfo).toHaveTextContent('Page 2 of 5');
  });

  test('disables "Previous" button on the first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByText('Previous')).toBeDisabled();
  });

  test('disables "Next" button on the last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByText('Next')).toBeDisabled();
  });

  test('does not render if there is only one page', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});