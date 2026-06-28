// B"H
function bytes(value) { try { return Buffer.byteLength(JSON.stringify(value), 'utf8'); } catch { return 0; } }
function tooLarge(value, max = 4096) { return bytes(value) > Number(max || 4096); }
module.exports = { bytes, tooLarge };
