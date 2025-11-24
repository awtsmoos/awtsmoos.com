/* B"H */
console. log('B"H',

,"\n ok")

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

// B"H - ULTIMATE DIAGNOSTIC: This version logs the bitboard state after EVERY character.
function createGameState_ULTIMATE_DIAGNOSTIC(fen) {
    log('\n--- ENTERING ULTIMATE DIAGNOSTIC createGameState ---', 'header');
    const state = { pieceBitboards: Array(12).fill(0n) };
    const parts = fen.split(' ');
    let row = 0, col = 0;
    
    log(`Parsing FEN board part: "${parts[0]}"`);

    for (const char of parts[0]) {
        let logMsg = '';
        if (char === '/') {
            row++;
            col = 0;
            log(`\nProcessing char: '/' -> New row ${row}`);
            continue;
        }
        if (/\d/.test(char)) {
            const emptySquares = parseInt(char);
            logMsg = `Processing char: '${char}' -> Skipping ${emptySquares} cols.`;
            col += emptySquares;
        } else {
            const pieceIndex = self.pieceMap.indexOf(char);
            const squareIndex = row * 8 + col;
            logMsg = `Processing char: '${char}' -> Index: ${pieceIndex}, Square: ${squareIndex}.`;
            
            if (pieceIndex !== -1) {
                state.pieceBitboards[pieceIndex] |= (1n << BigInt(squareIndex));
            }
            col++;
        }

        // Log the state of the universe AFTER this character was processed
        const p_w = state.pieceBitboards[6].toString(16); // black pawns
        const P_w = state.pieceBitboards[0].toString(16); // white pawns
        log(`${logMsg} | State now: p(b):${p_w}, P(W):${P_w}`, 'trace');
    }

    log('\n--- FINAL PARSED STATE ---', 'header');
    log(`  White (P,N,B,R,Q,K): 0x${state.pieceBitboards[0].toString(16)}, 0x${state.pieceBitboards[1].toString(16)}, 0x${state.pieceBitboards[2].toString(16)}, 0x${state.pieceBitboards[3].toString(16)}, 0x${state.pieceBitboards[4].toString(16)}, 0x${state.pieceBitboards[5].toString(16)}`);
    log(`  Black (p,n,b,r,q,k): 0x${state.pieceBitboards[6].toString(16)}, 0x${state.pieceBitboards[7].toString(16)}, 0x${state.pieceBitboards[8].toString(16)}, 0x${state.pieceBitboards[9].toString(16)}, 0x${state.pieceBitboards[10].toString(16)}, 0x${state.pieceBitboards[11].toString(16)}`);
    
    // Use the real function to get a complete state object
    const fullState = createGameState(fen); 
    // We are only using this diagnostic to observe. We pass the REAL state to the next step.
    return fullState; 
}


function runDiagnostic(fen, targetSan) {
    try {
        log('B"H - FORGING THE UNIVERSE FROM THE VOID', 'header');
        initializeAll();
        log('Universe is stable.', 'success');

        // Run the ultimate diagnostic just to produce the log
        createGameState_ULTIMATE_DIAGNOSTIC(fen);
        
        // Now, create the state using the REAL function from helpers.js to test it
        log('\n--- TESTING THE REAL createGameState FUNCTION ---', 'header');
        const state = createGameState(fen);
        
        // Log the final state from the REAL function
        log(`State from REAL function. Turn: ${state.turn === 1 ? 'BLACK' : 'WHITE'}. Black Pawns: 0x${state.pieceBitboards[6].toString(16)}`);

        log('\nNow, asking the engine to generate moves...', 'info');
        const legalMoves = generateMoves(state);
        log(`The engine has generated ${legalMoves.length} legal moves.`);

        const scribe = new PgnConverter();
        scribe.setState(state);
        let matchFound = false;

        log('\n--- SCRIBE TRACE ---', 'header');
        for (const moveInt of legalMoves) {
            if (scribe.isMoveSan(moveInt, targetSan, legalMoves)) {
                matchFound = true;
                break;
            }
        }
        
        log('\n--- FINAL DIAGNOSIS ---', 'header');
        if (matchFound) {
            log('✅ PARADOX RESOLVED. The error has been fixed.', 'success');
        } else {
            log('❌ PARADOX PERSISTS.', 'error');
            log('The error is definitively in the `createGameState` function in `helpers.js`. The ultimate diagnostic log above shows the step-by-step creation of the corrupted reality.', 'info');
        }
    } catch (err) {
        log(`\n/!\\ ERROR /!\\`, 'error');
        log(err.message, 'error');
        log(err.stack, 'error');
    } finally {
        self.postMessage({ type: 'complete' });
    }
}