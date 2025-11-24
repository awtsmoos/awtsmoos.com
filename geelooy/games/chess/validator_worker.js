/* B"H */

// =================================================================
//                 PGN LIBRARY VALIDATOR WORKER
// =================================================================
// This worker imports the existing chess logic to validate, merge,
// and clean a PGN library array.

try {
    // Import the necessary logic from your project files.
    // The path is relative to the location of pgn_validator.html
    importScripts('helpers.js', 'generateFromPgn.js');
} catch (e) {
    // If the imports fail, the helper files are not in the right place.
    self.postMessage({ type: 'error', message: `Failed to import scripts. Ensure helpers.js and generateFromPgn.js are in the same directory. Error: ${e.message}` });
}

self.onmessage = (e) => {
    const rawLibrary = e.data;
    if (!self.PgnConverter) {
         self.postMessage({ type: 'error', message: 'Chess logic not loaded. Halting.' });
         return;
    }
    
    const totalEntries = rawLibrary.length;
    self.postMessage({ type: 'progress', message: `Received ${totalEntries} entries. Starting validation...` });

    // =================================================
    // 1. VALIDATION PHASE: Filter out all invalid PGNs
    // =================================================
    const validEntries = [];
    const converter = new PgnConverter();
    rawLibrary.forEach((entry, index) => {
        converter.reset();
        const pgn = entry.pgn || '';
        const moves = pgn.replace(/(\d+\.\s*)/g, '').trim().split(/\s+/).filter(Boolean);
        let isValid = true;

        if (moves.length === 0 && pgn.length > 0) { // Catch empty or malformed PGNs
            isValid = false;
        } else {
            for (const san of moves) {
                const move = converter.parseSan(san);
                if (move === null) {
                    isValid = false;
                    break;
                }
                converter.applyMove(move);
            }
        }
        
        if (isValid) {
            validEntries.push(entry);
        }

        if ((index + 1) % 50 === 0) {
            self.postMessage({ type: 'progress', message: `Validating entry ${index + 1} of ${totalEntries}...` });
        }
    });

    self.postMessage({ type: 'progress', message: `Validation complete. ${validEntries.length} valid lines found. Merging duplicates...` });

    // =================================================
    // 2. MERGING PHASE: Group by name and remove shorter sub-lines
    // =================================================
    const groupedByName = new Map();
    for (const entry of validEntries) {
        if (!groupedByName.has(entry.name)) {
            groupedByName.set(entry.name, []);
        }
        groupedByName.get(entry.name).push(entry);
    }

    const mergedBook = [];
    for (const entries of groupedByName.values()) {
        // Sort by PGN length, longest first
        entries.sort((a, b) => b.pgn.length - a.pgn.length);

        while (entries.length > 0) {
            const baseEntry = entries.shift(); // Take the longest remaining line
            mergedBook.push(baseEntry);

            // Remove any other entries that are just shorter versions of this one
            for (let i = entries.length - 1; i >= 0; i--) {
                if (baseEntry.pgn.startsWith(entries[i].pgn)) {
                    entries.splice(i, 1);
                }
            }
        }
    }
    
    self.postMessage({ type: 'progress', message: `Merging complete. ${mergedBook.length} unique lines found. Renaming variations...` });

    // =================================================
    // 3. RENAMING PHASE: Identify and rename true variations
    // =================================================
    const finalGroupedByName = new Map();
    for (const entry of mergedBook) {
        if (!finalGroupedByName.has(entry.name)) {
            finalGroupedByName.set(entry.name, []);
        }
        finalGroupedByName.get(entry.name).push(entry);
    }

    const finalBook = [];
    for (const [name, entries] of finalGroupedByName.entries()) {
        if (entries.length === 1) {
            finalBook.push(entries[0]);
            continue;
        }
        
        // The first one keeps the base name
        finalBook.push(entries[0]);
        const baseMoves = entries[0].pgn.replace(/(\d+\.\s*)/g, '').trim().split(/\s+/);

        // Rename the subsequent variations
        for (let i = 1; i < entries.length; i++) {
            const currentEntry = entries[i];
            const currentMoves = currentEntry.pgn.replace(/(\d+\.\s*)/g, '').trim().split(/\s+/);
            
            let divergingMove = '';
            let divergingIndex = -1;

            for (let j = 0; j < Math.min(baseMoves.length, currentMoves.length); j++) {
                if (baseMoves[j] !== currentMoves[j]) {
                    divergingIndex = j;
                    divergingMove = currentMoves[j];
                    break;
                }
            }

            if (divergingMove) {
                const moveNum = Math.floor(divergingIndex / 2) + 1;
                const color = divergingIndex % 2 === 0 ? '.' : '...';
                currentEntry.name = `${name}: ${moveNum}${color}${divergingMove}`;
            } else {
                // This case should be rare after merging, but is a good fallback
                currentEntry.name = `${name} (Variation ${i + 1})`;
            }
            finalBook.push(currentEntry);
        }
    }
    
    // Final sort for clean output
    finalBook.sort((a,b) => a.name.localeCompare(b.name));

    self.postMessage({ type: 'complete', data: finalBook });
};