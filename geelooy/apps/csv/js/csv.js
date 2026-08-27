//B"H
/**
 * Native module for CSV manipulation.
 * No libraries. Pure logic.
 */

export const parseCSV = (content) => {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotedField = false;
    
    // Normalize line endings slightly for easier parsing
    // But mostly rely on the character stream
    const chars = content;
    
    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        const nextChar = chars[i + 1];

        if (inQuotedField) {
            if (char === '"') {
                if (nextChar === '"') {
                    // Escaped quote inside quoted field
                    currentField += '"';
                    i++;
                } else {
                    // End of quoted field
                    inQuotedField = false;
                }
            } else {
                currentField += char;
            }
        } else {
            if (char === '"') {
                inQuotedField = true;
            } else if (char === ',') {
                currentRow.push(currentField);
                currentField = '';
            } else if (char === '\r' || char === '\n') {
                // Handle CRLF or LF or CR
                if (char === '\r' && nextChar === '\n') {
                    i++;
                }
                currentRow.push(currentField);
                rows.push(currentRow);
                currentRow = [];
                currentField = '';
            } else {
                currentField += char;
            }
        }
    }

    // Flush last field
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }

    // Normalize row lengths
    if (rows.length > 0) {
        const maxCols = rows.reduce((max, row) => Math.max(max, row.length), 0);
        return rows.map(row => {
            while (row.length < maxCols) row.push('');
            return row;
        });
    }

    return rows;
};

export const generateCSV = (data) => {
    return data.map(row => {
        return row.map(field => {
            const stringField = String(field || '');
            // Check if field needs quoting
            if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n') || stringField.includes('\r')) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        }).join(',');
    }).join('\n');
};