/*
B"H
Boruch Hashem
Biezrash Hashem
*/
/**
 * Portable Executable (PE) Format Constants.
 * Based on Microsoft PE/COFF Specification.
 */

export const PE_CONSTANTS = {
    IMAGE_DOS_SIGNATURE: 0x5A4D,    // MZ
    IMAGE_NT_SIGNATURE: 0x00004550, // PE\0\0
    
    // File Header
    IMAGE_FILE_MACHINE_AMD64: 0x8664,
    
    // Optional Header (PE32+)
    IMAGE_NT_OPTIONAL_HDR64_MAGIC: 0x020B,
    
    // Subsystem
    IMAGE_SUBSYSTEM_WINDOWS_CUI: 3, // Console
    IMAGE_SUBSYSTEM_WINDOWS_GUI: 2,
    
    // DLL Characteristics
    IMAGE_DLLCHARACTERISTICS_DYNAMIC_BASE: 0x0040,
    IMAGE_DLLCHARACTERISTICS_NX_COMPAT: 0x0100,
    IMAGE_DLLCHARACTERISTICS_TERMINAL_SERVER_AWARE: 0x8000,
    
    // Section Characteristics
    IMAGE_SCN_CNT_CODE: 0x00000020,
    IMAGE_SCN_CNT_INITIALIZED_DATA: 0x00000040,
    IMAGE_SCN_MEM_EXECUTE: 0x20000000,
    IMAGE_SCN_MEM_READ: 0x40000000,
    IMAGE_SCN_MEM_WRITE: 0x80000000,
    
    // Defaults
    DEFAULT_SECT_ALIGN: 0x1000,
    DEFAULT_FILE_ALIGN: 0x200,
    // Standard 64-bit ImageBase to avoid memory conflicts (STATUS_NO_MEMORY)
    DEFAULT_IMAGE_BASE: 0x140000000 
};