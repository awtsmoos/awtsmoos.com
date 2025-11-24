/* B"H */
console. log('B"H'

,"\n ok1")

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
        log('The Scribe has been granted permission to speak (isAuditing = true).', 'success');
        // =================================================================

        log('\n--- TESTING THE REAL createGameState FUNCTION ---', 'header');
        const state = createGameState(fen); // This will now use your v5.0 Witness
        
        log('\nNow, asking the engine to generate moves from the CORRECTED state...', 'info');
        const legalMoves = generateMoves(state);
        log(`The engine has generated ${legalMoves.length} legal moves.`, 'success');

        const scribe = new PgnConverter();
        scribe.setState(state);
        let matchFound = false;

        log('\n--- SCRIBE TRACE: The Final Testimony ---', 'header');
        
        for (const moveInt of legalMoves) {
            // The ScribeLogger will now log directly to the main console,
            // as it does in the real engine. We don't need to hijack it anymore.
            if (scribe.isMoveSan(moveInt, targetSan, legalMoves)) {
                matchFound = true;
                break;
            }
        }
        
        log('\n--- FINAL DIAGNOSIS ---', 'header');
        if (matchFound) {
            log('✅ PARADOX RESOLVED.', 'success');
            log('The engine correctly created the universe, generated the move, and the Scribe identified it.', 'info');
            log('The journey is complete. The universe is stable.', 'success');
        } else {
            log('❌ PARADOX PERSISTS.', 'error');
            log('This should not be possible if the previous fixes were applied.', 'error');
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