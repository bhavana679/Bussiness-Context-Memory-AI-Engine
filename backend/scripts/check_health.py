import requests
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def check_backend_health():
    """Performs a production readiness check of the API, Database, and AI services."""
    base_url = "http://localhost:8000"
    print("\n" + "="*60)
    print(" SYSTEM PRODUCTION READINESS CHECK")
    print("="*60)

    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("[OK] API SERVER: Online.")
        else:
            print(f"[FAIL] API SERVER: Status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("[FAIL] API SERVER: Connection refused.")
        return

    try:
        response = requests.get(f"{base_url}/", timeout=5)
        data = response.json()
        print(f"[OK] SYSTEM STATUS: {data.get('status')} ({data.get('app')})")
    except Exception as e:
        print(f"[FAIL] SYSTEM STATUS: Error: {str(e)}")

    try:
        from config import settings
        storage_dir = os.path.dirname(settings.FAISS_INDEX_PATH)
        if os.path.exists(storage_dir):
            print(f"[OK] VECTOR STORAGE: Verified at {storage_dir}")
        else:
            print("[WARN] VECTOR STORAGE: Directory not found (will be initialized).")
        print(f"[INFO] AI MEMORY: Path set to {settings.FAISS_INDEX_PATH}")
    except ImportError:
        print("[FAIL] CONFIG: Missing internal dependencies.")

    print("\n" + "="*60)
    print(" READINESS CHECK COMPLETE")
    print("="*60 + "\n")

if __name__ == "__main__":
    check_backend_health()
