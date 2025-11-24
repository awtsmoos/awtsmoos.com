/* B"H */

// This is a dedicated Web Worker. It cannot access the DOM.
// Its purpose is to load the engine's brain and run the test.
console. log(`B"H`)
try {
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

function log(message, className = '') {
    self.postMessage({ type: 'log', message, className });
}

self.onmessage = function(e) {
    const { command, fen, targetSan } = e.data;
    if (command === 'run_diagnostic') {
        runDiagnostic(fen, targetSan);
    }
};

function runDiagnostic(fen, targetSan) {
    try {
        log('B"H - FORGING THE UNIVERSE FROM THE VOID', 'header');
        initializeAll();
        log('Universe is stable. All physical laws (bitboards) are initialized.', 'success');

        log(`\n--- TEST SCENARIO ---`);
        log(`REALITY (FEN):     ${fen}`);
        log(`TARGET WORD (SAN): "${targetSan}"`);
        log(`-----------------------\n`);

        log('Creating game state from FEN...', 'info');
        const state = createGameState(fen);
        log('Game state created successfully.', 'success');
        
        // =================================================================
        // B"H - NEW DEEP DIAGNOSTIC LOGGING
        // We will now inspect the engine's mind BEFORE it generates moves.
        // =================================================================
        log('\n--- DEEP STATE ANALYSIS (PRE-MOVEGEN) ---', 'header');
        log(`Inspecting state for turn: ${state.turn === 0 ? 'WHITE' : 'BLACK'}`);

        const files = 'abcdefgh', ranks = '87654321';
        const pieceChars = ['P','N','B','R','Q','K'];

        for (let p = P; p <= K; p++) {
            const pieceIndex = state.turn * 6 + p;
            const pieceName = pieceChars[p];
            const pieceBitboard = state.pieceBitboards[pieceIndex];
            
            log(`\n[${pieceName}] Bitboard (Hex): 0x${pieceBitboard.toString(16)}`, 'info');
            
            let bb_copy = pieceBitboard;
            if (bb_copy === 0n) {
                log(`  -> No pieces found.`, 'trace');
            } else {
                let pieceSquares = [];
                while (bb_copy > 0n) {
                    const from = getLSBIndex(bb_copy);
                    const coord = `${files[from % 8]}${ranks[Math.floor(from/8)]}`;
                    pieceSquares.push(coord);
                    bb_copy = popBit(bb_copy);
                }
                log(`  -> Found pieces at: ${pieceSquares.join(', ')}`, 'trace');
            }
        }
        // =================================================================
        // END OF NEW LOGGING
        // =================================================================

        if (self.EngineSoul) {
            self.EngineSoul.isAuditing = true;
        }

        log('\nNow, asking the engine to generate all legal moves...', 'info');
        const legalMoves = generateMoves(state);
        log(`The engine has generated ${legalMoves.length} legal moves for this position.`);

        const scribe = new PgnConverter();
        scribe.setState(state);

        let matchFound = false;
        log('\n--- SCRIBE TRACE: Comparing generated moves to target ---', 'header');
        
        const originalLogComparison = self.ScribeLogger.logComparison;
        const capturedLogs = [];
        self.ScribeLogger.logComparison = (details) => { capturedLogs.push(details); };

        for (const moveInt of legalMoves) {
            if (scribe.isMoveSan(moveInt, targetSan, legalMoves)) {
                matchFound = true;
                break;
            }
        }
        
        self.ScribeLogger.logComparison = originalLogComparison;
        
        capturedLogs.forEach(details => {
            const { generatedSan, isMatch, reason } = details;
            const msg = `[SCRIBE] ► Generated: "${generatedSan}", Match: ${isMatch ? '✅' : '❌'}, Reason: ${reason}`;
            log(msg, 'trace');
        });

        if (matchFound) log('\n✅ A match was found during the trace!', 'success');

        log('\n--- FINAL DIAGNOSIS ---', 'header');
        if (matchFound) {
            log('PARADOX RESOLVED: The logic is sound.', 'success');
        } else {
            log('PARADOX CONFIRMED: The move was not found.', 'error');
            log('CONCLUSION: Compare the "DEEP STATE ANALYSIS" to the FEN. If the bitboards or piece locations are wrong, the bug is in `createGameState`. If they are correct but the final move list is wrong, the bug is in `generateMoves`.', 'error');
        }

    } catch (err) {
        log(`\n/!\\ A CATASTROPHIC ERROR OCCURRED WITHIN THE HARNESS /!\\`, 'error');
        log(err.message, 'error');
        log(err.stack, 'error');
    } finally {
        if (self.EngineSoul) self.EngineSoul.isAuditing = false;
        self.postMessage({ type: 'complete' });
    }
}