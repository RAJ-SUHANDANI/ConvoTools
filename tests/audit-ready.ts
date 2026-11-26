import { expect, type Page } from "@playwright/test";

// Axe can sample a partially transparent reveal and report its temporary
// blended color. Audit the intended visible state, without disabling rules.
export async function waitForPolicyReveals(page: Page) {
  await expect(page.locator('html[data-ct-hydrated="true"]')).toHaveCount(1);
  for (const element of await page.locator(".ct-privacy-tile, .ct-legal-notice").all()) {
    const bounds = await element.boundingBox();
    const height = page.viewportSize()?.height ?? 0;
    if (bounds && bounds.y < height && bounds.y + bounds.height > 0) {
      await expect(element.locator("..")).toHaveCSS("opacity", "1");
    }
  }
}
