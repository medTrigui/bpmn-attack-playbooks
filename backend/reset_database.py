"""
Reset database - drops all tables and recreates them
Use this after schema changes
"""

import os
from pathlib import Path

def reset_database():
    """Delete the database file and it will be recreated on next run"""
    db_path = Path(__file__).parent / 'data' / 'bpmn_playbooks.db'
    
    if db_path.exists():
        print(f"🗑️  Deleting existing database: {db_path}")
        os.remove(db_path)
        print("✓ Database deleted")
    else:
        print("ℹ️  No existing database found")
    
    print("\n✓ Database will be recreated when you run main.py")
    print("⚠️  Note: All existing incidents will be lost\n")

if __name__ == "__main__":
    import sys
    
    print("\n" + "="*60)
    print("DATABASE RESET")
    print("="*60)
    print("This will delete all existing incidents and data.")
    print("="*60 + "\n")
    
    response = input("Are you sure you want to continue? (yes/no): ")
    
    if response.lower() in ['yes', 'y']:
        reset_database()
    else:
        print("\n❌ Database reset cancelled")
        sys.exit(0)

