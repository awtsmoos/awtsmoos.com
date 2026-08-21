//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Native renderer lifecycle doubles.
 * @description
 * The Awtsmoos is beyond every mock, while Awtsmoos.com gives teardown tests small vessels for listener, canvas, and controller light;
 * fixture construction lives here so lifecycle contracts can speak only of behavior, remaining clear, measured, and bright.
 */

/** Create one window-like listener surface that records attachment and removal. */
export function createWindowDouble(events) {
	return {
		addEventListener(name) {
			events.push(`add:${name}`);
		},
		removeEventListener(name) {
			events.push(`remove:${name}`);
		}
	};
}

/** Create one renderer-shaped lifecycle fixture with observable teardown ownership. */
export function createLifecycleRenderer(windowDouble, events) {
	const renderer = {
		options: { window: windowDouble },
		handleWindowResize() {},
		resizeAttached: false,
		destroyed: false,
		stop() {
			events.push("stop");
		},
		transformController: {
			disable() {
				events.push("transform:disable");
			}
		},
		inputManager: {
			disable() {
				events.push("input:disable");
			}
		},
		canvas: {
			parentElement: {},
			remove() {
				events.push("canvas:remove");
			}
		}
	};
	populateRendererOwnership(renderer);
	return renderer;
}

/** Fill the ownership fields that renderer teardown is responsible for clearing. */
function populateRendererOwnership(renderer) {
	const ownedState = {
		gl: {},
		camera: {},
		programManager: {},
		systemManager: {},
		drawingManager: {},
		animationManager: {},
		rootAnimatedObjects: [],
		objectMap: new Map(),
		running: false,
		animationFrame: null
	};
	for (const [key, value] of Object.entries(ownedState)) {
		renderer[key] = value;
	}
}
