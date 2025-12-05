
// B"H
(function(root) {
    root.MerkavaCompiler = root.MerkavaCompiler || {};

    class BytecodeBuilder {
        constructor() { this.bytes = []; }
        write8(byte) { this.bytes.push(byte & 0xFF); return this.bytes.length - 1; }
        write16(int) { this.bytes.push(int & 0xFF); this.bytes.push((int >> 8) & 0xFF); return this.bytes.length - 2; }
        patch16(index, value) { this.bytes[index] = value & 0xFF; this.bytes[index + 1] = (value >> 8) & 0xFF; }
        get currentAddress() { return this.bytes.length; }
        toBuffer() { return new Uint8Array(this.bytes); }
    }

    root.MerkavaCompiler.BytecodeBuilder = BytecodeBuilder;
})(typeof self !== 'undefined' ? self : this);
