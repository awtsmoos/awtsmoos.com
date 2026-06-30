import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const nav = readFileSync(new URL('../modules/app/navigationBindings.js', import.meta.url), 'utf8');
const timeline = readFileSync(new URL('../modules/nle/timelineMarkup.js', import.meta.url), 'utf8');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
const lines = css.trimEnd().split('\n');

assertTokens(requiredTokens(), css, 'required style token');
assertTokens(compactHomeTokens(), css + html + nav, 'compact dashboard token');
assertTokens(nlePageTokens(), css + html + nav, 'NLE page token');
assertTokens(timelineClasses(), css + timeline, 'timeline class');
assertTokens(operationalSelectors(), css, 'operational selector');
assertIdsExist(selectorIds(css), ids, 'CSS');
assertDomMapsExist(ids);
assertCompactDesktopContract(css, html, nav);
assertMaintainableCss(lines, css);

console.log(`B"H NLE page style contract passed: ${lines.length} readable lines`);

function assertTokens(tokens, source, label) {
  for (const token of tokens) assert.ok(source.includes(token), `${label}: ${token}`);
}

function requiredTokens() {
  return [
    ':root', '--nesher-bg', 'backdrop-filter', '.hero', '.studio-grid', '.stage-wrap', '#stage',
    '.stream-health', '.record-controls', '.source-toolbar', '.nle-panel', '.visualizer-panel',
    ':focus-visible', '[hidden]', '@media (max-width: 1320px)', '@media (max-width: 1080px)',
    '@media (max-width: 900px)', '@media (max-width: 720px)',
    '@media (prefers-reduced-motion: reduce)'
  ];
}

function compactHomeTokens() {
  return [
    'id="homeSection"', 'id="studioPage"', 'class="studio-home"', 'class="home-tile',
    'id="studioSettings"', '<details id="sourcesSection"', '<details id="streamSection"',
    '.studio-drawer', '.home-tile', '.nav-rail'
  ];
}

function nlePageTokens() {
  return [
    'class="nle-page nle-panel"', 'id="backToStudio"', 'data-page-target="nle"',
    'Dedicated NLE page', '.nle-page', '.page-kicker', '#backToStudio', 'showPage',
    'pages.studio.hidden', 'pages.nle.hidden', 'openInitialHash'
  ];
}

function timelineClasses() {
  return [
    '.timeline-real', '.timeline-ruler', '.timeline-markers', '.timeline-lane', '.timeline-track',
    '.clip', '.clip.active', '.clip.muted', '.clip.disabled', '.clip.faded', '.marker', '.playhead'
  ];
}

function operationalSelectors() {
  return [
    '.record-controls button:first-child', '#fmp4StreamButton', '#recordPhase', '#recordErrors',
    '#recordNote', '#streamState', '#streamErrors', '#providerNote', '#addMonitor', '#addDisplayAudio',
    '#addMic', '#addAudioVisualizer', '.visualizer-panel[hidden]', '#visualizerCustomJs', '#nleExport',
    '#nleSelectionSummary', '#encodingBenchmarkOutput', '#removeSource', '#rippleDeleteClip'
  ];
}

function selectorIds(source) {
  const found = [];
  for (const match of source.matchAll(/(?:^|})\s*([^{}]+)\{/g)) {
    for (const id of match[1].matchAll(/#([A-Za-z][\w-]*)/g)) found.push(id[1]);
  }
  return found;
}

function assertDomMapsExist(htmlIds) {
  const domDir = new URL('../modules/dom/', import.meta.url);
  for (const file of readdirSync(domDir).filter(name => name.endsWith('.js'))) {
    const source = readFileSync(new URL(file, domDir), 'utf8');
    const mapped = [...source.matchAll(/'([A-Za-z][\w-]*)'/g)].map(match => match[1]);
    assertIdsExist(mapped, htmlIds, `modules/dom/${file}`);
  }
}

function assertIdsExist(found, htmlIds, label) {
  for (const id of found) assert.ok(htmlIds.has(id), `${label} references missing id #${id}`);
}

function assertCompactDesktopContract(source, markup, navSource) {
  assert.ok(source.includes('button {\n  width: auto;'), 'desktop buttons must not be globally full-width');
  assert.ok(source.includes('@media (max-width: 1080px)'), 'desktop collapse must wait until 1080px');
  assert.ok(source.includes('grid-template-columns: repeat(6'), 'home grid starts as a real desktop grid');
  assert.ok(markup.includes('<section id="nleSection" class="nle-page nle-panel"'), 'NLE must be its own page');
  assert.ok(markup.includes('hidden>'), 'NLE page must start hidden from the studio scroll');
  assert.ok(navSource.includes('pages.nle.hidden = page !=='), 'nav must switch NLE page visibility');
}

function assertMaintainableCss(cssLines, source) {
  const maxLine = Math.max(...cssLines.map(line => line.length));
  assert.ok(cssLines.length > 380, `CSS is too thin for compact studio contract: ${cssLines.length}`);
  assert.ok(cssLines.length < 1250, `CSS is too sprawling: ${cssLines.length}`);
  assert.ok(maxLine < 155, `CSS contains an unreadable line: ${maxLine}`);
  assert.ok((source.match(/\{/g) || []).length > 95, 'CSS needs many readable rule blocks');
  assert.ok(!source.includes('fallback recorder token'), 'Style contract contains banned recorder text');
}
