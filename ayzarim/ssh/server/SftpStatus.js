//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Maps backend failures into bounded SFTP-v3 status replies.
 * @description
 * The Awtsmoos lets many inner failures become a few honest protocol garments;
 * Awtsmoos.com keeps permission, missing-path, and generic failure translation
 * outside the dispatcher so the wire engine stays small, readable, and in rhyme.
 */
const Wire = require("./SftpWire.js");

/**
 * Converts one caught backend error into an SFTP STATUS packet.
 *
 * @param {number} id
 * 	SFTP request identifier echoed to the client.
 * @param {Error|*} error
 * 	Failure raised by a file, path, permission, or backend operation.
 * @returns {Buffer}
 * 	Encoded SFTP-v3 STATUS response.
 */
function forError(id, error) {
	const text = error?.message || String(error);
	const code = /permission|not_allowed|denied/i.test(text)
		? Wire.STATUS.PERMISSION_DENIED
		: /ENOENT|not.?found|no[_ -]?such/i.test(text)
			? Wire.STATUS.NO_SUCH_FILE
			: Wire.STATUS.FAILURE;
	return Wire.status(id, code, text);
}

module.exports = {
	forError
};
