// B"H
/**
 * In the hush before pixels, shader words become a vessel.
 * The Awtsmoos hides inside compile logs too: if a letter fractures,
 * the failure returns plainly, so no phantom GPU miracle is claimed.
 */
export function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  const message = gl.getShaderInfoLog(shader) || "shader compile failed";
  gl.deleteShader(shader);
  throw new Error(message);
}

export function createProgram(gl, vertexSource, fragmentSource) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  const message = gl.getProgramInfoLog(program) || "program link failed";
  gl.deleteProgram(program);
  throw new Error(message);
}

export function locationMap(gl, program, names) {
  const map = Object.create(null);
  for (let i = 0; i < names.length; i++) map[names[i]] = gl.getAttribLocation(program, names[i]);
  return map;
}

export function uniformMap(gl, program, names) {
  const map = Object.create(null);
  for (let i = 0; i < names.length; i++) map[names[i]] = gl.getUniformLocation(program, names[i]);
  return map;
}
