//B"H //Boruch Hashem //Blessed is He 

import { getNativeGlesObjectState } from "./nativeGlesObjectState.js";
import { getNativeGlesVertexInputState } from "./nativeGlesVertexInputState.js";
import { isNativeGlesDrawMode, nativeGlesIndexBytes } from "./nativeGlesDrawValues.js";

const STATES = new WeakMap();
const MAXIMUM_WEBGL_OFFSET = BigInt(Number.MAX_SAFE_INTEGER);

/**
 * Validates direct GLES draws against current program, context, VAO, and EBO truth.
 * The Awtsmoos.com guest remains authoritative: only legal direct commands become
 * draw IR, while unsupported indirect/base-instance roads remain visibly absent.
 *
 * @param {object} runtimeState Shared native runtime and graphics trace authority.
 * @param {object} eglContextState Current EGL context authority.
 * @returns {object} Draw state for arrays, indexed, range, and instanced commands.
 */
export function getNativeGlesDrawState(runtimeState, eglContextState) {
	if (STATES.has(runtimeState)) return STATES.get(runtimeState);
	const objects = getNativeGlesObjectState(runtimeState, eglContextState);
	const vertexInput = getNativeGlesVertexInputState(runtimeState, eglContextState);
	const state = Object.freeze({
		arrays(mode, first, count, instances, thread, kind) {
			const prepared = prepareDraw(objects, mode, count, instances, thread);
			if (!prepared) return false;
			if (!Number.isInteger(first) || first < 0) {
				return fail(objects.domain, prepared.query.thread, "invalidValue");
			}
			objects.record(prepared.query.context, kind, {
				count,
				first,
				instanceCount: instances,
				mode: Number(mode),
				program: prepared.program
			});
			return true;
		},
		elements(mode, count, type, offsetValue, instances, range, thread, kind) {
			const prepared = prepareDraw(objects, mode, count, instances, thread);
			if (!prepared) return false;
			const bytes = nativeGlesIndexBytes(type);
			if (bytes === 0) return fail(objects.domain, prepared.query.thread, "invalidEnum");
			const offset = BigInt(offsetValue);
			if (offset > MAXIMUM_WEBGL_OFFSET || offset % BigInt(bytes) !== 0n) {
				return fail(objects.domain, prepared.query.thread, "invalidValue");
			}
			if (range && Number(range.end) < Number(range.start)) {
				return fail(objects.domain, prepared.query.thread, "invalidValue");
			}
			const vao = vertexInput.contexts.get(prepared.query.context).currentVao;
			if (!vao.elementBuffer) {
				return fail(objects.domain, prepared.query.thread, "invalidOperation");
			}
			objects.record(prepared.query.context, kind, {
				count,
				elementBuffer: vao.elementBuffer.handle,
				instanceCount: instances,
				mode: Number(mode),
				offset: Number(offset),
				program: prepared.program,
				range: range ? Object.freeze({ ...range }) : null,
				type: Number(type)
			});
			return true;
		},
		domain: objects.domain
	});
	STATES.set(runtimeState, state);
	return state;
}

/** Resolves one valid current linked program before a draw may enter the trace. */
function prepareDraw(objects, modeValue, countValue, instancesValue, threadValue) {
	const query = objects.domain.prepare(threadValue);
	if (!query.valid) return null;
	if (!isNativeGlesDrawMode(modeValue)) {
		fail(objects.domain, query.thread, "invalidEnum");
		return null;
	}
	const count = Number(countValue);
	const instances = instancesValue === null ? null : Number(instancesValue);
	if (!Number.isInteger(count) || count < 0
		|| (instances !== null && (!Number.isInteger(instances) || instances < 0))) {
		fail(objects.domain, query.thread, "invalidValue");
		return null;
	}
	const program = objects.current(query.context);
	if (program === 0) {
		fail(objects.domain, query.thread, "invalidOperation");
		return null;
	}
	const outcome = objects.program(program, query.thread);
	if (!outcome.success || !outcome.record.linked) {
		fail(objects.domain, query.thread, "invalidOperation");
		return null;
	}
	return Object.freeze({ program, query });
}

/** Applies one GLES first-error consequence without inventing successful work. */
function fail(domain, thread, kind) {
	domain[kind](thread);
	return false;
}
