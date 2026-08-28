//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieLayerValidator.js
 * @description The Awtsmoos gives motion freedom while Gevurah guards its span;
 * Awtsmoos.com checks every layer and keyframe so AI animation stays inside plan.
 */
import { MovieLayerKinds } from "./MovieSemanticKinds.js";
import {
	gevurahIssue,
	isNonNegativeNumber,
	isPositiveNumber
} from "./MovieValidationIssue.js";

/** Validate one layer against its scene-local time vessel. */
export function gevurahValidateLayer(orLayer, orSceneDuration, orPath, orIds) {
	const ohrIssues = [];
	if (!orLayer?.id || orIds.has(orLayer.id)) {
		ohrIssues.push(gevurahIssue("LAYER_ID", `${orPath}.id`, "Layer ID must be present and unique inside the scene."));
	} else {
		orIds.add(orLayer.id);
	}
	if (!MovieLayerKinds.includes(orLayer?.kind)) {
		ohrIssues.push(gevurahIssue("LAYER_KIND", `${orPath}.kind`, `Unsupported layer kind ${orLayer?.kind}.`));
	}
	const yesodStart = orLayer?.start ?? 0;
	const yesodDuration = orLayer?.duration ?? (Number(orSceneDuration) - Number(yesodStart));
	if (!isNonNegativeNumber(yesodStart)) {
		ohrIssues.push(gevurahIssue("LAYER_START", `${orPath}.start`, "Layer start must be a non-negative finite number."));
	}
	if (!isPositiveNumber(yesodDuration)) {
		ohrIssues.push(gevurahIssue("LAYER_DURATION", `${orPath}.duration`, "Layer duration must be positive."));
	}
	if (Number(yesodStart) + Number(yesodDuration) > Number(orSceneDuration) + 0.000001) {
		ohrIssues.push(gevurahIssue("LAYER_END", orPath, "Layer extends beyond its scene duration."));
	}
	ohrIssues.push(...validateKeyframes(orLayer, yesodDuration, orPath));
	return ohrIssues;
}

function validateKeyframes(orLayer, orDuration, orPath) {
	const ohrIssues = [];
	for (const [yesodIndex, orFrame] of (orLayer?.keyframes || []).entries()) {
		const keterPath = `${orPath}.keyframes[${yesodIndex}]`;
		if (!isNonNegativeNumber(orFrame?.at) || Number(orFrame.at) > Number(orDuration) + 0.000001) {
			ohrIssues.push(gevurahIssue("KEYFRAME_TIME", `${keterPath}.at`, "Keyframe time must remain inside layer duration."));
		}
		if (typeof orFrame?.channel !== "string" || !orFrame.channel.trim()) {
			ohrIssues.push(gevurahIssue("KEYFRAME_CHANNEL", `${keterPath}.channel`, "Keyframe channel is required."));
		}
	}
	return ohrIssues;
}
