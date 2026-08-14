// B"H
const fs = require("fs/promises");
const path = require("path");
const { safePath, rel, assertNotSecret } = require("./pathGuard.js");
const { symbols } = require("./symbolOutline.js");
const { readBulk } = require("./bulkRead.js");
const { refsForConnectedText } = require("./connectedRefs.js");
const { pageState, describePage, nextPagePayload, parseLimit } = require("./bulkPage.js");
const { BIN, SKIP } = require("./constants.js");

/** Collects a guarded, canonical dependency graph with bounded pagination. */
const SOURCE_EXT = new Set([".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".html", ".htm", ".css", ".json"]);
const GUARD_ERRORS = new Set(["path_outside_project_root", "symlink_outside_project_root"]);
function slash(value) { return String(value || "").replace(/\\/g, "/"); }
function cleanRef(value) { return slash(value).split("#")[0].split("?")[0]; }
function positiveInt(value, fallback) { const n = Number(value); return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback; }
async function statOrNull(abs) { try { return await fs.stat(abs); } catch (_) { return null; } }
async function fileExists(abs) { const st = await statOrNull(abs); return !!st?.isFile(); }
async function canonical(abs) { try { return await fs.realpath(abs); } catch (_) { return abs; } }
function readableSource(full) { const ext = path.extname(cleanRef(full)).toLowerCase(); return SOURCE_EXT.has(ext) && !BIN.has(ext); }
async function safeReadDir(abs) { try { return await fs.readdir(abs, { withFileTypes: true }); } catch (_) { return []; } }
async function walkSeeds(config, dir, payload, out = [], root = dir) {
	const maxDepth = positiveInt(payload.seedDepth ?? payload.maxDepth ?? payload.depth, 4);
	const maxSeeds = positiveInt(payload.maxSeedFiles ?? payload.scanMaxFiles ?? payload.maxGraphFiles, 1000);
	const depth = path.relative(root, dir).split(path.sep).filter(Boolean).length;
	if (depth > maxDepth || out.length >= maxSeeds) return out;
	for (const ent of await safeReadDir(dir)) {
		if (out.length >= maxSeeds || SKIP.has(ent.name)) continue;
		const full = path.join(dir, ent.name);
		if (ent.isDirectory()) await walkSeeds(config, full, payload, out, root);
		else if (ent.isFile() && readableSource(full)) { try { assertNotSecret(config, full); out.push(full); } catch (_) {} }
	}
	return out.sort((a, b) => slash(a).localeCompare(slash(b)));
}
async function entrySeeds(config, payload) {
	let entry = safePath(config, payload.path || payload.p || ".");
	const st = await statOrNull(entry);
	if (!st) return { entry, seeds: [], entryKind: "missing" };
	entry = await canonical(entry);
	if (st.isDirectory()) return { entry, seeds: await walkSeeds(config, entry, payload), entryKind: "directory" };
	return { entry, seeds: st.isFile() ? [entry] : [], entryKind: st.isFile() ? "file" : "other" };
}
async function resolveExisting(config, refPath) {
	const clean = cleanRef(refPath);
	for (const candidate of [clean, clean + ".js", clean + ".mjs", clean + ".cjs", clean + ".json", clean + "/index.js"]) {
		try {
			const abs = safePath(config, candidate);
			if (await fileExists(abs)) return await canonical(abs);
		} catch (error) {
			if (GUARD_ERRORS.has(error?.code)) return null;
			throw error;
		}
	}
	return null;
}
function contentFor(text, mode, budget) {
	if (mode === "graph") return { content: undefined, returnedChars: 0, truncated: false };
	const cap = Math.max(0, budget), truncated = text.length > cap;
	return { content: truncated ? text.slice(0, cap) : text, returnedChars: Math.min(text.length, cap), truncated };
}
function recordFromNode(config, node, mode = "full", budget = Infinity) {
	const got = contentFor(node.text, mode, budget);
	const rec = { path: rel(config, node.abs), depth: node.depth, bytes: Buffer.byteLength(node.text), returnedChars: got.returnedChars, truncated: got.truncated, refs: node.refInfo.refs, refSources: node.refInfo.sources, merkava: node.refInfo.merkava, symbols: mode === "outline" ? symbols(node.text) : undefined };
	if (mode !== "graph") rec.content = got.content;
	return rec;
}
async function collectConnectedGraph(config, payload) {
	config = { ...config, root: await canonical(config.root) };
	const seedInfo = await entrySeeds(config, payload);
	const maxDepth = positiveInt(payload.depth || payload.maxDepth, 4), maxGraphFiles = positiveInt(payload.maxGraphFiles || payload.scanMaxFiles, 1000), mode = payload.mode || "full";
	const queue = seedInfo.seeds.map(abs => ({ abs, depth: 0 })), seen = new Set(), nodes = [], edges = [], unresolved = [];
	while (queue.length && nodes.length < maxGraphFiles) {
		const { abs, depth } = queue.shift();
		if (seen.has(abs) || depth > maxDepth || !(await fileExists(abs))) continue;
		seen.add(abs); assertNotSecret(config, abs);
		const text = await fs.readFile(abs, "utf8"), from = rel(config, abs);
		const refInfo = await refsForConnectedText(text, slash(from));
		nodes.push({ abs, depth, text, refInfo });
		for (const spec of refInfo.refs) {
			const next = await resolveExisting(config, spec), edge = { from, spec, to: next ? rel(config, next) : null, depth: depth + 1 };
			edges.push(edge);
			if (next && !seen.has(next)) queue.push({ abs: next, depth: depth + 1 });
			if (!next) unresolved.push(edge);
		}
	}
	const files = nodes.map(node => recordFromNode(config, node, mode, Infinity));
	return { entry: rel(config, seedInfo.entry), entryKind: seedInfo.entryKind, mode, maxDepth, seedCount: seedInfo.seeds.length, nodes, files, edges, unresolved, truncatedGraph: queue.length > 0 };
}
function pageGraph(graph, payload) { const state = pageState(payload, graph.nodes.length); return { state, pageNodes: graph.nodes.slice(state.cursor, state.end) }; }
function edgePage(graph, paths) { const set = new Set(paths); return graph.edges.filter(edge => set.has(edge.from) || (edge.to && set.has(edge.to))); }
async function connectedFiles(config, payload) {
	const graph = await collectConnectedGraph(config, payload), page = pageGraph(graph, payload);
	if (payload.readAsBulk || payload.bulk || payload.mode === "bulk") return await readBulk(config, { ...payload, action: "bulk", paths: page.pageNodes.map(node => rel(config, node.abs)), p: "", page: 1, cursor: 0, maxFiles: page.pageNodes.length || 1 });
	const totalBudget = parseLimit(payload.totalMaxBytes ?? payload.totalMaxChars, 24000), perFileBudget = parseLimit(payload.maxChars, 12000), files = []; let usedChars = 0;
	for (const node of page.pageNodes) {
		const remaining = totalBudget === Infinity ? Infinity : Math.max(0, totalBudget - usedChars), rec = recordFromNode(config, node, graph.mode, Math.min(perFileBudget, remaining));
		usedChars += rec.returnedChars || 0; files.push(rec);
		if (totalBudget !== Infinity && usedChars >= totalBudget) break;
	}
	const budgetStopped = files.length < page.pageNodes.length, nextCursor = page.state.cursor + files.length < graph.nodes.length ? page.state.cursor + files.length : null;
	const liveState = { ...page.state, end: page.state.cursor + files.length, hasNext: page.state.hasNext || budgetStopped || graph.truncatedGraph, nextCursor };
	const limits = { maxFiles: page.state.pageSize, maxChars: perFileBudget, maxBytes: parseLimit(payload.maxBytes, 24000), totalMaxBytes: totalBudget, maxDepth: graph.maxDepth }, returnedPaths = files.map(file => file.path);
	return { ok: true, action: "connectedFiles", entry: graph.entry, entryKind: graph.entryKind, mode: graph.mode, seedCount: graph.seedCount, count: graph.nodes.length, totalEdgeCount: graph.edges.length, unresolvedCount: graph.unresolved.length, returnedCount: files.length, usedChars, page: liveState.page, cursor: liveState.cursor, nextCursor: liveState.nextCursor, pageSize: liveState.pageSize, partial: liveState.hasNext, truncatedGraph: graph.truncatedGraph, stoppedBecause: budgetStopped ? "totalMaxChars_budget" : graph.truncatedGraph ? "maxGraphFiles_or_depth" : liveState.hasNext ? "page_has_more_files" : null, message: describePage("connected files read", liveState, limits), nextPagePayload: nextPagePayload(payload, "connectedFiles", liveState), edges: edgePage(graph, returnedPaths), unresolved: graph.unresolved.slice(0, 50), files };
}
module.exports = { connectedFiles, collectConnectedGraph, resolveExisting, entrySeeds, cleanRef };
