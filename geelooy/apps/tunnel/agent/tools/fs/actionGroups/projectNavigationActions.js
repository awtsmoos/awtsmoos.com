//B"H
// Boruch Hashem
// Blessed is He

const Compiler = require("../contextCompiler/compiler.js");
const Search = require("../contextCompiler/search.js");
const Snapshot = require("../virtualOsProject/snapshot.js");
const Views = require("../virtualOsProject/views.js");

/**
 * @file Exposes real Project/Work/Agent/Knowledge navigation as read-only graph projections.
 * @description The Awtsmoos leaves raw folders and RAG files fully direct while Awtsmoos.com
 * offers meaningful Project views, Context, and Why lenses over the same authoritative stores.
 */
function buildProjectNavigationActions(context) {
	const { config, payload = {} } = context;
	async function snapshot() {
		return Snapshot.build(config, payload);
	}
	async function overview() {
		return { ok: true, view: "Projects", ...(Views.overview(await snapshot())) };
	}
	return {
		async virtualOsProjectOverview() {
			return overview();
		},
		async projectWorkView() {
			return { ok: true, view: "Work", items: (await snapshot()).work };
		},
		async projectAgentsView() {
			return { ok: true, view: "Agents", items: (await snapshot()).agents };
		},
		async projectKnowledgeView() {
			return { ok: true, view: "Knowledge", items: (await snapshot()).knowledge };
		},
		async projectDecisionsView() {
			const data = await snapshot();
			return { ok: true, view: "Decisions", items: Views.byKind(data, "decision") };
		},
		async projectFailuresView() {
			const data = await snapshot();
			return { ok: true, view: "Failures", items: Views.byKind(data, "failure") };
		},
		async projectObligationsView() {
			return { ok: true, view: "Obligations", items: (await snapshot()).obligations };
		},
		async projectContinuationView() {
			return { ok: true, view: "Continuations", items: (await snapshot()).continuations };
		},
		async projectHistoryView() {
			return { ok: true, view: "History", items: (await snapshot()).events };
		},
		async projectSmartView() {
			const data = await snapshot();
			return {
				ok: true,
				view: payload.view || payload.name || "unfinished",
				items: Views.smart(data, payload.view || payload.name)
			};
		},
		async projectContextView() {
			return Compiler.compile(config, {
				...payload,
				query: payload.query || payload.goal || "current project work decisions failures obligations",
				includeGraph: true
			});
		},
		async projectWhy() {
			return Search.search(config, {
				...payload,
				query: payload.query || payload.text || payload.path || payload.workId || "why",
				includeGraph: true,
				limit: payload.limit || 25
			});
		}
	};
}

module.exports = { buildProjectNavigationActions };
