// B"H

import { createRequire } from "node:module";
import fileSystem from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const { buildMissionActions } = require("../missionActions.js");
const params = value => ({ params: JSON.stringify(value) });

async function action(config, name, payload = {}) {
	const output = await buildMissionActions({
		config,
		payload: {
			action: name,
			...payload
		}
	})[name]();
	assert.equal(output.ok, true);
	assert.equal(output.action, name);
	return output;
}

async function main() {
	const base = await fileSystem.mkdtemp(path.join(os.tmpdir(), "loop-awdb-"));
	const root = path.join(base, "git", "project");
	await fileSystem.mkdir(root, { recursive: true });
	const metadataRoot = path.join(base, ".meta");
	const config = { root, metadataRoot };
	const previous = process.env.AWTSMOOS_MISSION_METADATA_AWDB;
	process.env.AWTSMOOS_MISSION_METADATA_AWDB = "1";

	try {
		const start = await action(config, "missionStart", params({
			goal: "loop metadata awdb",
			minimumInnovationWindowMs: 0
		}));
		const missionId = start.missionId;
		await action(config, "missionSelfImproveStart", params({
			missionId,
			minimumRuntimeMs: 0,
			minimumSelfImproveCycles: 1,
			minimumInnovations: 5,
			minimumNoveltyScore: 1,
			minimumMergeCourtPasses: 0
		}));
		await action(config, "missionSelfImprovePulse", params({
			missionId,
			proof: "metadata proof"
		}));
		await action(config, "missionRoomSummit", params({ missionId }));
		const status = await action(config, "missionMetadataStatus", params({
			projectRoot: root
		}));
		assert.equal(status.metadata.metadataRoot, metadataRoot);
		assert(status.metadata.files.some(file => file.endsWith(".awdb")));
		assert.equal(status.metadata.files.some(file => file.endsWith(".json")), false);
		console.log(JSON.stringify({
			ok: true,
			missionId,
			metadataRoot,
			files: status.metadata.files
		}, null, 2));
	} finally {
		if (previous === undefined) {
			delete process.env.AWTSMOOS_MISSION_METADATA_AWDB;
		} else {
			process.env.AWTSMOOS_MISSION_METADATA_AWDB = previous;
		}
	}
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});
