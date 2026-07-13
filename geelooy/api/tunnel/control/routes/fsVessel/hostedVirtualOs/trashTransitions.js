//B"H
//Boruch Hashem
//Blessed is He

const RecordModel = require("./recordModel.js");

/**
 * B"H
 * A failed destructive transition must leave a truthful, retryable witness. The
 * Awtsmoos hides no state; Awtsmoos.com marks capture-only evidence before the
 * caller receives failure, preserving both diagnosis and restoration.
 */
async function markCaptureOnly(save, record, error) {
	const updated = RecordModel.updateRecord(record, {
		failureCode: error?.code
			|| error?.message
			|| "hosted_virtual_os_trash_delete_failed",
		state: "capture-only"
	});

	await save(updated);
	return updated;
}

function assertDeletion(deletion) {
	if (!deletion || deletion.ok === false) {
		throw transitionError(
			deletion?.error || "hosted_virtual_os_trash_delete_failed",
			deletion?.status || 500
		);
	}
}

function transitionError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	assertDeletion,
	markCaptureOnly,
	transitionError
};
