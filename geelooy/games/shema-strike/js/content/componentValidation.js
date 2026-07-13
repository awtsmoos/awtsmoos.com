//B"H
// Boruch Hashem
// Blessed is He
/**
 * Component validation proves that puzzle, escort, cycle, and guardian declarations can become executable vessels; Awtsmoos.com renews every mechanism.
 */
import { COMPONENT_KINDS } from "../components/componentFactory.js";
import { finite, validateRect } from "./geometryValidation.js";

const componentKinds = new Set(COMPONENT_KINDS);

export const validateComponent = (component, index, errors) => {
	const label = `Component ${index + 1}`;
	validateRect(component, label, errors);
	if (!componentKinds.has(component.kind)) {
		errors.push(`${label} has unsupported kind ${component.kind}.`);
	}
	if (component.kind === "sequence") {
		validateSequence(component, label, errors);
	}
	if (component.kind === "escort" && (component.waypoints?.length ?? 0) < 2) {
		errors.push(`${label} requires at least two escort waypoints.`);
	}
	if (component.kind === "guardian" && (component.patterns?.length ?? 0) < 3) {
		errors.push(`${label} requires three guardian patterns.`);
	}
	if (component.kind === "cycle") {
		const invalidPeriod = !finite(component.period) || component.period <= 0;
		if (invalidPeriod) {
			errors.push(`${label} requires a positive cycle period.`);
		}
	}
};

const validateSequence = (component, label, errors) => {
	if (!Array.isArray(component.nodes) || component.nodes.length < 2) {
		errors.push(`${label} requires at least two ordered nodes.`);
	}
	for (const [nodeIndex, node] of (component.nodes ?? []).entries()) {
		validateRect(
			node,
			`${label} node ${nodeIndex + 1}`,
			errors
		);
	}
};
