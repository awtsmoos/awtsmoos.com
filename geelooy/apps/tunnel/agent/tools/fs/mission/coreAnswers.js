// B"H
// Boruch Hashem
// Blessed is He

const Actions = require("./answerActions.js");
const Questions = require("./questionSnapshot.js");

/**
 * @file Keeps mission answers bound to the exact durable question that asked them.
 * @description
 * The Awtsmoos does not let a vanished A–E gate be replaced by a convenient stranger;
 * Awtsmoos.com resolves the original question by identity while side effects travel through a focused changer.
 */
function createAnswers(env) {
	const actionEffects = Actions.create(env);

	function answerInputText(input = {}) {
		return env.StrictAnswer.answerInputText(input);
	}

	function parseAnswer(answer, question) {
		return env.StrictAnswer.parseAnswer(answer, question);
	}

	function ask(mission, answer = "", mode = "normal") {
		const question = env.question(mission, mode);
		const parsed = answer ? parseAnswer(answer, question) : null;
		const key = parsed ? env.AnswerLedger.idempotencyKey({}, mission, question.id, parsed) : "";
		mission.questions.push({ ...question, parsed, idempotencyKey: key });
		if (parsed?.choice && !env.AnswerLedger.duplicate(mission, question.id, key)) {
			env.AnswerLedger.record(mission, question, parsed, { idempotencyKey: key });
		}
		env.event(mission, "question", question.text, {
			questionId: question.id,
			question: Questions.snapshot(question),
			parsed,
			idempotencyKey: key
		});
		return { question, parsed };
	}

	function answer(mission, input = {}) {
		const requestedId = env.AnswerLedger.questionId(input, {});
		const question = requestedId
			? Questions.resolve(mission, requestedId)
			: env.question(mission);
		if (requestedId && !question) return missingQuestion(mission, requestedId);
		const normalized = question || env.question(mission);
		normalized.id = normalized.id || normalized.questionId;
		const parsed = parseAnswer(answerInputText(input), normalized);
		const key = env.AnswerLedger.idempotencyKey(input, mission, normalized.id, parsed);
		const existing = env.AnswerLedger.duplicate(mission, normalized.id, key);
		if (existing) return duplicateAnswer(mission, parsed, key, existing, normalized.id);
		mission.questions.push({ ...normalized, parsed, idempotencyKey: key });
		const applied = actionEffects.apply(mission, parsed);
		if (parsed.choice && applied.applied) {
			env.AnswerLedger.record(mission, normalized, parsed, { ...input, idempotencyKey: key });
		}
		return finishAnswer(mission, parsed, applied, normalized.id, key);
	}

	function missingQuestion(mission, questionId) {
		const applied = {
			applied: false,
			error: "question_payload_missing",
			questionId,
			didNotApplySideEffects: true
		};
		const next = { action: "missionGet", missionId: mission.id, reason: "question_payload_missing" };
		env.event(mission, "answer_rejected", "question payload missing", { questionId, applied, next });
		return { error: "question_payload_missing", questionId, applied, next, mustCallNext: next };
	}

	function duplicateAnswer(mission, parsed, key, existing, questionId) {
		const applied = env.AnswerLedger.duplicatePayload(existing);
		const next = env.nextStep(mission, { autoAdvance: mission.automation.enabled });
		env.event(mission, "answer_duplicate", parsed.raw, { parsed, applied, next, questionId, idempotencyKey: key });
		return { parsed, applied, next };
	}

	function finishAnswer(mission, parsed, applied, questionId, key) {
		const next = env.nextStep(mission, { autoAdvance: mission.automation.enabled });
		env.event(mission, parsed.choice && applied.applied ? "answer" : "answer_rejected", parsed.raw, {
			parsed, applied, next, questionId, idempotencyKey: key
		});
		return { parsed, applied, next };
	}

	return {
		answer,
		answerInputText,
		applyChoice: actionEffects.apply,
		ask,
		parseAnswer
	};
}

module.exports = { createAnswers };
