import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CustomNode from './CustomNode';
import { TestWrapper } from '../../test/TestWrapper';

const renderWithWrapper = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

describe('CustomNode', () => {
  const mockData = {
    id: 'test-node',
    type: 'api',
    name: 'Test API',
    description: 'Test Description',
    data: {
      owner: 'Test Owner',
      status: 'Active'
    },
    onExpand: vi.fn(),
    onCollapse: vi.fn(),
    onToggleVisibility: vi.fn(),
    isExpanded: false
  };

  const expandedData = {
    ...mockData,
    isExpanded: true,
    relatedNodes: [
      {
        id: 'related-api',
        type: 'api',
        name: 'Related API',
        description: 'Related Description'
      }
    ]
  };

  it('renders node with correct title and description', () => {
    renderWithWrapper(<CustomNode data={mockData} />);
    expect(screen.getByText('Test API')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders node data correctly', () => {
    renderWithWrapper(<CustomNode data={mockData} />);
    expect(screen.getByText('owner:')).toBeInTheDocument();
    expect(screen.getByText('Test Owner')).toBeInTheDocument();
    expect(screen.getByText('status:')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('calls onExpand when expand button is clicked', () => {
    renderWithWrapper(<CustomNode data={mockData} />);
    const expandButton = screen.getByRole('button', { name: /expand/i });
    fireEvent.click(expandButton);
    expect(mockData.onExpand).toHaveBeenCalledWith('test-node');
  });

  it('calls onCollapse when collapse button is clicked', () => {
    renderWithWrapper(<CustomNode data={expandedData} />);
    const collapseButton = screen.getByRole('button', { name: /collapse/i });
    fireEvent.click(collapseButton);
    expect(mockData.onCollapse).toHaveBeenCalledWith('test-node');
  });

  it('calls onToggleVisibility when visibility button is clicked', () => {
    renderWithWrapper(<CustomNode data={mockData} />);
    const visibilityButton = screen.getByRole('button', { name: /hide node/i });
    fireEvent.click(visibilityButton);
    expect(mockData.onToggleVisibility).toHaveBeenCalledWith('test-node');
  });

  it('shows related nodes when expanded', () => {
    renderWithWrapper(<CustomNode data={expandedData} />);
    // The component shows related nodes in a Badge component
    const badge = screen.getByRole('button', { name: /api/i });
    expect(badge).toBeInTheDocument();
  });

  it('handles null or undefined values gracefully', () => {
    const nullData = {
      ...mockData,
      name: 'Unnamed Node',
      data: {
        owner: null,
        status: null
      }
    };
    renderWithWrapper(<CustomNode data={nullData} />);
    expect(screen.getByText('Unnamed Node')).toBeInTheDocument();
    const nullValues = screen.getAllByText('null');
    expect(nullValues).toHaveLength(2);
  });
}); 