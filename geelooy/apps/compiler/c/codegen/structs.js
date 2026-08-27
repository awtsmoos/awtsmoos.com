/* B"H */

export function resolveStructs(structs) {
    const layouts = new Map();

    for (const s of structs) {
        let offset = 0;
        const fields = new Map();
        
        for (const f of s.fields) {
            let size = 8; // Default 64-bit pointer size
            
            if (f.type.ptr === 0) {
                if (f.type.base === 'char') {
                    size = 1;
                } else if (f.type.base === 'int') {
                    size = 4; // Ints are 4 bytes in structs (Win32 API compat)
                } else if (layouts.has(f.type.base)) {
                    // It is a nested struct value
                    size = layouts.get(f.type.base).size;
                }
            }
            
            if (f.arraySize > 0) size *= f.arraySize;
            
            // Alignment
            let align = 8;
            if (f.type.ptr === 0) {
                if (f.type.base === 'char') align = 1;
                else if (f.type.base === 'int') align = 4;
                // If nested struct, ideally align to its largest member, but 8 is safe fallback for x64
            }
            
            while (offset % align !== 0) offset++;
            
            fields.set(f.name, { offset, size, type: f.type, isArray: f.arraySize > 0 });
            offset += size;
        }
        
        // Structure size alignment (to 8 bytes)
        while (offset % 8 !== 0) offset++;
        
        layouts.set(s.name, { size: offset, fields });
    }
    return layouts;
}