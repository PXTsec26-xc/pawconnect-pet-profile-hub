import sys
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

import urllib.request
import json
import os
import time

def run():
    print("==================================================")
    print("SUBMITTING CLEARLY MARKED TEST REQUEST")
    print("==================================================")

    url = "http://localhost:5000/api/adoptions"
    test_payload = {
        "petId": 1,
        "fullName": "INSPECTION TEST USER (VERIFICATION RUN)",
        "email": "inspection_test@pawconnect.org",
        "phone": "(555) 000-TEST",
        "address": "999 Inspection Avenue, Suite 1",
        "occupation": "QA Inspector",
        "housingType": "House with fenced yard",
        "petExperience": "Previous pet owner",
        "reason": "This is a clearly marked test request submitted to verify persistent storage.",
        "agreement": True
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(test_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    print("\n1. Sending POST /api/adoptions...")
    with urllib.request.urlopen(req, timeout=5) as res:
        status = res.status
        body = json.loads(res.read().decode("utf-8"))
        print(f"   Response Status: {status} Created")
        print(f"   Assigned Application ID: #{body['application']['id']}")
        app_id = body['application']['id']

    print("\n2. Retrieving via GET /api/adoptions...")
    req_get = urllib.request.Request("http://localhost:5000/api/adoptions")
    with urllib.request.urlopen(req_get, timeout=5) as res:
        records = json.loads(res.read().decode("utf-8"))
        match = next((r for r in records if r["id"] == app_id), None)
        assert match is not None, "Record not found in API response!"
        print(f"   ✓ API successfully retrieved Application #{match['id']}")
        print(f"   Applicant Name: {match['fullName']}")
        print(f"   Status: {match['status']}")

    print("\n3. Reading physical storage file (pawconnect_data.json) directly from disk...")
    data_file_path = os.path.abspath("pawconnect_data.json")
    with open(data_file_path, "r", encoding="utf-8") as f:
        disk_data = json.load(f)

    disk_record = next((a for a in disk_data.get("adoptions", []) if a["id"] == app_id), None)
    assert disk_record is not None, "Record was not written to disk file!"
    print(f"   ✓ Confirmed written to disk at: {data_file_path}")
    print(f"   Record in 'adoptions' collection:")
    print(f"     ID: {disk_record['id']}")
    print(f"     Full Name: {disk_record['fullName']}")
    print(f"     Pet ID: {disk_record['petId']}")
    print(f"     Created At: {disk_record['createdAt']}")

    print("\n==================================================")
    print("VERIFICATION COMPLETE: WRITE & READ CONFIRMED")
    print("==================================================")

if __name__ == "__main__":
    run()
