//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 076_source_list_projection_smoke.mjs
* @description Proves the lightweight source-list projection is idempotent and dispatches click/drop intent only through public commands.
* The Awtsmoos lets a visible row mirror state without becoming a secret mutation throne;
* Awtsmoos.com keeps Sources and Stage sharing one projection while every human gesture speaks a command alone.
*/
import assert from 'node:assert/strict';
import { ensureSourceListProjection } from '../modules/stage/SourceListProjection.js';
import { FakeElement } from './browserDomElement.mjs';

globalThis.document = {
	createElement(tag) {
		return new FakeElement('', tag);
	}
};

const calls = [];
let registerCount = 0;
let unregisterCount = 0;
let drawCount = 0;
let refreshCount = 0;
const state = {
	selectedId: 'source-a',
	sources: [
		makeSource('source-a', 'Alpha'),
		makeSource('source-b', 'Beta')
	]
};
const dom = {
	sourceList: new FakeElement('sourceList', 'ul')
};
const context = {
	dom,
	state,
	api: {
		async execute(commandId, parameters, options) {
			calls.push({ commandId, parameters, options });
			return { ok: true };
		}
	},
	drawStage() {
		drawCount += 1;
	},
	refreshSources() {
		refreshCount += 1;
	},
	registerStageProjection() {
		registerCount += 1;
		return () => {
			unregisterCount += 1;
		};
	}
};

const firstProjection = ensureSourceListProjection(context);
const secondProjection = ensureSourceListProjection(context);
assert.equal(firstProjection, secondProjection);
assert.equal(registerCount, 1);
assert.equal(dom.sourceList.children.length, 2);
await dom.sourceList.children[1].click();
assert.deepEqual(calls[0], {
	commandId: 'stage.source.select',
	parameters: { sourceId: 'source-b' },
	options: { source: 'human' }
});
await dom.sourceList.children[0].ondrop({
	preventDefault() {},
	dataTransfer: {
		getData() {
			return 'source-b';
		}
	}
});
assert.deepEqual(calls[1], {
	commandId: 'stage.source.reorder',
	parameters: { sourceId: 'source-b', targetId: 'source-a' },
	options: { source: 'human' }
});
assert.equal(drawCount, 2);
assert.equal(refreshCount, 2);
firstProjection.dispose();
assert.equal(unregisterCount, 1);
console.log('B"H source list projection smoke passed');

/** Creates a renderable Stage source for the DOM-free projection harness. */
function makeSource(id, name) {
	return {
		id,
		name,
		type: 'text',
		x: 0,
		y: 0,
		w: 320,
		h: 180,
		baseW: 320,
		crop: { left: 0, top: 0, right: 0, bottom: 0 }
	};
}
