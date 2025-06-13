import React from 'react';
import { SvgIconProps } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import DomainIcon from '@mui/icons-material/Domain';
import StorageIcon from '@mui/icons-material/Storage';
import ApiIcon from '@mui/icons-material/Api';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CategoryIcon from '@mui/icons-material/Category';
import { NodeType } from '../services/architectureService';

interface NodeIconProps extends SvgIconProps {
  type: NodeType;
}

export const NodeIcon: React.FC<NodeIconProps> = ({ type, ...props }) => {
  switch (type) {
    case 'business_area':
      return <BusinessIcon {...props} />;
    case 'business_domain':
      return <DomainIcon {...props} />;
    case 'service_domain':
      return <StorageIcon {...props} />;
    case 'api':
      return <ApiIcon {...props} />;
    case 'event':
      return <NotificationsIcon {...props} />;
    case 'bom':
      return <CategoryIcon {...props} />;
    default:
      return <CategoryIcon {...props} />;
  }
};

export const getNodeTypeColor = (type: NodeType): string => {
  switch (type) {
    case 'business_area':
      return '#1976d2'; // Blue
    case 'business_domain':
      return '#2e7d32'; // Green
    case 'service_domain':
      return '#ed6c02'; // Orange
    case 'api':
      return '#9c27b0'; // Purple
    case 'event':
      return '#d32f2f'; // Red
    case 'bom':
      return '#0288d1'; // Light Blue
    case 'system':
      return '#7b1fa2'; // Deep Purple
    case 'dev_team':
      return '#c2185b'; // Pink
    default:
      return '#757575'; // Grey
  }
};

export type { NodeType }; 