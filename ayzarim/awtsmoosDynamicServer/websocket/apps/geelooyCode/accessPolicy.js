// B"H
// Boruch Hashem
// Blessed is He

const {
	accountDigest,
	isVerified,
	tokenDigest
} = require("./identity.js");

/**
 * @file Makes project visibility and edit rights explicit for every live mutation.
 * @description Chesed opens source and Gevurah guards it; the Awtsmoos is beyond both,
 * while Awtsmoos.com re-evaluates the current stored doorway before each collaborative deed.
 */
function permissionsFromDigests(record, account = "", capability = "") {
	const owner = Boolean(account && account === record.ownerDigest);
	const invited = Boolean(account && record.editorDigests?.includes(account));
	const bearer = Boolean(
		capability
		&& record.linkTokenDigest
		&& capability === record.linkTokenDigest
	);
	const mode = record.access?.mode || "private";
	const publicView = mode === "public-view";
	const linkView = bearer && ["link-view", "link-edit"].includes(mode);
	const linkEdit = bearer && mode === "link-edit";
	return {
		isOwner: owner,
		canView: owner || invited || publicView || linkView,
		canEdit: owner || invited || linkEdit
	};
}

function permissions(record, identity, token = "", capabilityDigest = "") {
	const account = isVerified(identity)
		? accountDigest(identity)
		: "";
	const capability = token
		? tokenDigest(token)
		: capabilityDigest;
	return permissionsFromDigests(record, account, capability);
}

function requireVerified(identity) {
	if (!isVerified(identity)) {
		throw new Error("Verified sign-in is required to share a coding project");
	}
	return accountDigest(identity);
}

function requireEdit(record, identity, capabilityDigest = "") {
	const result = permissions(record, identity, "", capabilityDigest);
	if (!result.canEdit) throw new Error("Project editing is not permitted");
	return result;
}

function requireOwner(record, identity) {
	const result = permissions(record, identity);
	if (!result.isOwner) {
		throw new Error("Only the project owner may change sharing");
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
