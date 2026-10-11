// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H — (11) Voice-to-mission.
 * A dictated idea becomes a tracked mission instantly: the transcript's
 * first line becomes the title, the rest becomes the goal, and the raw
 * transcript is kept verbatim so nothing the speaker said is lost.
 * (An optional audioRef keeps the pointer to the original recording.)
 */

const Model = require("./model.js");
const Service = require("./service.js");

function draftFromTranscript(transcript) {
	const text = Model.cleanText(transcript || "", 20000);
	const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
	const title = (lines[0] || "Dictated mission").replace(/^(mission|idea|todo|task)[:\s-]+/i, "").slice(0, 300) || "Dictated mission";
	const goal = lines.length > 1 ? lines.slice(1).join("\n") : text;
	return { title, goal, transcript: text };
}

async function dictate(config, payload = {}) {
	if (!payload.transcript) {
		const error = new Error("Voice intake needs transcript text.");
		error.code = "transcript_required";
		throw error;
	}
	const actor = payload.actor || "voice";
	const draft = draftFromTranscript(payload.transcript);
	const mission = await Service.create(config, {
		actor,
		projectRoot: payload.projectRoot || "general",
		title: payload.title || draft.title,
		goal: [draft.goal, payload.audioRef ? `\n\n[voice recording: ${payload.audioRef}]` : ""].join(""),
		tags: [...new Set(["voice", ...(payload.tags || [])])],
		skillsRequired: payload.skillsRequired || []
	});
	mission.notes.push(Model.note({ by: actor, text: `Dictated mission created from voice transcript (${draft.transcript.length} chars kept verbatim).` }));
	mission.voiceTranscript = draft.transcript;
	const Store = require("./store.js");
	await Store.saveMission(config, mission);
	await Store.activity(config, { kind: "voice_mission", missionId: mission.missionId, by: actor, title: mission.title });
	return mission;
}

module.exports = { dictate, draftFromTranscript };
