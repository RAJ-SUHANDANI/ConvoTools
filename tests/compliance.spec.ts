import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const legalPages: Array<{ path: string; heading: RegExp }> = [
  { path: "/privacy", heading: /Privacy should be simple/ },
  { path: "/terms", heading: /Terms of use/ },
  { path: "/cookies", heading: /Cookies & storage/ },
  { path: "/contact", heading: /Talk to the project/ },
  { path: "/accessibility", heading: /Accessible by design/ },
  { path: "/licenses", heading: /Built on good work/ },
];

for (const {path,heading} of legalPages) {
  test(path + " is readable, linked and accessible", async ({page}) => {
    const response=await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading",{level:1})).toContainText(heading);
    await expect(page.getByRole("link",{name:/Terms of use/}).first()).toBeVisible();
    await expect(page.getByRole("link",{name:/Contact & support/}).first()).toBeVisible();
    await expect(page.locator(".ct-content-sections section").first()).toBeVisible();
    const audit=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
    expect(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  });
}

test("external media previews require an explicit user action", async ({page}) => {
  await page.goto("/savefrom");
  await page.getByRole("textbox",{name:"Media URL"}).fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await page.getByRole("button",{name:/Analyse link/}).click();
  await expect(page.getByRole("heading",{name:/Preview from YouTube/})).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.getByRole("link",{name:/How external previews work/})).toHaveAttribute("href","/cookies");
  await page.getByRole("button",{name:"Load external preview"}).click();
  await expect(page.locator("iframe")).toHaveAttribute("src",/youtube-nocookie\.com/);
});

test("local file activity defaults to off and full workspace storage can be erased", async ({page}, testInfo) => {
  await page.goto("/tools/png-to-jpg");
  await expect(page.locator('html[data-ct-hydrated="true"]')).toHaveCount(1);
  expect(await page.evaluate(()=>localStorage.getItem("convotools.activity.v1"))).toBeNull();
  await page.goto("/dashboard");
  if (testInfo.project.name==="mobile") await page.getByRole("button",{name:"Open navigation"}).click();
  await page.getByRole("button",{name:"Settings"}).click();
  const history=page.getByRole("switch",{name:/Save local activity/});
  await expect(history).toHaveAttribute("aria-checked","false");
  await page.getByRole("textbox",{name:/Display name/}).fill("Local user");
  await page.getByRole("button",{name:/Save profile/}).click();
  await page.getByRole("button",{name:/Clear all local workspace data/}).click();
  await expect(page.getByText(/Downloaded files on your device are not deleted/)).toBeVisible();
  await page.getByRole("button",{name:/Yes, clear workspace/}).click();
  const result=await page.evaluate(()=>{
    const keys=["convotools.activity.v1","convotools.favorites.v1","convotools.profile.v1","convotools.settings.v1"];
    return keys.map(k=>localStorage.getItem(k));
  });
  expect(result).toEqual([null,null,null,null]);
});
