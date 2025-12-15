/*
B"H
Boruch Hashem
Biezrash Hashem
*/
/**
 * Awtsmoos x64 Opcode Dictionary.
 * Contains base opcodes, prefixes, and register codes for the AMD64 architecture.
 * This is the "Torah" (Law/Structure) of the Assembler.
 */

export const REGISTERS = {
    // 64-bit
    RAX: 0, RCX: 1, RDX: 2, RBX: 3, RSP: 4, RBP: 5, RSI: 6, RDI: 7,
    R8: 8, R9: 9, R10: 10, R11: 11, R12: 12, R13: 13, R14: 14, R15: 15,
    
    // 8-bit Aliases (Mapped to same index, instruction determines size)
    AL: 0, CL: 1, DL: 2, BL: 3, SPL: 4, BPL: 5, SIL: 6, DIL: 7,
    R8B: 8, R9B: 9, R10B: 10, R11B: 11, R12B: 12, R13B: 13, R14B: 14, R15B: 15
};

export const PREFIXES = {
    // REX Prefixes
    REX: 0x40,
    REX_W: 0x48, // Promote to 64-bit operand
    REX_R: 0x44, // Extension of the ModR/M reg field
    REX_X: 0x42, // Extension of the SIB index field
    REX_B: 0x41, // Extension of the ModR/M r/m field, SIB base, or Opcode reg
    
    // Operand Size Override
    OS_OVERRIDE: 0x66,
};

export const OPCODES = {
    // --- Data Transfer ---
    
    // MOV r/m64, r64
    MOV_RM64_R64: 0x89,
    // MOV r64, r/m64
    MOV_R64_RM64: 0x8B,
    // MOV r/m64, imm32 (Sign Extended)
    MOV_RM64_IMM32: 0xC7, 
    // MOV r64, imm64 (Move immediate to register) -> REX.W + B8+rd
    MOV_R64_IMM64_BASE: 0xB8,

    // LEA r64, m
    LEA_R64_M: 0x8D,
    
    // PUSH / POP
    PUSH_R64_BASE: 0x50, // +rd
    POP_R64_BASE: 0x58,  // +rd

    // --- Arithmetic & Logic ---
    
    // ADD r/m64, r64
    ADD_RM64_R64: 0x01,
    // ADD r/m64, imm8
    ADD_RM64_IMM8: 0x83, // /0
    // ADD r/m64, imm32
    ADD_RM64_IMM32: 0x81, // /0

    // SUB r/m64, r64
    SUB_RM64_R64: 0x29,
    // SUB r/m64, imm8
    SUB_RM64_IMM8: 0x83, // /5
    // SUB r/m64, imm32
    SUB_RM64_IMM32: 0x81, // /5
    
    // XOR r/m64, r64
    XOR_RM64_R64: 0x31,
    // XOR r/m64, imm8
    XOR_RM64_IMM8: 0x83, // /6

    // AND r/m64, r64
    AND_RM64_R64: 0x21,
    // AND r/m64, imm8
    AND_RM64_IMM8: 0x83, // /4
    
    // CMP r/m64, r64
    CMP_RM64_R64: 0x39,
    // CMP r/m64, imm8
    CMP_RM64_IMM8: 0x83, // /7
    
    // INC / DEC
    INC_RM64: 0xFF, // /0
    DEC_RM64: 0xFF, // /1

    // IMUL r64, r/m64 (Signed Multiply)
    IMUL_R64_RM64: [0x0F, 0xAF],

    // Shift Arithmetic Right: SAR r/m64, imm8
    SAR_RM64_IMM8: 0xC1, // /7
    // Shift Logical Left: SHL r/m64, imm8
    SHL_RM64_IMM8: 0xC1, // /4

    // MOVSX r64, r/m8 (Move with Sign Extension)
    MOVSX_R64_RM8: [0x0F, 0xBE],

    // --- Control Flow ---
    
    // CALL rel32
    CALL_REL32: 0xE8,
    // CALL r/m64 (Indirect)
    CALL_RM64: 0xFF, // /2
    
    // RET
    RET: 0xC3,
    
    // JMP rel32
    JMP_REL32: 0xE9,
    // JMP r/m64
    JMP_RM64: 0xFF, // /4
    // JMP rel8 (Short)
    JMP_REL8: 0xEB,
    
    // Conditional Jumps (Short)
    JO_REL8: 0x70,
    JNO_REL8: 0x71,
    JB_REL8: 0x72,
    JAE_REL8: 0x73,
    JE_REL8: 0x74, // JZ
    JNE_REL8: 0x75, // JNZ
    JL_REL8: 0x7C,  // JL
    JGE_REL8: 0x7D, // JGE
    JLE_REL8: 0x7E, // JLE
    JG_REL8: 0x7F,  // JG

    // Conditional Jumps (Long / 32-bit)
    // 0F 8x cd
    JE_REL32:  [0x0F, 0x84], // JZ
    JNE_REL32: [0x0F, 0x85], // JNZ
    JL_REL32:  [0x0F, 0x8C], // JL (Less)
    JGE_REL32: [0x0F, 0x8D], // JGE (Greater or Equal)
    JLE_REL32: [0x0F, 0x8E], // JLE (Less or Equal)
    JG_REL32:  [0x0F, 0x8F], // JG (Greater)
    
    // --- System / Misc ---
    NOP: 0x90,
    INT3: 0xCC,
    SYSCALL: [0x0F, 0x05]
};

// ModR/M Byte Helpers
// ModR/M Structure: [Mod (2 bits)] [Reg/Opcode (3 bits)] [R/M (3 bits)]

export const MOD = {
    INDIRECT: 0b00,        // [rax]
    DISP8:    0b01,        // [rax + disp8]
    DISP32:   0b10,        // [rax + disp32]
    DIRECT:   0b11         // rax
};

/**
 * Constructs a ModR/M byte.
 * @param {number} mod - The addressing mode (0-3).
 * @param {number} reg - The register index or opcode extension (0-7).
 * @param {number} rm - The register operand (0-7).
 * @returns {number} The byte.
 */
export function makeModRM(mod, reg, rm) {
    return ((mod & 3) << 6) | ((reg & 7) << 3) | (rm & 7);
}

/**
 * Constructs a SIB byte.
 * @param {number} scale - Scale factor (0=1x, 1=2x, 2=4x, 3=8x).
 * @param {number} index - Index register (0-7).
 * @param {number} base - Base register (0-7).
 * @returns {number} The byte.
 */
export function makeSIB(scale, index, base) {
    return ((scale & 3) << 6) | ((index & 7) << 3) | (base & 7);
}