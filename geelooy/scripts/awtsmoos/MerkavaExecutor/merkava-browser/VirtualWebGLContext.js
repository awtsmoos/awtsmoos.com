//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === 'object' && module.exports) {
		const modules = Object.assign(
			{},
			require('./VirtualWebGLConstantsCore.js'),
			require('./VirtualWebGLConstantsTexture.js'),
			require('./VirtualWebGLConstants2.js'),
			require('./VirtualWebGLBufferApi.js'),
			require('./VirtualWebGLProgramApi.js'),
			require('./VirtualWebGLUniformApi.js'),
			require('./VirtualWebGLTextureApi.js'),
			require('./VirtualWebGLFramebufferApi.js'),
			require('./VirtualWebGLStateApi.js'),
			require('./VirtualWebGL2Api.js'),
			require('./VirtualWebGLParameters.js'),
			require('./VirtualWebGLExtensions.js')
		);
		module.exports = factory(require('./VirtualWebGLTextureArena.js'), modules);
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(root.Merkava, root.Merkava));
	}
})(typeof self !== 'undefined' ? self : this, function(arenaMod, modules) {
	const VirtualWebGLTextureArena = arenaMod.VirtualWebGLTextureArena;

	/**
	 * Retained WebGL 1/2 semantic context shared by browser simulation and native
	 * lowering. The class owns identity, error ordering, context loss, default
	 * state, and command journaling while focused modules own API families.
	 */
	class VirtualWebGLContext {
		constructor(canvas, arena = new VirtualWebGLTextureArena(), options = {}) {
			this.canvas = canvas;
			this.arena = arena;
			this.commands = [];
			this.objects = [];
			this.errorQueue = [];
			this.currentProgram = null;
			this.enabledCaps = new Set();
			this.boundBuffers = new Map();
			this.boundTextures = new Map();
			this.boundFramebuffers = new Map();
			this.boundSamplers = new Map();
			this.activeQueries = new Map();
			this.pixelStore = new Map();
			this.contextVersion = Number(options.version || 1);
			modules.installCoreWebGLConstants(this);
			modules.installTextureWebGLConstants(this);
			modules.installWebGL2Constants(this);
			this.activeTextureValue = this.TEXTURE0;
			this.activeTextureUnit = 0;
			this.viewportValue = [0, 0, canvas.width || 0, canvas.height || 0];
			this.scissorValue = this.viewportValue.slice();
			this.clearColorValue = [0, 0, 0, 0];
			this.colorMaskValue = [true, true, true, true];
			this.depthMaskValue = true;
			this.depthFuncValue = this.LEQUAL;
			this.texture = canvas.__webglCanvasTexture || arena.createTexture(
				'canvas-webgl', canvas, canvas.width || 0, canvas.height || 0
			);
			canvas.__webglCanvasTexture = this.texture;
		}
		record(op, data = {}) {
			const entry = { op, ...data };
			this.commands.push(entry);
			this.arena.record(this.texture, `webgl.${op}`, data);
			return entry;
		}
		object(kind, extra = {}) {
			const item = { kind, id: this.objects.length, ...extra };
			this.objects.push(item);
			return item;
		}

		validObject(value, kind) {
			return !!value && value.kind === kind && !value.deleted && this.objects.includes(value);
		}

		pushError(code) {
			if (code && !this.errorQueue.includes(code)) this.errorQueue.push(code);
		}

		invalid(code, op, data = {}) {
			this.pushError(code);
			this.record(op, { ...data, error: code, invalid: true });
			return null;
		}

		recordUniform(op, location, value, extra = {}) {
			if (!location) return;
			if (location.program !== this.currentProgram?.id) return this.invalid(this.INVALID_OPERATION, op);
			this.record(op, { location, value: Array.from(value || []), ...extra });
		}

		getError() { return this.errorQueue.shift() || this.NO_ERROR; }
		getContextAttributes() { return { ...this.contextAttributes }; }
		isContextLost() { return !!this.contextLost; }
		loseContext() { this.contextLost = true; this.pushError(this.CONTEXT_LOST_WEBGL); this.record('contextLost'); }
		restoreContext() { this.contextLost = false; this.record('contextRestored'); }
		snapshot() { return { commands: this.commands, objects: this.objects.length, errors: this.errorQueue.slice(), viewport: this.viewportValue.slice() }; }
	}

	VirtualWebGLContext.prototype.contextAttributes = Object.freeze({
		alpha: true, antialias: true, depth: true, premultipliedAlpha: true,
		preserveDrawingBuffer: false, powerPreference: 'default', stencil: false
	});
	for (const installer of [
		modules.installWebGLBufferApi, modules.installWebGLProgramApi,
		modules.installWebGLUniformApi, modules.installWebGLTextureApi,
		modules.installWebGLFramebufferApi, modules.installWebGLStateApi,
		modules.installWebGL2Api, modules.installWebGLParameters,
		modules.installWebGLExtensions
	]) installer(VirtualWebGLContext);
	return { VirtualWebGLContext };
});
