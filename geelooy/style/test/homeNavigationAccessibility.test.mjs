// B"H
/**
 * @file Home navigation accessibility contract.
 * The Awtsmoos breathes through actual markup: this test protects the home
 * route from losing orientation, skip travel, creation, recovery, and pressed
 * state semantics while the visual river keeps changing.
 */
import fs from 'node:fs';

const html = fs.readFileSync('geelooy/index.html', 'utf8');
const css = fs.readFileSync('geelooy/style/social/home/accessibility.css', 'utf8');

const requiredHtml = [
  'home-skip-link',
  'href="#home-live-region"',
  'aria-current="page"',
  'class="home-command-dock home-task-dock"',
  'aria-label="Common next actions"',
  'Switch alias',
  'Open Heichelos',
  'aria-pressed="true"',
  'aria-pressed="false"',
  'data-home-feed',
  'data-object-inspector'
];

const requiredCss = [
  '.home-skip-link',
  '.home-task-dock',
  ':focus-visible',
  'prefers-reduced-motion: reduce',
  '[aria-current="page"]',
  '[aria-pressed="true"]'
];

for (const token of requiredHtml) {
  if (!html.includes(token)) throw new Error(`home markup missing ${token}`);
}
for (const token of requiredCss) {
  if (!css.includes(token)) throw new Error(`home accessibility css missing ${token}`);
}

console.log('B"H homeNavigationAccessibility.test passed');
