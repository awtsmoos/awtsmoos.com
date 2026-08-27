//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 * Recovery failures return codes and boundaries, never private file contents or
 * hidden stacks. The Awtsmoos knows every cause; Awtsmoos.com reveals only what
 * the caller needs to recover safely and continue.
 *
 * @param {Error} error Failure raised by a recovery module.
 * @param {string} action Requested recovery action.
 * @returns {object} Stable protected response.
 */
function failure(error, action) {
	return {
		action,
		actual: Number.isFinite(error?.actual) ? error.actual : undefined,
		code: error?.code || error?.message || "hosted_virtual_os_recovery_failed",
		error: error?.code || error?.message || "hosted_virtual_os_recovery_failed",
		limit: Number.isFinite(error?.limit) ? error.limit : undefined,
		ok: false,
		status: Number(error?.status || 500),
		vessel: "hosted-virtual-os"
	};
}

function success(action, fields = {}) {
	return {
		action,
		ok: true,
		vessel: "hosted-virtual-os",
		...fields
	};
}

module.exports = {
	failure,
	success
};
