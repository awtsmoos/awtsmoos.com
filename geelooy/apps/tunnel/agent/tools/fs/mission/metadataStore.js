// B"H
// Boruch Hashem
// Blessed is He

const fs = require('fs');
const path = require('path');
const MetadataPath = require('./metadataPath.js');

const DATABASE_IDLE_CLOSE_MS = 180;
const databaseLeases = new Map();
let exitHookInstalled = false;

function safe(value) {
	return String(value || 'item')
		.replace(/[^a-zA-Z0-9_-]/g, '_')
		.slice(0, 120) || 'item';
}

function stamp() {
	return new Date().toISOString();
}

function awdbEnabled() {
	return process.env.AWTSMOOS_MISSION_METADATA_AWDB === '1';
}

function awdbCandidates() {
	return [
		path.join(__dirname, '..', '..', '..', 'ayzarim', 'dosdb', 'awtsmoosBinary', 'awtsmoosdb', 'index.js'),
		path.join(__dirname, '../../../../../../../ayzarim/dosdb/awtsmoosBinary/awtsmoosdb/index.js')
	];
}

function loadAwdb() {
	const tried = [];
	for (const candidate of awdbCandidates()) {
		tried.push(candidate);
		if (fs.existsSync(candidate)) {
			return require(candidate);
		}
	}
	const error = new Error(`awtsmoosdb_module_missing: ${tried.join(' | ')}`);
	error.code = 'AWTSMOOSDB_MODULE_MISSING';
	throw error;
}

function openAwdb(file) {
	const AwtsmoosDB = loadAwdb();
	const database = new AwtsmoosDB(file, { debug: false });
	database.open();
	return database;
}

function leaseDatabase(file) {
	installExitHook();
	let lease = databaseLeases.get(file);
	if (!lease) {
		lease = { database: openAwdb(file), timer: null };
		databaseLeases.set(file, lease);
	}
	if (lease.timer) {
		clearTimeout(lease.timer);
		lease.timer = null;
	}
	return lease.database;
}

function releaseDatabase(file) {
	const lease = databaseLeases.get(file);
	if (!lease) {
		return;
	}
	lease.timer = setTimeout(() => closeDatabase(file), DATABASE_IDLE_CLOSE_MS);
}

function closeDatabase(file) {
	const lease = databaseLeases.get(file);
	if (!lease) {
		return;
	}
	if (lease.timer) {
		clearTimeout(lease.timer);
	}
	databaseLeases.delete(file);
	try {
		lease.database.close();
	} catch {}
}

function closeAllDatabases() {
	for (const file of [...databaseLeases.keys()]) {
		closeDatabase(file);
	}
}

function installExitHook() {
	if (exitHookInstalled) {
		return;
	}
	exitHookInstalled = true;
	process.once('exit', closeAllDatabases);
}

function plain(value) {
	return value && value.__resolve__ ? value.__resolve__() : value;
}

function withDb(config, input, callback) {
	const info = MetadataPath.report(config, input);
	fs.mkdirSync(info.metadataRoot, { recursive: true });
	const database = leaseDatabase(info.dbFile);
	try {
		return callback(database, info);
	} finally {
		releaseDatabase(info.dbFile);
	}
}

function entryFor(config = {}, mission = {}, kind = 'event', input = {}) {
	return {
		id: input.id || `${safe(kind)}_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 8)}`,
		at: input.at || stamp(),
		kind: safe(kind),
		missionId: mission.id || input.missionId || 'mission',
		roomId: mission.room?.id || input.roomId || '',
		agentId: input.agentId || input.fromAgent || '',
		projectRoot: input.projectRoot || config.root || '',
		text: input.text || input.body || input.message || input.subject || '',
		payload: input.payload || null
	};
}

function record(config = {}, mission = {}, kind = 'event', input = {}) {
	const info = MetadataPath.report(config, input);
	fs.mkdirSync(info.metadataRoot, { recursive: true });
	const entry = entryFor(config, mission, kind, input);
	if (!awdbEnabled()) {
		fs.appendFileSync(info.fallbackFile, `${JSON.stringify(entry)}\n`, 'utf8');
		return {
			ok: true,
			backend: 'append-jsonl',
			metadata: info,
			record: entry
		};
	}
	try {
		return withDb(config, input, database => {
			writeRecord(database, entry);
			return {
				ok: true,
				backend: 'awtsmoosdb',
				metadata: info,
				record: entry
			};
		});
	} catch (error) {
		fs.appendFileSync(info.fallbackFile, `${JSON.stringify(entry)}\n`, 'utf8');
		return {
			ok: true,
			backend: 'append-jsonl',
			metadata: info,
			record: entry,
			warning: String(error?.message || error)
		};
	}
}

function writeRecord(database, entry) {
	database.root.records ||= {};
	database.root.records[entry.id] = entry;
	database.root.latest = entry;
	database.root.collections ||= {};
	database.root.collections[entry.kind] ||= {};
	database.root.collections[entry.kind][entry.id] = entry;
}

function listRecords(config = {}, input = {}) {
	const info = MetadataPath.report(config, input);
	if (!awdbEnabled()) {
		const migrated = migrateLegacyRecords(config, input, info);
		return {
			ok: true,
			backend: migrated ? 'append-jsonl-migrated' : 'append-jsonl',
			metadata: info,
			records: lineRecords(info.fallbackFile, input)
		};
	}
	try {
		return withDb(config, input, (database, metadata) => ({
			ok: true,
			backend: 'awtsmoosdb',
			metadata,
			records: recordsFrom(database, input)
		}));
	} catch (error) {
		return {
			ok: false,
			backend: 'awtsmoosdb',
			error: String(error?.message || error),
			records: []
		};
	}
}

function lineRecords(file, input = {}) {
	let lines = [];
	try {
		lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
	} catch {
		return [];
	}
	return lines
		.map(parseLine)
		.filter(Boolean)
		.filter(item => !input.missionId || item.missionId === input.missionId)
		.filter(item => !input.roomId || item.roomId === input.roomId)
		.filter(item => !input.kind || item.kind === safe(input.kind))
		.sort((left, right) => String(left.at || '').localeCompare(String(right.at || '')))
		.slice(-limit(input));
}

function parseLine(line) {
	try {
		return JSON.parse(line);
	} catch {}
	const [at, kind, missionId, roomId, encoded = ''] = String(line).split('|');
	if (!at || !kind || !missionId) {
		return null;
	}
	return {
		at,
		kind,
		missionId,
		roomId,
		text: Buffer.from(encoded, 'base64').toString('utf8')
	};
}

function recordsFrom(database, input = {}) {
	const all = rawRecordsFrom(database);
	return all
		.filter(item => !input.missionId || item.missionId === input.missionId)
		.filter(item => !input.roomId || item.roomId === input.roomId)
		.filter(item => !input.kind || item.kind === safe(input.kind))
		.sort((left, right) => String(left.at || '').localeCompare(String(right.at || '')))
		.slice(-limit(input));
}

function rawRecordsFrom(database) {
	return database.root.records
		? database.keys(database.root.records).map(key => plain(database.root.records[key]))
		: [];
}

function roomEntry(config = {}, mission = {}, input = {}) {
	const room = mission.room || {};
	return {
		roomId: room.id || input.roomId || '',
		missionId: mission.id || input.missionId || '',
		name: room.name || mission.goal || '',
		projectRoot: room.projectRoot || input.projectRoot || mission.metadata?.projectRoot || config.root || '',
		updatedAt: stamp(),
		agents: Object.keys(room.agents || {}),
		messages: (room.messages || []).length,
		subMissions: (room.subMissions || []).length,
		blockingInterrupts: (room.interrupts || []).filter(item => item.status === 'blocking').length
	};
}

function upsertRoom(config = {}, mission = {}, input = {}) {
	const info = MetadataPath.report(config, input);
	const room = mission.room || {};
	const key = safe(room.id || input.roomId || mission.id);
	const entry = roomEntry(config, mission, input);
	if (!awdbEnabled()) {
		writeRoomDocument(info.roomsDirectory, key, entry);
		return {
			ok: true,
			backend: 'atomic-room-documents',
			metadata: info,
			room: entry
		};
	}
	try {
		return withDb(config, input, (database, metadata) => {
			database.root.activeRooms ||= {};
			database.root.activeRooms[key] = entry;
			return {
				ok: true,
				backend: 'awtsmoosdb',
				metadata,
				room: entry
			};
		});
	} catch (error) {
		return {
			ok: false,
			backend: 'awtsmoosdb',
			error: String(error?.message || error),
			room: entry
		};
	}
}

function readRoomDocuments(directory) {
	let files = [];
	try {
		files = fs.readdirSync(directory).filter(file => file.endsWith('.json'));
	} catch {
		return [];
	}
	return files.map(file => {
		try {
			return JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
		} catch {
			return null;
		}
	}).filter(Boolean);
}

function writeRoomDocument(directory, key, entry) {
	const file = path.join(directory, `${safe(key)}.json`);
	const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
	fs.mkdirSync(directory, { recursive: true });
	try {
		fs.writeFileSync(temporary, JSON.stringify(entry), {
			encoding: 'utf8',
			mode: 0o600
		});
		fs.renameSync(temporary, file);
	} finally {
		try {
			fs.unlinkSync(temporary);
		} catch {}
	}
}

function readRoomRegistry(file) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf8')) || {};
	} catch {
		return {};
	}
}

function writeLineRecords(file, records) {
	const directory = path.dirname(file);
	const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
	fs.mkdirSync(directory, { recursive: true });
	try {
		const body = records.length
			? `${records.map(item => JSON.stringify(item)).join('\n')}\n`
			: '';
		fs.writeFileSync(temporary, body, {
			encoding: 'utf8',
			mode: 0o600
		});
		fs.renameSync(temporary, file);
	} finally {
		try {
			fs.unlinkSync(temporary);
		} catch {}
	}
}

function hasLegacyDatabase(info) {
	return fs.existsSync(info.dbFile);
}

function migrateLegacyRecords(config, input, info) {
	if (fs.existsSync(info.fallbackFile) || !hasLegacyDatabase(info)) {
		return false;
	}
	try {
		const records = withDb(config, input, database => rawRecordsFrom(database)
			.sort((left, right) => String(left.at || '').localeCompare(String(right.at || ''))));
		writeLineRecords(info.fallbackFile, records);
		return true;
	} catch {
		return false;
	}
}

function migrateLegacyRooms(config, input, info) {
	if (readRoomDocuments(info.roomsDirectory).length) {
		return false;
	}
	try {
		let rooms = Object.values(readRoomRegistry(info.roomsFile));
		if (!rooms.length && hasLegacyDatabase(info)) {
			rooms = withDb(config, input, database => database.root.activeRooms
				? database.keys(database.root.activeRooms).map(key => plain(database.root.activeRooms[key]))
				: []);
		}
		if (!rooms.length) {
			return false;
		}
		for (const room of rooms) {
			writeRoomDocument(
				info.roomsDirectory,
				safe(room.roomId || room.missionId),
				room
			);
		}
		return true;
	} catch {
		return false;
	}
}

function activeRooms(config = {}, input = {}) {
	const info = MetadataPath.report(config, input);
	if (!awdbEnabled()) {
		const migrated = migrateLegacyRooms(config, input, info);
		return {
			ok: true,
			backend: migrated ? 'atomic-room-documents-migrated' : 'atomic-room-documents',
			metadata: info,
			rooms: readRoomDocuments(info.roomsDirectory)
		};
	}
	try {
		return withDb(config, input, (database, metadata) => ({
			ok: true,
			backend: 'awtsmoosdb',
			metadata,
			rooms: database.root.activeRooms
				? database.keys(database.root.activeRooms).map(key => plain(database.root.activeRooms[key]))
				: []
		}));
	} catch (error) {
		return {
			ok: false,
			backend: 'awtsmoosdb',
			error: String(error?.message || error),
			rooms: []
		};
	}
}

function status(config = {}, input = {}) {
	const info = MetadataPath.report(config, input);
	const files = fs.existsSync(info.metadataRoot)
		? fs.readdirSync(info.metadataRoot)
		: [];
	const registry = activeRooms(config, input);
	const hasRoomDocuments = fs.existsSync(info.roomsDirectory);
	return {
		ok: true,
		...info,
		exists: fs.existsSync(info.metadataRoot),
		files,
		hasJsonFiles: hasRoomDocuments ||
			files.some(file => file.endsWith('.json') || file.endsWith('.jsonl')),
		activeRooms: registry.rooms || []
	};
}

function limit(input = {}) {
	const number = Number(input.limit || 500);
	return Number.isFinite(number)
		? Math.max(1, Math.min(5000, number))
		: 500;
}

module.exports = {
	DATABASE_IDLE_CLOSE_MS,
	activeRooms,
	awdbCandidates,
	closeAllDatabases,
	listRecords,
	path: MetadataPath,
	record,
	status,
	upsertRoom
};
