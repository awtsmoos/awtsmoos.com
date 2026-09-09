//B"H
//Boruch Hashem
//Blessed is He

import { getWebGlGlesFramebufferReplayState } from "./webglGlesFramebufferReplayState.js";

const KINDS = new Set(["bind-framebuffer", "bind-renderbuffer", "create-framebuffer", "create-renderbuffer", "delete-framebuffer", "delete-renderbuffer", "framebuffer-renderbuffer", "framebuffer-status", "framebuffer-texture2d", "renderbuffer-storage"]);

/**
 * Replays guest FBO/RBO lifecycle, storage, and attachments onto genuine WebGL2 containers.
 * The Awtsmoos preserves native guest completeness decisions while Awtsmoos.com records host
 * status diagnostically and never hands browser objects back into guest address space.
 */
export function replayWebGlGlesFramebuffer(gl, state, operation) {
	if (!KINDS.has(operation?.kind)) return result(false, false);
	if (!state || typeof state !== "object") return result(false, true);
	const containers = getWebGlGlesFramebufferReplayState(state, gl);
	const handlers = {
		"bind-framebuffer": () => bindFramebuffer(gl, containers, operation),
		"bind-renderbuffer": () => bindRenderbuffer(gl, containers, operation),
		"create-framebuffer": () => Boolean(containers.createFramebuffer(operation.framebuffer)),
		"create-renderbuffer": () => Boolean(containers.createRenderbuffer(operation.renderbuffer)),
		"delete-framebuffer": () => containers.deleteFramebuffer(operation.framebuffer),
		"delete-renderbuffer": () => containers.deleteRenderbuffer(operation.renderbuffer),
		"framebuffer-renderbuffer": () => attachRenderbuffer(gl, containers, operation),
		"framebuffer-status": () => checkStatus(gl, state, operation),
		"framebuffer-texture2d": () => attachTexture(gl, state, operation),
		"renderbuffer-storage": () => storeRenderbuffer(gl, operation)
	};
	return result(Boolean(handlers[operation.kind]()), true);
}

/** Resolves zero to the default framebuffer and binds one mapped FBO. */
function bindFramebuffer(gl, containers, operation) {
	const object = mapped(containers.framebuffer, operation.framebuffer);
	if (object === undefined) return false;
	gl.bindFramebuffer(Number(operation.target), object);
	return true;
}

/** Resolves zero to null and binds one mapped renderbuffer object. */
function bindRenderbuffer(gl, containers, operation) {
	const object = mapped(containers.renderbuffer, operation.renderbuffer);
	if (object === undefined) return false;
	gl.bindRenderbuffer(Number(operation.target), object);
	return true;
}

/** Allocates single- or multisample renderbuffer storage through genuine WebGL2 methods. */
function storeRenderbuffer(gl, operation) {
	const method = Number(operation.samples) > 0 ? "renderbufferStorageMultisample" : "renderbufferStorage";
	if (typeof gl[method] !== "function") return false;
	const args = [Number(operation.target)];
	if (Number(operation.samples) > 0) args.push(Number(operation.samples));
	args.push(Number(operation.internalFormat), Number(operation.width), Number(operation.height));
	gl[method](...args);
	return true;
}

/** Attaches one mapped renderbuffer object to the currently bound WebGL framebuffer. */
function attachRenderbuffer(gl, containers, operation) {
	const object = mapped(containers.renderbuffer, operation.renderbuffer);
	if (object === undefined) return false;
	gl.framebufferRenderbuffer(Number(operation.target), Number(operation.attachment), Number(operation.renderbufferTarget), object);
	return true;
}

/** Attaches one mapped texture or returns truthful failure for unsupported multisample paths. */
function attachTexture(gl, state, operation) {
	const texture = mapped(state.texture, operation.texture);
	if (texture === undefined || Number(operation.samples) > 0) return false;
	gl.framebufferTexture2D(Number(operation.target), Number(operation.attachment), Number(operation.textureTarget), texture, Number(operation.level));
	return true;
}

/** Calls host completeness for diagnostics while native guest status remains authoritative. */
function checkStatus(gl, state, operation) {
	if (typeof gl.checkFramebufferStatus !== "function") return false;
	const hostStatus = Number(gl.checkFramebufferStatus(Number(operation.target)));
	state.record?.({ guestStatus: Number(operation.status), hostStatus, kind: "framebuffer-status" });
	return true;
}

/** Maps guest zero to null, unknown nonzero handles to undefined, and known handles to objects. */
function mapped(resolve, handleValue) {
	const handle = Number(handleValue);
	if (handle === 0) return null;
	return resolve(handle) || undefined;
}

/** Produces the frozen replay result contract shared by browser GLES routes. */
function result(applied, handled) { return Object.freeze({ applied: Boolean(applied), handled: Boolean(handled) }); }
