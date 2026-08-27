
// B"H
export const bufferModule = `
class Buffer extends Uint8Array {
    static from(data, enc) {
        if (typeof data === 'string') {
            if (enc === 'base64') return new Buffer(atob(data).split('').map(c => c.charCodeAt(0)));
            return new Buffer(new TextEncoder().encode(data));
        }
        return new Buffer(data);
    }
    static concat(list) {
        const total = list.reduce((s, b) => s + b.length, 0);
        const res = new Buffer(total);
        let off = 0;
        list.forEach(b => { res.set(b, off); off += b.length; });
        return res;
    }
    toString(enc) {
        if (enc === 'base64') return btoa(String.fromCharCode.apply(null, this));
        return new TextDecoder().decode(this);
    }
}
module.exports = { Buffer };
`;
