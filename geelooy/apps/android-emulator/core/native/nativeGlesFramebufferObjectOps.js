//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_GLES_FRAMEBUFFER, NATIVE_GLES_READ_FRAMEBUFFER, NATIVE_GLES_RENDERBUFFER, isNativeGlesFramebufferTarget } from "./nativeGlesFramebufferValues.js";
import { traceNativeGlesFramebuffer } from "./nativeGlesFramebufferTrace.js";

/** Binds a generated framebuffer name to read, draw, or both context-local targets. */
export function bindNativeGlesFramebuffer(runtimeState, domain, contexts, framebuffers, targetValue, handleValue, thread) {
	const query = domain.prepare(thread);
	if (!query.valid) return false;
	const target = Number(targetValue);
	if (!isNativeGlesFramebufferTarget(target)) return fail(domain, query.thread, "invalidEnum");
	const record = resolveOwned(framebuffers, handleValue, query.context);
	if (Number(handleValue) !== 0 && !record) return fail(domain, query.thread, "invalidOperation");
	if (record) record.created = true;
	bindTarget(contexts.get(query.context), target, record);
	traceNativeGlesFramebuffer(runtimeState, query.context, "bind-framebuffer", { framebuffer: record?.handle || 0, target });
	return true;
}

/** Binds one generated renderbuffer object to the context's sole renderbuffer target. */
export function bindNativeGlesRenderbuffer(runtimeState, domain, contexts, renderbuffers, targetValue, handleValue, thread) {
	const query = domain.prepare(thread);
	if (!query.valid) return false;
	const target = Number(targetValue);
	if (target !== NATIVE_GLES_RENDERBUFFER) return fail(domain, query.thread, "invalidEnum");
	const record = resolveOwned(renderbuffers, handleValue, query.context);
	if (Number(handleValue) !== 0 && !record) return fail(domain, query.thread, "invalidOperation");
	if (record) record.created = true;
	contexts.get(query.context).renderbuffer = record;
	traceNativeGlesFramebuffer(runtimeState, query.context, "bind-renderbuffer", { renderbuffer: record?.handle || 0, target });
	return true;
}

/** Deletes owned names and resets every current binding referencing those objects. */
export function deleteNativeGlesFramebufferObjects(runtimeState, domain, contexts, map, names, thread, kind) {
	const query = domain.prepare(thread);
	if (!query.valid) return false;
	const local = contexts.get(query.context);
	for (const raw of names) {
		const record = resolveOwned(map, raw, query.context);
		if (!record) continue;
		map.delete(record.handle);
		if (kind === "framebuffer") {
			if (local.draw === record) local.draw = null;
			if (local.read === record) local.read = null;
		} else if (local.renderbuffer === record) local.renderbuffer = null;
		traceNativeGlesFramebuffer(runtimeState, query.context, `delete-${kind}`, { [kind]: record.handle });
	}
	return true;
}

/** Reports GL_TRUE only after a generated owned name has actually been bound/created. */
export function isNativeGlesFramebufferObject(domain, map, handleValue, thread) {
	const query = domain.prepare(thread);
	if (!query.valid) return false;
	return Boolean(resolveOwned(map, handleValue, query.context)?.created);
}

/** Resolves the framebuffer selected by one target from context-local read/draw state. */
export function currentNativeGlesFramebuffer(contexts, contextValue, targetValue) {
	const local = contexts.get(contextValue);
	return Number(targetValue) === NATIVE_GLES_READ_FRAMEBUFFER ? local.read : local.draw;
}

/** Resolves a nonzero object only when it belongs to the current context. */
export function resolveOwned(map, handleValue, contextValue) {
	const handle = Number(handleValue);
	if (handle === 0) return null;
	const record = map.get(handle);
	return record && BigInt(record.owner) === BigInt(contextValue) ? record : null;
}

/** Applies GL_FRAMEBUFFER aliasing while preserving later read/draw divergence. */
function bindTarget(local, target, record) {
	if (target === NATIVE_GLES_FRAMEBUFFER) { local.draw = record; local.read = record; }
	else if (target === NATIVE_GLES_READ_FRAMEBUFFER) local.read = record;
	else local.draw = record;
}

/** Sets one first-error and returns false to keep object-operation callers concise. */
function fail(domain, thread, kind) { domain[kind](thread); return false; }
