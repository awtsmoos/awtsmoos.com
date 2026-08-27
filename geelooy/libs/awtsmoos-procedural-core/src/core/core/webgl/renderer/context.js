
// B"H
/**
 * @file context.js
 * @brief Handles WebGL context creation and extension management.
 */

export function initWebGL(containerId) {
    console.log(`B"H - Context: Initializing in '${containerId}'...`);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`B"H - Context Error: Container element '${containerId}' not found.`);
        return null;
    }

    console.log(`B"H - Context: Container dimensions: ${container.clientWidth}x${container.clientHeight}`);

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-label', '3D Scene');
    canvas.setAttribute('role', 'img');
    container.appendChild(canvas);

    // B"H - Request Anti-Aliasing for smooth, divine forms.
    const gl = canvas.getContext('webgl', { antialias: true });
    if (!gl) {
        alert('B"H - WebGL not supported!');
        console.error('B"H - Context Fatal: WebGL context creation failed.');
        return null;
    }

    // Enable Extensions
    const extDepth = gl.getExtension('WEBGL_depth_texture');
    console.log(`B"H - Context Extension: WEBGL_depth_texture ${extDepth ? 'ACTIVE' : 'MISSING'}`);

    gl.getExtension('OES_standard_derivatives');

    // B"H - Enable 32-bit indices for high-poly fluid meshes
    const extUint = gl.getExtension('OES_element_index_uint');
    if (extUint) {
        console.log('B"H - Context Extension: OES_element_index_uint ACTIVE.');
        gl.extUint = extUint;
    } else {
        console.warn('B"H - Context Warning: OES_element_index_uint MISSING. Large meshes may fail.');
    }

    const extInstanced = gl.getExtension('ANGLE_instanced_arrays');
    if (extInstanced) {
        console.log('B"H - Context Extension: ANGLE_instanced_arrays ACTIVE. Instancing enabled.');
        gl.extInstanced = extInstanced;
    } else {
        console.error('B"H - Context Critical: ANGLE_instanced_arrays MISSING. Hair/Grass will not render.');
    }

    const halfFloatExt = gl.getExtension('OES_texture_half_float');
    if (halfFloatExt) {
        console.log('B"H - Context Extension: OES_texture_half_float ACTIVE.');
        gl.getExtension('OES_texture_half_float_linear'); // Important for filtering
        gl.halfFloatExt = halfFloatExt; // Store it for access
    } else {
        console.warn('B"H - Context Warning: OES_texture_half_float MISSING. HDR rendering will be disabled.');
    }

    // Default Config
    gl.clearColor(0.8, 0.85, 0.9, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    return { canvas, gl };
}

export function resizeCanvas(gl, canvas) {
    if (!canvas || !gl || !canvas.parentElement) return false;
    const container = canvas.parentElement;

    // B"H - Apply device pixel ratio for true, crisp rendering on high-DPI displays.
    const displayWidth = Math.floor(container.clientWidth * (window.devicePixelRatio || 1));
    const displayHeight = Math.floor(container.clientHeight * (window.devicePixelRatio || 1));

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        console.log(`B"H - Context: Resizing canvas buffer to ${displayWidth}x${displayHeight} (DPI ${window.devicePixelRatio || 1})`);
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        return true;
    }
    return false;
}