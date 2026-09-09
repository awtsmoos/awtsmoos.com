//B"H
//Boruch Hashem
//Blessed is He

import { currentNativeGlesFramebuffer, resolveOwned } from "./nativeGlesFramebufferObjectOps.js";
import { traceNativeGlesFramebuffer } from "./nativeGlesFramebufferTrace.js";
import { NATIVE_GLES_FRAMEBUFFER_COMPLETE, NATIVE_GLES_FRAMEBUFFER_INCOMPLETE_ATTACHMENT, NATIVE_GLES_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT, NATIVE_GLES_RENDERBUFFER, isNativeGlesFramebufferAttachment, isNativeGlesFramebufferTarget } from "./nativeGlesFramebufferValues.js";

const MAX_RENDERBUFFER_SIZE = 16384;

/** Stores one texture attachment record on the selected non-default framebuffer. */
export function attachNativeGlesFramebufferTexture(runtimeState, domain, contexts, target, attachment, textureTarget, texture, level, samples, thread) {
	const query = preparedFramebuffer(domain, contexts, target, attachment, thread);
	if (!query.valid) return false;
	if (Number(texture) === 0) query.framebuffer.attachments.delete(Number(attachment));
	else query.framebuffer.attachments.set(Number(attachment), Object.freeze({ handle: Number(texture), kind: "texture", level: Number(level), samples: Number(samples), target: Number(textureTarget) }));
	traceNativeGlesFramebuffer(runtimeState, query.context, "framebuffer-texture2d", { attachment: Number(attachment), framebuffer: query.framebuffer.handle, level: Number(level), samples: Number(samples), target: Number(target), texture: Number(texture), textureTarget: Number(textureTarget) });
	return true;
}

/** Stores one validated renderbuffer attachment reference on the selected framebuffer. */
export function attachNativeGlesFramebufferRenderbuffer(runtimeState, domain, contexts, renderbuffers, target, attachment, renderbufferTarget, renderbuffer, thread) {
	const query = preparedFramebuffer(domain, contexts, target, attachment, thread);
	if (!query.valid) return false;
	if (Number(renderbufferTarget) !== NATIVE_GLES_RENDERBUFFER) return fail(domain, query.thread, "invalidEnum");
	const record = resolveOwned(renderbuffers, renderbuffer, query.context);
	if (Number(renderbuffer) !== 0 && !record) return fail(domain, query.thread, "invalidOperation");
	if (record) query.framebuffer.attachments.set(Number(attachment), Object.freeze({ handle: record.handle, kind: "renderbuffer", record }));
	else query.framebuffer.attachments.delete(Number(attachment));
	traceNativeGlesFramebuffer(runtimeState, query.context, "framebuffer-renderbuffer", { attachment: Number(attachment), framebuffer: query.framebuffer.handle, renderbuffer: record?.handle || 0, renderbufferTarget: Number(renderbufferTarget), target: Number(target) });
	return true;
}

/** Allocates storage metadata on the currently bound renderbuffer with bounded dimensions. */
export function storeNativeGlesRenderbuffer(runtimeState, domain, contexts, targetValue, internalFormat, widthValue, heightValue, samplesValue, thread) {
	const query = domain.prepare(thread);
	if (!query.valid) return false;
	if (Number(targetValue) !== NATIVE_GLES_RENDERBUFFER) return fail(domain, query.thread, "invalidEnum");
	const width = Number(widthValue);
	const height = Number(heightValue);
	const samples = Number(samplesValue);
	if (![width, height, samples].every(Number.isInteger) || width < 0 || height < 0 || samples < 0 || width > MAX_RENDERBUFFER_SIZE || height > MAX_RENDERBUFFER_SIZE) return fail(domain, query.thread, "invalidValue");
	const record = contexts.get(query.context).renderbuffer;
	if (!record) return fail(domain, query.thread, "invalidOperation");
	Object.assign(record, { height, internalFormat: Number(internalFormat), samples, width });
	traceNativeGlesFramebuffer(runtimeState, query.context, "renderbuffer-storage", { height, internalFormat: Number(internalFormat), renderbuffer: record.handle, samples, target: Number(targetValue), width });
	return true;
}

/** Returns deterministic guest completeness for default, empty, and attached framebuffer states. */
export function nativeGlesFramebufferStatus(runtimeState, domain, contexts, targetValue, thread) {
	const query = domain.prepare(thread);
	if (!query.valid) return 0;
	const target = Number(targetValue);
	if (!isNativeGlesFramebufferTarget(target)) { domain.invalidEnum(query.thread); return 0; }
	const framebuffer = currentNativeGlesFramebuffer(contexts, query.context, target);
	let status = NATIVE_GLES_FRAMEBUFFER_COMPLETE;
	if (framebuffer && framebuffer.attachments.size === 0) status = NATIVE_GLES_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT;
	if (framebuffer && [...framebuffer.attachments.values()].some(incompleteAttachment)) status = NATIVE_GLES_FRAMEBUFFER_INCOMPLETE_ATTACHMENT;
	traceNativeGlesFramebuffer(runtimeState, query.context, "framebuffer-status", { framebuffer: framebuffer?.handle || 0, status, target });
	return status;
}

/** Prepares one non-default framebuffer attachment mutation and validates its enums. */
function preparedFramebuffer(domain, contexts, targetValue, attachmentValue, thread) {
	const query = domain.prepare(thread);
	if (!query.valid) return { ...query, framebuffer: null };
	const target = Number(targetValue);
	if (!isNativeGlesFramebufferTarget(target)) return failed(domain, query, "invalidEnum");
	if (!isNativeGlesFramebufferAttachment(attachmentValue)) return failed(domain, query, "invalidEnum");
	const framebuffer = currentNativeGlesFramebuffer(contexts, query.context, target);
	if (!framebuffer) return failed(domain, query, "invalidOperation");
	return { ...query, framebuffer };
}

/** Marks a renderbuffer attachment incomplete until nonzero storage has been allocated. */
function incompleteAttachment(attachment) { return attachment.kind === "renderbuffer" && (!attachment.record.width || !attachment.record.height); }

/** Converts preparation failure into the same shaped result used by successful preparation. */
function failed(domain, query, kind) { domain[kind](query.thread); return { ...query, framebuffer: null, valid: false }; }

/** Sets one GLES first-error and returns false for concise attachment validation. */
function fail(domain, thread, kind) { domain[kind](thread); return false; }
