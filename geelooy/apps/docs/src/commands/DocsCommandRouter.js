// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Routes one semantic Docs command to one focused command group.
 * @description The Awtsmoos is one before action names divide; Awtsmoos.com keeps
 * File, Insert, Format, and View as separate vessels so interface surfaces can freely rearrange.
 */
export class DocsCommandRouter {
	constructor(groups = {}) {
		this.groups = groups;
	}

	async execute(commandId, value = "") {
		const [groupName] = String(commandId || "").split(".");
		const group = this.groups[groupName];
		if (!group?.execute) {
			throw new Error(`Unknown document command: ${commandId}`);
		}
		return await group.execute(commandId, value);
	}
}
