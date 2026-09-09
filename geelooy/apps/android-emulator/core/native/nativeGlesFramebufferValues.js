//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_GLES_FRAMEBUFFER = 0x8d40;
export const NATIVE_GLES_READ_FRAMEBUFFER = 0x8ca8;
export const NATIVE_GLES_DRAW_FRAMEBUFFER = 0x8ca9;
export const NATIVE_GLES_RENDERBUFFER = 0x8d41;
export const NATIVE_GLES_FRAMEBUFFER_COMPLETE = 0x8cd5;
export const NATIVE_GLES_FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 0x8cd6;
export const NATIVE_GLES_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8cd7;
export const NATIVE_GLES_DEPTH_ATTACHMENT = 0x8d00;
export const NATIVE_GLES_STENCIL_ATTACHMENT = 0x8d20;
export const NATIVE_GLES_DEPTH_STENCIL_ATTACHMENT = 0x821a;
export const NATIVE_GLES_COLOR_ATTACHMENT0 = 0x8ce0;

const FRAMEBUFFER_TARGETS = new Set([NATIVE_GLES_FRAMEBUFFER, NATIVE_GLES_READ_FRAMEBUFFER, NATIVE_GLES_DRAW_FRAMEBUFFER]);

/** Returns whether a GLenum can select a framebuffer binding in GLES 3.x. */
export function isNativeGlesFramebufferTarget(value) {
	return FRAMEBUFFER_TARGETS.has(Number(value));
}

/** Returns whether one enum is a core depth/stencil or one of sixteen minimum color attachments. */
export function isNativeGlesFramebufferAttachment(value) {
	const attachment = Number(value);
	if ([NATIVE_GLES_DEPTH_ATTACHMENT, NATIVE_GLES_STENCIL_ATTACHMENT, NATIVE_GLES_DEPTH_STENCIL_ATTACHMENT].includes(attachment)) return true;
	return attachment >= NATIVE_GLES_COLOR_ATTACHMENT0 && attachment < NATIVE_GLES_COLOR_ATTACHMENT0 + 16;
}
