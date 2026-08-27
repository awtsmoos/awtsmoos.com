
// B"H
import { loadShaderSource } from './shaders/utils/shaderModuleLoader.js';

/**
 * @file shaderCompiler.js
 * @brief The divine logic for transforming GLSL text into GPU-executable programs.
 */

function loadShader(gl, type, source) {
    const fullSource = loadShaderSource(source);
    const shader = gl.createShader(type);
    gl.shaderSource(shader, fullSource);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`B"H - Shader Compilation Error:`, gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

/**
 * B"H - Compiles and links a full shader program with strict attribute binding.
 */
export function compileShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return null;

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    // B"H - THE ANCHOR OF STABILITY: 
    // We explicitly bind 'aVertexPosition' to location 0. 
    // This ensures that our full-screen quad draws (which only use one attribute) 
    // always work even if previous draw calls left higher attributes in a dirty state.
    gl.bindAttribLocation(shaderProgram, 0, 'aVertexPosition');

    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('B"H - Program Linking Error:', gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    // Capture locations for easy access
    const attribLocations = {
        vertexPosition: 0, // Forced to 0
        vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
        boneIndices: gl.getAttribLocation(shaderProgram, 'aBoneIndices'),
        boneWeights: gl.getAttribLocation(shaderProgram, 'aBoneWeights'),
    };
    
    return {
        program: shaderProgram,
        attribLocations: attribLocations,
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
            ambientLightColor: gl.getUniformLocation(shaderProgram, 'uAmbientLightColor'),
            directionalLightColor: gl.getUniformLocation(shaderProgram, 'uDirectionalLightColor'),
            lightDirection: gl.getUniformLocation(shaderProgram, 'uLightDirection'),
        },
    };
}
