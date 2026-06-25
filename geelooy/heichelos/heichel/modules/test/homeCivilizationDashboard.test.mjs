// B"H
/**
 * Static covenant for Phases 2-5 of the Awtsmoos Civilization frontend.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('geelooy/index.html', 'utf8');
const liveFeed = readFileSync('geelooy/scripts/awtsmoos/social/home/liveFeed.js', 'utf8');
const css = readFileSync('geelooy/style/social/home/civilization-dashboard.css', 'utf8');
const indexCss = readFileSync('geelooy/style/social/home/index.css', 'utf8');

for (const token of [
  'data-civilization-dashboard',
  'home-command-galaxy',
  'data-feed-mode="civilization"',
  'data-feed-mode="search"',
  'data-civilization-metrics',
  'data-object-inspector',
  'data-object-inspector-body'
]) {
  assert.ok(html.includes(token), `home dashboard missing ${token}`);
}

for (const token of [
  'getCivilizationState',
  'getCivilizationFeed',
  'getCivilizationEntityState',
  'searchSocial',
  'renderObjectCard',
  'inspectObject',
  'universal-object-card',
  'dataset.objectType',
  "seriesId || 'root'"
]) {
  assert.ok(liveFeed.includes(token), `live feed dashboard missing ${token}`);
}

for (const token of [
  '.awtsmoos-civilization-dashboard',
  '.home-command-galaxy',
  '.civilization-metrics',
  '.universal-object-card',
  '.civilization-object-inspector',
  '.object-inspector-section'
]) {
  assert.ok(css.includes(token), `civilization css missing ${token}`);
}

assert.ok(indexCss.includes('./civilization-dashboard.css'), 'home css entry must import civilization dashboard layer');
console.log('B"H homeCivilizationDashboard.test passed');
