// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};
    root.MerkavaVM.OpHandlers = root.MerkavaVM.OpHandlers || [];
    const H = root.MerkavaVM.OpHandlers;

    // B"H (2026-10-09): Hot-path optimization. Binary ops use direct _sp
    // access instead of pop()/push() method calls. This is the hottest
    // path in arithmetic-heavy code (loops).
    //
    // Stack layout for binary op: [..., a, b] with _sp pointing past b.
    // We replace both with result: stack[_sp-2] = a OP b; _sp--.

    H[0x40] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a + b; t._sp = sp - 1; }; // ADD
    H[0x41] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a - b; t._sp = sp - 1; }; // SUB
    H[0x42] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a * b; t._sp = sp - 1; }; // MUL
    H[0x43] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a / b; t._sp = sp - 1; }; // DIV
    H[0x44] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a % b; t._sp = sp - 1; }; // MOD
    H[0x45] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = Math.pow(a, b); t._sp = sp - 1; }; // POW

    // --- BITWISE ---
    H[0x46] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a & b; t._sp = sp - 1; }; // AND
    H[0x47] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a | b; t._sp = sp - 1; }; // OR
    H[0x48] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a ^ b; t._sp = sp - 1; }; // XOR
    H[0x49] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a << b; t._sp = sp - 1; }; // SHL
    H[0x4A] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a >> b; t._sp = sp - 1; }; // SHR
    H[0x4B] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a >>> b; t._sp = sp - 1; }; // USHR

    // --- COMPARISON ---
    H[0x4C] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a == b; t._sp = sp - 1; }; // EQ
    H[0x4E] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a === b; t._sp = sp - 1; }; // STRICT EQ
    H[0x4D] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a != b; t._sp = sp - 1; }; // NEQ
    H[0x4F] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a !== b; t._sp = sp - 1; }; // STRICT NEQ
    H[0x50] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a > b; t._sp = sp - 1; };  // GT
    H[0x51] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a >= b; t._sp = sp - 1; }; // GTE
    H[0x52] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a < b; t._sp = sp - 1; };  // LT
    H[0x53] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a <= b; t._sp = sp - 1; }; // LTE

    H[0x54] = (t) => { const b = t.pop(), a = t.pop(); t.push(a instanceof b); }; // INSTANCEOF
    H[0x55] = (t) => { const b = t.pop(), a = t.pop(); t.push(a in b); }; // IN

    // --- UNARY ---
    H[0x60] = (t) => { const s = t.stack, sp = t._sp; s[sp-1] = !s[sp-1]; }; // NOT (in-place)
    H[0x61] = (t) => { const s = t.stack, sp = t._sp; s[sp-1] = ~s[sp-1]; }; // BIT NOT (in-place)
    H[0x62] = (t) => { const s = t.stack, sp = t._sp; s[sp-1] = -s[sp-1]; }; // NEGATE (in-place)
    H[0x63] = (t) => { const s = t.stack, sp = t._sp; s[sp-1] = typeof s[sp-1]; }; // TYPEOF (in-place)
    H[0x64] = (t) => { t._sp--; }; // VOID (just pop, in-place)

})(typeof self !== 'undefined' ? self : this);
