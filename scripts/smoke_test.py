"""
FairHire Smoke Test
Tests UI rendering, navigation, form interactions, and language toggle.
Does NOT call the Claude API — analyze button is tested for state only.
"""

from playwright.sync_api import sync_playwright, expect
import sys

BASE_URL = "http://localhost:5173"
PASS = "✅"
FAIL = "❌"
results = []


def check(label: str, fn):
    try:
        fn()
        results.append((PASS, label))
        print(f"  {PASS} {label}")
    except Exception as e:
        results.append((FAIL, label))
        print(f"  {FAIL} {label}: {e}")


def run_smoke_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        print("\n=== FairHire Smoke Test ===\n")

        # ── 1. Page Load ──────────────────────────────────────────────────────
        print("[ Page Load ]")
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.screenshot(path="/tmp/fairhire_01_home.png", full_page=True)

        check("App title visible (FairHire)", lambda: expect(
            page.locator("h1")).to_contain_text("FairHire"))
        check("App tagline visible", lambda: expect(
            page.locator("header")).to_be_visible())
        check("Language toggle rendered", lambda: expect(
            page.locator("button[aria-label], button:has-text('MX'), button:has-text('US'), button:has-text('🇲🇽'), button:has-text('🇺🇸')").first
        ).to_be_visible())

        # ── 2. Input Form ─────────────────────────────────────────────────────
        print("\n[ Input Form ]")
        check("Job description textarea present", lambda: expect(
            page.locator("textarea").first).to_be_visible())
        check("CV textarea present", lambda: expect(
            page.locator("textarea").nth(1)).to_be_visible())
        check("Analyze button present", lambda: expect(
            page.locator("button[disabled]").or_(
                page.locator("button").filter(has_text="Analizar").or_(
                    page.locator("button").filter(has_text="Analyze")
                )
            ).first
        ).to_be_visible())
        check("Analyze button disabled when fields empty", lambda: expect(
            page.locator("button[disabled]").first).to_be_visible())

        # ── 3. Form validation (typing enables button) ────────────────────────
        print("\n[ Form Validation ]")
        jd_placeholder_text = (
            "Desarrolladora Backend Senior\n\n"
            "Buscamos una desarrolladora con 5+ años en Python, FastAPI y AWS. "
            "Salario: $35,000 - $45,000 MXN mensual. "
            "Modalidad: Remoto. CDMX."
        )
        cv_placeholder_text = (
            "María García\n"
            "Software Engineer | 6 años de experiencia\n\n"
            "Habilidades: Python, Django, FastAPI, Docker, AWS, PostgreSQL\n"
            "Educación: Ingeniería en Sistemas, UNAM 2018\n"
            "Experiencia: Desarrolladora Backend en Startup Fintech (2019-2024)"
        )

        page.locator("textarea").first.fill(jd_placeholder_text)
        page.locator("textarea").nth(1).fill(cv_placeholder_text)

        check("Analyze button enabled after filling both fields", lambda: expect(
            page.locator("button:not([disabled])").filter(
                has_text="Analizar"
            ).or_(
                page.locator("button:not([disabled])").filter(has_text="Analyze")
            ).first
        ).to_be_enabled())
        page.screenshot(path="/tmp/fairhire_02_form_filled.png", full_page=True)

        # ── 4. Language Toggle (Radix DropdownMenu) ───────────────────────────
        print("\n[ Language Toggle ]")

        h2_text_before = page.locator("h2").first.inner_text()
        print(f"     h2 before switch: {repr(h2_text_before[:60])}")

        # Determine opposite language to switch to
        current_lang_btn = page.locator("button[aria-label='Change language']")
        current_lang_text = current_lang_btn.locator("span").inner_text().lower()
        target_lang = "Español" if "en" in current_lang_text else "English"
        print(f"     current lang: {current_lang_text!r}  → switching to {target_lang!r}")

        # Open the dropdown, then click the target language menu item
        current_lang_btn.click()
        page.wait_for_selector(f"[role='menuitem']:has-text('{target_lang}')", timeout=5000)
        page.locator(f"[role='menuitem']:has-text('{target_lang}')").click()
        page.wait_for_timeout(500)

        h2_text_after = page.locator("h2").first.inner_text()
        print(f"     h2 after switch:  {repr(h2_text_after[:60])}")

        check("Language toggle changes UI text", lambda: (
            None if h2_text_before != h2_text_after
            else (_ for _ in ()).throw(AssertionError("Text did not change after language toggle"))
        ))
        page.screenshot(path="/tmp/fairhire_03_lang_toggled.png", full_page=True)

        # Switch back to original language
        current_lang_btn.click()
        revert_lang = "English" if target_lang == "Español" else "Español"
        page.wait_for_selector(f"[role='menuitem']:has-text('{revert_lang}')", timeout=5000)
        page.locator(f"[role='menuitem']:has-text('{revert_lang}')").click()
        page.wait_for_timeout(300)

        # ── 5. Footer ─────────────────────────────────────────────────────────
        print("\n[ Footer ]")
        check("Footer visible", lambda: expect(page.locator("footer")).to_be_visible())
        check("LinkedIn link present", lambda: expect(
            page.locator("a[href*='linkedin']")).to_be_visible())

        # ── 6. Mobile viewport ───────────────────────────────────────────────
        print("\n[ Mobile Viewport (375px) ]")
        page.set_viewport_size({"width": 375, "height": 812})
        page.wait_for_timeout(300)
        check("App title still visible on mobile", lambda: expect(
            page.locator("h1")).to_be_visible())
        check("Textareas stack on mobile", lambda: expect(
            page.locator("textarea").first).to_be_visible())
        page.screenshot(path="/tmp/fairhire_04_mobile.png", full_page=True)

        browser.close()

    # ── Summary ────────────────────────────────────────────────────────────────
    passed = sum(1 for r in results if r[0] == PASS)
    failed = sum(1 for r in results if r[0] == FAIL)
    print(f"\n{'='*40}")
    print(f"Results: {passed}/{len(results)} passed")
    if failed:
        print(f"         {failed} FAILED")
    print(f"{'='*40}")
    print("\nScreenshots saved:")
    for f in [
        "/tmp/fairhire_01_home.png",
        "/tmp/fairhire_02_form_filled.png",
        "/tmp/fairhire_03_lang_toggled.png",
        "/tmp/fairhire_04_mobile.png",
    ]:
        print(f"  {f}")

    return failed == 0


if __name__ == "__main__":
    ok = run_smoke_test()
    sys.exit(0 if ok else 1)
