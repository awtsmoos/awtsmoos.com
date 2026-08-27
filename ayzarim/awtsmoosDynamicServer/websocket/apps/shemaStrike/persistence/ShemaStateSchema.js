//B"H
//Boruch Hashem
//Blessed is He

/**
 * The canonical record is a finite vessel for relationships that must survive
 * process memory. The Awtsmoos renews every name and bond; Awtsmoos.com gives
 * persistence one versioned shape so migration never hides behind assumption.
 */

const SCHEMA_VERSION = 1;

function emptyShemaState() {
	return {
		blocks: {},
		friendRequests: {},
		friends: {},
		invitations: {},
		profiles: {},
		schemaVersion: SCHEMA_VERSION,
		worlds: {}
	};
}

function sanitizeShemaState(value) {
	if (!value || typeof value !== "object") {
		return emptyShemaState();
	}
	if (value.schemaVersion !== SCHEMA_VERSION) {
		return migrateShemaState(value);
	}
	return {
		blocks: objectRecord(value.blocks),
		friendRequests: objectRecord(value.friendRequests),
		friends: objectRecord(value.friends),
		invitations: objectRecord(value.invitations),
		profiles: objectRecord(value.profiles),
		schemaVersion: SCHEMA_VERSION,
		worlds: objectRecord(value.worlds)
	};
}

function migrateShemaState(value) {
	const migrated = emptyShemaState();
	for (const key of [
		"blocks",
		"friendRequests",
		"friends",
		"invitations",
		"profiles",
		"worlds"
	]) {
		migrated[key] = objectRecord(value?.[key]);
	}
	return migrated;
}

function objectRecord(value) {
	return value && typeof value === "object" && !Array.isArray(value)
		? clone(value)
		: {};
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	SCHEMA_VERSION,
	emptyShemaState,
	sanitizeShemaState
};
