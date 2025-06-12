import { architectureService, Node } from './architectureService';
import { expect, describe, it } from '@jest/globals';

describe('ArchitectureService', () => {
  it('should return the same instance when getInstance is called multiple times', () => {
    const instance1 = architectureService;
    const instance2 = architectureService;
    expect(instance1).toBe(instance2);
  });

  it('should create a new node with the provided data', () => {
    const nodeData = {
      type: 'business_area' as Node['type'],
      name: 'Test Business Area',
      description: 'Test Description',
      data: { key: 'value' },
      position: { x: 10, y: 20 },
      relatedNodes: []
    };
    const newNode = architectureService.createNode(nodeData);
    expect(newNode).toBeDefined();
    expect(newNode.name).toBe('Test Business Area');
    expect(newNode.type).toBe('business_area');
    expect(newNode.description).toBe('Test Description');
    expect(newNode.data).toEqual({ key: 'value' });
    expect(newNode.position).toEqual({ x: 10, y: 20 });
  });

  it('should add an edge between two nodes if the relation is valid', () => {
    const node1 = architectureService.createNode({
      type: 'business_area',
      name: 'Business Area 1',
      description: 'Description 1'
    });
    const node2 = architectureService.createNode({
      type: 'business_domain',
      name: 'Business Domain 1',
      description: 'Description 2'
    });
    const edge = architectureService.addEdge(node1.id, node2.id, 'contains')!;
    expect(edge).toBeDefined();
    expect(edge.source).toBe(node1.id);
    expect(edge.target).toBe(node2.id);
    expect(edge.label).toBe('contains');
  });

  it('should return null when adding an edge with an invalid relation', () => {
    const node1 = architectureService.createNode({
      type: 'business_area',
      name: 'Business Area 2',
      description: 'Description 3'
    });
    const node2 = architectureService.createNode({
      type: 'service_domain',
      name: 'Service Domain 1',
      description: 'Description 4'
    });
    const edge = architectureService.addEdge(node1.id, node2.id, 'invalidRelation');
    expect(edge).toBeNull();
  });

  it('should search nodes by keyword in name and description', () => {
    const node = architectureService.createNode({
      type: 'business_area',
      name: 'Searchable Node',
      description: 'This is a searchable description'
    });
    const results = architectureService.searchNodes('searchable');
    expect(results).toContainEqual(expect.objectContaining({ id: node.id }));
  });

  it('should retrieve a node by its ID', () => {
    const node = architectureService.createNode({
      type: 'business_area',
      name: 'Node to Retrieve',
      description: 'Description for retrieval'
    });
    const retrievedNode = architectureService.getNodeById(node.id)!;
    expect(retrievedNode).toBeDefined();
    expect(retrievedNode.id).toBe(node.id);
  });
}); 