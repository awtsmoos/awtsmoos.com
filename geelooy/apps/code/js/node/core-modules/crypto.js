
// B"H
export const cryptoModule = `
const { Buffer } = require('buffer');

// Minimal Pure JS SHA1 for WebSocket Handshakes
function sha1(msg) {
    let bytes = typeof msg === 'string' ? new TextEncoder().encode(msg) : msg;
    let K =[0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
    let m =[1732584193, -271733879, -1732584194, 271733878, -1009589776];
    let w =[];
    let M = new Uint8Array(bytes.length + 1 + ((((bytes.length + 8) >> 6) + 1) << 6) - bytes.length - 1);
    M.set(bytes); M[bytes.length] = 0x80;
    new DataView(M.buffer).setUint32(M.length - 4, bytes.length << 3, false);
    
    for (let i = 0; i < M.length; i += 64) {
        let[a,b,c,d,e] = m;
        for (let j = 0; j < 80; j++) {
            w[j] = j < 16 ? new DataView(M.buffer).getUint32(i + j * 4, false) : (w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16]) << 1 | (w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16]) >>> 31;
            let f = (a << 5 | a >>> 27) + e + K[j/20|0] + w[j] + (j < 20 ? (b & c | ~b & d) : j < 40 ? (b ^ c ^ d) : j < 60 ? (b & c | b & d | c & d) : (b ^ c ^ d)) | 0;
            e = d; d = c; c = b << 30 | b >>> 2; b = a; a = f;
        }
        m = [m[0]+a|0, m[1]+b|0, m[2]+c|0, m[3]+d|0, m[4]+e|0];
    }
    let res = new Uint8Array(20);
    let dv = new DataView(res.buffer);
    for(let i=0;i<5;i++) dv.setUint32(i*4, m[i], false);
    return res;
}

module.exports = {
    createHash(algo) {
        return {
            _data:[],
            update(data) { this._data.push(Buffer.from(data)); return this; },
            digest(enc) {
                const full = Buffer.concat(this._data);
                let hashed;
                if (algo === 'sha1') hashed = sha1(full);
                else hashed = full; // Fallback for unsupported
                const buf = Buffer.from(hashed);
                return enc === 'base64' ? buf.toString('base64') : buf.toString();
            }
        }
    }
};
`;
