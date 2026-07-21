// B"H
// Boruch Hashem
// Blessed is He
/** An action gathers property channels without binding them to one renderer. */

import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";
import { createStableId } from "../foundation/artifacts/createStableId.js";
import { createKeyframe } from "./createKeyframe.js";

function normalizeChannel(input) {
	if (!input || typeof input !== "object") throw new TypeError("Action channel must be an object.");
	if (!input.propertyReference || typeof input.propertyReference !== "object") {
		throw new TypeError("Action channel requires a propertyReference.");
	}
	const keyframes = Object.freeze((input.keyframes ?? []).map(createKeyframe).sort((a, b) => a.time - b.time));
	if (!keyframes.length) throw new Error("Action channel requires keyframes.");
	return Object.freeze({
		id: input.id ?? createStableId("animation.channel", input.propertyReference),
		propertyReference: cloneManifestMetadata(input.propertyReference),
		keyframes,
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
}

export function createAction(input = {}) {
	const channels = Object.freeze((input.channels ?? []).map(normalizeChannel));
	return Object.freeze({
		schema: "awtsmoos.animation-action",
		id: input.id ?? createStableId("animation.action", channels),
		name: typeof input.name === "string" ? input.name : "Action",
		channels,
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
}
