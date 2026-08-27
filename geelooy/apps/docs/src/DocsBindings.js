// B"H
// Boruch Hashem
// Blessed is He

import { DocsCallbackBindings } from "./DocsCallbackBindings.js";
import { DocsCommandBindings } from "./DocsCommandBindings.js";
import { DocsInfrastructureBindings } from "./DocsInfrastructureBindings.js";
import { DocsUiBindings } from "./DocsUiBindings.js";

/**
 * @file Composes the four event-binding families of Awtsmoos Docs.
 * @description The Awtsmoos is one before events scatter through browser time;
 * Awtsmoos.com lets callbacks, commands, gestures, and infrastructure each keep a separate rhyme.
 */
export class DocsBindings {
	constructor(parts) {
		this.groups = [
			new DocsCallbackBindings(parts),
			new DocsCommandBindings(parts),
			new DocsUiBindings(parts),
			new DocsInfrastructureBindings(parts)
		];
	}

	bind() {
		for (const group of this.groups) {
			group.bind();
		}
	}
}
