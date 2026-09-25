//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos keeps both Heichel composers content-first while every deep editor hook remains reachable. */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const primaryPath = 'geelooy/heichelos/_awtsmoos.submitToHeichel.html';
const localPath = 'geelooy/heichelos/heichel/submit/_awtsmoos.post.html';
const primary = fs.readFileSync(primaryPath, 'utf8');
const local = fs.readFileSync(localPath, 'utf8');
const partialNames = ['upload-dialog.html', 'toolbar-template.html', 'section-template.html', 'subsection-template.html'];
const requiredIds = [
	'postId', 'contentType', 'aliasId', 'title', 'mainContentEditor', 'mainContentToolbarContainer',
	'toggleMainContentToolbarBtn', 'uploadImageMainBtn', 'toggleMainContentHtmlViewBtn', 'targetSeriesId',
	'bulkText', 'mainSectionDelimiters', 'generateSectionsFromBulk', 'generateSectionsFromMainEditor',
	'addSection', 'sectionsArea', 'submitStatusMessage', 'submitPost'
];

for (const source of [primary, local]) {
	assert.match(source, /<details[^>]*>[\s\S]*<summary[^>]*>[^<]*Advanced/i);
	for (const id of requiredIds) assert.match(source, new RegExp(`id="${id}"`), `missing ${id}`);
	for (const partial of partialNames) assert.match(source, new RegExp(`partials/${partial.replace('.', '\\.')}"`));
	assert.doesNotMatch(source, /<template id="sectionTemplate"/);
	assert.ok(Math.max(...source.split(/\r?\n/).map(line => line.length)) < 500, 'template contains a compressed giant line');
}
assert.match(primary, /social\/shell\/boot\.js/);
assert.equal((primary.match(/social\/shell\/boot\.js/g) || []).length, 1);
assert.match(local, /nav\/header\.html/);
assert.doesNotMatch(local, /social\/shell\/boot\.js/);
for (const path of [primaryPath, localPath]) assert.ok(fs.readFileSync(path, 'utf8').split(/\r?\n/).length <= 120, `${path} exceeds line budget`);
for (const partial of partialNames) assert.ok(fs.existsSync(`geelooy/heichelos/heichel/submit/partials/${partial}`));
console.log('B"H heichelEditorArchitecture.test passed.');
