// B"H

/**
 * B"H — A PID is only an address. Birth token and process-group identity prove
 * which command family currently occupies that address.
 */
function create(input = {}) {
	return {
		pid: positiveInteger(input.pid),
		processGroupId: positiveInteger(input.processGroupId || input.pgid),
		birthToken: clean(input.birthToken),
		platform: clean(input.platform || process.platform),
		observedAt: input.observedAt || new Date().toISOString()
	};
}

function compare(expected = {}, observed = {}) {
	const wanted = create(expected);
	const actual = create(observed);
	if (observed.alive === false || !actual.pid) {
		return { ok: false, state: 'dead', expected: wanted, observed: actual };
	}
	if (!wanted.pid || wanted.pid !== actual.pid) {
		return mismatch('pid_mismatch', wanted, actual);
	}
	if (!wanted.birthToken || !actual.birthToken) {
		return {
			ok: false,
			state: 'unverified',
			reason: 'birth_token_missing',
			expected: wanted,
			observed: actual
		};
	}
	if (wanted.birthToken !== actual.birthToken) {
		return mismatch('birth_token_mismatch', wanted, actual);
	}
	if (wanted.processGroupId && actual.processGroupId &&
		wanted.processGroupId !== actual.processGroupId) {
		return mismatch('process_group_mismatch', wanted, actual);
	}
	return { ok: true, state: 'exact', expected: wanted, observed: actual };
}

function fromMeta(meta = {}) {
	return create({
		...(meta.processIdentity || {}),
		pid: meta.processIdentity?.pid || meta.pid || meta.worker?.pid,
		processGroupId: meta.processIdentity?.processGroupId || meta.processGroupId,
		birthToken: meta.processIdentity?.birthToken || meta.birthToken,
		platform: meta.processIdentity?.platform || meta.platform
	});
}

function mismatch(reason, expected, observed) {
	return { ok: false, state: 'mismatch', reason, expected, observed };
}

function clean(value) {
	return String(value || '').trim();
}

function positiveInteger(value) {
	const number = Number(value);
	return Number.isInteger(number) && number > 0 ? number : null;
}

module.exports = { compare, create, fromMeta, positiveInteger };
