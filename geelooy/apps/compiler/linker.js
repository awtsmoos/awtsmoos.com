/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { align, stringToBytes } from './utils.js';
import { PE_CONSTANTS } from './pe_defs.js';
import { PEBuilder } from './pe_builder.js';
import { buildImportTable } from './import_manager.js';

export function linkAndBuild(artifact, mode) {
    const { code, dataBlobs, importDef, dataRelocs } = artifact;
    const { DEFAULT_SECT_ALIGN, DEFAULT_FILE_ALIGN, DEFAULT_IMAGE_BASE } = PE_CONSTANTS;
    const RVA_TEXT = DEFAULT_SECT_ALIGN; // 0x1000

    // 1. Resolve Labels Internal to Code
    code.resolveLabels();

    // 2. Build Import Table Info
    const importTable = buildImportTable(importDef);

    // 3. Layout Section
    // [Code] [Padding] [Data Blobs] [Padding] [Imports]
    
    let offset = 0;
    const codeStart = offset;
    offset += code.buffer.length;
    offset = align(offset, 8);
    
    // Data Offsets
    const dataOffsets = [];
    for(let blob of dataBlobs) {
        dataOffsets.push(offset);
        offset += blob.length;
        offset = align(offset, 8);
    }
    
    // Import Offsets
    const iatOffset = offset;
    offset += importTable.iatSize;
    const idtOffset = offset;
    offset += importTable.idtSize;
    const iltOffset = offset;
    offset += importTable.iltSize;
    const namesOffset = offset;
    offset += importTable.namesSize;

    const sectionRawSize = offset;
    const sectionDiskSize = align(sectionRawSize, DEFAULT_FILE_ALIGN);

    // 4. Write Content to Section Buffer
    const sectionData = new Uint8Array(sectionDiskSize);
    const dv = new DataView(sectionData.buffer);
    
    // Write Code
    sectionData.set(new Uint8Array(code.buffer), codeStart);
    
    // Write Data
    dataBlobs.forEach((blob, i) => {
        sectionData.set(blob, dataOffsets[i]);
    });

    // Write Imports
    let currentNameOffset = namesOffset;
    let currentIatOffset = iatOffset;
    let currentIltOffset = iltOffset;
    
    const funcRvaMap = {};

    importTable.definitions.forEach((dll, dllIdx) => {
        const idtEntry = idtOffset + (dllIdx * 20);
        
        // IDT: Name RVA
        dv.setUint32(idtEntry + 12, RVA_TEXT + currentNameOffset, true); 
        sectionData.set(stringToBytes(dll.name), currentNameOffset);
        currentNameOffset += dll.name.length;
        if (currentNameOffset % 2 !== 0) currentNameOffset++;

        // IDT: Thunks
        dv.setUint32(idtEntry + 0, RVA_TEXT + currentIltOffset, true); // Original
        dv.setUint32(idtEntry + 16, RVA_TEXT + currentIatOffset, true); // First

        dll.funcs.forEach(fn => {
            const hintRva = RVA_TEXT + currentNameOffset;
            sectionData.set(stringToBytes(fn), currentNameOffset + 2);
            
            // Set Thunks (64-bit)
            // Note: We set only low 32-bits (RVA), high bits are 0.
            dv.setUint32(currentIltOffset, hintRva, true);
            dv.setUint32(currentIatOffset, hintRva, true);
            
            funcRvaMap[fn] = RVA_TEXT + currentIatOffset;

            currentIltOffset += 8;
            currentIatOffset += 8;
            currentNameOffset += 2 + fn.length;
            if (currentNameOffset % 2 !== 0) currentNameOffset++;
        });

        // Null Terminators
        currentIltOffset += 8;
        currentIatOffset += 8;
    });

    // 5. Apply External Patches (Imports & Data)
    
    // Helper: Patch 32-bit displacement relative to Next Instruction (RIP)
    function patchDisp32(patchOffset, targetRVA) {
        // RIP = BaseRVA + PatchOffset + 4 (Size of Disp field)
        const rip = RVA_TEXT + patchOffset + 4;
        const disp = targetRVA - rip;
        dv.setUint32(codeStart + patchOffset, disp, true);
    }

    // Call Patches (Imports)
    code.callPatches.forEach(patch => {
        const targetRVA = funcRvaMap[patch.funcName];
        if (!targetRVA) throw new Error("Missing import: " + patch.funcName);
        patchDisp32(patch.offset, targetRVA);
    });

    // Data Patches (LEA to Data)
    code.dataPatches.forEach(patch => {
        const targetRVA = RVA_TEXT + dataOffsets[patch.id];
        patchDisp32(patch.offset, targetRVA);
    });
    
    // 6. Apply Data-to-Data Relocations (e.g. Globals pointing to strings/functions)
    if (dataRelocs) {
        dataRelocs.forEach(reloc => {
            // Find target RVA
            let targetRva = 0;
            
            // Is it a code label?
            if (code.labels[reloc.target] !== undefined) {
                targetRva = RVA_TEXT + code.labels[reloc.target];
            } 
            // Is it a data label (handled via asm/parser context which isn't fully exposed here)?
            // We only have access to dataOffsets by ID.
            // The reloc.target is a string name. The asm parser mapped names to IDs in dataSymbols.
            // But here we don't have the name-to-ID map directly unless passed.
            // For now, let's assume the reloc target is a CODE label.
            // Wait, C globals usually point to string literals (Data Blobs).
            // We need the data symbol map in linker or pre-resolved IDs.
            // Simplified: linker.js doesn't see dataSymbols map.
            // We'll rely on ASM parser resolving data references to other data?
            // ASM parser can't resolve data-to-data offsets easily without layout.
            // FIX: If target is not in code, we might fail.
            // BUT: string literals generated by C compiler are labels in ASM: `str_0: ...`.
            // `dataSymbols` in parser maps `str_0` to an ID.
            // We need that map here or have the parser resolve the ID.
            // Let's assume for now C generated pointers point to CODE labels (functions) or we need to pass the map.
            
            // To properly fix, `createCustomAsmApp` should probably resolve names to IDs for dataRelocs if possible,
            // or pass the map.
            // Let's be safe: If we can't find the label, we skip (or throw).
        });
        
        // REVISION: We need `dataSymbols` here to resolve string pointers.
        // Since we can't change the signature easily without plumbing, 
        // let's try to handle it in `asm/parser.js` by converting symbolic targets to blob IDs if known.
        // But `asm/parser` knows symbols. 
        // Let's just assume for this pass that we only support code pointers OR 
        // we can't support data pointers without passing the symbol map.
        // Let's modify `compiler_asm.js` to pass `dataSymbols` map? 
        // Or better: `linker.js` is the one calculating offsets.
        // We will skip data relocs for now in this iteration unless I add `dataSymbols` to artifact.
        
        // Actually, let's add `dataSymbols` to artifact.
    }

    // 7. Determine Entry Point
    let entryPointOffset = 0;
    if (code.labels['start'] !== undefined) {
        entryPointOffset = code.labels['start'];
    }

    // 7. Construct PE
    const pe = new PEBuilder(
        code.buffer.length,
        sectionRawSize - code.buffer.length,
        sectionRawSize,
        sectionData,
        RVA_TEXT + entryPointOffset // Adjust Entry Point RVA
    );
    
    pe.setImportDirectory(RVA_TEXT + idtOffset, importTable.idtSize);
    
    if (mode === 'gui') {
        pe.setGuiSubsystem();
    }

    // Apply Data Relocations (Absolute Addresses)
    // We do this AFTER PE construction basics because we need ImageBase
    if (dataRelocs && artifact.dataSymbols) {
        const symMap = artifact.dataSymbols;
        dataRelocs.forEach(reloc => {
            const blobOffset = dataOffsets[reloc.blobId];
            const patchPos = blobOffset + reloc.offset;
            
            let targetRva = 0;
            
            if (code.labels[reloc.target] !== undefined) {
                targetRva = RVA_TEXT + code.labels[reloc.target];
            } else if (symMap.has(reloc.target)) {
                const targetBlobId = symMap.get(reloc.target);
                targetRva = RVA_TEXT + dataOffsets[targetBlobId];
            } else {
                console.warn(`Linker: Undefined symbol '${reloc.target}' in data relocation.`);
                return;
            }
            
            const fullAddress = BigInt(DEFAULT_IMAGE_BASE) + BigInt(targetRva);
            dv.setBigUint64(patchPos, fullAddress, true);
        });
    }

    const headerBuffer = pe.build();
    return new Blob([headerBuffer, sectionData], { type: "application/vnd.microsoft.portable-executable" });
}