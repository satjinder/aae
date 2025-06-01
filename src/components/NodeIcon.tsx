import React from 'react';
import ApiIcon from '@mui/icons-material/Api';
import EventIcon from '@mui/icons-material/Event';
import StorageIcon from '@mui/icons-material/Storage';
import DomainIcon from '@mui/icons-material/Domain';
import BusinessIcon from '@mui/icons-material/Business';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import type { Node } from '../services/architectureService';

type NodeType = Node['type'];

interface NodeIconProps {
  type: NodeType;
  fontSize?: 'small' | 'medium' | 'large';
  color?: string;
}

export const NodeIcon: React.FC<NodeIconProps> = ({ type, fontSize = 'medium', color }) => {
  const iconStyle = { color, fontSize };

  switch (type) {
    case 'api':
      return <ApiIcon fontSize={fontSize} sx={iconStyle} />;
    case 'event':
      return <EventIcon fontSize={fontSize} sx={iconStyle} />;
    case 'dataProduct':
      return <StorageIcon fontSize={fontSize} sx={iconStyle} />;
    case 'domainService':
      return <DomainIcon fontSize={fontSize} sx={iconStyle} />;
    case 'capability':
      return <LightbulbIcon fontSize={fontSize} sx={iconStyle} />;
    default:
      return null;
  }
}; 