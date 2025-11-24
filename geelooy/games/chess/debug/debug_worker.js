/* B"H */


// This is a dedicated Web Worker. It cannot access the DOM.
// Its purpose is to load the engine's brain and run the test.
console. log('B"H',
"\n",
"wow2"
)
/* B"H */

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

// B"H - CORRECTED HYPER-DIAGNOSTIC FUNCTION
function createGameState_DIAGNOSTIC(fen) {
    log('\n--- ENTERING CORRECTED HYPER-DIAGNOSTIC createGameState ---', 'header');
    const state = { pieceBitboards: Array(12).fill(0n) };
    const parts = fen.split(' ');
    let row = 0, col = 0;
    
    log(`Parsing FEN board part: "${parts[0]}"`);
    log(`Using pieceMap: "${self.pieceMap}"`);

    for (const char of parts[0]) {
        if (char === '/') {
            row++;
            col = 0;
            continue; // Go to next character
        }
        if (/\d/.test(char)) {
            const emptySquares = parseInt(char);
            log(`  -> Found number '${emptySquares}'. Skipping ${emptySquares} columns.`);
            col += emptySquares;
        } else {
            const pieceIndex = self.pieceMap.indexOf(char);
            const squareIndex = row * 8 + col;
            log(`  -> Found char '${char}'. At [row:${row}, col:${col}]. IndexOf result: ${pieceIndex}.`, 'trace');
            
            if (pieceIndex !== -1) {
                state.pieceBitboards[pieceIndex] |= (1n << BigInt(squareIndex));
            }
            // THE BUG FIX IS HERE: The column counter must ONLY increment for single characters.
            col++;
        }
    }

    log(`\nFinished parsing board. Final bitboards (Hex):`);
    log(`  White (P,N,B,R,Q,K): 0x${state.pieceBitboards[0].toString(16)}, 0x${state.pieceBitboards[1].toString(16)}, 0x${state.pieceBitboards[2].toString(16)}, 0x${state.pieceBitboards[3].toString(16)}, 0x${state.pieceBitboards[4].toString(16)}, 0x${state.pieceBitboards[5].toString(16)}`);
    log(`  Black (p,n,b,r,q,k): 0x${state.pieceBitboards[6].toString(16)}, 0x${state.pieceBitboards[7].toString(16)}, 0x${state.pieceBitboards[8].toString(16)}, 0x${state.pieceBitboards[9].toString(16)}, 0x${state.pieceBitboards[10].toString(16)}, 0x${state.pieceBitboards[11].toString(16)}`);
    log('--- EXITING HYPER-DIAGNOSTIC createGameState ---\n', 'header');
    
    // We must return a complete state object for generateMoves to work
    const fullState = createGameState(fen); // Use the real function to get the other properties
    fullState.pieceBitboards = state.pieceBitboards; // Override with our correctly parsed bitboards
    return fullState;
}


function runDiagnostic(fen, targetSan) {
    try {
        log('B"H - FORGING THE UNIVERSE FROM THE VOID', 'header');
        initializeAll();
        log('Universe is stable.', 'success');

        const state = createGameState_DIAGNOSTIC(fen);
        
        log('\nNow, asking the engine to generate moves from the CORRECTED state...', 'info');
        const legalMoves = generateMoves(state);
        log(`The engine has generated ${legalMoves.length} legal moves.`, 'success');

        const scribe = new PgnConverter();
        scribe.setState(state);
        let matchFound = false;

        log('\n--- SCRIBE TRACE: Comparing generated moves to target ---', 'header');
        for (const moveInt of legalMoves) {
            if (scribe.isMoveSan(moveInt, targetSan, legalMoves)) {
                matchFound = true;
                break;
            }
        }
        
        log('\n--- FINAL DIAGNOSIS ---', 'header');
        if (matchFound) {
            log('✅ PARADOX RESOLVED in diagnostic mode.', 'success');
            log('The FEN parser logic is now correct. The same fix must be applied to the real `createGameState` function in `helpers.js`.', 'info');
        } else {
            log('❌ PARADOX PERSISTS.', 'error');
        }
    } catch (err) {
        log(`\n/!\\ ERROR /!\\`, 'error');
        log(err.message, 'error');
        log(err.stack, 'error');
    } finally {
        self.postMessage({ type: 'complete' });
    }
}