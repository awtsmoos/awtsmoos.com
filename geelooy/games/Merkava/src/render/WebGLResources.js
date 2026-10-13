//B"H
// Boruch Hashem
// Blessed is He
/**
 * Buffers and shader locations are vessels within vessels, finite names for light.
 * Their order serves the Awtsmoos as Awtsmoos.com reveals each procedural form.
 *
 * B"H — Yaakov 2026-10-13: meshes may carry UVs (aUV) and named textures.
 * Textures load async from Awtsmoos Drive; textureFor() returns the GL
 * texture only when fully ready, so draws fall back to flat color safely.
 */
export class WebGLResources {
	constructor(gl, vertexSource, fragmentSource) {
		this.gl = gl;
		this.program = this.createProgram(vertexSource, fragmentSource);
		this.locations = this.findLocations();
		this.textures = new Map();
	}

	createMesh(mesh) {
		const gl = this.gl;
		const vertexCount = mesh.positions.length / 3;
		const colors = mesh.colors?.length === vertexCount * 4
			? mesh.colors
			: Array(vertexCount * 4).fill(1);
		const uvs = mesh.uvs?.length === vertexCount * 2
			? mesh.uvs
			: new Array(vertexCount * 2).fill(0);
		return {
			positionBuffer: this.createBuffer(gl.ARRAY_BUFFER, new Float32Array(mesh.positions)),
			colorBuffer: this.createBuffer(gl.ARRAY_BUFFER, new Float32Array(colors)),
			uvBuffer: this.createBuffer(gl.ARRAY_BUFFER, new Float32Array(uvs)),
			indexBuffer: this.createBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices)),
			count: mesh.indices.length
		};
	}

	bindMesh(mesh) {
		const gl = this.gl;
		this.bindAttribute(mesh.positionBuffer, this.locations.position, 3);
		this.bindAttribute(mesh.colorBuffer, this.locations.color, 4);
		this.bindAttribute(mesh.uvBuffer, this.locations.uv, 2);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
	}

	/**
	 * Begins async loading of a texture under a mesh name. A 1x1 white
	 * placeholder keeps the pipeline valid; the entry flips ready on load.
	 * Failures resolve silently — the mesh keeps its flat vessel color.
	 */
	loadTexture(name, url) {
		if (this.textures.has(name)) {
			return;
		}
		const gl = this.gl;
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
			new Uint8Array([255, 255, 255, 255]));
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		const entry = { texture, ready: false };
		this.textures.set(name, entry);
		const image = new Image();
		image.crossOrigin = 'anonymous';
		image.onload = () => {
			try {
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
				gl.generateMipmap(gl.TEXTURE_2D);
				entry.ready = true;
			} catch (error) {
				entry.ready = false;
			}
		};
		image.onerror = () => {
			entry.ready = false;
		};
		image.src = url;
	}

	/**
	 * Returns the GL texture for a mesh name when fully loaded, else null.
	 */
	textureFor(name) {
		const entry = this.textures.get(name);
		return entry && entry.ready ? entry.texture : null;
	}

	findLocations() {
		const gl = this.gl;
		return {
			position: gl.getAttribLocation(this.program, 'aPosition'),
			color: gl.getAttribLocation(this.program, 'aColor'),
			uv: gl.getAttribLocation(this.program, 'aUV'),
			model: gl.getUniformLocation(this.program, 'uModel'),
			viewProjection: gl.getUniformLocation(this.program, 'uViewProjection'),
			tint: gl.getUniformLocation(this.program, 'uTint'),
			glow: gl.getUniformLocation(this.program, 'uGlow'),
			pulse: gl.getUniformLocation(this.program, 'uPulse'),
			texture: gl.getUniformLocation(this.program, 'uTexture'),
			useTexture: gl.getUniformLocation(this.program, 'uUseTexture')
		};
	}

	createProgram(vertexSource, fragmentSource) {
		const gl = this.gl;
		const program = gl.createProgram();
		gl.attachShader(program, this.compile(gl.VERTEX_SHADER, vertexSource));
		gl.attachShader(program, this.compile(gl.FRAGMENT_SHADER, fragmentSource));
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(`WebGL link failed: ${gl.getProgramInfoLog(program)}`);
		}
		return program;
	}

	compile(type, source) {
		const gl = this.gl;
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw new Error(`WebGL shader failed: ${gl.getShaderInfoLog(shader)}`);
		}
		return shader;
	}

	createBuffer(target, data) {
		const buffer = this.gl.createBuffer();
		this.gl.bindBuffer(target, buffer);
		this.gl.bufferData(target, data, this.gl.STATIC_DRAW);
		return buffer;
	}

	bindAttribute(buffer, location, size) {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.enableVertexAttribArray(location);
		this.gl.vertexAttribPointer(location, size, this.gl.FLOAT, false, 0, 0);
	}
}
