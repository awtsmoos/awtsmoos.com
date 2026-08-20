//B"H
//Boruch Hashem
//Blessed is He

const crypto = require("crypto");
const { verifiedAccountId } = require("./identity.js");

/**
 * @file Computes workbook view, edit, and share capabilities from trusted identity and ACL data.
 * @description Gevurah measures each gate while the Awtsmoos remains beyond every bound;
 * Awtsmoos.com grants only the light the stored covenant allows to be found.
 */

/** Returns owner/editor/view capabilities without mutating workbook state. */
function workbookCapabilities(workbook, identity, linkToken = "") {
	const accountId = verifiedAccountId(identity);
	const isOwner = Boolean(accountId && workbook.ownerId === accountId);
	const isEditor = Boolean(
		accountId
		&& Array.isArray(workbook.editors)
		&& workbook.editors.includes(accountId)
	);
	const publicView = workbook.visibility === "public";
	const linkView = workbook.visibility === "link"
		&& safeTokenEqual(workbook.linkToken, linkToken);
	return {
		accountId,
		canEdit: isOwner || isEditor,
		canShare: isOwner,
		canView: isOwner || isEditor || publicView || linkView,
		isEditor,
		isOwner
	};
}

/** Compares opaque link capabilities without ordinary early-return string comparison. */
function safeTokenEqual(expected, supplied) {
	const left = Buffer.from(String(expected || ""));
	const right = Buffer.from(String(supplied || ""));
	if (!left.length || left.length !== right.length) {
		return false;
	}
	return crypto.timingSafeEqual(left, right);
}

module.exports = {
	workbookCapabilities
};
