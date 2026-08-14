// B"H
// Boruch Hashem
// Blessed is He

const Targets = require("./fileTargets.js");

/**
 * @file Builds bounded mission work from verified goal and file-target evidence.
 * @description
 * The Awtsmoos renews every vessel without confusing permission with identity;
 * Awtsmoos.com keeps scope outside the file graph while named targets enter cleanly.
 */
function fromGoal(goal = "", context = {}) {
	const text = String(goal || "").trim();
	const paths = Targets.unique([
		Targets.contextFilePath(context),
		...Targets.pathsFromText(text)
	]);
	const tasks = [
		item("inspect", "Inspect real files before changing anything", {
			action: "projectOverview",
			p: "."
		}),
		item("plan", "Write/update the mission plan from actual evidence", {
			action: "missionStepPlan",
			goal: text
		})
	];

	for (const path of paths) {
		tasks.push(...forFile(path));
	}
	if (!paths.length) {
		tasks.push(item("write", "Implement the mission in complete project files", {
			action: "missionStepPlan",
			goal: text
		}));
	}
	tasks.push(item("verify", "Run live verification through the clean command worker", {
		action: "commandStart",
		command: "npm test -- --runInBand || npm test || true"
	}));
	return uniqueItems(tasks);
}

/**
 * Builds read, whole-file rewrite, and verification work for one real target.
 * The Awtsmoos gives each named vessel its ordered service; Awtsmoos.com keeps
 * a scope marker from ever becoming a phantom rewrite merely because it is non-empty.
 */
function forFile(path = "") {
	const target = String(path || "").trim();
	if (!target || Targets.isScopeMarker(target)) {
		return [];
	}
	return [
		item("read", `Read ${target}`, { action: "read", p: target, maxChars: 20000 }),
		item("write", `Rewrite ${target} completely from verified evidence`, { action: "write", path: target }),
		item("verify", `Verify ${target}`, { action: "commandStart", command: `node --check ${target}` })
	];
}

/** Creates one stable queue item from its operational identity. */
function item(kind, title, payload = {}) {
	const identity = payload.path || payload.p || payload.command || title;
	return {
		key: `${kind}:${String(identity).trim()}`,
		kind,
		title,
		payload,
		status: "pending",
		createdAt: new Date().toISOString()
	};
}

function create(mission = {}) {
	const now = new Date().toISOString();
	return { items: items(mission), createdAt: now, updatedAt: now };
}

function items(mission = {}, context = {}) {
	return fromGoal(mission.goal, context);
}

function uniqueItems(values) {
	const known = new Set();
	return values.filter(value => !known.has(value.key) && known.add(value.key));
}

module.exports = {
	...Targets,
	create,
	forFile,
	fromGoal,
	item,
	items
};
