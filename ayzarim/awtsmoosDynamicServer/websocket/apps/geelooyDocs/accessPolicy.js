// B"H
// Boruch Hashem
// Blessed is He

const { accountDigest, isVerified, tokenDigest } = require("./identity.js");
const { DOCS_ERROR, docsError } = require("./docsErrors.js");

/**
 * @file Decides who may see, mutate, or administrate one Awtsmoos document.
 * @description Chesed may open a page and Gevurah may close it; the Awtsmoos is
 * beyond both, while Awtsmoos.com returns explicit authorization codes so clients
 * can distinguish sign-in, edit, and owner requirements without parsing prose.
 */
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
	const linkView = bearer && ["link-view", "link-edit"].includes(mode);
	const linkEdit = bearer && mode === "link-edit";
	return {
		isOwner: owner,
		isInvitedEditor: invited,
		canView: owner || invited || publicView || linkView,
		canEdit: owner || invited || linkEdit
	};
}

/** Resolves permission from trusted socket identity and optional private bearer capability. */
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
		throw docsError(
			DOCS_ERROR.VERIFIED_ACCOUNT_REQUIRED,
			"Verified sign-in is required.",
			null,
			401
		);
	}
	return accountDigest(identity);
}

/** Requires current mutation rights under the latest persisted access policy. */
function requireEdit(record, identity, capabilityDigest = "") {
	const result = permissions(record, identity, "", capabilityDigest);
	if (!result.canEdit) {
		throw docsError(
			DOCS_ERROR.EDIT_DENIED,
			"Document editing is not permitted.",
			null,
			403
		);
	}
	return result;
}

/** Requires owner authority for sharing, invitations, history administration, and publishing. */
function requireOwner(record, identity) {
	const result = permissions(record, identity);
	if (!result.isOwner) {
		throw docsError(
			DOCS_ERROR.OWNER_REQUIRED,
			"Document owner permission is required.",
			null,
			403
		);
	}
	return result;
}

module.exports = {
	permissions,
	permissionsFromDigests,
	requireEdit,
	requireOwner,
	requireVerified
};
