// B"H
/**
 * Chapter 198: Social style contract. The interface is not allowed to collapse
 * back into one cramped stylesheet. Every major surface imports split vessels,
 * uses shared tokens, and keeps mobile-safe rules alive.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

function read(path) { return readFileSync(path, 'utf8'); }
function imports(path) { return [...read(path).matchAll(/@import\s+["']([^"']+)["']/g)].map(match => match[1]); }
function mustInclude(source, token, label) { assert.ok(source.includes(token), `${label} missing ${token}`); }

const tokenSource = read('geelooy/style/social-system/tokens.css');
for (const token of ['--g-bg', '--g-panel', '--g-gold-2', '--g-radius-3', '--g-touch', 'safe-area-inset-bottom']) mustInclude(tokenSource, token, 'tokens');

const entries = {
  node: 'geelooy/style/social-system/node-os/base.css',
  nodeCards: 'geelooy/style/social-system/node-os/cards.css',
  entity: 'geelooy/style/social-system/entity/base.css',
  entityCards: 'geelooy/style/social-system/entity/cards.css',
  comments: 'geelooy/style/social-system/comments.css',
  editor: 'geelooy/style/social-system/editor.css'
};

for (const [label, path] of Object.entries(entries)) assert.ok(imports(path).length >= (label.includes('Cards') ? 3 : 4), `${label} should import split CSS vessels`);

const nodeCss = readdirSync('geelooy/style/social-system/node-os/parts').map(file => read(`geelooy/style/social-system/node-os/parts/${file}`)).join('\n');
for (const token of ['.node-os-layout', '.node-breadcrumbs', '.node-child-arrow', '.node-detail-grid', '@media(max-width:820px)']) mustInclude(nodeCss, token, 'node css');

const entityCss = readdirSync('geelooy/style/social-system/entity/parts').map(file => read(`geelooy/style/social-system/entity/parts/${file}`)).join('\n');
for (const token of ['.entity-layout', '.entity-graph-row', '.entity-node-children', '@media(max-width:820px)']) mustInclude(entityCss, token, 'entity css');

const commentCss = readdirSync('geelooy/style/social-system/comments/parts').map(file => read(`geelooy/style/social-system/comments/parts/${file}`)).join('\n');
for (const token of ['.comment-section', '.comment-preview-grid', '.comment-replies', '@media(max-width:720px)']) mustInclude(commentCss, token, 'comment css');

const editorCss = readdirSync('geelooy/style/social-system/editor/parts').map(file => read(`geelooy/style/social-system/editor/parts/${file}`)).join('\n');
for (const token of ['.editor-actions', '.danger-btn', '.asset-strip', '@media(max-width:720px)']) mustInclude(editorCss, token, 'editor css');

const nodeApp = read('geelooy/node-os/app.js');
for (const token of ['node-os-layout', 'node-breadcrumbs', 'node-detail-grid', 'node-child-arrow']) mustInclude(nodeApp, token, 'node app');
const entityApp = read('geelooy/entity-view/app.js');
for (const token of ['entity-layout', 'entity-graph-row', 'Node OS', 'Entity DNA']) mustInclude(entityApp, token, 'entity app');

console.log('B"H socialStyleContract.test passed');
