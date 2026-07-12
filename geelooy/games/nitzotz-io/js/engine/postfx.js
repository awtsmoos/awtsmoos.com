// B"H

/**
 * Chapter XII — The frame enters a temporary vessel, then returns as one image.
 * Allocation happens only on resize, never during the animation heartbeat.
 */
export function createPostFX(gl) {
	let framebuffer = null;
	let texture = null;
	let depth = null;
	let width = 0;
	let height = 0;
	let enabled = false;

	function resize(nextWidth, nextHeight, requested) {
		width = nextWidth;
		height = nextHeight;
		enabled = Boolean(requested);
		if (!enabled) return;
		ensureResources();
		configureTexture();
		configureDepth();
		attachFramebuffer();
	}

	function ensureResources() {
		framebuffer ||= gl.createFramebuffer();
		texture ||= gl.createTexture();
		depth ||= gl.createRenderbuffer();
	}

	function configureTexture() {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}

	function configureDepth() {
		gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
	}

	function attachFramebuffer() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
		enabled = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	return {
		resize,
		begin() {
			gl.bindFramebuffer(gl.FRAMEBUFFER, enabled ? framebuffer : null);
			return enabled;
		},
		end() {
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			return enabled ? texture : null;
		},
		get enabled() {
			return enabled;
		},
		get size() {
			return [width, height];
		}
	};
}
