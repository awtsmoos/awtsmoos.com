/* B"H */
console. log('B"H')
/* B"H */

try {
    // Load the sanctified scriptures
    importScripts(
        '../bitboard-helpers.js',
        '../helpers.js',
        '../generateFromPgn.js',
        '../grandmaster_library.js'
    );
} catch (e) {
    self.postMessage({ type: 'log', message: `FATAL: Could not import engine scripts. Error: ${e.message}`, className: 'error' });
    self.postMessage({ type: 'complete' });
    self.close();
}

// A communication channel to the outside world
function log(message, className = '') {
    self.postMessage({ type: 'log', message, className });
}

self.onmessage = function(e) {
    const { command, fen, targetSan } = e.data;
    if (command === 'run_diagnostic') {
        runDiagnostic(fen, targetSan);
    }
};

// --- NEW: ASCII Board Visualization ---
function logBoard(state) {
    let boardStr = "";
    log("--- BOARD VISUALIZATION (Engine Reality) ---", "info");
    // Standard FEN order: Rank 8 (r=0) to Rank 1 (r=7)
    for (let r = 0; r < 8; r++) {
        let rowStr = `Rank ${8-r}:  `;
        for (let f = 0; f < 8; f++) {
            const sq = r * 8 + f;
            let char = ".";
            // Check all 12 piece bitboards
            for (let i = 0; i < 12; i++) {
                if ((state.pieceBitboards[i] >> BigInt(sq)) & 1n) {
                    char = pieceMap[i]; // Use the global pieceMap
                    break;
                }
            }
            rowStr += char + " ";
        }
        log(rowStr, "trace");
    }
    log("------------------------------------------", "info");
}

function runDiagnostic(fen, targetSan) {
    try {
        log('B"H - DEEP DIAGNOSTIC MODE ACTIVATED', 'header');
        initializeAll();
        
        // --- 1. Setup Auditing ---
        self.EngineSoul = { isAuditing: true };
        
        // Redirect Scribe logs to the UI so we can see the mismatches
        if (self.ScribeLogger) {
            self.ScribeLogger.logComparison = function(details) {
                const { generatedSan, targetSan, isMatch, reason } = details;
                const icon = isMatch ? "✅" : "❌";
                const style = isMatch ? "success" : "trace";
                log(`[SCRIBE] ${icon} Target: "${targetSan}" | Gen: "${generatedSan}" | ${reason}`, style);
            };
            log('Scribe output redirected to UI.', 'success');
        }

        // --- 2. Create and Inspect State ---
        log(`\nParsing FEN: ${fen}`, 'info');
        const state = createGameState(fen);
        
        // LOG CRITICAL STATE VARIABLES
        log(`Turn: ${state.turn === 0 ? 'White' : 'Black'} (Val: ${state.turn})`, 'info');
        log(`En Passant: ${state.enpassant}`, 'info');
        log(`Castling: ${state.castling}`, 'info');
        
        // VISUALIZE THE BOARD
        logBoard(state);
        
        // CHECK FOR BITBOARD OVERLAPS
        // If a White Knight is also in the Black Knight bitboard, we have a major issue.
        const whitePieces = state.occupancies[0];
        const blackPieces = state.occupancies[1];
        if ((whitePieces & blackPieces) !== 0n) {
            log('CRITICAL ERROR: White and Black pieces overlap! (Occupancy Collision)', 'error');
            log(`Overlap: 0x${(whitePieces & blackPieces).toString(16)}`, 'error');
        } else {
            log('Occupancy Check: No overlapping pieces between sides.', 'success');
        }

        // --- 3. Generate Moves ---
        log('\nGenerating moves...', 'info');
        const legalMoves = generateMoves(state);
        log(`Generated ${legalMoves.length} legal moves.`, 'success');

        // --- 4. Run Scribe Analysis ---
        const scribe = new PgnConverter();
        scribe.setState(state);
        let matchFound = false;

        log('\n--- MOVE ANALYSIS ---', 'header');
        for (const moveInt of legalMoves) {
            if (scribe.isMoveSan(moveInt, targetSan, legalMoves)) {
                matchFound = true;
                break;
            }
        }
        
        log('\n--- FINAL DIAGNOSIS ---', 'header');
        if (matchFound) {
            log('✅ PARADOX RESOLVED.', 'success');
        } else {
            log('❌ PARADOX PERSISTS.', 'error');
            log('Check the BOARD VISUALIZATION above. Are the pieces where they should be?', 'info');
        }

    } catch (err) {
        log(`ERROR: ${err.message}`, 'error');
        log(err.stack, 'error');
    } finally {
        if (self.EngineSoul) delete self.EngineSoul;
        self.postMessage({ type: 'complete' });
    }
}