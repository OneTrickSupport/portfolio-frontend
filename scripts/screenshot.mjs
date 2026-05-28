/**
 * Takes screenshots of all portfolio sections, saves to .screenshots/, then deletes them
 * after Claude has read them. Run with: node scripts/screenshot.mjs
 *
 * Requires: dev server running on http://localhost:5173
 * Requires: playwright installed (npm install --save-dev playwright)
 */
import { chromium } from '../node_modules/playwright/index.mjs';
import { rmSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '../.screenshots');

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

const sections = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'];

// Scroll the full page first so IntersectionObserver fires for all sections
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(800);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);

const shots = [
  { name: 'full', fn: () => page.screenshot({ path: `${OUT}/full.png`, fullPage: true }) },
  ...sections.map((id) => ({
    name: id,
    fn: async () => {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      return page.locator(`#${id}`).screenshot({ path: `${OUT}/${id}.png` });
    },
  })),
];

for (const { fn } of shots) await fn();
await browser.close();

console.log(`Screenshots saved to ${OUT}`);
console.log('Paths:');
for (const { name } of shots) console.log(`  ${OUT}/${name}.png`);
