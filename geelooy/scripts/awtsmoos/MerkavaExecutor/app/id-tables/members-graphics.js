// B"H
(function membersGraphics(root) {
  const tables = root.AwtsEctIdTables = root.AwtsEctIdTables || {};
  tables.members = tables.members || {};

  /** B"H. Canvas, WebGL, media, streams, typed arrays: visual vessels get IDs. */
  Object.assign(tables.members, {
    ctx2d: ["canvas", "fillStyle", "strokeStyle", "globalAlpha", "globalCompositeOperation", "lineWidth", "lineCap", "lineJoin", "miterLimit", "font", "textAlign", "textBaseline", "direction", "imageSmoothingEnabled", "clearRect", "fillRect", "strokeRect", "beginPath", "closePath", "moveTo", "lineTo", "bezierCurveTo", "quadraticCurveTo", "arc", "arcTo", "ellipse", "rect", "fill", "stroke", "clip", "isPointInPath", "isPointInStroke", "save", "restore", "translate", "rotate", "scale", "transform", "setTransform", "resetTransform", "drawImage", "createImageData", "getImageData", "putImageData", "createLinearGradient", "createRadialGradient", "createPattern", "fillText", "strokeText", "measureText", "setLineDash", "getLineDash"],
    webgl: ["canvas", "drawingBufferWidth", "drawingBufferHeight", "viewport", "scissor", "clearColor", "clearDepth", "clearStencil", "clear", "enable", "disable", "blendFunc", "depthFunc", "createShader", "shaderSource", "compileShader", "getShaderParameter", "getShaderInfoLog", "deleteShader", "createProgram", "attachShader", "detachShader", "linkProgram", "getProgramParameter", "getProgramInfoLog", "useProgram", "deleteProgram", "createBuffer", "bindBuffer", "bufferData", "bufferSubData", "deleteBuffer", "getAttribLocation", "enableVertexAttribArray", "disableVertexAttribArray", "vertexAttribPointer", "getUniformLocation", "uniform1f", "uniform2f", "uniform3f", "uniform4f", "uniform1i", "uniform2i", "uniform3i", "uniform4i", "uniformMatrix2fv", "uniformMatrix3fv", "uniformMatrix4fv", "createTexture", "bindTexture", "texImage2D", "texParameteri", "activeTexture", "drawArrays", "drawElements", "createFramebuffer", "bindFramebuffer", "framebufferTexture2D"],
    typedArray: ["buffer", "byteLength", "byteOffset", "length", "BYTES_PER_ELEMENT", "at", "set", "subarray", "slice", "copyWithin", "fill", "map", "filter", "reduce", "forEach", "find", "includes", "indexOf", "join", "reverse", "sort", "keys", "values", "entries"],
    ArrayBuffer: ["byteLength", "slice", "isView"],
    DataView: ["buffer", "byteLength", "byteOffset", "getInt8", "getUint8", "getInt16", "getUint16", "getInt32", "getUint32", "getFloat32", "getFloat64", "setInt8", "setUint8", "setInt16", "setUint16", "setInt32", "setUint32", "setFloat32", "setFloat64"],
    media: ["play", "pause", "load", "currentTime", "duration", "paused", "muted", "volume", "srcObject", "controls", "autoplay", "loop", "width", "height", "videoWidth", "videoHeight", "requestVideoFrameCallback", "captureStream"],
    stream: ["getReader", "getWriter", "pipeTo", "pipeThrough", "tee", "cancel", "locked", "read", "releaseLock", "write", "close", "abort"],
    worker: ["postMessage", "terminate", "onmessage", "onerror", "addEventListener", "removeEventListener"],
    messagePort: ["postMessage", "start", "close", "onmessage", "onmessageerror", "addEventListener", "removeEventListener"]
  });
})(typeof self !== "undefined" ? self : globalThis);
