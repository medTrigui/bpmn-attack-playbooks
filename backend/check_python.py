"""
Python version compatibility checker
"""
import sys

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    
    print(f"Detected Python {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3:
        print("ERROR: Python 3.x is required")
        return False
    
    if version.minor >= 13:
        print("WARNING: Python 3.13+ detected")
        print("   SQLAlchemy may have compatibility issues with Python 3.13")
        print("   Recommended: Use Python 3.11 or 3.12")
        print("\n   Attempting to continue anyway...")
        return True
    
    if version.minor < 8:
        print("ERROR: Python 3.8+ is required")
        return False
    
    print("Python version compatible")
    return True

if __name__ == "__main__":
    check_python_version()

