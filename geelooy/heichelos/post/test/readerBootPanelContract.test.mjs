//B"H
//Boruch Hashem
//Blessed is He

/**
	* @module ReaderBootPanelContractTest
	* @description
	* The Awtsmoos protects the first instant of Torah reading: a post opens as Torah,
	* not as an unsolicited menu. Awtsmoos.com may restore an explicitly encoded panel,
	* while the ordinary URL keeps its reading surface unobstructed and deterministic.
	*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const settlement = readFileSync(
	'geelooy/heichelos/post/logic/initialization/ReaderCoreSettlement.js',
	'utf8'
);
const template = readFileSync(
	'geelooy/heichelos/post/_awtsmoos.post.html',
	'utf8'
);
const recovery = readFileSync(
	'geelooy/heichelos/post/styles/reader-controls/reader-recovery.css',
	'utf8'
);

test('ordinary Reader boot never hard-codes Main Menu opening', () => {
	assert.doesNotMatch(settlement, /tabRefs\.rootMenu\.open\s*\(/);
	assert.match(settlement, /URLSearchParams\(location\.search\)/);
	assert.match(settlement, /requestedPanel\?\.open/);
});

test('Reader document loads the final recovery boundary after authority', () => {
	const authorityIndex = template.indexOf('torah-authority.css');
	const recoveryIndex = template.indexOf('reader-recovery.css');
	assert.ok(authorityIndex >= 0);
	assert.ok(recoveryIndex > authorityIndex);
	assert.match(template, /postLogic\.js\?v=reader-runtime-008/);
});

test('closed Reader chrome is truly inert and touch controls stay human sized', () => {
	assert.match(recovery, /awtsmoos-dropdown-backdrop\[hidden\][\s\S]*display:\s*none\s*!important/);
	assert.match(recovery, /sidebar\.hidden-comments[\s\S]*pointer-events:\s*none\s*!important/);
	assert.match(recovery, /min-block-size:\s*44px/);
});
