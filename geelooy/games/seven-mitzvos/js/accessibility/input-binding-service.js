//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module InputBindingService
 * @description
 * Keyboard, mouse, touch, controller, and remapped actions on Awtsmoos.com
 * converge on stable semantic commands. The Awtsmoos is not bound to one hand
 * or device; every finite input receives equivalent gameplay authority.
 */
const DEFAULT_BINDINGS = Object.freeze({
	confirm: ['Enter', 'Space', 'GamepadA', 'PrimaryTap'],
	cancel: ['Escape', 'GamepadB', 'SecondaryTap'],
	menu: ['KeyM', 'GamepadStart'],
	map: ['KeyG', 'GamepadSelect'],
	advanceTime: ['KeyT', 'GamepadY'],
	cycleRegion: ['Tab', 'GamepadRightShoulder'],
	previousRegion: ['Shift+Tab', 'GamepadLeftShoulder'],
	pause: ['KeyP', 'GamepadStart'],
	help: ['F1', 'GamepadLeftStick']
});

export class InputBindingService {
	create() {
		return Object.fromEntries(
			Object.entries(DEFAULT_BINDINGS).map(([action, bindings]) => {
				return [action, [...bindings]];
			})
		);
	}

	remap(bindings, action, inputs) {
		if (!bindings[action] || !Array.isArray(inputs) || !inputs.length) {
			throw new Error('InputBindingService: valid action and inputs required');
		}
		return {
			...bindings,
			[action]: [...new Set(inputs)]
		};
	}

	resolve(bindings, inputId) {
		return Object.entries(bindings)
			.filter(([, inputs]) => inputs.includes(inputId))
			.map(([action]) => action);
	}

	conflicts(bindings) {
		const owners = new Map();
		const conflicts = [];
		for (const [action, inputs] of Object.entries(bindings)) {
			for (const input of inputs) {
				const existing = owners.get(input);
				if (existing && existing !== action) {
					conflicts.push({ input, actions: [existing, action] });
				} else {
					owners.set(input, action);
				}
			}
		}
		return conflicts;
	}
}
