import requests
from bs4 import BeautifulSoup
import csv
import re
import json

def extract_bian_structure():
    # URL of the BIAN Service Landscape
    url = "https://bian.org/servicelandscape-12-0-0/views/view_51891.html"
    
    # Get the page content
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find the SVG element
    svg = soup.find('svg')
    
    # Initialize lists to store the data
    nodes = []
    edges = []
    
    # Extract all text elements (nodes)
    for text in svg.find_all('text'):
        # Get the text content
        content = text.get_text().strip()
        if not content:
            continue
            
        # Get the position
        x = float(text.get('x', 0))
        y = float(text.get('y', 0))
        
        # Generate a unique ID
        unique_id = f"node_{len(nodes)}"
        
        # Determine the type based on position and content
        node_type = "unknown"
        if "Business Area" in content:
            node_type = "business_area"
        elif "Business Domain" in content:
            node_type = "business_domain"
        elif "Service Domain" in content:
            node_type = "service_domain"
            
        nodes.append({
            'id': unique_id,
            'name': content,
            'type': node_type,
            'x': x,
            'y': y
        })
    
    # Extract all lines (edges)
    for line in svg.find_all('line'):
        x1 = float(line.get('x1', 0))
        y1 = float(line.get('y1', 0))
        x2 = float(line.get('x2', 0))
        y2 = float(line.get('y2', 0))
        
        # Find the closest nodes to the line endpoints
        start_node = find_closest_node(nodes, x1, y1)
        end_node = find_closest_node(nodes, x2, y2)
        
        if start_node and end_node:
            edges.append({
                'source': start_node['id'],
                'target': end_node['id'],
                'type': 'contains'
            })
    
    # Write to CSV
    with open('bian_structure.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['ID', 'Name', 'Type', 'Parent ID'])
        
        # First write all nodes
        for node in nodes:
            # Find parent node
            parent_id = find_parent_id(node, nodes, edges)
            writer.writerow([
                node['id'],
                node['name'],
                node['type'],
                parent_id
            ])
    
    # Also save the full structure as JSON for reference
    with open('bian_structure.json', 'w', encoding='utf-8') as f:
        json.dump({
            'nodes': nodes,
            'edges': edges
        }, f, indent=2)

def find_closest_node(nodes, x, y):
    closest_node = None
    min_distance = float('inf')
    
    for node in nodes:
        distance = ((node['x'] - x) ** 2 + (node['y'] - y) ** 2) ** 0.5
        if distance < min_distance:
            min_distance = distance
            closest_node = node
    
    return closest_node

def find_parent_id(node, nodes, edges):
    # Find edges where this node is the target
    for edge in edges:
        if edge['target'] == node['id']:
            return edge['source']
    return None

if __name__ == "__main__":
    extract_bian_structure() 