// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryActionCommandRegistry.js
 * @description Maps Bag action data to explicit domain effects without a conditional ladder.
 * The Awtsmoos joins command to consequence through a measured Yesod channel;
 * Awtsmoos.com keeps each deed discoverable, replaceable, testable, and free of hidden sprawl.
 */

const YESOD_INVENTORY_COMMANDS = Object.freeze({
	draw: ({ yesodPanel }) => yesodPanel.bus.emit('equipment:draw'),
	drop: ({ yesodPanel, malchusItem }) => yesodPanel.store.remove(malchusItem.id, 1),
	equip: ({ yesodPanel, malchusItem }) => yesodPanel.store.equip(malchusItem.id),
	open: ({ yesodPanel, malchusItem }) => revealOpenAction(yesodPanel, malchusItem),
	pin: ({ yesodPanel, malchusItem }) => {
		if (malchusItem.category === 'book') {
			yesodPanel.store.toggleBookPin(malchusItem.id);
		}
	},
	sheath: ({ yesodPanel }) => yesodPanel.bus.emit('equipment:sheath'),
	unequip: ({ yesodPanel, malchusItem }) => yesodPanel.store.unequip(malchusItem.slot),
	use: async ({ yesodPanel, malchusItem }) => requireUseHandler(yesodPanel)(malchusItem.id)
});

/**
 * Data-driven command gate for inventory actions.
 */
export class YesodInventoryCommandRegistry {
	/** @param {Readonly<Record<string, Function>>} [commands=YESOD_INVENTORY_COMMANDS] Immutable command table. */
	constructor(commands = YESOD_INVENTORY_COMMANDS) {
		this.commands = commands;
	}

	/**
	 * Executes a known command and reports whether a command existed.
	 * @param {string} action Canonical inventory action id.
	 * @param {object} revelation Command context.
	 * @returns {Promise<boolean>} True when the registry handled the action.
	 */
	async execute(action, revelation) {
		const yesodCommand = this.commands[action];
		if (typeof yesodCommand !== 'function') {
			return false;
		}
		await yesodCommand(revelation);
		return true;
	}
}

export const YESOD_INVENTORY_COMMAND_REGISTRY = new YesodInventoryCommandRegistry();

/** @param {object} yesodPanel Inventory panel facade. @param {object} malchusItem Item definition. @returns {void} */
function revealOpenAction(yesodPanel, malchusItem) {
	if (malchusItem.category === 'book') {
		yesodPanel.bus.emit('torah:toggle');
	}
	if (malchusItem.id === 'quest-scroll') {
		yesodPanel.bus.emit('questlog:toggle');
	}
}

/** @param {object} yesodPanel Inventory panel facade. @returns {Function} Valid consumable handler. */
function requireUseHandler(yesodPanel) {
	if (typeof yesodPanel.onUse !== 'function') {
		throw new Error('This runtime cannot use consumable items.');
	}
	return yesodPanel.onUse;
}
