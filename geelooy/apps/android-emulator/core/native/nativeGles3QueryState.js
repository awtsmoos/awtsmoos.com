//B"H
//Boruch Hashem
//Blessed be He

const STATES = new WeakMap();
const TARGETS = new Set([0x8c2f, 0x8d6a, 0x8c88]);
const CURRENT_QUERY = 0x8865;
const QUERY_RESULT = 0x8866;
const QUERY_RESULT_AVAILABLE = 0x8867;

/**
 * Returns context-local GLES3 query-object state for one native runtime.
 * Generated names remain non-objects until first begin, active targets are tracked
 * independently, and deterministic software completion becomes visible only at end.
 */
export function getNativeGles3QueryState(runtimeState, domain) {
	if (!STATES.has(runtimeState)) STATES.set(runtimeState, createState(runtimeState, domain));
	return STATES.get(runtimeState);
}

/** Creates one isolated per-context query namespace. */
function createState(runtimeState, domain) {
	const contexts = new Map();
	return Object.freeze({
		begin(targetValue, handleValue, thread) {
			const query = domain.prepare(thread);
			if (!query.valid) return false;
			const target = Number(targetValue);
			const handle = Number(handleValue);
			const local = contextState(contexts, query.context);
			const record = local.records.get(handle);
			if (!TARGETS.has(target)) return fail(domain, query.thread, "invalidEnum");
			if (!record || local.active.has(target) || record.active) return fail(domain, query.thread, "invalidOperation");
			Object.assign(record, { active: true, available: false, created: true, target });
			local.active.set(target, record);
			trace(runtimeState, query.context, "begin-query", { query: handle, target });
			return true;
		},
		delete(names, thread) {
			const query = domain.prepare(thread);
			if (!query.valid) return false;
			const local = contextState(contexts, query.context);
			for (const raw of names) {
				const record = local.records.get(Number(raw));
				if (!record || record.active) continue;
				local.records.delete(record.handle);
				trace(runtimeState, query.context, "delete-query", { query: record.handle });
			}
			return true;
		},
		domain,
		end(targetValue, thread) {
			const query = domain.prepare(thread);
			if (!query.valid) return false;
			const target = Number(targetValue);
			if (!TARGETS.has(target)) return fail(domain, query.thread, "invalidEnum");
			const local = contextState(contexts, query.context);
			const record = local.active.get(target);
			if (!record) return fail(domain, query.thread, "invalidOperation");
			Object.assign(record, { active: false, available: true, result: 1 });
			local.active.delete(target);
			trace(runtimeState, query.context, "end-query", { query: record.handle, target });
			return true;
		},
		generate(count, thread) {
			const query = domain.prepare(thread);
			if (!query.valid) return Object.freeze({ names: [], success: false });
			const local = contextState(contexts, query.context);
			const names = [];
			for (let index = 0; index < count; index += 1) {
				const handle = local.next++;
				local.records.set(handle, { active: false, available: false, created: false, handle, result: 0, target: 0 });
				names.push(handle);
				trace(runtimeState, query.context, "create-query", { query: handle });
			}
			return Object.freeze({ names: Object.freeze(names), success: true });
		},
		is(handleValue, thread) {
			const query = domain.prepare(thread);
			return query.valid && Boolean(contextState(contexts, query.context).records.get(Number(handleValue))?.created);
		},
		object(handleValue, pnameValue, thread) {
			const query = domain.prepare(thread);
			if (!query.valid) return outcome(false, 0);
			const record = contextState(contexts, query.context).records.get(Number(handleValue));
			if (!record?.created || record.active) return failure(domain, query.thread, "invalidOperation");
			const pname = Number(pnameValue);
			if (pname === QUERY_RESULT) return outcome(true, record.result);
			if (pname === QUERY_RESULT_AVAILABLE) return outcome(true, record.available ? 1 : 0);
			return failure(domain, query.thread, "invalidEnum");
		},
		query(targetValue, pnameValue, thread) {
			const query = domain.prepare(thread);
			if (!query.valid) return outcome(false, 0);
			const target = Number(targetValue);
			if (!TARGETS.has(target) || Number(pnameValue) !== CURRENT_QUERY) return failure(domain, query.thread, "invalidEnum");
			return outcome(true, contextState(contexts, query.context).active.get(target)?.handle || 0);
		}
	});
}

function contextState(contexts, context) {
	const key = BigInt(context).toString();
	if (!contexts.has(key)) contexts.set(key, { active: new Map(), next: 1, records: new Map() });
	return contexts.get(key);
}
function outcome(success, value) { return Object.freeze({ success, value: Number(value) }); }
function failure(domain, thread, kind) { domain[kind](thread); return outcome(false, 0); }
function fail(domain, thread, kind) { domain[kind](thread); return false; }
function trace(runtimeState, context, kind, payload) { runtimeState.nativeGraphicsTrace?.gles(Object.freeze({ context: BigInt(context).toString(), kind, ...payload })); }
