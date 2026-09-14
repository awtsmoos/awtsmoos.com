//B"H
//Boruch Hashem
//Blessed be He

const STATES = new WeakMap();
const TRANSFORM_FEEDBACK = 0x8e22;
const MODES = new Set([0x0000, 0x0001, 0x0004]);

/**
 * Returns one context-local GLES3 transform-feedback namespace.
 * Names become objects after their first bind, while active/paused lifecycle state
 * remains attached to the currently bound object including the default object zero.
 */
export function getNativeGles3TransformFeedbackState(runtimeState, domain) {
	if (!STATES.has(runtimeState)) STATES.set(runtimeState, createState(runtimeState, domain));
	return STATES.get(runtimeState);
}

/** Creates the isolated context table and lifecycle API. */
function createState(runtimeState, domain) {
	const contexts = new Map();
	return Object.freeze({
		begin(modeValue, thread) {
			const prepared = prepare(domain, contexts, thread);
			if (!prepared.valid) return false;
			const mode = Number(modeValue);
			if (!MODES.has(mode)) return fail(domain, prepared.thread, "invalidEnum");
			const record = prepared.local.bound;
			if (record.active) return fail(domain, prepared.thread, "invalidOperation");
			Object.assign(record, { active: true, mode, paused: false });
			trace(runtimeState, prepared.context, "begin-transform-feedback", { mode, transformFeedback: record.handle });
			return true;
		},
		bind(targetValue, handleValue, thread) {
			const prepared = prepare(domain, contexts, thread);
			if (!prepared.valid) return false;
			if (Number(targetValue) !== TRANSFORM_FEEDBACK) return fail(domain, prepared.thread, "invalidEnum");
			if (prepared.local.bound.active && !prepared.local.bound.paused) return fail(domain, prepared.thread, "invalidOperation");
			const handle = Number(handleValue);
			const record = handle === 0 ? prepared.local.defaultObject : prepared.local.records.get(handle);
			if (!record) return fail(domain, prepared.thread, "invalidOperation");
			record.created = true;
			prepared.local.bound = record;
			trace(runtimeState, prepared.context, "bind-transform-feedback", { target: TRANSFORM_FEEDBACK, transformFeedback: handle });
			return true;
		},
		delete(names, thread) {
			const prepared = prepare(domain, contexts, thread);
			if (!prepared.valid) return false;
			for (const raw of names) {
				const record = prepared.local.records.get(Number(raw));
				if (!record || record.active) continue;
				prepared.local.records.delete(record.handle);
				if (prepared.local.bound === record) prepared.local.bound = prepared.local.defaultObject;
				trace(runtimeState, prepared.context, "delete-transform-feedback", { transformFeedback: record.handle });
			}
			return true;
		},
		domain,
		end(thread) {
			const prepared = prepare(domain, contexts, thread);
			if (!prepared.valid) return false;
			const record = prepared.local.bound;
			if (!record.active) return fail(domain, prepared.thread, "invalidOperation");
			Object.assign(record, { active: false, paused: false });
			trace(runtimeState, prepared.context, "end-transform-feedback", { transformFeedback: record.handle });
			return true;
		},
		generate(count, thread) {
			const prepared = prepare(domain, contexts, thread);
			if (!prepared.valid) return Object.freeze({ names: [], success: false });
			const names = [];
			for (let index = 0; index < count; index += 1) {
				const handle = prepared.local.next++;
				prepared.local.records.set(handle, record(handle, false));
				names.push(handle);
				trace(runtimeState, prepared.context, "create-transform-feedback", { transformFeedback: handle });
			}
			return Object.freeze({ names: Object.freeze(names), success: true });
		},
		is(handleValue, thread) {
			const prepared = prepare(domain, contexts, thread);
			return prepared.valid && Boolean(prepared.local.records.get(Number(handleValue))?.created);
		},
		pause(thread) { return setPaused(runtimeState, domain, contexts, thread, true); },
		resume(thread) { return setPaused(runtimeState, domain, contexts, thread, false); }
	});
}

function prepare(domain, contexts, thread) { const query = domain.prepare(thread); return { ...query, local: query.valid ? local(contexts, query.context) : null }; }
function local(contexts, context) { const key = BigInt(context).toString(); if (!contexts.has(key)) { const zero = record(0, true); contexts.set(key, { bound: zero, defaultObject: zero, next: 1, records: new Map() }); } return contexts.get(key); }
function record(handle, created) { return { active: false, created, handle, mode: 0, paused: false }; }
function setPaused(runtimeState, domain, contexts, thread, paused) { const prepared = prepare(domain, contexts, thread); if (!prepared.valid) return false; const recordValue = prepared.local.bound; if (!recordValue.active || recordValue.paused === paused) return fail(domain, prepared.thread, "invalidOperation"); recordValue.paused = paused; trace(runtimeState, prepared.context, paused ? "pause-transform-feedback" : "resume-transform-feedback", { transformFeedback: recordValue.handle }); return true; }
function fail(domain, thread, kind) { domain[kind](thread); return false; }
function trace(runtimeState, context, kind, payload) { runtimeState.nativeGraphicsTrace?.gles(Object.freeze({ context: BigInt(context).toString(), kind, ...payload })); }
