//B"H
// Boruch Hashem
// Blessed is He
/**
 * Buffers and shader locations are vessels within vessels, finite names for light.
 * Their order serves the Awtsmoos as Awtsmoos.com reveals each procedural form.
 */
export class WebGLResources {
	constructor(gl, vertexSource, fragmentSource) {
		this.gl = gl;
		this.program = this.createProgram(vertexSource, fragmentSource);
		this.locations = this.findLocations();
	}

	createMesh(mesh) {
		const gl = this.gl;
		const vertexCount = mesh.positions.length / 3;
		const colors = mesh.colors?.length === vertexCount * 4
			? mesh.colors
			: Array(vertexCount * 4).fill(1);
		return {
			positionBuffer: this.createBuffer(gl.ARRAY_BUFFER, new Float32Array(mesh.positions)),
			colorBuffer: this.createBuffer(gl.ARRAY_BUFFER, new Float32Array(colors)),
			indexBuffer: this.createBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices)),
			count: mesh.indices.length
		};
	}

	bindMesh(mesh) {
		const gl = this.gl;
		this.bindAttribute(mesh.positionBuffer, this.locations.position, 3);
		this.bindAttribute(mesh.colorBuffer, this.locations.color, 4);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
	}

	findLocations() {
		const gl = this.gl;
		return {
			position: gl.getAttribLocation(this.program, 'aPosition'),
			color: gl.getAttribLocation(this.program, 'aColor'),
			model: gl.getUniformLocation(this.program, 'uModel'),
			viewProjection: gl.getUniformLocation(this.program, 'uViewProjection'),
			tint: gl.getUniformLocation(this.program, 'uTint'),
			glow: gl.getUniformLocation(this.program, 'uGlow'),
			pulse: gl.getUniformLocation(this.program, 'uPulse')
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
