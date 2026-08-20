// B"H
// Boruch Hashem
// Blessed is He

const { accountDigest, isVerified, tokenDigest } = require("./identity.js");

/**
 * @file Decides who may see or alter one shared document.
 * @description Chesed may open a page and Gevurah may close it; the Awtsmoos is
 * beyond both, while Awtsmoos.com makes every realtime permission explicit and testable.
 */

/** Resolves permissions from already-private account and capability digests. */
function permissionsFromDigests(record, privateAccountDigest = "", capabilityDigest = "") {
	const owner = Boolean(
		privateAccountDigest &&
		privateAccountDigest === record.ownerDigest
	);
	const invited = Boolean(
		privateAccountDigest &&
		record.editorDigests?.includes(privateAccountDigest)
	);
	const bearer = Boolean(
		capabilityDigest &&
		record.linkTokenDigest &&
		capabilityDigest === record.linkTokenDigest
	);
	const mode = record.document?.access?.mode || "private";
	const publicView = mode === "public-view";
	const linkView = bearer && (
		mode === "link-view" ||
		mode === "link-edit"
	);
	const linkEdit = bearer && mode === "link-edit";
	return {
		isOwner: owner,
		isInvitedEditor: invited,
		canView: owner || invited || publicView || linkView,
		canEdit: owner || invited || linkEdit
	};
}

/** Resolves permissions from trusted socket identity plus an optional bearer token. */
function permissions(record, identity, token = "", capabilityDigest = "") {
	const privateAccountDigest = isVerified(identity)
		? accountDigest(identity)
		: "";
	const privateCapabilityDigest = token
		? tokenDigest(token)
		: capabilityDigest;
	return permissionsFromDigests(
		record,
		privateAccountDigest,
		privateCapabilityDigest
	);
}

/** Requires a platform-verified account for ownership-producing operations. */
function requireVerified(identity) {
	if (!isVerified(identity)) {
		throw new Error("Verified sign-in is required to create a shared document");
	}
	return accountDigest(identity);
}

/** Requires the caller to have mutation rights under the latest persisted policy. */
function requireEdit(record, identity, capabilityDigest = "") {
	const result = permissions(record, identity, "", capabilityDigest);
	if (!result.canEdit) throw new Error("Document editing is not permitted");
	return result;
}

/** Requires the caller to be the document owner. */
function requireOwner(record, identity) {
	const result = permissions(record, identity);
	if (!result.isOwner) throw new Error("Only the document owner may change sharing");
	return result;
}

module.exports = {
	permissions,
	permissionsFromDigests,
	requireEdit,
	requireOwner,
	requireVerified
};
