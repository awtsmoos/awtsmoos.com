// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H — (3) Mission templates.
 * Reusable recipes: "translate a sefer", "repair a game", "audit a corpus".
 * Instantiate a template with params and a real tracked mission appears.
 * Custom templates can be registered per tunnel; built-ins ship in code.
 */

const Store = require("./store.js");
const Model = require("./model.js");

function fill(template, params) {
	return String(template).replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
		const value = key.split(".").reduce((obj, part) => (obj == null ? obj : obj[part]), params);
		return value == null ? "" : String(value);
	});
}

const BUILTINS = [
	{
		templateId: "translate-sefer",
		name: "Translate a sefer",
		description: "Translate a Hebrew work section by section, verifying every chunk against the source.",
		params: ["workTitle", "sourceRef", "targetLanguage"],
		build: p => ({
			title: `Translate ${p.workTitle || "sefer"}${p.sourceRef ? ` (${p.sourceRef})` : ""}`,
			goal: fill("Translate {{workTitle}} into {{targetLanguage}}. Work section by section from {{sourceRef}}. Every chunk must be verified against the live source bytes before it counts as done.", { targetLanguage: "English", ...p }),
			tags: ["translation", "sefer"],
			skillsRequired: ["translation", "hebrew"],
			checkpoints: [
				{ plainEnglish: "Source material located and chunked.", evidenceRequired: ["chunk-list"] },
				{ plainEnglish: "First section translated and verified against source bytes.", evidenceRequired: ["translation", "verification"] },
				{ plainEnglish: "Full work translated.", evidenceRequired: ["translation"] },
				{ plainEnglish: "Final verification pass complete — zero unverified chunks.", evidenceRequired: ["verification-report"] }
			]
		})
	},
	{
		templateId: "repair-game",
		name: "Repair a game",
		description: "Take a broken game from bug report to verified playable.",
		params: ["gameName", "bugReport"],
		build: p => ({
			title: `Repair ${p.gameName || "game"}`,
			goal: fill("Repair {{gameName}}. Bug report: {{bugReport}}. Reproduce first, fix second, verify with a real gameplay pass — never declare fixed without playing it.", p),
			tags: ["repair", "game"],
			skillsRequired: ["debugging", "gameplay-qa"],
			checkpoints: [
				{ plainEnglish: "Bug reproduced and root cause identified.", evidenceRequired: ["repro-steps", "root-cause"] },
				{ plainEnglish: "Fix implemented.", evidenceRequired: ["diff"] },
				{ plainEnglish: "Real gameplay verification pass — game is playable.", evidenceRequired: ["gameplay-evidence"] }
			]
		})
	},
	{
		templateId: "audit-corpus",
		name: "Audit a corpus",
		description: "Sweep a content corpus for defects and repair or requeue every one.",
		params: ["corpusName", "defectKind"],
		build: p => ({
			title: `Audit ${p.corpusName || "corpus"}`,
			goal: fill("Audit the {{corpusName}} corpus for {{defectKind}}. Check every unit, record every defect with evidence, repair what is repairable and requeue the rest.", { defectKind: "defects", ...p }),
			tags: ["audit", "corpus"],
			skillsRequired: ["qa", "content-review"],
			checkpoints: [
				{ plainEnglish: "Full sweep complete — every unit checked.", evidenceRequired: ["sweep-report"] },
				{ plainEnglish: "Every defect recorded with evidence.", evidenceRequired: ["defect-list"] },
				{ plainEnglish: "Repairs done or requeued — zero defects unaccounted.", evidenceRequired: ["resolution-report"] }
			]
		})
	},
	{
		templateId: "blank-mission",
		name: "Blank mission",
		description: "A plain mission with a title and a goal.",
		params: ["title", "goal"],
		build: p => ({
			title: p.title || "Untitled mission",
			goal: p.goal || "",
			tags: [],
			skillsRequired: [],
			checkpoints: []
		})
	}
];

function builtinList() {
	return BUILTINS.map(t => ({ templateId: t.templateId, name: t.name, description: t.description, params: t.params, builtin: true }));
}

async function list(config) {
	const custom = await Store.listCustomTemplates(config);
	return builtinList().concat(custom.map(t => ({ ...t, builtin: false })));
}

async function find(config, templateId) {
	const builtin = BUILTINS.find(t => t.templateId === templateId);
	if (builtin) return { ...builtin, builtin: true };
	const custom = await Store.loadTemplate(config, templateId);
	return custom ? { ...custom, builtin: false } : null;
}

async function register(config, payload = {}) {
	if (!payload.templateId || !payload.name) {
		const error = new Error("Custom template needs templateId and name.");
		error.code = "template_invalid";
		throw error;
	}
	const template = {
		templateId: Store.safe(payload.templateId),
		name: Model.cleanText(payload.name, 200),
		description: Model.cleanText(payload.description || ""),
		params: Array.isArray(payload.params) ? payload.params.map(String).slice(0, 30) : [],
		blueprint: {
			title: Model.cleanText(payload.title || payload.name, 300),
			goal: Model.cleanText(payload.goal || ""),
			tags: Model.cleanList(payload.tags),
			skillsRequired: Model.cleanList(payload.skillsRequired),
			checkpoints: (Array.isArray(payload.checkpoints) ? payload.checkpoints : []).map(c => ({ plainEnglish: Model.cleanText(c.plainEnglish || c, 500) })).slice(0, 50)
		},
		registeredBy: Model.cleanText(payload.actor || "unknown", 200),
		registeredAt: Model.stamp()
	};
	await Store.saveTemplate(config, template);
	return template;
}

/** Instantiate a template into a mission blueprint (caller persists via Service.create). */
async function instantiate(config, templateId, params = {}) {
	const template = await find(config, templateId);
	if (!template) {
		const error = new Error(`No template ${templateId}.`);
		error.code = "template_not_found";
		throw error;
	}
	let blueprint;
	if (template.builtin) {
		blueprint = BUILTINS.find(t => t.templateId === templateId).build(params || {});
	} else {
		const b = template.blueprint || {};
		blueprint = {
			title: fill(b.title || template.name, params),
			goal: fill(b.goal || "", params),
			tags: b.tags || [],
			skillsRequired: b.skillsRequired || [],
			checkpoints: (b.checkpoints || []).map(c => ({ plainEnglish: fill(c.plainEnglish, params) }))
		};
	}
	return { ...blueprint, templateId: template.templateId };
}

module.exports = { list, find, register, instantiate, builtinList };
