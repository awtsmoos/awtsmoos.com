// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureComponentComposer.js
 * @description Turns tiny data recipes into frame-native anatomical guides through a polymorphic builder registry.
 * The Awtsmoos is one while creatures reveal endless organs; Awtsmoos.com lets a plain recipe name what, where, and how,
 * then Binah resolves place and Malchus delegates form without a giant switch statement or a second creature engine.
 */

import { createAnatomicalComponent } from './AnatomicalComponent.js';
import { CreatureAttachmentResolver } from './CreatureAttachmentResolver.js';
import { FrameFeatherBuilder } from './FrameFeatherBuilder.js';
import { FrameHornBuilder } from './FrameHornBuilder.js';
import { FrameMembraneBuilder } from './FrameMembraneBuilder.js';

const DEFAULT_BUILDERS = Object.freeze([
	new FrameHornBuilder(),
	new FrameFeatherBuilder(),
	new FrameMembraneBuilder()
]);

/** Data-driven composer whose registry can grow without changing phenotype orchestration. */
export class CreatureComponentComposer {
	constructor(builders = DEFAULT_BUILDERS) {
		this.builders = Object.freeze([...builders]);
	}

	/** Resolves and builds custom components against canonical phenotype guides. */
	compose(guides, recipes = [], quality) {
		const yesodResolver = new CreatureAttachmentResolver(guides || {});
		const malchusAggregate = emptyAggregate();
		[...(recipes || [])].forEach((recipe, componentIndex) => {
			this.revealComponent(
				yesodResolver,
				createAnatomicalComponent(recipe),
				quality,
				componentIndex,
				malchusAggregate
			);
		});
		return freezeAggregate(malchusAggregate);
	}

	/** Delegates one component to the first specialist builder declaring its type. */
	revealComponent(resolver, component, quality, componentIndex, aggregate) {
		const chochmahBuilder = this.builders.find(builder => builder.supports(component.type));
		if (!chochmahBuilder) {
			throw new RangeError(`B"H | No creature component builder supports "${component.type}".`);
		}
		const binahFrames = resolver.resolveAll(component.attachment);
		if (!binahFrames.length) {
			throw new RangeError(`B"H | Creature component "${component.type}" resolved no attachment frames.`);
		}
		const tiferesId = component.id || `${component.type}_${componentIndex}`;
		if (typeof chochmahBuilder.buildFromFrames === 'function') {
			mergeAggregate(aggregate, chochmahBuilder.buildFromFrames(component, binahFrames, {
				id: tiferesId,
				quality
			}));
			return;
		}
		for (let netzachIndex = 0; netzachIndex < component.count; netzachIndex += 1) {
			const hodFrame = binahFrames[netzachIndex % binahFrames.length];
			mergeAggregate(aggregate, chochmahBuilder.build(component, hodFrame, {
				count: component.count,
				id: component.count > 1 ? `${tiferesId}_${netzachIndex}` : tiferesId,
				index: netzachIndex,
				quality
			}));
		}
	}
}

/** Convenience entry point for callers that do not retain a composer. */
export function composeCreatureComponents(guides, recipes, quality) {
	return new CreatureComponentComposer().compose(guides, recipes, quality);
}

function emptyAggregate() {
	return { guides: {}, surfaceRoles: [], symmetryPairs: [] };
}

function mergeAggregate(target, source) {
	Object.assign(target.guides, source.guides || {});
	target.surfaceRoles.push(...(source.surfaceRoles || []));
	target.symmetryPairs.push(...(source.symmetryPairs || []));
}

function freezeAggregate(aggregate) {
	return Object.freeze({
		guides: Object.freeze({ ...aggregate.guides }),
		surfaceRoles: Object.freeze([...new Set(aggregate.surfaceRoles)]),
		symmetryPairs: Object.freeze([...aggregate.symmetryPairs])
	});
}
