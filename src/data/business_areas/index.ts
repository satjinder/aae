import salesServiceData from './business-area-sales-and-service.json';
import businessSupportData from './business-area-business-support.json';
import operationsExecutionData from './business-area-operations-and-execution.json';
import referenceDataData from './business-area-reference-data.json';
import riskComplianceData from './business-area-risk-and-compliance.json';

// Combine all nodes from different business areas into one array
export const allBusinessAreaNodes = [
  ...salesServiceData.nodes,
  ...businessSupportData.nodes,
  ...operationsExecutionData.nodes,
  ...referenceDataData.nodes,
  ...riskComplianceData.nodes
];

// Combine all edges from different business areas into one array
export const allBusinessAreaEdges = [
  ...salesServiceData.edges,
  ...businessSupportData.edges,
  ...operationsExecutionData.edges,
  ...referenceDataData.edges,
  ...riskComplianceData.edges
]; 