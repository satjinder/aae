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