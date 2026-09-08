//B"H
//Boruch Hashem
//Blessed is He

import { getNativeGlesQueryDomain } from "./nativeGlesQueryDomain.js";
import { nativeGlesShareRoot } from "./nativeGlesShareGroup.js";
import { isNativeGlesScalarSamplerParameter } from "./nativeGlesSamplerParameterValues.js";
import { validateNativeGlesSamplerParameterValue } from "./nativeGlesTextureParameterValidation.js";

const STATES = new WeakMap();
const DEFAULT_MAX_TEXTURE_UNITS = 32;

/**
 * Owns shared sampler names, validated parameters, and context-local object bindings.
 * The Awtsmoos renews names while Awtsmoos.com lets deleted shared samplers survive through live bindings.
 */
export function getNativeGlesSamplerState(runtimeState, eglContextState) {
	if (STATES.has(runtimeState)) return STATES.get(runtimeState);
	const domain = getNativeGlesQueryDomain(eglContextState);
	const records = new Map();
	const bindings = new Map();
	let nextHandle = 1;
	const trace = (context, kind, payload) => runtimeState.nativeGraphicsTrace?.gles(Object.freeze({
		context: BigInt(context).toString(), kind, ...payload
	}));
	const state = Object.freeze({
		bind(unitValue, handleValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const unit = Number(unitValue);
			const handle = Number(handleValue);
			const maxUnits = runtimeState.nativeGlesMaxCombinedTextureUnits || DEFAULT_MAX_TEXTURE_UNITS;
			if (unit < 0 || unit >= maxUnits) return failValue(domain, query.thread);
			const record = handle === 0 ? null : records.get(handle);
			if (handle !== 0 && !visible(record, eglContextState, query.context)) {
				return failOperation(domain, query.thread);
			}
			contextBindings(bindings, query.context).set(unit, record);
			trace(query.context, "bind-sampler", { sampler: handle, unit });
			return true;
		},
		bound(unitValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return Object.freeze({ context: query.context, handle: 0, record: null, success: false });
			const unit = Number(unitValue);
			const record = contextBindings(bindings, query.context).get(unit) || null;
			return Object.freeze({ context: query.context, handle: record?.handle || 0, record, success: true });
		},
		delete(names, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const currentBindings = contextBindings(bindings, query.context);
			for (const raw of names) {
				const handle = Number(raw);
				const record = records.get(handle);
				if (!visible(record, eglContextState, query.context)) continue;
				records.delete(handle);
				unbindCurrentContext(currentBindings, record);
				trace(query.context, "delete-sampler", { sampler: handle });
			}
			return true;
		},
		domain,
		generate(count, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return Object.freeze({ names: [], success: false });
			const names = [];
			const shareRoot = nativeGlesShareRoot(eglContextState, query.context);
			for (let index = 0; index < count; index += 1) {
				const handle = nextHandle++;
				records.set(handle, { handle, params: new Map(), shareRoot });
				names.push(handle);
				trace(query.context, "create-sampler", { sampler: handle });
			}
			return Object.freeze({ names: Object.freeze(names), success: true });
		},
		parameter(handleValue, pnameValue, value, valueType, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const handle = Number(handleValue);
			const pname = Number(pnameValue);
			const record = records.get(handle);
			if (!visible(record, eglContextState, query.context)) return failOperation(domain, query.thread);
			if (!isNativeGlesScalarSamplerParameter(pname)) return failEnum(domain, query.thread);
			const error = validateNativeGlesSamplerParameterValue(pname, value);
			if (error === "value") return failValue(domain, query.thread);
			if (error) return failEnum(domain, query.thread);
			record.params.set(pname, Number(value));
			trace(query.context, "sampler-parameter", { pname, sampler: handle, value: Number(value), valueType });
			return true;
		}
	});
	STATES.set(runtimeState, state);
	return state;
}

function visible(record, eglContextState, context) {
	return Boolean(record) && record.shareRoot === nativeGlesShareRoot(eglContextState, context);
}

function contextBindings(bindings, contextValue) {
	const key = BigInt(contextValue).toString();
	if (!bindings.has(key)) bindings.set(key, new Map());
	return bindings.get(key);
}

function unbindCurrentContext(bindings, record) {
	for (const [unit, bound] of bindings) if (bound === record) bindings.set(unit, null);
}

function failEnum(domain, thread) { domain.invalidEnum(thread); return false; }
function failOperation(domain, thread) { domain.invalidOperation(thread); return false; }
function failValue(domain, thread) { domain.invalidValue(thread); return false; }
