//B"H
/* 
  Pure WebGL Visualization
  Effect: A 3D stream/tunnel of Hebrew letters that pulse and wave based on audio frequency.
*/

const canvas = document.getElementById('viz-canvas');
const gl = canvas.getContext('webgl', { alpha: false });

let width, height;
let audioData = new Uint8Array(128); // Placeholder

// Hebrew Glyphs
const CHARS = "אבגדהוזחטיכלמנסעפצקרשת";

// Shaders
const vsSource = `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  attribute float aOffset;
  attribute float aSpeed;
  attribute float aCharIndex;

  uniform mat4 uProjection;
  uniform float uTime;
  uniform float uAudioHigh;
  uniform float uAudioLow;

  varying vec2 vTexCoord;
  varying float vOpacity;
  varying float vCharIndex;

  void main() {
    // Move particles towards camera
    float zPos = mod(aPosition.z + uTime * aSpeed, 20.0) - 15.0; // Range -15 to 5
    
    // Wave effect based on X and Time + Audio
    float wave = sin(aPosition.x * 0.5 + uTime * 2.0) * (0.5 + uAudioLow * 0.01);
    
    vec3 pos = vec3(aPosition.x, aPosition.y + wave, zPos);
    
    // Scale based on audio (kick)
    float scale = 1.0 + (uAudioHigh * 0.005 * step(10.0, aSpeed));

    gl_Position = uProjection * vec4(pos * scale, 1.0);
    
    vTexCoord = aTexCoord;
    
    // Fade out far away and very close
    float dist = abs(zPos);
    vOpacity = 1.0 - smoothstep(10.0, 15.0, dist);
    vOpacity *= smoothstep(0.0, 2.0, dist + 15.0);
    
    vCharIndex = aCharIndex;
    gl_PointSize = 64.0 / dist; // Simple point size simulation if used points, but using quads
  }
`;

const fsSource = `
  precision mediump float;
  
  varying vec2 vTexCoord;
  varying float vOpacity;
  varying float vCharIndex;
  
  uniform sampler2D uTexture;
  uniform vec3 uColor1;
  uniform vec3 uColor2;

  void main() {
    // Calculate UV for the specific character in the atlas
    // Atlas is 1 row, 22 chars
    float charWidth = 1.0 / 22.0;
    float charLeft = floor(vCharIndex) * charWidth;
    vec2 charUV = vec2(charLeft + vTexCoord.x * charWidth, vTexCoord.y);
    
    vec4 texColor = texture2D(uTexture, charUV);
    
    if(texColor.a < 0.1) discard;
    
    vec3 color = mix(uColor1, uColor2, vTexCoord.y);
    gl_FragColor = vec4(color, texColor.a * vOpacity);
  }
`;

// Helper: Compile Shader
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Helper: Link Program
function initShaderProgram(gl, vs, fs) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vs);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fs);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  return shaderProgram;
}

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

// Locations
const programInfo = {
  attribs: {
    vertexPosition: gl.getAttribLocation(shaderProgram, 'aPosition'),
    textureCoord: gl.getAttribLocation(shaderProgram, 'aTexCoord'),
    speed: gl.getAttribLocation(shaderProgram, 'aSpeed'),
    charIndex: gl.getAttribLocation(shaderProgram, 'aCharIndex'),
  },
  uniforms: {
    projection: gl.getUniformLocation(shaderProgram, 'uProjection'),
    time: gl.getUniformLocation(shaderProgram, 'uTime'),
    audioHigh: gl.getUniformLocation(shaderProgram, 'uAudioHigh'),
    audioLow: gl.getUniformLocation(shaderProgram, 'uAudioLow'),
    texture: gl.getUniformLocation(shaderProgram, 'uTexture'),
    color1: gl.getUniformLocation(shaderProgram, 'uColor1'),
    color2: gl.getUniformLocation(shaderProgram, 'uColor2'),
  },
};

// Texture Atlas Generation
function createGlyphTexture() {
  const cvs = document.createElement('canvas');
  cvs.width = 1024;
  cvs.height = 64;
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, 1024, 64);
  
  ctx.font = 'bold 48px "Courier New", monospace';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const step = 1024 / 22;
  for(let i=0; i<CHARS.length; i++) {
    ctx.fillText(CHARS[i], step * i + step/2, 32);
  }
  
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cvs);
  gl.generateMipmap(gl.TEXTURE_2D);
  return tex;
}

const glyphTexture = createGlyphTexture();

// Buffers
const PARTICLE_COUNT = 400;
const positions = [];
const texCoords = [];
const speeds = [];
const charIndices = [];
const indices = [];

for(let i = 0; i < PARTICLE_COUNT; i++) {
  // Random position in tunnel
  const x = (Math.random() - 0.5) * 20;
  const y = (Math.random() - 0.5) * 10;
  const z = (Math.random() * 20) - 15;
  
  const speed = 2.0 + Math.random() * 5.0;
  const charIdx = Math.floor(Math.random() * 22);
  const size = 0.5 + Math.random() * 0.5;

  // Quad vertices (4 per particle)
  // BL, BR, TR, TL
  const baseIdx = i * 4;
  
  positions.push(x - size, y - size, z);
  positions.push(x + size, y - size, z);
  positions.push(x + size, y + size, z);
  positions.push(x - size, y + size, z);
  
  texCoords.push(0, 1);
  texCoords.push(1, 1);
  texCoords.push(1, 0);
  texCoords.push(0, 0);
  
  // Per vertex data (instanced would be better but this is simple enough)
  for(let j=0; j<4; j++) {
    speeds.push(speed);
    charIndices.push(charIdx);
  }
  
  indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
  indices.push(baseIdx, baseIdx + 2, baseIdx + 3);
}

function createBuffer(data) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  return buf;
}

const posBuffer = createBuffer(positions);
const texBuffer = createBuffer(texCoords);
const speedBuffer = createBuffer(speeds);
const charBuffer = createBuffer(charIndices);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

// Resize
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  gl.viewport(0, 0, width, height);
}
window.addEventListener('resize', resize);
resize();

// Projection Matrix
function makePerspective(fov, aspect, near, far) {
  const f = 1.0 / Math.tan(fov / 2);
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * (1 / (near - far)), -1,
    0, 0, (2 * far * near) * (1 / (near - far)), 0
  ];
}

// Render Loop
let startTime = Date.now();

export function setVisualizerData(data) {
  audioData = data;
}

function render() {
  const now = (Date.now() - startTime) * 0.001;
  
  gl.clearColor(0.01, 0.01, 0.02, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // Additive blending for neon glow
  
  gl.useProgram(shaderProgram);
  
  // Set Attributes
  const setAttrib = (buf, loc, size) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc);
  };
  
  setAttrib(posBuffer, programInfo.attribs.vertexPosition, 3);
  setAttrib(texBuffer, programInfo.attribs.textureCoord, 2);
  setAttrib(speedBuffer, programInfo.attribs.speed, 1);
  setAttrib(charBuffer, programInfo.attribs.charIndex, 1);
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  
  // Set Uniforms
  const projMat = makePerspective(Math.PI / 4, width / height, 0.1, 100.0);
  gl.uniformMatrix4fv(programInfo.uniforms.projection, false, projMat);
  
  gl.uniform1f(programInfo.uniforms.time, now);
  
  // Calculate audio reactivity
  let avgLow = 0;
  let avgHigh = 0;
  for(let i=0; i<30; i++) avgLow += audioData[i];
  for(let i=30; i<100; i++) avgHigh += audioData[i];
  avgLow /= 30;
  avgHigh /= 70;
  
  gl.uniform1f(programInfo.uniforms.audioLow, avgLow);
  gl.uniform1f(programInfo.uniforms.audioHigh, avgHigh);
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, glyphTexture);
  gl.uniform1i(programInfo.uniforms.texture, 0);
  
  // Neon Colors
  gl.uniform3f(programInfo.uniforms.color1, 0.0, 0.95, 1.0); // Cyan
  gl.uniform3f(programInfo.uniforms.color2, 0.73, 0.07, 1.0); // Purple
  
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  
  requestAnimationFrame(render);
}

render();
