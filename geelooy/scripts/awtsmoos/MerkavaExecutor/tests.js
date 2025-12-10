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
    
    canvas_anim: `// B"H - 2D Canvas Animation (Bouncing Ball)
let cvs = document.getElementById('vm-canvas');
let ctx = cvs.getContext('2d');
let x = 50;
let y = 100;
let dx = 2;
let dy = 2;

function draw(t) {
  // Clear Frame
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; // Trail effect
  ctx.fillRect(0, 0, 300, 200);
  
  // Update Physics
  x = x + dx;
  y = y + dy;
  
  if (x > 300 || x < 0) dx = -dx;
  if (y > 200 || y < 0) dy = -dy;
  
  // Render Light
  ctx.fillStyle = '#00FF00';
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, 6.28);
  ctx.fill();
  
  requestAnimationFrame(draw);
}

syscall(0, "Igniting 2D Loop...");
requestAnimationFrame(draw);`,

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

    rainbow: `// B"H - Paranoid Rainbow Triangle
// Simple White Triangle on Red Background
let cvs = document.getElementById('vm-canvas');
let gl = cvs.getContext('webgl');

if (!gl) syscall(0, "Error: No WebGL");

// 1. Shaders (Simplified)
let vsSrc = \`
  attribute vec2 position;
  void main() {
    // Pass through position, fix aspect
    gl_Position = vec4(position.x / 1.5, position.y, 0.0, 1.0);
    gl_PointSize = 10.0;
  }
\`;

let fsSrc = \`
  precision mediump float;
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // WHITE
  }
\`;

function compile(type, src) {
  let s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    syscall(0, "Shader Err:", gl.getShaderInfoLog(s));
  }
  return s;
}

let prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSrc));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSrc));
gl.linkProgram(prog);
gl.useProgram(prog);

// 2. Data
// Triangle covering center
let vertices = [
   0.0,  0.5,
  -0.5, -0.5,
   0.5, -0.5
];

let floatData = new Float32Array(vertices);
syscall(0, "FloatData Check:", floatData[0], floatData[1], floatData[2]);

// 3. Buffer
let buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, floatData, gl.STATIC_DRAW);

// Verify Buffer on GPU
let bufSize = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
syscall(0, "GPU Buffer Size (Bytes):", bufSize);

let posLoc = gl.getAttribLocation(prog, "position");
syscall(0, "PosAttribLoc:", posLoc);

// 4. Render Loop
let frame = 0;
function loop(t) {
    gl.viewport(0,0,300,200);
    
    // Clear to RED
    gl.clearColor(0.5, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Explicit Bind
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    
    gl.enableVertexAttribArray(posLoc);
    // Stride 0 (tightly packed), Offset 0
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    
    // Disable Culling & Depth to ensure visibility
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
    frame++;
    if(frame % 60 == 0) syscall(0, "Frame:", frame);
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
`,

    workers: `// B"H - Merkava Worker
syscall(0, "Main: Spawning Worker...");

let w = new Worker('worker_script.js');

w.onmessage = function(e) {
  syscall(0, "Main: Received from Worker:", JSON.stringify(e.data));
};

w.postMessage("Ignite the Sephira");
syscall(0, "Main: Message Sent. Waiting for response...");`,

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