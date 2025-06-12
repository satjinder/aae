import xml.etree.ElementTree as ET
import json
import os
from pathlib import Path

def parse_bian_xml(xml_file):
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    # Dictionary to store all business areas and their components
    business_areas = {}
    
    # Parse all business areas
    for ba in root.findall('.//BusinessArea'):
        ba_id = ba.get('id')
        ba_name = ba.get('name')
        
        # Initialize business area structure
        business_areas[ba_id] = {
            'nodes': [
                {
                    'id': ba_id,
                    'name': ba_name,
                    'type': 'business_area',
                    'description': f'Business area covering {ba_name.lower()}'
                }
            ],
            'edges': []
        }
        
        # Parse business domains
        for bd in ba.findall('.//BusinessDomain'):
            bd_id = bd.get('id')
            bd_name = bd.get('name')
            
            # Add business domain node
            business_areas[ba_id]['nodes'].append({
                'id': bd_id,
                'name': bd_name,
                'type': 'business_domain',
                'description': f'Managing {bd_name.lower()} processes'
            })
            
            # Add edge from business area to business domain
            business_areas[ba_id]['edges'].append({
                'source': ba_id,
                'target': bd_id,
                'type': 'contains'
            })
            
            # Parse service domains
            for sd in bd.findall('.//ServiceDomain'):
                sd_id = sd.get('id')
                sd_name = sd.get('name')
                
                # Add service domain node
                business_areas[ba_id]['nodes'].append({
                    'id': sd_id,
                    'name': sd_name,
                    'type': 'service_domain',
                    'description': f'Service for {sd_name.lower()}'
                })
                
                # Add edge from business domain to service domain
                business_areas[ba_id]['edges'].append({
                    'source': bd_id,
                    'target': sd_id,
                    'type': 'contains'
                })
    
    return business_areas

def update_json_files(business_areas, data_dir):
    # Create data directory if it doesn't exist
    os.makedirs(data_dir, exist_ok=True)
    
    # Update each business area's JSON files
    for ba_id, data in business_areas.items():
        # Create nodes file
        nodes_file = os.path.join(data_dir, f'{ba_id}.json')
        with open(nodes_file, 'w', encoding='utf-8') as f:
            json.dump(data['nodes'], f, indent=2)
        
        # Create edges file
        edges_file = os.path.join(data_dir, f'{ba_id}-edges.json')
        with open(edges_file, 'w', encoding='utf-8') as f:
            json.dump({'edges': data['edges']}, f, indent=2)

def main():
    # Path to the BIAN XML file
    xml_file = 'bian.xml'
    
    # Path to the data directory
    data_dir = 'src/data/business_areas'
    
    # Parse the XML file
    business_areas = parse_bian_xml(xml_file)
    
    # Update the JSON files
    update_json_files(business_areas, data_dir)
    
    print(f"Updated JSON files in {data_dir}")

if __name__ == "__main__":
    main() 