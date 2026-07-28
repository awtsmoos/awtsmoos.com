// B"H

import { createRequire } from "node:module";
import fileSystem from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const MetadataStore = require("../../mission/metadataStore.js");

async function main() {
	const base = await fileSystem.mkdtemp(path.join(os.tmpdir(), "mission-meta-migrate-"));
	const root = path.join(base, "project");
	const metadataRoot = path.join(base, "metadata");
	const config = { root, metadataRoot };
	const mission = {
		id: "mission_legacy",
		goal: "Keep legacy agents visible",
		room: {
			id: "room_legacy",
			name: "Legacy Room",
			projectRoot: root,
			agents: {
				agent_one: { status: "working" },
				agent_two: { status: "ready" }
			},
			messages: [{ text: "Still here." }],
			subMissions: [],
			interrupts: []
		}
	};
	const previous = process.env.AWTSMOOS_MISSION_METADATA_AWDB;
	await fileSystem.mkdir(root, { recursive: true });
	process.env.AWTSMOOS_MISSION_METADATA_AWDB = "1";

	try {
		assert.equal(MetadataStore.upsertRoom(config, mission).ok, true);
		assert.equal(MetadataStore.record(config, mission, "room_message", {
			agentId: "agent_one",
			text: "Legacy message"
		}).ok, true);
		MetadataStore.closeAllDatabases();
		delete process.env.AWTSMOOS_MISSION_METADATA_AWDB;

		const rooms = MetadataStore.activeRooms(config);
		const records = MetadataStore.listRecords(config, { roomId: "room_legacy" });
		assert.equal(rooms.backend, "atomic-room-documents-migrated");
		assert.equal(records.backend, "append-jsonl-migrated");
		assert.deepEqual(rooms.rooms[0].agents.sort(), ["agent_one", "agent_two"]);
		assert.equal(records.records[0].text, "Legacy message");

		const report = MetadataStore.path.report(config);
		assert.equal((await fileSystem.stat(report.roomsDirectory)).isDirectory(), true);
		assert.equal((await fileSystem.stat(report.fallbackFile)).isFile(), true);

		const secondRooms = MetadataStore.activeRooms(config);
		const secondRecords = MetadataStore.listRecords(config, { roomId: "room_legacy" });
		assert.equal(secondRooms.backend, "atomic-room-documents");
		assert.equal(secondRecords.backend, "append-jsonl");
		assert.equal(secondRooms.rooms.length, 1);
		assert.equal(secondRecords.records.length, 1);
		console.log(JSON.stringify({
			ok: true,
			rooms: secondRooms.rooms.length,
			records: secondRecords.records.length,
			metadataRoot
		}, null, 2));
	} finally {
		MetadataStore.closeAllDatabases();
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
