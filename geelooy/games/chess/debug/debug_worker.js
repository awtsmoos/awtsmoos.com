/* B"H */

// This is a dedicated Web Worker. It cannot access the DOM.
// Its purpose is to load the engine's brain and run the test.

// --- Step 1: Load the Engine's Consciousness ---
// This uses the exact same method as the real engine.
try {
    importScripts(
        '../bitboard-helpers.js',
        '../helpers.js',
        '../generateFromPgn.js',
        '../grandmaster_library.js' // Needed for the PgnConverter context
    );
} catch (e) {
    // If the scripts fail to load, we can't do anything else.
    self.postMessage({ type: 'log', message: `FATAL: Could not import engine scripts. Error: ${e.message}`, className: 'error' });
    self.postMessage({ type: 'complete' });
    self.close();
}


// --- Step 2: Define a communication channel back to the main thread ---
function log(message, className = '') {
    self.postMessage({ type: 'log', message, className });
}

// --- Step 3: Listen for the command from the main thread ---
self.onmessage = function(e) {
    const { command, fen, targetSan } = e.data;

    if (command === 'run_diagnostic') {
        runDiagnostic(fen, targetSan);
    }
};

// --- Step 4: The Diagnostic Logic ---
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
        log('Game state created. Now, generating all legal moves...', 'info');

        const legalMoves = generateMoves(state);
        log(`The engine has generated ${legalMoves.length} legal moves for this position.`);

        const scribe = new PgnConverter();
        scribe.setState(state);

        let matchFound = false;
        log('\n--- SCRIBE TRACE: Comparing generated moves to target ---', 'header');
        
        // Temporarily hijack the Scribe's logging to capture its thoughts.
        const originalScribeLogger = self.ScribeLogger.logComparison;
        self.ScribeLogger.logComparison = (details) => {
             const { move, generatedSan, targetSan, isMatch, reason } = details;
             const fromSq = getMoveFrom(move);
             const files = 'abcdefgh', ranks = '87654321';
             const moveCoords = `${files[fromSq % 8]}${ranks[Math.floor(fromSq/8)]}`;
             const msg = `[SCRIBE] ${moveCoords} ► Target: "${targetSan}", Generated: "${generatedSan}", Match: ${isMatch ? '✅' : '❌'}, Reason: ${reason}`;
             log(msg, 'trace');
        };

        for (const moveInt of legalMoves) {
            if (scribe.isMoveSan(moveInt, targetSan, legalMoves)) {
                const from = getMoveFrom(moveInt);
                const to = getMoveTo(moveInt);
                const fromSq = String.fromCharCode(97 + (from % 8)) + (8 - Math.floor(from / 8));
                const toSq = String.fromCharCode(97 + (to % 8)) + (8 - Math.floor(to / 8));
                log(`\n✅ SUCCESS: The move ${fromSq}${toSq} was correctly identified as "${targetSan}"!`, 'success');
                matchFound = true;
                break;
            }
        }
        
        // Restore the original logger.
        self.ScribeLogger.logComparison = originalScribeLogger;

        log('\n--- FINAL DIAGNOSIS ---', 'header');
        if (matchFound) {
            log('PARADOX RESOLVED: The logic is sound. The move was generated and parsed correctly.', 'success');
            log('The error must have been caused by a state corruption issue that is now fixed.', 'info');
        } else {
            log('PARADOX CONFIRMED: A move that should be legal was either NOT generated, or the Scribe FAILED to identify it.', 'error');
            log('CONCLUSION: Examine the trace log above. If you see the correct move (e.g., d7d5) but the "Generated SAN" is wrong, the bug is in `isMoveSan`. If you do not see the move at all, the bug is in `generateMoves`.', 'error');
        }

    } catch (err) {
        log(`\n/!\\ A CATASTROPHIC ERROR OCCURRED WITHIN THE HARNESS /!\\`, 'error');
        log(err.message, 'error');
        log(err.stack, 'error');
    } finally {
        // Tell the main thread the test is over.
        self.postMessage({ type: 'complete' });
    }
}