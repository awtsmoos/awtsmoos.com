//B"H
// viz.js - Merkavah Vortex Visualizer
import { GLEngine } from './gl-engine.js';

// --- SHADERS ---
const VS = `#version 300 es
in float aIdx;

uniform highp float uTime;
uniform highp float uBass;
uniform highp float uMid;
uniform highp float uTreb;
uniform mat4 uProj;

out float vIdx;
out float vDepth;
out float vAlpha;

void main() {
    vIdx = aIdx;
    
    // Merkavah Geometry: A sphere of rotating rings
    float total = 2000.0;
    float phi = acos( -1.0 + (2.0 * aIdx) / total );
    float theta = sqrt(total * 3.14159) * phi;
    
    float rBase = 8.0;
    float r = rBase + (uBass * 5.0 * sin(aIdx * 0.1 + uTime));
    
    // Chaos Rotation
    float t = uTime * 0.2;
    float x0 = r * sin(phi) * cos(theta);
    float y0 = r * sin(phi) * sin(theta);
    float z0 = r * cos(phi);
    
    // 3D Rotation Matrix (Y and Z axes)
    float c = cos(t); float s = sin(t);
    float x1 = x0 * c - z0 * s;
    float z1 = x0 * s + z0 * c;
    
    // Treble Jitter
    x1 += (sin(uTime * 10.0 + aIdx) * uTreb * 0.5);
    
    gl_Position = uProj * vec4(x1, y0, z1 - 20.0, 1.0);
    gl_PointSize = (400.0 / gl_Position.w) * (0.8 + uMid);
    
    vDepth = z1;
    vAlpha = 1.0;
}
`;

const FS = `#version 300 es
precision mediump float;

uniform sampler2D uAtlas;
uniform highp float uTime;
in float vIdx;
in float vAlpha;

out vec4 fragColor;

void main() {
    float charCount = 22.0;
    float charIdx = mod(vIdx, charCount);
    
    float u = (charIdx + gl_PointCoord.x) / charCount;
    float v = gl_PointCoord.y;
    
    vec4 tex = texture(uAtlas, vec2(u, v));
    
    // Cyberpunk Color Palette
    vec3 col = vec3(0.0);
    float blink = sin(uTime * 5.0 + vIdx) > 0.9 ? 2.0 : 1.0;
    
    if (mod(vIdx, 3.0) == 0.0) col = vec3(0.0, 0.9, 1.0); // Cyan
    else if (mod(vIdx, 3.0) == 1.0) col = vec3(1.0, 0.0, 0.4); // Pink
    else col = vec3(0.0, 1.0, 0.5); // Green
    
    fragColor = vec4(col * blink, tex.a * vAlpha);
}
`;

let engine = null;
let audioData = new Uint8Array(128);
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
        
        const atlas = createHebrewAtlas();
        engine.createTextureFromCanvas('atlas', atlas);
        
        // 2000 Particles
        const count = 2000;
        const data = new Float32Array(count);
        for(let i=0; i<count; i++) data[i] = i;
        engine.createBuffer('particles', data);
        
        isRunning = true;
        loop();
    } catch(e) { console.error("VIZ CRITICAL:", e); }
}

export function setVisualizerData(data) {
    audioData = data;
}

function loop() {
    if(!isRunning || !engine || !engine.gl) return;
    requestAnimationFrame(loop);
    
    const gl = engine.gl;
    const prog = engine.programs['vortex'];

    // SAFETY CHECK: If program doesn't exist, don't try to use it.
    if (!prog) return;

    engine.clear();
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    
    gl.useProgram(prog);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, engine.textures['atlas']);
    
    // Safely get uniform location
    const uAtlasLoc = gl.getUniformLocation(prog, 'uAtlas');
    if (uAtlasLoc) gl.uniform1i(uAtlasLoc, 0);
    
    const aIdx = gl.getAttribLocation(prog, 'aIdx');
    if (aIdx !== -1) {
        gl.bindBuffer(gl.ARRAY_BUFFER, engine.buffers['particles']);
        gl.enableVertexAttribArray(aIdx);
        gl.vertexAttribPointer(aIdx, 1, gl.FLOAT, false, 0, 0);
    }
    
    // Analyze Audio
    let bass = 0, mid = 0, treb = 0;
    for(let i=0; i<10; i++) bass += audioData[i];
    for(let i=20; i<60; i++) mid += audioData[i];
    for(let i=80; i<120; i++) treb += audioData[i];
    
    bass /= (10 * 255);
    mid /= (40 * 255);
    treb /= (40 * 255);
    
    // Projection
    const aspect = engine.width / engine.height;
    const fov = 1.0;
    const f = 1.0 / Math.tan(fov/2);
    const m = [f/aspect,0,0,0, 0,f,0,0, 0,0,-1,-1, 0,0,-2,0];
    
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'uProj'), false, m);
    gl.uniform1f(gl.getUniformLocation(prog, 'uTime'), performance.now() * 0.001);
    gl.uniform1f(gl.getUniformLocation(prog, 'uBass'), bass);
    gl.uniform1f(gl.getUniformLocation(prog, 'uMid'), mid);
    gl.uniform1f(gl.getUniformLocation(prog, 'uTreb'), treb);
    
    gl.drawArrays(gl.POINTS, 0, 2000);
}

function createHebrewAtlas() {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.shadowColor = "white"; ctx.shadowBlur = 15;
    ctx.fillStyle = "white"; ctx.font = "bold 44px 'Courier New'";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const chars = "אבגדהוזחטיכלמנסעפצקרשת";
    for(let i=0; i<22; i++) ctx.fillText(chars[i], i*(1024/22) + (1024/44), 32);
    return c;
}
