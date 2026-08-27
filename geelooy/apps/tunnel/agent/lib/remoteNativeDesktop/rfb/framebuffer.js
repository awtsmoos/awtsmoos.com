// B"H
function createFramebuffer(width = 1024, height = 768) { return { width, height, pixels:Buffer.alloc(width * height * 4), dirty:[{ x:0, y:0, width, height }] }; }
function clear(fb, rgba = [12, 18, 30, 255]) { for (let i = 0; i < fb.pixels.length; i += 4) rgba.forEach((v, n) => fb.pixels[i + n] = v); fb.dirty = [{ x:0, y:0, width:fb.width, height:fb.height }]; return fb; }
module.exports = { createFramebuffer, clear };
