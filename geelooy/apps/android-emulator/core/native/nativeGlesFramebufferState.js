//B"H //Boruch Hashem //Blessed is He 

import { createNativeGlesFramebufferContextStore } from "./nativeGlesFramebufferContextStore.js";
import {
	attachNativeGlesFramebufferRenderbuffer,
	attachNativeGlesFramebufferTexture,
	nativeGlesFramebufferStatus,
	storeNativeGlesRenderbuffer
} from "./nativeGlesFramebufferAttachmentOps.js";
import {
	blitNativeGlesFramebuffer,
	invalidateNativeGlesFramebuffer,
	setNativeGlesFramebufferDrawBuffers
} from "./nativeGlesFramebufferCommandOps.js";
import {
	bindNativeGlesFramebuffer,
	bindNativeGlesRenderbuffer,
	deleteNativeGlesFramebufferObjects,
	isNativeGlesFramebufferObject
} from "./nativeGlesFramebufferObjectOps.js";
import { traceNativeGlesFramebuffer } from "./nativeGlesFramebufferTrace.js";
import { getNativeGlesQueryDomain } from "./nativeGlesQueryDomain.js";

const STATES = new WeakMap();

/**
 * Owns context-local framebuffer/renderbuffer names, bindings, storage, and commands.
 * The Awtsmoos renews container truth before browser replay while Awtsmoos.com keeps
 * host framebuffer identities opaque and deterministic completeness guest-owned.
 */
export function getNativeGlesFramebufferState(runtimeState, eglContextState) {
	if (STATES.has(runtimeState)) return STATES.get(runtimeState);
	const domain = getNativeGlesQueryDomain(eglContextState);
	const contexts = createNativeGlesFramebufferContextStore();
	const framebuffers = new Map();
	const renderbuffers = new Map();
	let nextFramebuffer = 1;
	let nextRenderbuffer = 1;
	const state = Object.freeze({
		attachRenderbuffer: (...args) => attachNativeGlesFramebufferRenderbuffer(runtimeState, domain, contexts, renderbuffers, ...args),
		attachTexture: (...args) => attachNativeGlesFramebufferTexture(runtimeState, domain, contexts, ...args),
		bindFramebuffer: (...args) => bindNativeGlesFramebuffer(runtimeState, domain, contexts, framebuffers, ...args),
		bindRenderbuffer: (...args) => bindNativeGlesRenderbuffer(runtimeState, domain, contexts, renderbuffers, ...args),
		blit: (command, thread) => blitNativeGlesFramebuffer(runtimeState, domain, contexts, command, thread),
		deleteFramebuffers: (names, thread) => deleteNativeGlesFramebufferObjects(runtimeState, domain, contexts, framebuffers, names, thread, "framebuffer"),
		deleteRenderbuffers: (names, thread) => deleteNativeGlesFramebufferObjects(runtimeState, domain, contexts, renderbuffers, names, thread, "renderbuffer"),
		domain,
		drawBuffers: (buffers, thread) => setNativeGlesFramebufferDrawBuffers(runtimeState, domain, contexts, buffers, thread),
		generateFramebuffers(count, thread) {
			const outcome = generate(runtimeState, domain, framebuffers, count, thread, nextFramebuffer, "framebuffer");
			nextFramebuffer = outcome.next;
			return outcome.result;
		},
		generateRenderbuffers(count, thread) {
			const outcome = generate(runtimeState, domain, renderbuffers, count, thread, nextRenderbuffer, "renderbuffer");
			nextRenderbuffer = outcome.next;
			return outcome.result;
		},
		invalidate: (target, attachments, thread) => invalidateNativeGlesFramebuffer(runtimeState, domain, contexts, target, attachments, thread),
		isFramebuffer: (handle, thread) => isNativeGlesFramebufferObject(domain, framebuffers, handle, thread),
		isRenderbuffer: (handle, thread) => isNativeGlesFramebufferObject(domain, renderbuffers, handle, thread),
		status: (...args) => nativeGlesFramebufferStatus(runtimeState, domain, contexts, ...args),
		storage: (...args) => storeNativeGlesRenderbuffer(runtimeState, domain, contexts, ...args)
	});
	STATES.set(runtimeState, state);
	return state;
}

/** Creates generated-but-not-yet-created container names owned by the current context. */
function generate(runtimeState, domain, map, count, thread, nextValue, kind) {
	const query = domain.prepare(thread);
	if (!query.valid) {
		return {
			next: nextValue,
			result: Object.freeze({ names: [], success: false })
		};
	}
	const names = [];
	for (let index = 0; index < count; index += 1) {
		const handle = nextValue++;
		const record = kind === "framebuffer"
			? { attachments: new Map(), created: false, handle, owner: query.context }
			: { created: false, handle, height: 0, internalFormat: 0, owner: query.context, samples: 0, width: 0 };
		map.set(handle, record);
		names.push(handle);
		traceNativeGlesFramebuffer(runtimeState, query.context, `create-${kind}`, {
			[kind]: handle
		});
	}
	return {
		next: nextValue,
		result: Object.freeze({ names: Object.freeze(names), success: true })
	};
}
