//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const {
	VirtualWebGLContext
} = require('../VirtualWebGLContext.js');

/**
 * Exercises retained state, error ordering, shader/program truth, framebuffer
 * completeness, extension honesty, and core WebGL2 object families.
 */
function run() {
	const canvas = {
		height: 180,
		width: 320
	};
	const gl = new VirtualWebGLContext(canvas, undefined, {
		version: 2
	});
	gl.bindBuffer(0xdead, null);
	assert.equal(gl.getError(), gl.INVALID_ENUM);
	assert.equal(gl.getError(), gl.NO_ERROR);
	const badShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(badShader, 'attribute vec3 p;');
	gl.compileShader(badShader);
	assert.equal(gl.getShaderParameter(badShader, gl.COMPILE_STATUS), false);
	assert.match(gl.getShaderInfoLog(badShader), /missing void main/);
	const vertex = shader(gl, gl.VERTEX_SHADER, 'void main(){gl_Position=vec4(0.0);}');
	const fragment = shader(gl, gl.FRAGMENT_SHADER, 'void main(){ }');
	const program = gl.createProgram();
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	assert.equal(gl.getProgramParameter(program, gl.LINK_STATUS), true);
	gl.useProgram(program);
	assert.equal(gl.getParameter(gl.CURRENT_PROGRAM), program);
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	const framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	assert.equal(
		gl.checkFramebufferStatus(gl.FRAMEBUFFER),
		gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT
	);
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,
		gl.COLOR_ATTACHMENT0,
		gl.TEXTURE_2D,
		texture,
		0
	);
	assert.equal(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE);
	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	assert.equal(gl.isVertexArray(vao), true);
	const query = gl.createQuery();
	gl.beginQuery(gl.ANY_SAMPLES_PASSED, query);
	gl.endQuery(gl.ANY_SAMPLES_PASSED);
	assert.equal(gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE), true);
	const sampler = gl.createSampler();
	gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	assert.equal(gl.getSamplerParameter(sampler, gl.TEXTURE_MIN_FILTER), gl.LINEAR);
	const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
	assert.equal(gl.clientWaitSync(sync, 0, 0), gl.ALREADY_SIGNALED);
	assert.equal(gl.getExtension('NOT_REAL'), null);
	assert.ok(gl.getExtension('OES_vertex_array_object'));
	assert.match(gl.getParameter(gl.VERSION), /WebGL 2\.0/);
	console.log(JSON.stringify({
		commands: gl.commands.length,
		objects: gl.objects.length,
		ok: true
	}));
}

/** @returns {object} */
function shader(gl, type, source) {
	const value = gl.createShader(type);
	gl.shaderSource(value, source);
	gl.compileShader(value);
	return value;
}

run();
