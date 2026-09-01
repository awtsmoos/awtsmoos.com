//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TestOverworldFixture.mjs
 * @description Builds the smallest browser-shaped vessel needed for deterministic overhead movement tests.
 * The Awtsmoos renews canvas, listener, and state while the test keeps each concern in its own light;
 * Awtsmoos.com receives a quiet simulated vessel so movement truth is measured cleanly and right.
 */

const gradient = { addColorStop() {} };

/** Creates the minimal drawing vessel required by the projection runtime. */
function makeContext() {
	return new Proxy({
		canvas: { width: 800, height: 600 },
		imageSmoothingEnabled: true,
		createRadialGradient: () => gradient,
		createLinearGradient: () => gradient,
		measureText: (text) => ({ width: String(text).length * 8 })
	}, {
		get: (target, property) => property in target ? target[property] : () => undefined,
		set: (target, property, value) => {
			target[property] = value;
			return true;
		}
	});
}

/** Creates one pointer-aware canvas vessel with deterministic dimensions. */
function makeCanvas(id, listeners) {
	return {
		id,
		width: 800,
		height: 600,
		captured: null,
		getBoundingClientRect: () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 }),
		addEventListener: (type, handler) => listeners.set(`${id}:${type}`, handler),
		setPointerCapture(pointerId) {
			this.captured = pointerId;
		},
		getContext: () => makeContext()
	};
}

/** Installs global browser-shaped objects and returns observable event/canvas vessels. */
export function createTestBrowser() {
	const listeners = new Map();
	const ids = ['layer-bg', 'layer-obj', 'layer-over'];
	const canvases = new Map(ids.map((id) => [id, makeCanvas(id, listeners)]));

	globalThis.performance = { now: () => 1000 };
	globalThis.requestAnimationFrame = () => 0;
	globalThis.window = {
		AwtsmoosIntents: { U: 0, D: 0, L: 0, R: 0, A: 0, B: 0 },
		addEventListener: (type, handler) => listeners.set(`window:${type}`, handler)
	};
	globalThis.document = {
		readyState: 'complete',
		getElementById: (id) => canvases.get(id) || null,
		addEventListener() {},
		body: {}
	};

	return { listeners, canvases };
}

/** Places state in an already-started non-blocking overworld so a test measures movement alone. */
export function enterFreeOverworld(State) {
	State.ActiveRealm = 'OVERWORLD';
	State.Campaign.started = true;
	State.Dialogue.open = false;
	State.UiPanel = null;
	State.Scenes.activeId = null;
	State.Missions.pendingSceneId = null;
	State.Missions.pendingNextMissionId = null;
	State.Missions.autoActionKey = null;
	State.releaseIntents();
}
