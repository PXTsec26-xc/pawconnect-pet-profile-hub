import sys
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

from playwright.sync_api import sync_playwright
import os
import time

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
os.makedirs("tests/screenshots", exist_ok=True)

routes = [
    ("home", "/"),
    ("pets", "/pets"),
    ("pet_detail", "/pets/1"),
    ("adopt", "/adopt/1"),
    ("shelters", "/shelters"),
    ("blog", "/blog"),
    ("rescue", "/rescue"),
    ("about", "/about"),
    ("contact", "/contact"),
    ("login", "/login"),
    ("register", "/register"),
]

with sync_playwright() as p:
    print("Launching Edge browser for E2E testing...")
    browser = p.chromium.launch(executable_path=edge_path, headless=True)
    
    # 1. Capture Desktop routes
    context = browser.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()

    for name, path in routes:
        url = f"http://localhost:5000{path}"
        try:
            print(f"Navigating to {url}...")
            page.goto(url, wait_until="networkidle", timeout=10000)
            page.wait_for_timeout(1000)
            page.screenshot(path=f"tests/screenshots/build_desktop_{name}.png", full_page=True)
            print(f"  ✓ Saved tests/screenshots/build_desktop_{name}.png")
        except Exception as e:
            print(f"  ✗ Error on {name}: {e}")

    # 2. Capture Mobile Home
    context_mobile = browser.new_context(viewport={"width": 375, "height": 812}, is_mobile=True)
    page_m = context_mobile.new_page()
    page_m.goto("http://localhost:5000/", wait_until="networkidle")
    page_m.wait_for_timeout(1000)
    page_m.screenshot(path="tests/screenshots/build_mobile_home.png", full_page=True)
    print("  ✓ Saved tests/screenshots/build_mobile_home.png")
    context_mobile.close()

    # 3. Interactive Form Test: Emergency Rescue Form
    print("\nTesting interactive form submission on /rescue...")
    page.goto("http://localhost:5000/rescue", wait_until="networkidle")
    page.fill('input[name="reporterName"]', 'Browser Automated Tester')
    page.fill('input[name="reporterPhone"]', '(555) 777-8899')
    page.fill('input[name="location"]', 'Downtown Plaza near the water fountain')
    page.select_option('select[name="urgency"]', 'high')
    page.fill('textarea[name="description"]', 'Spotted a friendly stray golden dog with a blue collar searching for food.')
    page.click('button[type="submit"]')
    page.wait_for_timeout(2000)
    page.screenshot(path="tests/screenshots/build_rescue_submitted.png")
    
    content = page.content()
    assert "Rescue Report Received" in content or "RESCUE-" in content, "Form submission feedback not found!"
    print("  ✓ Interactive form submission succeeded and verified in browser DOM!")

    # 4. Interactive Form Test: Contact Form
    print("\nTesting interactive contact form submission on /contact...")
    page.goto("http://localhost:5000/contact", wait_until="networkidle")
    page.fill('input[name="name"]', 'Browser Contact Tester')
    page.fill('input[name="email"]', 'tester@pawconnect.org')
    page.fill('input[name="subject"]', 'Volunteer Question')
    page.fill('textarea[name="message"]', 'I would love to volunteer at the upcoming weekend adoption event.')
    page.click('button[type="submit"]')
    page.wait_for_timeout(2000)
    page.screenshot(path="tests/screenshots/build_contact_submitted.png")

    content_contact = page.content()
    assert "Message Sent!" in content_contact, "Contact form success not found!"
    print("  ✓ Contact form submission confirmed in browser DOM!")

    context.close()
    browser.close()
    print("\n🎉 ALL E2E BROWSER CHECKS COMPLETED SUCCESSFULLY!")
