// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const HandoffPaths = require("../../mission/autoContinuation/handoffPaths.js");

/**
 * @file Proves living project and mission plans outrank a crowded legacy archive.
 * @description
 * The Awtsmoos reveals the nearest present spark before old echoes call from afar;
 * Awtsmoos.com keeps current plans in the successor's hand, a bright and guiding star.
 */
function main() {
	const originalAuthority = process.env.AWTSMOOS_PROJECT_ROOT;
	delete process.env.AWTSMOOS_PROJECT_ROOT;
	const authority = fs.mkdtempSync(path.join(os.tmpdir(), "awts-tier-precedence-"));
	try {
		const projectRoot = path.join(authority, "work", "awtsmoos.com");
		const projectPlan = path.join(projectRoot, "geelooy", "ai", "thoughts", "verification", "CURRENT_PLAN.md");
		const missionPlan = path.join(authority, ".awtsmoos-ai-thoughts", "mission-zero-handoff", "MISSION_PLAN.md");
		const legacyRoot = path.join(authority, ".awtsmoos-agent-thoughts", "legacy");
		fs.mkdirSync(path.dirname(projectPlan), { recursive: true });
		fs.mkdirSync(path.dirname(missionPlan), { recursive: true });
		fs.mkdirSync(legacyRoot, { recursive: true });
		fs.writeFileSync(projectPlan, "project");
		fs.writeFileSync(missionPlan, "mission");
		for (let index = 0; index < 20; index += 1) {
			fs.writeFileSync(path.join(legacyRoot, `LEGACY_${index}.md`), `legacy-${index}`);
		}
		const mission = {
			id: "mission-zero-handoff",
			goal: "zero handoff recovery",
			room: { id: "room-zero-handoff", projectRoot }
		};
		const paths = HandoffPaths.collect({ root: authority }, mission, { projectRoot });
		const canonicalProject = fs.realpathSync(projectPlan);
		const canonicalMission = fs.realpathSync(missionPlan);
		const firstLegacy = paths.findIndex(value => value.includes("LEGACY_"));
		assert.equal(paths.length, 12);
		assert.equal(paths[0], canonicalProject);
		assert.equal(paths.includes(canonicalMission), true);
		assert.equal(firstLegacy === -1 || paths.indexOf(canonicalMission) < firstLegacy, true);
		console.log(JSON.stringify({ ok: true, suite: "mission-planning-precedence", firstLegacy }));
	} finally {
		fs.rmSync(authority, { recursive: true, force: true });
		if (originalAuthority === undefined) {
			delete process.env.AWTSMOOS_PROJECT_ROOT;
		} else {
			process.env.AWTSMOOS_PROJECT_ROOT = originalAuthority;
		}
	}
}

main();
