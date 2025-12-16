/*
B"H
Boruch Hashem
Biezrash Hashem
*/
/**
 * Awtsmoos x64 Opcode Dictionary.
 */

export const REGISTERS = {
    // 64-bit
    RAX: 0, RCX: 1, RDX: 2, RBX: 3, RSP: 4, RBP: 5, RSI: 6, RDI: 7,
    R8: 8, R9: 9, R10: 10, R11: 11, R12: 12, R13: 13, R14: 14, R15: 15,
    
    // 32-bit
    EAX: 0, ECX: 1, EDX: 2, EBX: 3, ESP: 4, EBP: 5, ESI: 6, EDI: 7,
    R8D: 8, R9D: 9, R10D: 10, R11D: 11, R12D: 12, R13D: 13, R14D: 14, R15D: 15,
    
    // 16-bit
    AX: 0, CX: 1, DX: 2, BX: 3, SP: 4, BP: 5, SI: 6, DI: 7,
    R8W: 8, R9W: 9, R10W: 10, R11W: 11, R12W: 12, R13W: 13, R14W: 14, R15W: 15,

    // 8-bit
    AL: 0, CL: 1, DL: 2, BL: 3, SPL: 4, BPL: 5, SIL: 6, DIL: 7,
    R8B: 8, R9B: 9, R10B: 10, R11B: 11, R12B: 12, R13B: 13, R14B: 14, R15B: 15
};

export const REGISTER_SIZES = {
    RAX: 64, RCX: 64, RDX: 64, RBX: 64, RSP: 64, RBP: 64, RSI: 64, RDI: 64,
    R8: 64, R9: 64, R10: 64, R11: 64, R12: 64, R13: 64, R14: 64, R15: 64,
    EAX: 32, ECX: 32, EDX: 32, EBX: 32, ESP: 32, EBP: 32, ESI: 32, EDI: 32,
    R8D: 32, R9D: 32, R10D: 32, R11D: 32, R12D: 32, R13D: 32, R14D: 32, R15D: 32,
    AX: 16, CX: 16, DX: 16, BX: 16, SP: 16, BP: 16, SI: 16, DI: 16,
    R8W: 16, R9W: 16, R10W: 16, R11W: 16, R12W: 16, R13W: 16, R14W: 16, R15W: 16,
    AL: 8, CL: 8, DL: 8, BL: 8, SPL: 8, BPL: 8, SIL: 8, DIL: 8,
    R8B: 8, R9B: 8, R10B: 8, R11B: 8, R12B: 8, R13B: 8, R14B: 8, R15B: 8
};

export const PREFIXES = {
    REX: 0x40,
    REX_W: 0x48,
    REX_R: 0x44,
    REX_X: 0x42,
    REX_B: 0x41,
    OS_OVERRIDE: 0x66,
    REP: 0xF3,  // Repeat prefix
    REPNE: 0xF2 // Repeat Not Equal
};

export const OPCODES = {
    MOV_RM_R: 0x89,
    MOV_R_RM: 0x8B,
    MOV_RM8_R8: 0x88,
    MOV_R8_RM8: 0x8A,
    
    MOV_RM_IMM32: 0xC7, 
    MOV_RM8_IMM8: 0xC6,

    MOV_R64_IMM64_BASE: 0xB8,
    MOV_R32_IMM32_BASE: 0xB8,
    MOV_R8_IMM8_BASE: 0xB0,

    LEA_R64_M: 0x8D,
    
    PUSH_R64_BASE: 0x50,
    POP_R64_BASE: 0x58,

    ADD_RM64_R64: 0x01, ADD_R64_RM64: 0x03, ADD_RM64_IMM8: 0x83, ADD_RM64_IMM32: 0x81,
    SUB_RM64_R64: 0x29, SUB_R64_RM64: 0x2B, SUB_RM64_IMM8: 0x83, SUB_RM64_IMM32: 0x81,
    OR_RM64_R64: 0x09,  OR_R64_RM64: 0x0B,  OR_RM64_IMM8: 0x83,  OR_RM64_IMM32: 0x81,
    XOR_RM64_R64: 0x31, XOR_R64_RM64: 0x33, XOR_RM64_IMM8: 0x83,
    AND_RM64_R64: 0x21, AND_R64_RM64: 0x23, AND_RM64_IMM8: 0x83,
    CMP_RM64_R64: 0x39, CMP_R64_RM64: 0x3B, CMP_RM64_IMM8: 0x83,
    TEST_RM64_R64: 0x85, TEST_RM64_IMM32: 0xF7,
    
    INC_RM64: 0xFF, DEC_RM64: 0xFF, NEG_RM64: 0xF7,
    IMUL_R64_RM64: [0x0F, 0xAF],
    IDIV_RM64: 0xF7, DIV_RM64: 0xF7, CQO: 0x99,
    SAR_RM64_IMM8: 0xC1, SHL_RM64_IMM8: 0xC1,
    MOVSX_R64_RM8: [0x0F, 0xBE],
    MOVZX_R_RM: [0x0F, 0xB6], // Byte to Reg

    // String Instructions
    STOSB: 0xAA,
    STOSD: 0xAB, 
    MOVSB: 0xA4,
    MOVSD: 0xA5,
    CLD: 0xFC,
    STD: 0xFD,

    CMOV_O: [0x0F, 0x40], CMOV_NO: [0x0F, 0x41], CMOV_B: [0x0F, 0x42], CMOV_AE: [0x0F, 0x43],
    CMOV_E: [0x0F, 0x44], CMOV_NE: [0x0F, 0x45], CMOV_BE: [0x0F, 0x46], CMOV_A: [0x0F, 0x47],
    CMOV_S: [0x0F, 0x48], CMOV_NS: [0x0F, 0x49], CMOV_P: [0x0F, 0x4A], CMOV_NP: [0x0F, 0x4B],
    CMOV_L: [0x0F, 0x4C], CMOV_GE: [0x0F, 0x4D], CMOV_LE: [0x0F, 0x4E], CMOV_G: [0x0F, 0x4F],

    CALL_REL32: 0xE8, CALL_RM64: 0xFF, RET: 0xC3,
    JMP_REL32: 0xE9, JMP_RM64: 0xFF, JMP_REL8: 0xEB,
    
    JO_REL8: 0x70, JNO_REL8: 0x71, JB_REL8: 0x72, JAE_REL8: 0x73, JE_REL8: 0x74, JNE_REL8: 0x75,
    JL_REL8: 0x7C, JGE_REL8: 0x7D, JLE_REL8: 0x7E, JG_REL8: 0x7F,

    JE_REL32: [0x0F, 0x84], JNE_REL32: [0x0F, 0x85], JL_REL32: [0x0F, 0x8C], JGE_REL32: [0x0F, 0x8D],
    JLE_REL32: [0x0F, 0x8E], JG_REL32: [0x0F, 0x8F],

    SETE_RM8: [0x0F, 0x94], SETNE_RM8: [0x0F, 0x95], SETL_RM8: [0x0F, 0x9C],
    SETG_RM8: [0x0F, 0x9F], SETLE_RM8: [0x0F, 0x9E], SETGE_RM8: [0x0F, 0x9D],

    NOP: 0x90, INT3: 0xCC, SYSCALL: [0x0F, 0x05]
};

export const MOD = {
    INDIRECT: 0b00, DISP8: 0b01, DISP32: 0b10, DIRECT: 0b11
};

export function makeModRM(mod, reg, rm) {
    return ((mod & 3) << 6) | ((reg & 7) << 3) | (rm & 7);
}

export function makeSIB(scale, index, base) {
    return ((scale & 3) << 6) | ((index & 7) << 3) | (base & 7);
}