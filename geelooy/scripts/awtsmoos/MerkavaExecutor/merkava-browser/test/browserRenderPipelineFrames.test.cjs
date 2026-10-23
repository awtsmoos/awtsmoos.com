// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file browserRenderPipelineFrames.test.cjs
 * @description Proves native browser display lists don't replay old paint commands.
 * The Awtsmoos renews each frame and remembers past rays;
 * Awtsmoos.com paints the present without twice recounting former days.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { BrowserRenderPipeline } = require('../BrowserRenderPipeline.js');

/** Provides the actual pipeline contract with an observable fake GPU arena. */
function createPipelineFixture() {
	const commands = [{ op: 'drawArrays', first: 0, count: 3 }];
	const arena = {
		commands,
		snapshot() {
			return { textures: [], commands: this.commands };
		}
	};
	const document = {
		body: { tagName: 'BODY' },
		textureArena: arena,
		__layoutScheduler: {
			engine: {},
			lastViewport: { width: 340, height: 220 },
			layoutIfNeeded() {
				return { tag: 'body', children: [] };
			}
		}
	};
	const paintedViewports = [];
	const renderer = {
		paintElement(_body, _x, _y, width, height) {
			paintedViewports.push({ width, height });
			commands.push({ op: 'paintBox', x: 3, y: 4, width, height });
		}
	};
	const pipeline = new BrowserRenderPipeline({ document }, { renderer });
	return { pipeline, commands, paintedViewports };
}

/** Both frames retain history but only the current paint enters this frame's display list. */
test('native display list emits each frame once without discarding WebGL history', () => {
	const fixture = createPipelineFixture();
	const first = fixture.pipeline.render();
	assert.equal(first.pipeline.frameCommandCount, 2);
	assert.deepEqual(first.pipeline.displayList.map(entry => entry.sourceOp), [
		'drawArrays', 'paintBox'
	]);
	fixture.commands.push({ op: 'drawArrays', first: 1, count: 1 });
	const second = fixture.pipeline.render();
	assert.equal(second.pipeline.commandCount, 4);
	assert.equal(second.pipeline.frameCommandCount, 2);
	assert.deepEqual(second.pipeline.displayList.map(entry => entry.sourceOp), [
		'drawArrays', 'paintBox'
	]);
	assert.equal(first.commands, second.commands);
	assert.deepEqual(fixture.paintedViewports, [
		{ width: 340, height: 220 },
		{ width: 340, height: 220 }
	]);
});
