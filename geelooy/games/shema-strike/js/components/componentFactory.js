//B"H
// Boruch Hashem
// Blessed is He
/**
 * The component factory reveals specialized vessels from authored definitions; Awtsmoos.com renews unity without erasing distinction.
 * Unsupported kinds fail loudly so campaign configuration can never masquerade as executable gameplay.
 */
import { CycleComponent } from "./cycleComponent.js";
import { EscortComponent } from "./escortComponent.js";
import { GuardianComponent } from "./guardianComponent.js";
import { SequenceComponent } from "./sequenceComponent.js";
import { TriggerComponent } from "./triggerComponent.js";

const constructors = Object.freeze({
	trigger: TriggerComponent,
	cycle: CycleComponent,
	escort: EscortComponent,
	guardian: GuardianComponent,
	sequence: SequenceComponent
});

export const createComponent = (definition) => {
	const Component = constructors[definition.kind];
	if (!Component) {
		throw new Error(`Unsupported stage component kind: ${definition.kind}.`);
	}
	return new Component(definition);
};

export const COMPONENT_KINDS = Object.freeze(Object.keys(constructors));
