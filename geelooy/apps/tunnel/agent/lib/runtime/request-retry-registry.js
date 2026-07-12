// B"H
const Identity = require('./request-retry-identity.js');
const Shapes = require('./request-retry-shapes.js');
const Store = require('./request-retry-store.js');

/** B"H — Retry polls one original operation and can never enqueue a duplicate. */
function begin(input = {}) {
	return Store.begin(Identity.requestIdentity(input.payload || input, input.data || {}));
}

function poll(input = {}) {
	const identity = Identity.retryIdentity(input.payload || input, input.data || {});
	const record = Store.get(identity.controlRequestId);
	if (!record) return Shapes.missing(identity.controlRequestId, identity.requestedAction);
	if (identity.requestedAction && record.requestedAction !== identity.requestedAction) {
		return Shapes.conflict(record, identity.requestedAction);
	}
	return record.state === 'completed'
		? Shapes.completed(record)
		: Shapes.pending(record);
}

module.exports = {
	begin,
	collect: Store.collect,
	complete: Store.complete,
	poll,
	progress: Store.progress,
	requestIdentity: Identity.requestIdentity,
	reset: Store.reset,
	retryIdentity: Identity.retryIdentity,
	snapshot: Store.snapshot
};
