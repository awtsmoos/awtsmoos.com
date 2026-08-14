// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos binds hidden shader words to visible light, translating one honest source for both generations of the WebGL vessel.

export class WebGlProgram {
	constructor(gl, vertexSource, fragmentSource) {
		this.gl = gl;
		this.isWebGl2 = typeof WebGL2RenderingContext !== "undefined"
			&& gl instanceof WebGL2RenderingContext;
		this.attributeLocations = new Map();
		this.uniformLocations = new Map();
		this.program = this.createProgram(vertexSource, fragmentSource);
	}

	createShader(type, source) {
		const shader = this.gl.createShader(type);
		const preparedSource = this.prepareSource(type, source);
		this.gl.shaderSource(shader, preparedSource);
		this.gl.compileShader(shader);

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			const compilerLog = this.gl.getShaderInfoLog(shader) || "Unknown shader error";
			this.gl.deleteShader(shader);
			throw new Error(`Shader compilation failed: ${compilerLog}`);
		}

		return shader;
	}

	createProgram(vertexSource, fragmentSource) {
		const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
		const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
		const program = this.gl.createProgram();
		this.gl.attachShader(program, vertexShader);
		this.gl.attachShader(program, fragmentShader);
		this.gl.linkProgram(program);
		this.gl.deleteShader(vertexShader);
		this.gl.deleteShader(fragmentShader);

		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			const linkerLog = this.gl.getProgramInfoLog(program) || "Unknown linking error";
			this.gl.deleteProgram(program);
			throw new Error(`Shader linking failed: ${linkerLog}`);
		}

		return program;
	}

	prepareSource(type, source) {
		if (!this.isWebGl2) {
			return source;
		}

		if (type === this.gl.VERTEX_SHADER) {
			return `#version 300 es\n${source}`
				.replace(/\battribute\b/g, "in")
				.replace(/\bvarying\b/g, "out");
		}

		return `#version 300 es\n${source}`
			.replace(/\bvarying\b/g, "in")
			.replace(/\btexture2D\b/g, "texture")
			.replace("precision mediump float;", "precision mediump float;\nout vec4 awtsmoosColor;")
			.replace(/\bgl_FragColor\b/g, "awtsmoosColor");
	}

	use() {
		this.gl.useProgram(this.program);
	}

	attribute(name) {
		if (!this.attributeLocations.has(name)) {
			this.attributeLocations.set(name, this.gl.getAttribLocation(this.program, name));
		}

		return this.attributeLocations.get(name);
	}

	uniform(name) {
		if (!this.uniformLocations.has(name)) {
			this.uniformLocations.set(name, this.gl.getUniformLocation(this.program, name));
		}

		return this.uniformLocations.get(name);
	}

	dispose() {
		this.gl.deleteProgram(this.program);
		this.attributeLocations.clear();
		this.uniformLocations.clear();
	}
}
