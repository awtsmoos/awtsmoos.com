/* B"H */

// This is a dedicated Web Worker. It cannot access the DOM.
// Its purpose is to load the engine's brain and run the test.

// --- Step 1: Load the Engine's Consciousness ---
// The paths are corrected to point up one directory.
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
        
        // This is the crucial part: we need to activate the Gnostic Audit mode
        // for the ScribeLogger to output its detailed trace.
        if (self.EngineSoul) {
            self.EngineSoul.isAuditing = true;
            log('Gnostic Audit Mode has been activated for the Scribe.', 'info');
        } else {
            log('WARNING: EngineSoul not found. Scribe tracing may be disabled.', 'error');
        }

        const legalMoves = generateMoves(state);
        log(`The engine has generated ${legalMoves.length} legal moves for this position.`);

        const scribe = new PgnConverter();
        scribe.setState(state);

        let matchFound = false;
        log('\n--- SCRIBE TRACE: Comparing generated moves to target ---', 'header');
        
        // Temporarily hijack the Scribe's logging to capture its thoughts.
        // This will now work because we exposed ScribeLogger in generateFromPgn.js
        const originalLogComparison = self.ScribeLogger.logComparison;
        const capturedLogs = [];
        
        // We will capture logs instead of printing them directly from the hijack
        self.ScribeLogger.logComparison = (details) => {
            capturedLogs.push(details);
        };

        for (const moveInt of legalMoves) {
            if (scribe.isMoveSan(moveInt, targetSan, legalMoves)) {
                matchFound = true;
                break; // Exit early once the match is found
            }
        }
        
        // Restore the original logger function
        self.ScribeLogger.logComparison = originalLogComparison;
        
        // Now, log all the captured thoughts from the Scribe
        capturedLogs.forEach(details => {
            const { generatedSan, isMatch, reason } = details;
            const msg = `[SCRIBE] ► Generated: "${generatedSan}", Match: ${isMatch ? '✅' : '❌'}, Reason: ${reason}`;
            log(msg, 'trace');
        });

        if (matchFound) {
            log('\n✅ A match was found during the trace!', 'success');
        }

        log('\n--- FINAL DIAGNOSIS ---', 'header');
        if (matchFound) {
            log('PARADOX RESOLVED: The logic is sound. The move was generated and parsed correctly.', 'success');
        } else {
            log('PARADOX CONFIRMED: A move that should be legal was either NOT generated, or the Scribe FAILED to identify it.', 'error');
            log('CONCLUSION: Examine the trace log above. If you see the correct move (e.g., d7d5) being generated with the WRONG SAN, the bug is in `isMoveSan`. If you do not see the move `d7d5` at all, the bug is in `generateMoves`.', 'error');
        }

    } catch (err) {
        log(`\n/!\\ A CATASTROPHIC ERROR OCCURRED WITHIN THE HARNESS /!\\`, 'error');
        log(err.message, 'error');
        log(err.stack, 'error');
    } finally {
        if (self.EngineSoul) self.EngineSoul.isAuditing = false; // Cleanup
        self.postMessage({ type: 'complete' });
    }
}