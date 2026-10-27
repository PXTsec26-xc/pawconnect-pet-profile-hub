import urllib.request
import urllib.parse
import json
import time
import subprocess
import os
import sys
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

BASE_URL = "http://localhost:5000"

def request(method, path, data=None, token=None):
    url = BASE_URL + path
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            res_body = res.read().decode("utf-8")
            return res.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            parsed = json.loads(body)
        except:
            parsed = {"raw": body}
        return e.code, parsed

def run_tests():
    print("==================================================")
    print("🐾 PAWCONNECT FULL INTEGRATION & PERSISTENCE TEST")
    print("==================================================")

    # 1. Health check
    print("\n[Test 1] Health Check...")
    status, res = request("GET", "/api/health")
    assert status == 200, f"Health check failed: {res}"
    print(f"  ✓ API is healthy ({res.get('service')})")

    # 2. Pets catalog & filters
    print("\n[Test 2] Pets Catalog & Filters...")
    status, res = request("GET", "/api/pets")
    assert status == 200 and "pets" in res, f"Pets catalog failed: {res}"
    total_pets = len(res["pets"])
    print(f"  ✓ Found {total_pets} pets (total: {res['total']})")

    status, res_dog = request("GET", "/api/pets?type=Dog")
    assert status == 200, "Filter type=Dog failed"
    for p in res_dog["pets"]:
        assert p["type"] == "Dog", f"Unexpected pet type {p['type']}"
    print(f"  ✓ Type filter works ({len(res_dog['pets'])} dogs)")

    status, res_search = request("GET", "/api/pets?search=Buddy")
    assert status == 200 and len(res_search["pets"]) >= 1, "Search for 'Buddy' failed"
    print(f"  ✓ Search query works (found {res_search['pets'][0]['name']})")

    # 3. Shelters
    print("\n[Test 3] Shelters Listing...")
    status, shelters = request("GET", "/api/shelters")
    assert status == 200 and len(shelters) > 0, "Shelters failed"
    print(f"  ✓ Found {len(shelters)} shelters ({shelters[0]['name']})")

    # 4. Blog Posts
    print("\n[Test 4] Blog Posts...")
    status, blog = request("GET", "/api/blog")
    assert status == 200 and len(blog["posts"]) > 0, "Blog failed"
    print(f"  ✓ Found {len(blog['posts'])} articles ({blog['posts'][0]['title'][:30]}...)")

    # 5. User Registration & Auth
    print("\n[Test 5] User Registration & Session...")
    ts = int(time.time())
    test_user = {
        "fullName": f"Test Adopter {ts}",
        "email": f"adopter_{ts}@test.com",
        "password": "SecretPassword123",
        "phone": "(555) 321-4321"
    }
    status, reg_res = request("POST", "/api/users/register", test_user)
    assert status == 201 and "token" in reg_res, f"Registration failed: {reg_res}"
    user_token = reg_res["token"]
    user_id = reg_res["user"]["id"]
    print(f"  ✓ Created user #{user_id} ({test_user['email']})")

    # Verify session via /api/users/me
    status, me_res = request("GET", "/api/users/me", token=user_token)
    assert status == 200 and me_res["email"] == test_user["email"], "Me check failed"
    print(f"  ✓ Authenticated as {me_res['fullName']}")

    # 6. Submit Adoption Application
    print("\n[Test 6] Submit Real Adoption Application...")
    app_data = {
        "petId": 1,
        "fullName": test_user["fullName"],
        "email": test_user["email"],
        "phone": test_user["phone"],
        "address": "456 Sunflower Lane, San Francisco, CA",
        "occupation": "Veterinary Assistant",
        "housingType": "House with fenced yard",
        "petExperience": "Previous pet owner",
        "reason": "We have a spacious backyard and plenty of time for daily runs and loving care.",
        "agreement": True
    }
    status, app_res = request("POST", "/api/adoptions", app_data, token=user_token)
    assert status == 201 and "application" in app_res, f"Adoption submission failed: {app_res}"
    app_id = app_res["application"]["id"]
    print(f"  ✓ Adoption application #{app_id} persisted in database")

    # User retrieves their adoption application
    status, my_apps = request("GET", "/api/adoptions", token=user_token)
    assert status == 200 and any(a["id"] == app_id for a in my_apps), "Could not retrieve user adoptions"
    print(f"  ✓ User retrieved {len(my_apps)} adoption application(s)")

    # 7. Submit Emergency Rescue Report
    print("\n[Test 7] Submit Real Emergency Rescue Report...")
    rescue_data = {
        "reporterName": "Sarah Witness",
        "reporterPhone": "(555) 999-1122",
        "location": "Corner of 4th St & Market, near the park bench",
        "urgency": "high",
        "description": "Found a small terrier mix with a minor leg limp, appears friendly but nervous.",
        "imageUrl": "https://images.unsplash.com/photo-1543466835-00a7907e9de1"
    }
    status, rescue_res = request("POST", "/api/rescue", rescue_data)
    assert status == 201 and "report" in rescue_res, f"Rescue report failed: {rescue_res}"
    rescue_id = rescue_res["report"]["id"]
    print(f"  ✓ Rescue report #{rescue_id} logged to emergency dispatch")

    # 8. Submit Contact Message
    print("\n[Test 8] Submit Real Contact Form Message...")
    contact_data = {
        "name": "Community Partner",
        "email": "partner@community.org",
        "subject": "Host Adoption Event",
        "message": "We would love to co-host an adoption drive this upcoming Saturday."
    }
    status, contact_res = request("POST", "/api/contact", contact_data)
    assert status == 201 and "id" in contact_res, f"Contact message failed: {contact_res}"
    print(f"  ✓ Contact inquiry #{contact_res['id']} stored")

    # 9. Favorites Persistence
    print("\n[Test 9] Add & Retrieve Favorite Pet...")
    status, fav_res = request("POST", "/api/favorites", {"petId": 2}, token=user_token)
    assert status == 201, f"Failed to add favorite: {fav_res}"
    status, my_favs = request("GET", "/api/favorites", token=user_token)
    assert status == 200 and any(f["petId"] == 2 for f in my_favs), "Favorite not in list"
    print(f"  ✓ Favorite saved and verified in user dashboard")

    # 10. Admin Authentication & Actions
    print("\n[Test 10] Admin Authentication & Authorization...")
    status, admin_login = request("POST", "/api/users/login", {
        "email": "admin@pawconnect.org",
        "password": "admin123"
    })
    assert status == 200 and admin_login["user"]["role"] == "admin", "Admin login failed"
    admin_token = admin_login["token"]
    print(f"  ✓ Admin logged in ({admin_login['user']['fullName']})")

    # Admin reviews and approves the application
    status, update_res = request("PATCH", f"/api/adoptions/{app_id}", {"status": "approved"}, token=admin_token)
    assert status == 200 and update_res["status"] == "approved", "Admin status update failed"
    print(f"  ✓ Admin approved adoption #{app_id}")

    # Admin adds a new pet
    new_pet_data = {
        "name": f"Rocky {ts}",
        "type": "Dog",
        "breed": "Boxer Mix",
        "age": "1 year",
        "gender": "Male",
        "size": "Medium",
        "city": "Austin",
        "vaccinated": True,
        "neutered": True,
        "description": "Rocky is a goofy, fun-loving pup who adores tennis balls and cuddles.",
        "imageUrl": "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
        "shelterName": "Hope Animal Rescue"
    }
    status, pet_res = request("POST", "/api/pets", new_pet_data, token=admin_token)
    assert status == 201 and "id" in pet_res, f"Admin pet creation failed: {pet_res}"
    new_pet_id = pet_res["id"]
    print(f"  ✓ Admin created new pet #{new_pet_id} ({new_pet_data['name']})")

    # Regular user is forbidden from admin routes
    status, unauth_res = request("POST", "/api/pets", new_pet_data, token=user_token)
    assert status == 403, f"Non-admin should be forbidden: {status}"
    print(f"  ✓ Non-admin properly blocked from admin route (HTTP 403)")

    print("\n==================================================")
    print("🎉 ALL 10 INTEGRATION TESTS PASSED PERFECTLY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
