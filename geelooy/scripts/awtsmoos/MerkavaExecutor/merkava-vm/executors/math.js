
// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};
    root.MerkavaVM.OpHandlers = root.MerkavaVM.OpHandlers || [];
    const H = root.MerkavaVM.OpHandlers;

    // --- ARITHMETIC ---
    H[0x40] = (t) => { const b = t.pop(), a = t.pop(); t.push(a + b); }; // ADD
    H[0x41] = (t) => { const b = t.pop(), a = t.pop(); t.push(a - b); }; // SUB
    H[0x42] = (t) => { const b = t.pop(), a = t.pop(); t.push(a * b); }; // MUL
    H[0x43] = (t) => { const b = t.pop(), a = t.pop(); t.push(a / b); }; // DIV
    H[0x44] = (t) => { const b = t.pop(), a = t.pop(); t.push(a % b); }; // MOD
    H[0x45] = (t) => { const b = t.pop(), a = t.pop(); t.push(Math.pow(a, b)); }; // POW

    // --- BITWISE ---
    H[0x46] = (t) => { const b = t.pop(), a = t.pop(); t.push(a & b); }; // AND
    H[0x47] = (t) => { const b = t.pop(), a = t.pop(); t.push(a | b); }; // OR
    H[0x48] = (t) => { const b = t.pop(), a = t.pop(); t.push(a ^ b); }; // XOR
    H[0x49] = (t) => { const b = t.pop(), a = t.pop(); t.push(a << b); }; // SHL
    H[0x4A] = (t) => { const b = t.pop(), a = t.pop(); t.push(a >> b); }; // SHR
    H[0x4B] = (t) => { const b = t.pop(), a = t.pop(); t.push(a >>> b); }; // USHR

    // --- COMPARISON ---
    H[0x4C] = (t) => { const b = t.pop(), a = t.pop(); t.push(a == b); }; // EQ
    H[0x4E] = (t) => { const b = t.pop(), a = t.pop(); t.push(a === b); }; // STRICT EQ
    H[0x4D] = (t) => { const b = t.pop(), a = t.pop(); t.push(a != b); }; // NEQ
    H[0x4F] = (t) => { const b = t.pop(), a = t.pop(); t.push(a !== b); }; // STRICT NEQ
    H[0x50] = (t) => { const b = t.pop(), a = t.pop(); t.push(a > b); };  // GT
    H[0x51] = (t) => { const b = t.pop(), a = t.pop(); t.push(a >= b); }; // GTE
    H[0x52] = (t) => { const b = t.pop(), a = t.pop(); t.push(a < b); };  // LT
    H[0x53] = (t) => { const b = t.pop(), a = t.pop(); t.push(a <= b); }; // LTE
    
    H[0x54] = (t) => { const b = t.pop(), a = t.pop(); t.push(a instanceof b); }; // INSTANCEOF
    H[0x55] = (t) => { const b = t.pop(), a = t.pop(); t.push(a in b); }; // IN

    // --- UNARY ---
    H[0x60] = (t) => t.push(!t.pop()); // NOT
    H[0x61] = (t) => t.push(~t.pop()); // BIT NOT
    H[0x62] = (t) => t.push(-t.pop()); // NEGATE
    H[0x63] = (t) => t.push(typeof t.pop()); // TYPEOF
    H[0x64] = (t) => t.push(typeof t.pop()); // VOID (Just consume)

})(typeof self !== 'undefined' ? self : this);
