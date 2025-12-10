// B"H
// tests.js - The Scrolls of Testing

window.MERKAVA_TESTS = {
    intro: `// B"H - Sefer Yetzirah Logic
let nodes = [{v:1}, {v:2}, {v:6}];
let light = 0;
let i = 0;
while(i < nodes.length) {
  let n = nodes[i];
  if(n.v % 2 == 0) light = light + n.v * 10;
  else light = light + n.v;
  syscall(0, "Node:", n.v, "Light:", light);
  i++;
}`,
    canvas: `// B"H - Sacred Geometry (Canvas)
let cvs = document.getElementById('vm-canvas');
let ctx = cvs.getContext('2d');
syscall(0, "Context Acquired:", ctx);

ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, 300, 200);

ctx.fillStyle = '#FF0000'; 
let x = 50;

while(x < 250) {
  syscall(0, "Drawing at X:", x);
  ctx.beginPath();
  ctx.arc(x, 100, 20, 0, 6.28);
  ctx.fill(); 
  x = x + 50;
}
syscall(0, "Canvas Painted.");`,
    
    webgl: `// B"H - WebGL Void
let cvs = document.getElementById('vm-canvas');
let gl = cvs.getContext('webgl');

if (!gl) {
    syscall(0, "WebGL unavailable.");
} else {
  gl.clearColor(0.2, 0.0, 0.4, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  syscall(0, "WebGL Buffer Cleared.");
}`,

    rainbow: `// B"H - Rotating Rainbow Triangle
let cvs = document.getElementById('vm-canvas');
let gl = cvs.getContext('webgl');

// Shaders
let vsSrc = \`
  attribute vec2 position;
  attribute vec3 color;
  varying vec3 vColor;
  uniform float angle;
  void main() {
    float c = cos(angle);
    float s = sin(angle);
    mat2 rot = mat2(c, -s, s, c);
    gl_Position = vec4(rot * position, 0.0, 1.0);
    vColor = color;
  }
\`;

let fsSrc = \`
  precision mediump float;
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
\`;

// Compile Shader Helper
function compile(type, src) {
  let s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    syscall(0, "Shader Err:", gl.getShaderInfoLog(s));
  }
  return s;
}

let vs = compile(gl.VERTEX_SHADER, vsSrc);
let fs = compile(gl.FRAGMENT_SHADER, fsSrc);
let prog = gl.createProgram();
gl.attachShader(prog, vs);
gl.attachShader(prog, fs);
gl.linkProgram(prog);
gl.useProgram(prog);

// Data: x, y, r, g, b
let vertices = [
   0.0,  0.5, 1.0, 0.0, 0.0,
  -0.5, -0.5, 0.0, 1.0, 0.0,
   0.5, -0.5, 0.0, 0.0, 1.0
];

let buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

let posLoc = gl.getAttribLocation(prog, "position");
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 20, 0);

let colLoc = gl.getAttribLocation(prog, "color");
gl.enableVertexAttribArray(colLoc);
gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, 20, 8);

let angleLoc = gl.getUniformLocation(prog, "angle");
let angle = 0.0;

// Animation Loop
// In VM, infinite loops run until cycles exhausted.
// We use a bounded loop to simulate a few frames.
let frames = 0;
while (frames < 20) {
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.uniform1f(angleLoc, angle);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  
  angle = angle + 0.1;
  frames++;
  syscall(0, "Frame:", frames);
}
syscall(0, "Animation Sequence Complete.");
`,

    workers: `// B"H - Merkava Worker
syscall(0, "Main: Spawning Worker...");

let w = new Worker('worker_script.js');

w.onmessage = function(e) {
  syscall(0, "Main: Received from Worker:", JSON.stringify(e.data));
};

w.postMessage("Ignite the Sephira");
syscall(0, "Main: Message Sent.");`,

    atomics: `// B"H - Atomics from Scratch
syscall(0, "Allocating Simulated Shared Memory...");

// This uses our Polyfilled SharedArrayBuffer
let sab = new SharedArrayBuffer(1024);
let int32 = new Int32Array(sab);

// Perform Atomic Ops
syscall(0, "Initial Value:", Atomics.load(int32, 0));
let old = Atomics.add(int32, 0, 42);
syscall(0, "Old Value:", old);
let curr = Atomics.load(int32, 0);
syscall(0, "New Value (Should be 42):", curr);

let res = Atomics.compareExchange(int32, 0, 42, 777);
syscall(0, "CompareExchange Result (Old):", res);
syscall(0, "Final Value (Should be 777):", Atomics.load(int32, 0));`,

    modules: `// B"H - Modules
// Simulating Export Syntax
export const ALEPH = 1;
export function say() { return "Light"; }

syscall(0, "Module System: Exports compiled successfully.");
syscall(0, "Constant ALEPH:", ALEPH);
syscall(0, "Function say():", say());`,

    scripts: `// B"H - ImportScripts
syscall(0, "Attempting Import...");
importScripts('https://lib.js/core.js');

if (typeof IMPORTED_LIB_LOADED !== 'undefined') {
  syscall(0, "Success: Library Loaded via Sync Emulation.");
} else {
  syscall(0, "Note: Simulating async load...");
}`
};