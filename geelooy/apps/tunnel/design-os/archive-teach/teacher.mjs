//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Teacher mode — the AI as rebbe for design.
 * @description Not just "here is the design" but "here is WHY." The teacher
 * runs a design through the explainer and the Aleph-Beis letters, then speaks
 * plainly: what was decided, why each choice was made, and which principle
 * stands behind it — citing its sources, like any good shiur.
 *
 *   import { teach } from "./teacher.mjs";
 *   const lesson = teach(`body.fontSize = 16px\ntitle.fontSize = 4 * body.fontSize`);
 */

import { explain, whyValue, pathToWords } from "./explainer.mjs";
import { checkDesign, getLetter } from "../aleph-beis/index.mjs";
import { design } from "../constraints/index.mjs";

/**
 * Teach a design: full lesson with sections and citations.
 * @param {string} src Constraint DSL source.
 * @param {Object} opts {bundles, approvedBy, note}
 * @returns {{ok, errors, headline, sections, score}}
 */
export function teach(src, opts = {}) {
	const explained = explain(src, opts);
	if (!explained.ok) {
		return { ok: false, errors: explained.errors, headline: "", sections: [], score: null };
	}
	const letters = checkDesign(src);

	const sections = [];

	// 1. What was decided.
	const decisions = explained.explanations
		.filter((e) => e.path)
		.map((e) => `- **${e.path}** = ${e.value}`)
		.join("\n");
	sections.push({
		title: "What was decided",
		body:
			explained.headline +
			"\n\n" +
			decisions +
			"\n\nEvery one of these is traceable to a rule you declared. Nothing is an accident.",
		citations: [],
	});

	// 2. Why each choice.
	sections.push({
		title: "Why each choice was made",
		body: explained.explanations.map((e) => e.text).join("\n\n"),
		citations: (opts.bundles || []).map((b) => `Library bundle "${b}"`),
	});

	// 3. The letters behind it.
	if (letters.ok && letters.letters.length) {
		const applicable = letters.letters.filter((l) => l.applicable);
		const passing = applicable.filter((l) => l.pass);
		const failing = applicable.filter((l) => !l.pass);
		let body = "";
		if (passing.length) {
			body +=
				"This design keeps faith with " +
				passing.length +
				" of the letters:\n\n" +
				passing
					.map((l) => {
						const full = getLetter(l.key);
						return `- **${l.hebrew} ${l.name} — ${l.principle}**: ${full ? full.principleDetail : l.detail} _(sources: ${(full && full.sources ? full.sources : []).join(", ") || "tradition"})_`;
					})
					.join("\n");
		}
		if (failing.length) {
			body +=
				"\n\nAnd it breaks faith with " +
				failing.length +
				":\n\n" +
				failing.map((l) => `- **${l.hebrew} ${l.name} — ${l.principle}**: ${l.detail}`).join("\n") +
				"\n\nA rebbe does not flatter. Fix these.";
		}
		if (!applicable.length) {
			body =
				"None of the 22 letters could judge this design — it does not speak their language (no title, body, spacing, or color tokens). Add more of the design, and the letters will weigh in.";
		}
		sections.push({
			title: "The letters behind it",
			body,
			citations: passing.map((l) => `${l.hebrew} ${l.name}: ${(getLetter(l.key) || {}).sources || []}`.replace(/,$/, "")),
		});
	}

	// 4. How to judge it.
	const score = letters.ok ? letters.score : null;
	sections.push({
		title: "How to judge it",
		body: score
			? `The letters give this design ${score.passed} out of ${score.applicable} (${Math.round(score.ratio * 100)}%). ` +
			  (score.ratio === 1
					? "Whole. Every letter that could speak, spoke in its favor."
					: "Not whole yet. Read the failing letters above and return with corrections.")
			: "The design solved, but the letters could not score it. Judge it by the rules you declared.",
		citations: [],
	});

	return {
		ok: true,
		errors: [],
		headline: explained.headline,
		sections,
		score,
	};
}

/** Adjective → design property mapping for questions. */
const ADJECTIVE_MAP = {
	big: "fontSize",
	bigger: "fontSize",
	large: "fontSize",
	small: "fontSize",
	smaller: "fontSize",
	tiny: "fontSize",
	dark: "color",
	darker: "color",
	light: "color",
	lighter: "color",
	wide: "maxWidth",
	wider: "maxWidth",
	narrow: "maxWidth",
	tall: "lineHeight",
	short: "lineHeight",
	high: "lineHeight",
	low: "lineHeight",
	bold: "fontWeight",
	heavy: "fontWeight",
};

/** Noun → design element mapping for questions. */
const NOUN_HINTS = ["title", "body", "section", "heading", "footnote", "caption", "background", "button", "link", "hebrew", "english"];

/**
 * Answer a question about a design, in plain language.
 * @param {string} src Constraint DSL source.
 * @param {string} question e.g. "Why is the title so big?"
 * @returns {string} The teacher's answer.
 */
export function answerQuestion(src, question, opts = {}) {
	const q = question.toLowerCase();

	// 1. Specific: "Why is the title so big?" — noun + adjective.
	if (/why/.test(q)) {
		const noun = NOUN_HINTS.find((n) => q.includes(n));
		const adjective = Object.keys(ADJECTIVE_MAP).find((a) => new RegExp(`\\b${a}\\b`).test(q));
		if (noun && adjective) {
			return whyValue(src, `${noun}.${ADJECTIVE_MAP[adjective]}`, opts);
		}
		if (noun) {
			// "Why is the title like this?" — everything about the noun.
			const explained = explain(src, opts);
			if (!explained.ok) return `I cannot explain it: ${explained.errors[0] || "the design does not solve"}.`;
			const hits = explained.explanations.filter((e) => e.path && e.path.startsWith(noun + "."));
			if (hits.length) return hits.map((h) => h.text).join("\n\n");
			return `The design says nothing specific about the ${noun}. It may inherit from general rules.`;
		}
		// "Why is it beautiful?" / "Why is this good?" — the general answer.
		if (/\b(it|this|the design|that)\b/.test(q) || /beautiful|pretty|good|nice|awe/.test(q)) {
			const lesson = teach(src, opts);
			if (!lesson.ok) return `I cannot teach this design: ${lesson.errors[0] || "it does not solve"}.`;
			return (
				`It is beautiful because nothing in it is accidental.\n\n` +
				lesson.sections[1].body.split("\n\n").slice(0, 3).join("\n\n") +
				`\n\n${lesson.sections[2].body.split("\n\n")[0]}`
			);
		}
		const m = q.match(/why (?:is|are|does)\s+([\w.]+)/);
		if (m) return whyValue(src, m[1], opts);
	}

	// 2. Bare beauty question: "Is it beautiful?" / "Tell me about this design."
	if (/beautiful|pretty|good|nice|awe|tell me about|what do you think/.test(q)) {
		const lesson = teach(src, opts);
		if (!lesson.ok) return `I cannot teach this design: ${lesson.errors[0] || "it does not solve"}.`;
		return (
			`It is beautiful because nothing in it is accidental.\n\n` +
			lesson.sections[1].body.split("\n\n").slice(0, 3).join("\n\n") +
			`\n\n${lesson.sections[2].body.split("\n\n")[0]}`
		);
	}

	// 3. "What does X mean?" / "What is X?"
	const what = q.match(/what (?:does|is)\s+([\w.]+)/);
	if (what) {
		const target = what[1].replace(/^the /, "").replace(/ /g, ".");
		return whyValue(src, target, opts);
	}

	return (
		`Ask me "why" — for example: "Why is the title so big?" or "Why is the body dark?" ` +
		`Name the element (title, body, section) and what you notice about it, and I will trace it to the exact rule.`
	);
}

/** Render a full lesson as Markdown (a page of the sefer). */
export function lessonMarkdown(src, opts = {}) {
	const lesson = teach(src, opts);
	if (!lesson.ok) return `# Lesson\n\nThe design does not solve: ${lesson.errors.join("; ")}`;
	const lines = ["# A Lesson in This Design", "", `_${lesson.headline}_`, ""];
	for (const s of lesson.sections) {
		lines.push(`## ${s.title}`, "", s.body, "");
		if (s.citations.length) {
			lines.push("**Sources:** " + s.citations.filter(Boolean).join(" · "), "");
		}
	}
	return lines.join("\n");
}

/** One-line verdict, for quick checks. */
export function verdict(src, opts = {}) {
	const r = design(src);
	if (!r.ok) return `Not a design yet: ${r.errors[0] || "it does not solve"}.`;
	const letters = checkDesign(src);
	if (letters.ok && letters.score && letters.score.applicable > 0) {
		const pct = Math.round(letters.score.ratio * 100);
		return `Solves cleanly. The letters approve ${letters.score.passed}/${letters.score.applicable} (${pct}%).`;
	}
	return "Solves cleanly. The letters have nothing to judge — add more of the design.";
}
