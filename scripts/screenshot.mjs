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

const shots = [
  { name: 'full',       fn: () => page.screenshot({ path: `${OUT}/full.png`, fullPage: true }) },
  { name: 'hero',       fn: () => page.locator('#hero').screenshot({ path: `${OUT}/hero.png` }) },
  { name: 'about',      fn: () => page.locator('#about').screenshot({ path: `${OUT}/about.png` }) },
  { name: 'skills',     fn: () => page.locator('#skills').screenshot({ path: `${OUT}/skills.png` }) },
  { name: 'projects',   fn: () => page.locator('#projects').screenshot({ path: `${OUT}/projects.png` }) },
  { name: 'experience', fn: () => page.locator('#experience').screenshot({ path: `${OUT}/experience.png` }) },
  { name: 'contact',    fn: () => page.locator('#contact').screenshot({ path: `${OUT}/contact.png` }) },
];

for (const { fn } of shots) await fn();
await browser.close();

console.log(`Screenshots saved to ${OUT}`);
console.log('Paths:');
for (const { name } of shots) console.log(`  ${OUT}/${name}.png`);
