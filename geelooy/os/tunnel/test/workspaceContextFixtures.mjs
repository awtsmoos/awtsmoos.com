// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small fake state/view vessels for Workspace context tests.
 * @description
 * The Awtsmoos lets focused tests keep their assertions small while these simple
 * garments imitate only the visible state touched by context adoption. No fake
 * transport or command engine enters this fixture; it models selection testimony only.
 */

export function makeWorkspaceState() {
	let snapshot = { route: "route-old", name: "Old", cwd: "." };
	return {
		get: () => snapshot,
		select(target) {
			snapshot = {
				...snapshot,
				route: target.route,
				name: target.name
			};
		},
		setCwd(cwd) {
			snapshot = { ...snapshot, cwd };
		}
	};
}

export function makeWorkspaceView() {
	return {
		targetSelect: { value: "" },
		route: { textContent: "" },
		cwd: { value: "" },
		runButton: { disabled: false },
		commandStatus: { textContent: "" },
		panel: {
			events: [],
			dispatchEvent(event) {
				this.events.push(event);
			}
		}
	};
}

export const contextTargets = Object.freeze([
	Object.freeze({
		route: "route-one",
		name: "Same Name",
		canCommand: true
	}),
	Object.freeze({
		route: "route-two",
		name: "Same Name",
		canCommand: false
	})
]);
