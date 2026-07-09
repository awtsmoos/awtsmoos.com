// B"H
/** WebGL utility vessels: types explicit, uniforms named, no hidden engine. */
export function drawMode(gl, mode) {
  return { 0: gl.POINTS, 1: gl.LINES, 2: gl.LINE_LOOP, 3: gl.LINE_STRIP, 4: gl.TRIANGLES, 5: gl.TRIANGLE_STRIP, 6: gl.TRIANGLE_FAN }[mode ?? 4] || gl.TRIANGLES;
}

export function attributeType(gl, attribute) {
  const array = attribute.array;
  if (array instanceof Float32Array) return gl.FLOAT;
  if (array instanceof Uint8Array) return gl.UNSIGNED_BYTE;
  if (array instanceof Uint16Array) return gl.UNSIGNED_SHORT;
  if (array instanceof Uint32Array) return gl.UNSIGNED_INT;
  if (array instanceof Int8Array) return gl.BYTE;
  if (array instanceof Int16Array) return gl.SHORT;
  return gl.FLOAT;
}

export function createShader(gl, type, source, label, errors) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const info = gl.getShaderInfoLog(shader);
  if (info) errors.push(`${label} shader: ${info}`);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(`${label} shader failed: ${info}`);
  return shader;
}

export function createProgram(gl, vertexSource, fragmentSource, label, errors) {
  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource, label, errors));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource, label, errors));
  gl.linkProgram(program);
  const info = gl.getProgramInfoLog(program);
  if (info) errors.push(`${label} program: ${info}`);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`${label} program failed: ${info}`);
  return program;
}

export function locations(gl, program) {
  return {
    position: gl.getAttribLocation(program, 'aPosition'),
    normal: gl.getAttribLocation(program, 'aNormal'),
    color: gl.getAttribLocation(program, 'aColor'),
    uv: gl.getAttribLocation(program, 'aUv'),
    joints: gl.getAttribLocation(program, 'aJoints'),
    weights: gl.getAttribLocation(program, 'aWeights'),
    mvp: gl.getUniformLocation(program, 'uMvp'),
    model: gl.getUniformLocation(program, 'uModel'),
    colorUniform: gl.getUniformLocation(program, 'uColor'),
    alphaCutoff: gl.getUniformLocation(program, 'uAlphaCutoff'),
    alphaMode: gl.getUniformLocation(program, 'uAlphaMode'),
    lit: gl.getUniformLocation(program, 'uLit'),
    pointSize: gl.getUniformLocation(program, 'uPointSize'),
    map: gl.getUniformLocation(program, 'uMap'),
    useMap: gl.getUniformLocation(program, 'uUseMap'),
    mapRepeat: gl.getUniformLocation(program, 'uMapRepeat'),
    jointMatrices: gl.getUniformLocation(program, 'uJointMatrices[0]'),
    jointTexture: gl.getUniformLocation(program, 'uJointTexture'),
    jointTextureHeight: gl.getUniformLocation(program, 'uJointTextureHeight'),
  };
}

export function materialColor(material) {
  const color = material?.color || [0.75, 0.70, 0.62, 1];
  const opacity = material?.opacity ?? color[3] ?? 1;
  return new Float32Array([color[0] ?? 0.75, color[1] ?? 0.70, color[2] ?? 0.62, opacity]);
}

export function alphaModeCode(material) {
  if (material?.alphaMode === 'MASK') return 1;
  if (material?.alphaMode === 'BLEND') return 2;
  return 0;
}
