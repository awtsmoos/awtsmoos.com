/* B"H */


// This is a dedicated Web Worker. It cannot access the DOM.
// Its purpose is to load the engine's brain and run the test.
console. log('B"H',
"\n",
"wow2"
)
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

// =================================================================
// B"H - HYPER-DIAGNOSTIC, TEMPORARY createGameState FUNCTION
// This function will be used INSTEAD of the one from helpers.js
// to give us the most detailed log possible.
// =================================================================
function createGameState_DIAGNOSTIC(fen) {
    log('\n--- ENTERING HYPER-DIAGNOSTIC createGameState ---', 'header');
    const state = {
        pieceBitboards: Array(12).fill(0n),
        occupancies: Array(3).fill(0n),
        turn: WHITE,
        enpassant: -1,
        castling: 0,
    };

    const parts = fen.split(' ');
    let row = 0, col = 0;
    
    log(`Parsing FEN board part: "${parts[0]}"`);
    log(`Using pieceMap: "${self.pieceMap}"`);

    for (const char of parts[0]) {
        if (char === '/') {
            row++;
            col = 0;
            log(`  -> New row. Now at row ${row}.`);
        } else if (/\d/.test(char)) {
            const emptySquares = parseInt(char);
            log(`  -> Found number '${emptySquares}'. Skipping ${emptySquares} columns.`);
            col += emptySquares;
        } else {
            const pieceIndex = self.pieceMap.indexOf(char);
            const squareIndex = row * 8 + col;
            log(`  -> Found character '${char}'. At [row:${row}, col:${col}]. IndexOf result: ${pieceIndex}.`, 'trace');
            
            if (pieceIndex !== -1) {
                state.pieceBitboards[pieceIndex] |= (1n << BigInt(squareIndex));
            } else {
                 log(`    -> CHARACTER NOT FOUND IN PIECEMAP! SKIPPING.`, 'error');
            }
            col++;
        }
    }

    log(`\nFinished parsing board. Final bitboards (Hex):`);
    log(`  White (P,N,B,R,Q,K): 0x${state.pieceBitboards[0].toString(16)}, 0x${state.pieceBitboards[1].toString(16)}, 0x${state.pieceBitboards[2].toString(16)}, 0x${state.pieceBitboards[3].toString(16)}, 0x${state.pieceBitboards[4].toString(16)}, 0x${state.pieceBitboards[5].toString(16)}`);
    log(`  Black (p,n,b,r,q,k): 0x${state.pieceBitboards[6].toString(16)}, 0x${state.pieceBitboards[7].toString(16)}, 0x${state.pieceBitboards[8].toString(16)}, 0x${state.pieceBitboards[9].toString(16)}, 0x${state.pieceBitboards[10].toString(16)}, 0x${state.pieceBitboards[11].toString(16)}`);

    state.occupancies[WHITE] = state.pieceBitboards[P] | state.pieceBitboards[N] | state.pieceBitboards[B] | state.pieceBitboards[R] | state.pieceBitboards[Q] | state.pieceBitboards[K];
    state.occupancies[BLACK] = state.pieceBitboards[P+6] | state.pieceBitboards[N+6] | state.pieceBitboards[B+6] | state.pieceBitboards[R+6] | state.pieceBitboards[Q+6] | state.pieceBitboards[K+6];
    state.occupancies[2] = state.occupancies[WHITE] | state.occupancies[BLACK];
    state.turn = (parts[1] === 'w') ? WHITE : BLACK;
    // (Skipping castling/enpassant for this specific diagnostic)
    log('--- EXITING HYPER-DIAGNOSTIC createGameState ---\n', 'header');
    return state;
}


function runDiagnostic(fen, targetSan) {
    try {
        log('B"H - FORGING THE UNIVERSE FROM THE VOID', 'header');
        initializeAll();
        log('Universe is stable. All physical laws (bitboards) are initialized.', 'success');

        log(`\n--- TEST SCENARIO ---`);
        log(`REALITY (FEN):     ${fen}`);
        log(`TARGET WORD (SAN): "${targetSan}"`);
        log(`-----------------------\n`);

        // Use our special diagnostic function instead of the real one.
        const state = createGameState_DIAGNOSTIC(fen);

        if (self.EngineSoul) self.EngineSoul.isAuditing = true;

        log('Now, asking the engine to generate all legal moves...', 'info');
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
            log('CONCLUSION: Examine the HYPER-DIAGNOSTIC log. The "IndexOf result" for black pieces (like "p") MUST be >= 6. If it is not, the `pieceMap` variable is the source of all corruption.', 'error');
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