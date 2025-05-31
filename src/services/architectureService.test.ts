import { describe, it, expect, vi, beforeEach } from 'vitest';
import { architectureService } from './architectureService';
import type { Node, Edge } from './architectureService';

// Mock the architecture data
vi.mock('../data/architecture.json', () => ({
  default: {
    nodes: [
      {
        id: 'cap1',
        type: 'capability',
        name: 'Test Capability',
        description: 'Test Description',
        data: { owner: 'Test Owner', status: 'Active' }
      },
      {
        id: 'ds1',
        type: 'domainService',
        name: 'Test Service',
        description: 'Test Description',
        data: { owner: 'Test Owner', status: 'Active' }
      },
      {
        id: 'api1',
        type: 'api',
        name: 'Test API',
        description: 'Test Description',
        data: { owner: 'Test Owner', status: 'Active' }
      }
    ],
    edges: [
      {
        id: 'e1',
        source: 'cap1',
        target: 'ds1',
        type: 'default'
      },
      {
        id: 'e2',
        source: 'ds1',
        target: 'api1',
        type: 'default'
      }
    ]
  }
}));

describe('ArchitectureService', () => {
  it('should search nodes by name', () => {
    const results = architectureService.searchNodes('Test');
    expect(results).toHaveLength(3);
    expect(results[0].name).toBe('Test Capability');
  });

  it('should get nodes by type', () => {
    const capabilityNodes = architectureService.getNodesByType('capability');
    expect(capabilityNodes).toHaveLength(1);
    expect(capabilityNodes[0].name).toBe('Test Capability');
  });

  it('should get edges by node id', () => {
    const edges = architectureService.getEdgesByNodeId('ds1');
    expect(edges).toHaveLength(2);
    expect(edges[0].source).toBe('cap1');
    expect(edges[1].target).toBe('api1');
  });

  it('should get connected nodes', () => {
    const connectedNodes = architectureService.getConnectedNodes('ds1');
    expect(connectedNodes).toHaveLength(2);
    expect(connectedNodes[0].name).toBe('Test Capability');
    expect(connectedNodes[1].name).toBe('Test API');
  });

  describe('searchNodes', () => {
    it('should find nodes by name', () => {
      const results = architectureService.searchNodes('Test');
      expect(results).toHaveLength(3);
    });

    it('should find nodes by description', () => {
      const results = architectureService.searchNodes('Description');
      expect(results).toHaveLength(3);
    });

    it('should return empty array for no matches', () => {
      const results = architectureService.searchNodes('Nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('getNodeById', () => {
    it('should find node by id', () => {
      const node = architectureService.getNodeById('cap1');
      expect(node).toBeDefined();
      expect(node?.id).toBe('cap1');
    });

    it('should return undefined for non-existent id', () => {
      const node = architectureService.getNodeById('nonexistent');
      expect(node).toBeUndefined();
    });
  });

  describe('getRelatedNodes', () => {
    it('should find related nodes and edges', () => {
      const { nodes, edges } = architectureService.getRelatedNodes('ds1');
      expect(nodes).toHaveLength(2); // Should include both cap1 and api1
      expect(edges).toHaveLength(2); // Should include both edges
    });

    it('should return empty arrays for node with no relations', () => {
      const { nodes, edges } = architectureService.getRelatedNodes('nonexistent');
      expect(nodes).toHaveLength(0);
      expect(edges).toHaveLength(0);
    });
  });

  describe('getAllData', () => {
    it('should return all nodes and edges', () => {
      const data = architectureService.getAllData();
      expect(data.nodes).toHaveLength(3);
      expect(data.edges).toHaveLength(2);
    });
  });

  describe('getNodesByType', () => {
    it('should return nodes of specific type', () => {
      const apiNodes = architectureService.getNodesByType('api');
      expect(apiNodes).toHaveLength(1);
      expect(apiNodes[0].type).toBe('api');
    });

    it('should return empty array for non-existent type', () => {
      const nodes = architectureService.getNodesByType('nonexistent' as any);
      expect(nodes).toHaveLength(0);
    });
  });

  describe('getEdgesByNodeId', () => {
    it('should return edges connected to node', () => {
      const edges = architectureService.getEdgesByNodeId('ds1');
      expect(edges).toHaveLength(2);
    });

    it('should return empty array for node with no edges', () => {
      const edges = architectureService.getEdgesByNodeId('nonexistent');
      expect(edges).toHaveLength(0);
    });
  });

  describe('getConnectedNodes', () => {
    it('should return nodes connected to given node', () => {
      const nodes = architectureService.getConnectedNodes('ds1');
      expect(nodes).toHaveLength(2);
      expect(nodes.map(n => n.id)).toContain('cap1');
      expect(nodes.map(n => n.id)).toContain('api1');
    });

    it('should return empty array for node with no connections', () => {
      const nodes = architectureService.getConnectedNodes('nonexistent');
      expect(nodes).toHaveLength(0);
    });
  });
}); 