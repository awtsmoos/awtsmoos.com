// B"H

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fileSystem = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const MetadataStore = require("../../mission/metadataStore.js");

const CHILDREN = 32;

if (process.argv[2] === "--child") {
	writeRoom(Number(process.argv[3]), process.argv[4], process.argv[5]);
	process.exit(0);
}

async function main() {
	const base = fileSystem.mkdtempSync(path.join(os.tmpdir(), "room-meta-processes-"));
	const root = path.join(base, "project");
	const metadataRoot = path.join(base, "metadata");
	fileSystem.mkdirSync(root, { recursive: true });
	await Promise.all(Array.from({ length: CHILDREN }, (_, index) => child(index, root, metadataRoot)));

	const result = MetadataStore.activeRooms({ root, metadataRoot });
	const roomIds = result.rooms.map(room => room.roomId).sort();
	assert.equal(result.backend, "atomic-room-documents");
	assert.equal(roomIds.length, CHILDREN);
	assert.deepEqual(roomIds, Array.from({ length: CHILDREN }, (_, index) => `room_${index}`).sort());
	console.log(JSON.stringify({
		ok: true,
		suite: "mission-room-metadata-parallel-processes",
		processes: CHILDREN,
		roomsPreserved: roomIds.length
	}, null, 2));
}

function writeRoom(index, root, metadataRoot) {
	const mission = {
		id: `mission_${index}`,
		goal: `Parallel room ${index}`,
		room: {
			id: `room_${index}`,
			agents: {
				[`agent_${index}`]: { status: "working" }
			},
			messages: [],
			subMissions: [],
			interrupts: []
		}
	};
	const result = MetadataStore.upsertRoom({ root, metadataRoot }, mission);
	assert.equal(result.ok, true);
}

function child(index, root, metadataRoot) {
	return new Promise((resolve, reject) => {
		const processHandle = childProcess.fork(
			__filename,
			["--child", String(index), root, metadataRoot],
			{ stdio: "ignore" }
		);
		processHandle.once("error", reject);
		processHandle.once("exit", code => {
			if (code === 0) {
				resolve();
				return;
			}
			reject(new Error(`room metadata child ${index} exited ${code}`));
		});
	});
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});
