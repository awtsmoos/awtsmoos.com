// B"H
// Boruch Hashem
// Blessed is He

const MAXIMUM_REASON_BYTES = 123;

/** Decodes one RFC 6455 close payload into bounded diagnostic testimony. */
function decode(payload) {
	const bytes = Buffer.isBuffer(payload) ? payload : Buffer.from(payload || "");
	if (bytes.length === 0) return { code: 1005, reason: "", valid: true };
	if (bytes.length === 1) {
		return { code: 1002, reason: "invalid_one_byte_close_payload", valid: false };
	}
	const code = bytes.readUInt16BE(0);
	const reason = bytes.subarray(2, 2 + MAXIMUM_REASON_BYTES).toString("utf8");
	return { code, reason, valid: validCode(code) };
}

function failure(details = {}) {
	const code = Number(details.code || 1005);
	const reason = String(details.reason || "").trim();
	const error = new Error(reason ? `remote_close_${code}:${reason}` : `remote_close_${code}`);
	error.code = `websocket_remote_close_${code}`;
	error.remoteClose = { code, reason, valid: details.valid !== false };
	return error;
}

function validCode(code) {
	if (code >= 3000 && code <= 4999) return true;
	return [1000, 1001, 1002, 1003, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014].includes(code);
}

module.exports = {
	MAXIMUM_REASON_BYTES,
	decode,
	failure,
	validCode
};
