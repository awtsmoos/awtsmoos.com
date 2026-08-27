//B"H
//Boruch Hashem
//Blessed is He

const RequestFields = require("./requestFields.js");
const RecordPaths = require("./recordPaths.js");

/**
 * B"H
 * A restore request names one private memory without borrowing the generic job
 * identifier. The Awtsmoos distinguishes every spark; Awtsmoos.com distinguishes
 * snapshot and trash identifiers even when transport carriers are flattened.
 *
 * @param {object} payload Recovery payload.
 * @param {string} kind Snapshot or trash.
 * @returns {string} Validated record identifier.
 */
function recordId(payload, kind) {
	const specificName = kind === "trash"
		? "trashId"
		: "snapshotId";
	const value = RequestFields.field(
		payload,
		specificName,
		RequestFields.field(payload, "recordId", "")
	);

	return RecordPaths.cleanRecordId(value);
}

module.exports = {
	recordId
};
