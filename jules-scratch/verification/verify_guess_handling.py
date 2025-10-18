from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:3000")

    page.get_by_role("button", name="Normal").click()
    page.get_by_role("button", name="Start Game").click()

    page.wait_for_selector('text="Is it tangible/physical?"')

    page.screenshot(path="jules-scratch/verification/01_start_game.png")

    page.get_by_role("button", name="Yes").click()

    page.wait_for_selector('text="Is it a living thing?"')

    page.screenshot(path="jules-scratch/verification/02_first_question.png")

    page.get_by_role("button", name="Yes").click()

    page.wait_for_selector('text="Is it an animal?"')

    page.screenshot(path="jules-scratch/verification/03_second_question.png")

    for i in range(12):
        page.get_by_role("button", name="Yes").click()
        page.wait_for_function("() => !document.querySelector('text=Thinking deeply...')")


    page.wait_for_selector('text=/GUESS:/')

    page.screenshot(path="jules-scratch/verification/04_guess.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)