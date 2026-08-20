// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares the version-one Geelooy Code collaborative project protocol.
 * @description The Awtsmoos is beyond message names; Awtsmoos.com gives every live
 * coding act a bounded type so source collaboration cannot become an unmeasured payload channel.
 */
const APPLICATION_ID = "geelooy-code";
const VERSION = 1;
const SHARE_MODES = Object.freeze([
	"private",
	"public-view",
	"link-view",
	"link-edit"
]);
const TYPES = Object.freeze({
	CREATE: "code.project.create",
	JOIN: "code.project.join",
	LEAVE: "code.project.leave",
	PATCH: "code.file.patch",
	SYNC: "code.file.sync",
	FILE_CREATE: "code.file.create",
	FILE_RENAME: "code.file.rename",
	FILE_DELETE: "code.file.delete",
	ACCESS: "code.access.update",
	INVITE: "code.access.invite",
	PRESENCE: "code.presence.update"
});
const EVENTS = Object.freeze({
	FILE: "code.file.changed",
	STRUCTURE: "code.project.structure",
	ACCESS: "code.access.changed",
	PRESENCE: "code.presence.changed"
});

function boundedText(value, label, maximum, fallback = "") {
	const text = String(value ?? fallback);
	if (text.length > maximum) throw new Error(`${label} is too long`);
	return text;
}

function projectId(value) {
	const id = boundedText(value, "Project id", 96).trim();
	if (!/^[A-Za-z0-9_-]{12,96}$/.test(id)) {
		throw new Error("Invalid project id");
	}
	return id;
}

function shareMode(value) {
	const mode = String(value || "private");
	if (!SHARE_MODES.includes(mode)) {
		throw new Error("Unsupported project sharing mode");
	}
	return mode;
}

function revision(value, label = "Revision") {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 0) {
		throw new Error(`${label} is invalid`);
	}
	return number;
}

module.exports = {
	APPLICATION_ID,
	EVENTS,
	SHARE_MODES,
	TYPES,
	VERSION,
	boundedText,
	projectId,
	revision,
	shareMode
};
