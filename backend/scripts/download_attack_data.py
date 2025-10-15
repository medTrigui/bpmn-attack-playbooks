"""
Script to download MITRE ATT&CK data from official GitHub repository
Run this after installing requirements to fetch the latest ATT&CK data
"""

import requests
import json
from pathlib import Path

# URLs for MITRE ATT&CK STIX data
ATTACK_URLS = {
    'enterprise': 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json',
    'mobile': 'https://raw.githubusercontent.com/mitre/cti/master/mobile-attack/mobile-attack.json',
    'ics': 'https://raw.githubusercontent.com/mitre/cti/master/ics-attack/ics-attack.json'
}

def download_attack_data():
    """Download ATT&CK data files"""
    data_dir = Path(__file__).parent.parent / 'data' / 'attack_data'
    data_dir.mkdir(parents=True, exist_ok=True)
    
    print("Downloading MITRE ATT&CK data...")
    
    for domain, url in ATTACK_URLS.items():
        print(f"\nDownloading {domain} ATT&CK data...")
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            output_file = data_dir / f'{domain}-attack.json'
            
            # Parse and pretty-print JSON
            data = response.json()
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            
            # Calculate stats
            objects = data.get('objects', [])
            techniques = [o for o in objects if o.get('type') == 'attack-pattern']
            tactics = [o for o in objects if o.get('type') == 'x-mitre-tactic']
            
            print(f"[OK] Downloaded {domain} ATT&CK data")
            print(f"  - File: {output_file}")
            print(f"  - Size: {output_file.stat().st_size / 1024:.1f} KB")
            print(f"  - Techniques: {len(techniques)}")
            print(f"  - Tactics: {len(tactics)}")
            
        except requests.RequestException as e:
            print(f"[ERROR] Failed to download {domain} data: {e}")
        except Exception as e:
            print(f"[ERROR] Error processing {domain} data: {e}")
    
    print("\n" + "="*50)
    print("Download complete!")
    print(f"Data saved to: {data_dir}")
    print("="*50)

if __name__ == '__main__':
    download_attack_data()

