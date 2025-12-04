//B"H
// viz.js - Merkavah Vortex Visualizer with Data Texture
import { GLEngine } from './gl-engine.js';

// --- SHADERS ---
const VS = `#version 300 es
in float aIdx;

uniform highp float uTime;
uniform sampler2D uAudioData; // 128x1 Texture containing frequency data
uniform mat4 uProj;

out float vIdx;
out float vAmp;

void main() {
    vIdx = aIdx;
    
    // Map particle index to audio frequency bin
    // We have 2000 particles, 128 audio bins.
    // Wrap around:
    float freqCoord = mod(aIdx, 128.0) / 128.0;
    
    // Sample Audio Amplitude from Texture (Red Channel)
    float amp = texture(uAudioData, vec2(freqCoord, 0.5)).r;
    vAmp = amp; // Pass to fragment shader for coloring
    
    // GEOMETRY: The "Audio Stargate"
    // A circle that expands and spikes based on amplitude
    
    float total = 2000.0;
    float theta = (aIdx / total) * 6.28318 * 4.0 + (uTime * 0.2); // 4 Loops
    
    // Base Radius + Audio Displacement
    float rBase = 12.0;
    float r = rBase + (amp * 15.0); // Intense displacement
    
    // Spiral Depth
    float z = (mod(aIdx, 500.0) / 500.0) * -10.0 - 15.0; 
    
    // Position
    float x = r * cos(theta);
    float y = r * sin(theta);
    
    // Add some trebel jitter
    if (mod(aIdx, 5.0) == 0.0) {
        x += (sin(uTime * 10.0 + aIdx) * amp * 2.0);
    }

    gl_Position = uProj * vec4(x, y, z, 1.0);
    
    // Size scales with amplitude
    gl_PointSize = (500.0 / gl_Position.w) * (0.8 + amp * 2.0);
}
`;

const FS = `#version 300 es
precision mediump float;

uniform sampler2D uAtlas;
uniform highp float uTime;
in float vIdx;
in float vAmp;

out vec4 fragColor;

void main() {
    float charCount = 22.0;
    float charIdx = mod(vIdx, charCount);
    
    float u = (charIdx + gl_PointCoord.x) / charCount;
    float v = gl_PointCoord.y;
    
    vec4 tex = texture(uAtlas, vec2(u, v));
    if(tex.a < 0.1) discard;
    
    // Reactive Colors
    vec3 col = vec3(0.0);
    
    // Base Color cycles
    vec3 base = vec3(0.0, 1.0, 1.0); // Cyan
    if (vAmp > 0.6) base = vec3(1.0, 0.0, 0.5); // Magenta High Energy
    else if (vAmp > 0.3) base = vec3(0.0, 1.0, 0.5); // Green Mid
    
    // Flash
    col = base * (1.0 + vAmp * 2.0);

    fragColor = vec4(col, tex.a);
}
`;

let engine = null;
let audioTexture = null;
let audioData = new Uint8Array(128); // Raw data container
let isRunning = false;

export function initViz(canvas) {
    if(!canvas) return;
    try {
        engine = new GLEngine(canvas);
        const prog = engine.createProgram('vortex', VS, FS);
        
        if (!prog) {
            console.error("VIZ ERROR: Failed to create shader program 'vortex'. Aborting visualization.");
            return;
        }
        
        // 1. Create Font Atlas
        const atlas = createHebrewAtlas();
        engine.createTextureFromCanvas('atlas', atlas);
        
        // 2. Create Audio Data Texture (128x1, Red component only is sufficient, using Luminance or RGB)
        const gl = engine.gl;
        audioTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, audioTexture);
        // Initialize with zeros
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 128, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array(128));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        engine.textures['audio'] = audioTexture;

        // 3. Particles
        const count = 2000;
        const data = new Float32Array(count);
        for(let i=0; i<count; i++) data[i] = i;
        engine.createBuffer('particles', data);
        
        isRunning = true;
        loop();
    } catch(e) { console.error("VIZ CRITICAL:", e); }
}

export function setVisualizerData(data) {
    // data is Uint8Array(128)
    audioData = data;
}

function loop() {
    if(!isRunning || !engine || !engine.gl) return;
    requestAnimationFrame(loop);
    
    const gl = engine.gl;
    const prog = engine.programs['vortex'];

    if (!prog) return;

    // Update Audio Texture
    gl.bindTexture(gl.TEXTURE_2D, engine.textures['audio']);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 128, 1, gl.LUMINANCE, gl.UNSIGNED_BYTE, audioData);

    engine.clear();
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    
    gl.useProgram(prog);
    
    // Bind Atlas to Unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, engine.textures['atlas']);
    gl.uniform1i(gl.getUniformLocation(prog, 'uAtlas'), 0);

    // Bind AudioData to Unit 1
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, engine.textures['audio']);
    gl.uniform1i(gl.getUniformLocation(prog, 'uAudioData'), 1);
    
    const aIdx = gl.getAttribLocation(prog, 'aIdx');
    if (aIdx !== -1) {
        gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers['particles']);
        gl.enableVertexAttribArray(aIdx);
        gl.vertexAttribPointer(aIdx, 1, gl.FLOAT, false, 0, 0);
    }
    
    // Projection
    const aspect = engine.width / engine.height;
    const fov = 1.0; 
    const f = 1.0 / Math.tan(fov/2);
    const m = [f/aspect,0,0,0, 0,f,0,0, 0,0,-1,-1, 0,0,-2,0];
    
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'uProj'), false, m);
    gl.uniform1f(gl.getUniformLocation(prog, 'uTime'), performance.now() * 0.001);
    
    gl.drawArrays(gl.POINTS, 0, 2000);
}

function createHebrewAtlas() {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0,0,1024,64);
    
    ctx.shadowColor = "cyan"; ctx.shadowBlur = 10;
    ctx.fillStyle = "white"; ctx.font = "900 48px 'Courier New'";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const chars = "אבגדהוזחטיכלמנסעפצקרשת";
    for(let i=0; i<22; i++) ctx.fillText(chars[i], i*(1024/22) + (1024/44), 32);
    return c;
}