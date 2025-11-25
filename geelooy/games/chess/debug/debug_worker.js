/* B"H */
console. log('B"H')
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

// Listen for the command to begin
self.onmessage = function(e) {
    const { command, fen, targetSan } = e.data;
    if (command === 'run_diagnostic') {
        runDiagnostic(fen, targetSan);
    }
};

// The Final Diagnostic
function runDiagnostic(fen, targetSan) {
    try {
        log('B"H - FORGING THE UNIVERSE FROM THE VOID', 'header');
        initializeAll();
        log('Universe is stable.', 'success');

        // =================================================================
        // THE FINAL FIX FOR THE DIAGNOSTIC TOOL
        // We must create the EngineSoul and grant the Scribe permission to speak.
        // =================================================================
        self.EngineSoul = { isAuditing: true };
        log('A temporary consciousness (EngineSoul) has been created.', 'info');
        
        // --- CRITICAL FIX: REDIRECT SCRIBE LOGS TO THE UI ---
        if (self.ScribeLogger) {
            self.ScribeLogger.logComparison = function(details) {
                const { generatedSan, targetSan, isMatch, reason } = details;
                const icon = isMatch ? "✅" : "❌";
                const style = isMatch ? "success" : "trace";
                // We format the log so it appears clearly in your debug tool window
                log(`[SCRIBE] ${icon} Target: "${targetSan}" | Gen: "${generatedSan}" | ${reason}`, style);
            };
            log('The Scribe\'s voice has been redirected to this display.', 'success');
        } else {
            log('WARNING: ScribeLogger not found. Comparisons will be invisible.', 'error');
        }
        // =================================================================

        log('\n--- TESTING THE REAL createGameState FUNCTION ---', 'header');
        const state = createGameState(fen); 
        
        // Sanity check on the state
        log(`State Turn: ${state.turn === 0 ? 'White' : 'Black'}`, 'info');
        
        log('\nNow, asking the engine to generate moves from the CORRECTED state...', 'info');
        const legalMoves = generateMoves(state);
        log(`The engine has generated ${legalMoves.length} legal moves.`, 'success');

        const scribe = new PgnConverter();
        scribe.setState(state);
        let matchFound = false;

        log('\n--- SCRIBE TRACE: The Final Testimony ---', 'header');
        
        for (const moveInt of legalMoves) {
            // The isMoveSan function will now trigger our redirected logComparison above
            if (scribe.isMoveSan(moveInt, targetSan, legalMoves)) {
                matchFound = true;
                // We found it! We can break, or keep going to see if any others match (unlikely)
                break;
            }
        }
        
        log('\n--- FINAL DIAGNOSIS ---', 'header');
        if (matchFound) {
            log('✅ PARADOX RESOLVED.', 'success');
            log('The engine correctly created the universe, generated the move, and the Scribe identified it.', 'info');
        } else {
            log('❌ PARADOX PERSISTS.', 'error');
            log('The engine generated moves, but none matched the target SAN.', 'error');
            log('Review the SCRIBE TRACE above. You will now see exactly what the engine generated vs what you wanted.', 'info');
        }

    } catch (err) {
        log(`\n/!\\ AN UNEXPECTED ERROR OCCURRED /!\\`, 'error');
        log(err.message, 'error');
        log(err.stack, 'error');
    } finally {
        // Clean up the temporary consciousness
        if (self.EngineSoul) delete self.EngineSoul;
        self.postMessage({ type: 'complete' });
    }
}