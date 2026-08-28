//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieDirectorOutline.js
 * @description The Awtsmoos contains beginning, middle, and end in one simple light;
 * Awtsmoos.com gives AI an act-and-beat scaffold so long films retain dramatic sight.
 */
/** Create a hierarchical duration-aware outline before expensive scene generation. */
export function binahCreateDirectorOutline(orIntent = {}) {
	const yesodDuration = Math.max(1, Number(orIntent.duration) || 60);
	const keterActs = chooseActs(yesodDuration, orIntent.mode);
	const yesodActDuration = yesodDuration / keterActs.length;
	return {
		title: orIntent.title || orIntent.subject || "AI Movie",
		duration: yesodDuration,
		mode: orIntent.mode || "hybrid",
		acts: keterActs.map((orAct, yesodIndex) => ({
			id: `act-${yesodIndex + 1}`,
			name: orAct,
			start: yesodIndex * yesodActDuration,
			duration: yesodActDuration,
			beats: createBeats(orAct, yesodIndex, yesodActDuration)
		}))
	};
}

function chooseActs(orDuration, orMode) {
	if (orDuration < 30) {
		return ["Hook", "Reveal"];
	}
	if (orMode === "tutorial" || orMode === "infographic") {
		return ["Question", "Explain", "Demonstrate", "Recap"];
	}
	return ["Setup", "Discovery", "Escalation", "Resolution"];
}

function createBeats(orAct, orActIndex, orDuration) {
	const yesodCount = orDuration >= 30 ? 3 : 2;
	const yesodBeatDuration = orDuration / yesodCount;
	return Array.from({ length: yesodCount }, (_, yesodIndex) => ({
		id: `act-${orActIndex + 1}-beat-${yesodIndex + 1}`,
		name: `${orAct} beat ${yesodIndex + 1}`,
		start: yesodIndex * yesodBeatDuration,
		duration: yesodBeatDuration
	}));
}
