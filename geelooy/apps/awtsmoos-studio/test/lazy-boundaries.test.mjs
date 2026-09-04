//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file lazy-boundaries.test.mjs
 * @description Proves common-path Studio code cannot silently reawaken professional, advanced-agent, or full-editor islands before their owning intent.
 * The Awtsmoos lets concealed power remain near without forcing every chamber into first light;
 * Awtsmoos.com tests the gates themselves, so lazy architecture is measured by imports and action families rather than names that merely sound right.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { StudioDeferredAgentGateway } from '../src/api/StudioDeferredAgentGateway.js';
import { getStudioLazyActionFamily } from '../src/loading/StudioLazyActionFamilies.js';
import { StudioLazyUiActions } from '../src/loading/StudioLazyUiActions.js';

const runtimeUrl = new URL('../src/loading/features/loadStudioRuntime.js', import.meta.url);
const lazyAgentUrl = new URL('../src/api/StudioLazyAgentApi.js', import.meta.url);

/** Creates the minimal store surface consumed by the lazy action coordinator. */
function createStore() {
	return {
		status: '',
		set(key, value) {
			if (key === 'status') {
				this.status = value;
			}
		}
	};
}

test('startup source has no static Pro Tools or advanced-gateway import', async () => {
	const runtimeSource = await readFile(runtimeUrl, 'utf8');
	const lazyAgentSource = await readFile(lazyAgentUrl, 'utf8');
	assert.doesNotMatch(runtimeSource, /installNesherProTools/);
	assert.doesNotMatch(lazyAgentSource, /StudioAdvancedAgentGateway/);
});

test('lazy action routing separates command, federation, and editor families', () => {
	assert.equal(getStudioLazyActionFamily('executeStudioCommand'), 'command');
	assert.equal(getStudioLazyActionFamily('selectMovieLayer'), 'federation');
	assert.equal(getStudioLazyActionFamily('updateTransformField'), 'editor');
});

test('first executeStudioCommand requests the command feature entry only', async () => {
	const originalDocument = globalThis.document;
	globalThis.document = { baseURI: 'http://awtsmoos.test/studio/' };
	try {
		const requested = [];
		const actions = new StudioLazyUiActions({}, {});
		actions.moduleCache.load = async (specifier) => {
			requested.push(specifier);
			return {
				createStudioFeatureActions() {
					return { executeStudioCommand() {} };
				}
			};
		};
		const element = { dataset: { commandType: 'create', commandValue: 'text' } };
		await actions.run('executeStudioCommand', {
			event: { type: 'click', currentTarget: element },
			element,
			store: createStore()
		});
		assert.deepEqual(requested, ['./src/loading/features/loadStudioCommandActions.js']);
	} finally {
		globalThis.document = originalDocument;
	}
});

test('advanced agent gateway imports only after an advanced call', async () => {
	const originalDocument = globalThis.document;
	globalThis.document = { baseURI: 'http://awtsmoos.test/studio/' };
	try {
		const requested = [];
		const gateway = new StudioDeferredAgentGateway({});
		gateway.moduleCache.load = async (specifier) => {
			requested.push(specifier);
			return {
				StudioAdvancedAgentGateway: class {
					peek() { return null; }
					call(method, ...args) { return { method, args }; }
				}
			};
		};
		assert.equal(gateway.peek(), null);
		assert.deepEqual(requested, []);
		assert.deepEqual(await gateway.call('exportMovie', { quality: 'draft' }), {
			method: 'exportMovie',
			args: [{ quality: 'draft' }]
		});
		assert.deepEqual(requested, ['./src/api/StudioAdvancedAgentGateway.js']);
	} finally {
		globalThis.document = originalDocument;
	}
});
