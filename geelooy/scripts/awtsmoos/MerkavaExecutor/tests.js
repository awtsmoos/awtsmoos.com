
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

    rainbow: `// B"H - Rotating Rainbow Triangle (Deep Debug)
let cvs = document.getElementById('vm-canvas');
let gl = cvs.getContext('webgl');

if (!gl) {
    syscall(0, "CRITICAL: No WebGL Context");
} else {
    syscall(0, "WebGL Context Acquired:", gl);
}

// 1. Shaders
let vsSrc = \`
  attribute vec2 position;
  attribute vec3 color;
  varying vec3 vColor;
  uniform float angle;
  
  void main() {
    float c = cos(angle);
    float s = sin(angle);
    mat2 rot = mat2(c, -s, s, c);
    vec2 pos = rot * position;
    gl_Position = vec4(pos.x / 1.5, pos.y, 0.0, 1.0);
    gl_PointSize = 10.0;
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

function compile(type, src) {
  syscall(0, "Compiling Type:", type);
  let s = gl.createShader(type);
  
  if (!s) {
      syscall(0, "ERROR: gl.createShader returned null/undefined for type", type);
      return null;
  }
  
  gl.shaderSource(s, src);
  gl.compileShader(s);
  
  let status = gl.getShaderParameter(s, gl.COMPILE_STATUS);
  
  if (!status) {
    syscall(0, "Shader Compile Error:", gl.getShaderInfoLog(s));
    return null;
  }
  
  // syscall(0, "Compile Success. Returning shader object:", s);
  return s;
}

let prog = gl.createProgram();
let vs = compile(gl.VERTEX_SHADER, vsSrc);
let fs = compile(gl.FRAGMENT_SHADER, fsSrc);

syscall(0, "VS Handle:", vs);
syscall(0, "FS Handle:", fs);

if (!vs || !fs) {
    syscall(0, "ABORT: Shaders failed to compile.");
} else {
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    
    let linkStatus = gl.getProgramParameter(prog, gl.LINK_STATUS);
    if (!linkStatus) {
        syscall(0, "Program Link Error:", gl.getProgramInfoLog(prog));
    } else {
        gl.useProgram(prog);
        syscall(0, "Program Linked & Active.");
        
        // 2. Data
        let vertices = [
           0.0,  0.6,   1.0, 0.0, 0.0, // Top (Red)
          -0.6, -0.6,   0.0, 1.0, 0.0, // Left (Green)
           0.6, -0.6,   0.0, 0.0, 1.0  // Right (Blue)
        ];

        let floatData = new Float32Array(vertices);

        // 3. Buffer Setup
        let buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, floatData, gl.STATIC_DRAW);

        // 4. Locations
        let posLoc = gl.getAttribLocation(prog, "position");
        let colLoc = gl.getAttribLocation(prog, "color");
        let angleLoc = gl.getUniformLocation(prog, "angle");

        syscall(0, "Attributes - Pos:", posLoc, "Col:", colLoc);

        // 5. Render Loop
        let angle = 0.0;
        let frame = 0;

        function loop(t) {
            gl.viewport(0,0,300,200);
            gl.clearColor(0.1, 0.1, 0.1, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            
            gl.useProgram(prog);
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 20, 0);
            
            gl.enableVertexAttribArray(colLoc);
            gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, 20, 8);
            
            gl.uniform1f(angleLoc, angle);
            
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            
            angle = angle + 0.05;
            frame++;
            
            if(frame % 120 == 0) syscall(0, "Frame:", frame);
            requestAnimationFrame(loop);
        }

        requestAnimationFrame(loop);
    }
}
`,

    workers: `// B"H - Merkava Worker
syscall(0, "Main: Spawning Worker...");

let w = new Worker('worker_script.js');

w.onmessage = function(e) {
  syscall(0, "Main: Received from Worker:", JSON.stringify(e.data));
  syscall(0, "Main: Terminating Worker...");
  w.terminate();
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

    scripts: `// B"H - ImportScripts (Main Thread)
syscall(0, "Attempting Import...");

// Note: 'worker_script.js' is defined in MOCK_FILES in index.html/console.html
// importScripts will find it there and execute it.
importScripts('worker_script.js');

syscall(0, "ImportScripts Complete.");
`,

    complex_offscreen: `// B"H - Complex: Offscreen Canvas & Worker Modules (Dynamic Blob)
syscall(0, "[Main] Starting Advanced Graphix...");

// 1. Get Offscreen Control
let cvs = document.getElementById('vm-canvas');
let off = cvs.transferControlToOffscreen();

// 2. Define Worker Source as String (Dynamic)
// Note: This relies on 'renderer_lib.js' which is a VIRTUAL file!
// The WorkerProxy will bridge the request for 'renderer_lib.js' back to the Main thread.
const workerSource = \`
    // B"H - Dynamic Graphics Worker
    importScripts('renderer_lib.js');
    
    let engine = null;
    self.onmessage = function(e) {
        if (e.data.canvas) {
            syscall(0, "[GFX Worker] Received OffscreenCanvas.");
            engine = new Renderer(e.data.canvas);
            engine.start();
        } else if (e.data.cmd === 'pulse') {
            if (engine) engine.pulse();
        } else if (e.data.cmd === 'input') {
            if (engine) engine.handleInput(e.data);
        }
    };
\`;

// 3. Create Blob URL
const blob = new Blob([workerSource], {type: 'application/javascript'});
const workerUrl = URL.createObjectURL(blob);

syscall(0, "[Main] Spawning Worker from Blob...");
let w = new Worker(workerUrl);

// 4. Send Canvas
syscall(0, "[Main] Transferring Canvas...");
w.postMessage({ canvas: off }, [off]);

// 5. Event Listeners (Interactive Mode)
// B"H - Added Mouse & Keyboard handling
// Note: Since 'cvs' is a DOM Node (Proxy) in the VM context, 
// and 'addEventListener' is a native method, the VM will now bridge the closure automatically!
cvs.addEventListener('mousedown', function(e) {
    let rect = cvs.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    syscall(0, "[Main] Click:", x, y);
    w.postMessage({ cmd: 'input', type: 'click', x: x, y: y });
});

document.addEventListener('keydown', function(e) {
    syscall(0, "[Main] Key:", e.key);
    w.postMessage({ cmd: 'input', type: 'key', key: e.key });
});

syscall(0, "[Main] Listening for Input (Click Canvas or Press Keys)...");

// 6. Background Heartbeat
let tick = 0;
function interact() {
   tick++;
   if (tick % 200 == 0) {
      // Keep connection alive
      w.postMessage({ cmd: 'pulse' });
   }
   requestAnimationFrame(interact);
}
interact();
`
};
