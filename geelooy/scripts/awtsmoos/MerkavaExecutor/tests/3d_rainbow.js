
// B"H
(function() {
    window.MERKAVA_TESTS['3d_rainbow'] = {
        name: "Test 3d: Rainbow Triangle (WebGL)",
        orchestrator: `// B"H - Rotating Rainbow Triangle
const canvas = document.getElementById('vm-canvas');
const gl = canvas.getContext('webgl');
if (!gl) throw new Error("WebGL not found.");

const vsSource = \`
    attribute vec2 pos;
    attribute vec3 col;
    varying vec3 vCol;
    uniform float rot;
    void main() {
        float c = cos(rot), s = sin(rot);
        gl_Position = vec4(mat2(c, -s, s, c) * pos, 0.0, 1.0);
        vCol = col;
    }
\`;

const fsSource = \`
    precision mediump float;
    varying vec3 vCol;
    void main() { gl_FragColor = vec4(vCol, 1.0); }
\`;

function createShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.log("Shader Error:", gl.getShaderInfoLog(s));
    }
    return s;
}

const prog = gl.createProgram();
gl.attachShader(prog, createShader(gl.VERTEX_SHADER, vsSource));
gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, fsSource));
gl.linkProgram(prog);
gl.useProgram(prog);

const vertices = new Float32Array([
     0.0,  0.5,  1, 0, 0,
    -0.5, -0.5,  0, 1, 0,
     0.5, -0.5,  0, 0, 1
]);

const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const pos = gl.getAttribLocation(prog, "pos");
const col = gl.getAttribLocation(prog, "col");
const rot = gl.getUniformLocation(prog, "rot");

gl.enableVertexAttribArray(pos);
gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 20, 0);
gl.enableVertexAttribArray(col);
gl.vertexAttribPointer(col, 3, gl.FLOAT, false, 20, 8);

let angle = 0;
function frame() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(rot, angle);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    angle += 0.02;
    requestAnimationFrame(frame);
}
console.log("Initiating Cosmic Rotation...");
requestAnimationFrame(frame);`,
        
        async run(Merkava, tools) {
            const source = this.orchestrator;
            
            // Using the SDK's high-level run because it handles the complicated 
            // deep proxying needed for WebGL contexts.
            return Merkava.run(source, {
                context: { 
                    document: window.document,
                    Float32Array: window.Float32Array,
                    console: { log: tools.log }
                },
                hostAPI: { 0: tools.log }
            });
        }
    };
})();
