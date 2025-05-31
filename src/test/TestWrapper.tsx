import React from 'react';
import { ReactFlowProvider } from 'reactflow';

export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactFlowProvider>
      {children}
    </ReactFlowProvider>
  );
}; 