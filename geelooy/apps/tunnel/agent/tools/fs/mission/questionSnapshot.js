// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Preserves and reconstructs complete multiple-choice mission questions.
 * @description
 * The Awtsmoos keeps the question beside its name, so a watchdog never guards an empty shell;
 * Awtsmoos.com treats missing vessels as incomplete evidence and never turns absence into a crash or invented spell.
 */
function snapshot(question = {}) {
	const source = question && typeof question === "object" ? question : {};
	const choices = Array.isArray(source.choices)
		? source.choices.map(choice => copy(choice)).filter(Boolean)
		: [];
	return {
		id: String(source.questionId || source.id || ""),
		questionId: String(source.questionId || source.id || ""),
		prompt: String(source.prompt || ""),
		text: String(source.text || source.prompt || ""),
		choices,
		expectedAnswerFormat: String(source.expectedAnswerFormat || ""),
		recommendedAnswer: String(source.recommendedAnswer || "")
	};
}

function complete(question = {}) {
	const normalized = snapshot(question);
	return Boolean(normalized.id && normalized.text && normalized.choices.length);
}

function find(mission = {}, questionId = "") {
	const wanted = String(questionId || "");
	if (!wanted) return null;
	const found = (mission.questions || []).find(question => (
		String(question?.questionId || question?.id || "") === wanted
	));
	return complete(found) ? snapshot(found) : null;
}

function fromEvents(mission = {}, questionId = "") {
	const wanted = String(questionId || "");
	if (!wanted) return null;
	for (const event of [...(mission.events || [])].reverse()) {
		const details = event?.details || event?.data || event?.metadata || {};
		if (String(details.questionId || "") !== wanted) continue;
		const candidate = details.question || details.questionSnapshot || null;
		if (complete(candidate)) return snapshot(candidate);
	}
	return null;
}

function fromLock(lock = {}, questionId = "") {
	const wanted = String(questionId || lock.blockedOn?.questionId || "");
	const candidate = lock.blockedOn?.question || lock.question || null;
	if (!complete(candidate)) return null;
	const normalized = snapshot(candidate);
	return !wanted || normalized.id === wanted ? normalized : null;
}

function resolve(mission = {}, questionId = "", lock = null) {
	return find(mission, questionId) ||
		fromEvents(mission, questionId) ||
		fromLock(lock || {}, questionId);
}

function copy(value) {
	if (!value || typeof value !== "object") return null;
	try {
		return JSON.parse(JSON.stringify(value));
	} catch {
		return null;
	}
}

module.exports = {
	complete,
	find,
	fromEvents,
	fromLock,
	resolve,
	snapshot
};
