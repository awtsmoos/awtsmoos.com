/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { align, stringToBytes } from './utils.js';
import { PE_CONSTANTS } from './pe_defs.js';

/**
 * Helper class to construct PE Headers.
 */
export class PEBuilder {
    constructor(codeSize, dataSize, totalVirtualSize, sectionData, entryPointRVA) {
        this.codeSize = codeSize;
        this.dataSize = dataSize;
        this.totalVirtualSize = totalVirtualSize;
        this.sectionData = sectionData;
        this.entryPointRVA = entryPointRVA;
        
        this.headersSize = 0x200; // 512 bytes fixed
        this.headerBuffer = new Uint8Array(this.headersSize);
        this.view = new DataView(this.headerBuffer.buffer);

        // Default Subsystem: Console
        this.subsystem = PE_CONSTANTS.IMAGE_SUBSYSTEM_WINDOWS_CUI;
    }

    setGuiSubsystem() {
        this.subsystem = PE_CONSTANTS.IMAGE_SUBSYSTEM_WINDOWS_GUI;
    }

    setImportDirectory(rva, size) {
        const opt = 0x58;
        // DataDirectory[1] is Import Table. Offset 112 + 8 = 120.
        this.view.setUint32(opt + 120, rva, true);
        this.view.setUint32(opt + 124, size, true);
    }

    build() {
        this.buildDosHeader();
        this.buildPEHeader();
        this.buildOptionalHeader();
        this.buildSectionTable();
        return this.headerBuffer;
    }

    buildDosHeader() {
        this.view.setUint16(0, PE_CONSTANTS.IMAGE_DOS_SIGNATURE, true); // MZ
        this.view.setUint32(0x3C, 0x40, true); // Offset to PE Header
    }

    buildPEHeader() {
        const pe = 0x40;
        this.view.setUint32(pe, PE_CONSTANTS.IMAGE_NT_SIGNATURE, true); // PE\0\0
        this.view.setUint16(pe + 4, PE_CONSTANTS.IMAGE_FILE_MACHINE_AMD64, true);
        this.view.setUint16(pe + 6, 1, true); // NumberOfSections
        this.view.setUint16(pe + 20, 0xF0, true); // SizeOfOptionalHeader
        // Characteristics: RELOCS_STRIPPED | EXECUTABLE | LARGE_ADDRESS_AWARE
        this.view.setUint16(pe + 22, 0x0023, true); 
    }

    buildOptionalHeader() {
        const opt = 0x58; // 0x40 + 24
        const { DEFAULT_IMAGE_BASE, DEFAULT_SECT_ALIGN, DEFAULT_FILE_ALIGN } = PE_CONSTANTS;

        this.view.setUint16(opt, PE_CONSTANTS.IMAGE_NT_OPTIONAL_HDR64_MAGIC, true); // PE32+
        this.view.setUint8(opt + 2, 0x0E); // Linker Major
        this.view.setUint8(opt + 3, 0x00); // Linker Minor

        this.view.setUint32(opt + 4, align(this.codeSize, DEFAULT_FILE_ALIGN), true); // SizeOfCode
        this.view.setUint32(opt + 8, align(this.dataSize, DEFAULT_FILE_ALIGN), true); // SizeOfInitData
        
        this.view.setUint32(opt + 16, this.entryPointRVA, true); // AddressOfEntryPoint
        this.view.setUint32(opt + 20, this.entryPointRVA, true); // BaseOfCode

        this.view.setBigUint64(opt + 24, BigInt(DEFAULT_IMAGE_BASE), true);
        this.view.setUint32(opt + 32, DEFAULT_SECT_ALIGN, true);
        this.view.setUint32(opt + 36, DEFAULT_FILE_ALIGN, true);
        
        this.view.setUint16(opt + 40, 6, true); // MajorOSVer
        this.view.setUint16(opt + 48, 6, true); // MajorSubsystemVer

        // SizeOfImage
        const sizeOfImage = align(this.headersSize, DEFAULT_SECT_ALIGN) + align(this.totalVirtualSize, DEFAULT_SECT_ALIGN);
        this.view.setUint32(opt + 56, sizeOfImage, true);

        this.view.setUint32(opt + 60, this.headersSize, true); // SizeOfHeaders
        this.view.setUint32(opt + 64, 0, true); // CheckSum

        // Subsystem (Offset 68)
        this.view.setUint16(opt + 68, this.subsystem, true);

        // DllCharacteristics: NX_COMPAT | TERMINAL_SERVER_AWARE
        this.view.setUint16(opt + 70, 0x8100, true);

        this.view.setBigUint64(opt + 72, 0x100000n, true); // StackReserve
        this.view.setBigUint64(opt + 80, 0x1000n, true);   // StackCommit
        this.view.setBigUint64(opt + 88, 0x100000n, true); // HeapReserve
        this.view.setBigUint64(opt + 96, 0x1000n, true);   // HeapCommit

        this.view.setUint32(opt + 104, 0, true);  // LoaderFlags
        this.view.setUint32(opt + 108, 16, true); // NumberOfRvaAndSizes
    }

    buildSectionTable() {
        const sect = 0x148;
        const { DEFAULT_SECT_ALIGN, DEFAULT_FILE_ALIGN } = PE_CONSTANTS;
        
        // Name: .text
        this.headerBuffer.set(stringToBytes(".text"), sect);
        
        this.view.setUint32(sect + 8, align(this.totalVirtualSize, DEFAULT_SECT_ALIGN), true); // VirtualSize
        this.view.setUint32(sect + 12, DEFAULT_SECT_ALIGN, true); // VirtualAddress
        this.view.setUint32(sect + 16, align(this.totalVirtualSize, DEFAULT_FILE_ALIGN), true); // SizeOfRawData
        this.view.setUint32(sect + 20, this.headersSize, true); // PointerToRawData
        
        // Characteristics: Exec | Read | Write | Code | InitData
        this.view.setUint32(sect + 36, 0xE0000060, true);
    }
}
