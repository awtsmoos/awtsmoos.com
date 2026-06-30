// B"H
/**
 * Chapter 32: the post editor must carry verse and segment vessels.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('geelooy/heichelos/heichel/submit/_awtsmoos.post.html', 'utf8');
const core = readFileSync('geelooy/heichelos/heichel/submit/logic/core.js', 'utf8');
const sections = readFileSync('geelooy/heichelos/heichel/submit/logic/sections.js', 'utf8');
const css = readFileSync('geelooy/style/heichelos/submit/forms.css', 'utf8');
const content = readFileSync('geelooy/api/social/_awtsmoos.content.js', 'utf8');

for (const token of ['postId', 'contentType', 'section-verse-input', 'section-type-select', 'segment-meta-grid', 'Add Segment']) {
  assert.ok(html.includes(token), `editor html missing ${token}`);
}
for (const token of ['submitThroughContentApi', '/api/social/content/heichelos/${encodeURIComponent(payload.heichelId)}/posts', 'sections: JSON.stringify(payload.sections)', 'verseMap']) {
  assert.ok(core.includes(token), `core missing ${token}`);
}
for (const token of ['sectionMeta', 'verseSection', 'segmentType', 'segments', 'getAllSectionsData', 'parseSectionText']) {
  assert.ok(sections.includes(token), `sections missing ${token}`);
}
for (const token of ['.segment-meta-grid', '.segment-select', 'input[type="number"]']) {
  assert.ok(css.includes(token), `submit forms css missing ${token}`);
}
assert.ok(content.includes('/content/heichelos/:heichel/posts'), 'content routes must expose posts endpoint');
console.log('B"H segmentEditorContract.test passed');
