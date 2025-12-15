/* B"H */

export function resolveStructs(structs) {
    const layouts = new Map();

    for (const s of structs) {
        let offset = 0;
        const fields = new Map();
        
        for (const f of s.fields) {
            let size = 8; // Default 64-bit align
            // Primitive sizes?
            if (f.type.ptr === 0) {
                if (f.type.base === 'char') size = 1;
                else if (f.type.base === 'int') size = 8; 
                // Nested struct? Not handled yet
            }
            
            if (f.arraySize > 0) size *= f.arraySize;
            
            // Padding
            // Simple alignment: Everything 8-byte aligned if > 1 byte, else packed?
            // Windows ABI: align to member size.
            // Let's keep it simple: everything 8 byte aligned for now except chars?
            // To make `struct dirent` work (Win32 API), we MUST match C layout.
            // int is 4 bytes. char is 1.
            
            // Adjust size for 'int' to 4 bytes
            if (f.type.ptr === 0 && f.type.base === 'int') {
                // But our registers are 64-bit.
                // If we treat int as 4 bytes, we need to be careful with stack slots.
                // ASM emitter generally pushes 64-bit.
                // However, data structs must be packed correctly.
                size = (f.arraySize > 0 ? f.arraySize : 1) * 4;
            } else if (f.type.ptr === 0 && f.type.base === 'char') {
                size = (f.arraySize > 0 ? f.arraySize : 1);
            } else {
                // Pointers are 8
                size = (f.arraySize > 0 ? f.arraySize : 1) * 8;
            }

            // Align offset?
            // If int (4), align to 4. If ptr (8), align to 8.
            let align = 8;
            if (f.type.ptr === 0) {
                if (f.type.base === 'char') align = 1;
                else if (f.type.base === 'int') align = 4;
            }
            
            // align offset
            while (offset % align !== 0) offset++;
            
            fields.set(f.name, { offset, size, type: f.type, isArray: f.arraySize > 0 });
            offset += size;
        }
        
        // Structure size alignment (usually to largest member)
        while (offset % 8 !== 0) offset++;
        
        layouts.set(s.name, { size: offset, fields });
    }
    return layouts;
}