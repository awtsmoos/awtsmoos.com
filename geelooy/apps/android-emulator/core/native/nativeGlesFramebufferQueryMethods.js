//B"H
//Boruch Hashem
//Blessed be He

import { currentNativeGlesFramebuffer } from "./nativeGlesFramebufferObjectOps.js";
import { isNativeGlesFramebufferAttachment, isNativeGlesFramebufferTarget, NATIVE_GLES_RENDERBUFFER } from "./nativeGlesFramebufferValues.js";

/** Adds read-only framebuffer/renderbuffer lookups to the shared context ledger. */
export function createNativeGlesFramebufferQueryMethods(domain, contexts) {
	return Object.freeze({
		attachment(targetValue, attachmentValue, thread) {
			const query = domain.prepare(thread);
			if (!query.valid) return failed(query.context);
			if (!isNativeGlesFramebufferTarget(targetValue)
				|| !isNativeGlesFramebufferAttachment(attachmentValue)) {
				domain.invalidEnum(query.thread);
				return failed(query.context);
			}
			const framebuffer = currentNativeGlesFramebuffer(contexts, query.context, targetValue);
			if (!framebuffer) {
				domain.invalidOperation(query.thread);
				return failed(query.context);
			}
			return Object.freeze({
				context: query.context,
				record: framebuffer.attachments.get(Number(attachmentValue)) || null,
				success: true
			});
		},
		renderbuffer(targetValue, thread) {
			const query = domain.prepare(thread);
			if (!query.valid) return failed(query.context);
			if (Number(targetValue) !== NATIVE_GLES_RENDERBUFFER) {
				domain.invalidEnum(query.thread);
				return failed(query.context);
			}
			const record = contexts.get(query.context).renderbuffer;
			if (!record) {
				domain.invalidOperation(query.thread);
				return failed(query.context);
			}
			return Object.freeze({ context: query.context, record, success: true });
		}
	});
}

/** Returns one immutable failed lookup shape. */
function failed(context) {
	return Object.freeze({ context, record: null, success: false });
}
