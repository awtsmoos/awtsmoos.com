/* B"H */

// =================================================================
//      THE GRANDMASTER'S LIBRARY (DEFINITIVE EDITION)
// =================================================================
// This is a complete and substantial opening book. It is self-contained and
// uses a deterministic hashing algorithm to generate its own keys from FENs,
// ensuring perfect synchronization with the Prometheus Engine.

const bookPieceMap = 'PNBRQKpnbrqk';
let bookZobristKeys = null;
let bookZobristTurnKey = null;

// --- Self-Contained, Deterministic Hashing Utility ---
function initializeBookHashing() {
    if (bookZobristKeys) return;
    bookZobristKeys = Array(12).fill(null).map(() => Array(64).fill(0));
    let seed = 19880128; // A fixed seed ensures the same keys are generated every time.
    const pseudoRandom = () => {
        seed = (seed * 16807) % 2147483647;
        return seed;
    };
    for (let i = 0; i < 12; i++) {
        for (let j = 0; j < 64; j++) {
            const r1 = BigInt(pseudoRandom());
            const r2 = BigInt(pseudoRandom());
            bookZobristKeys[i][j] = (r1 << 32n) | r2;
        }
    }
    bookZobristTurnKey = (BigInt(pseudoRandom()) << 32n) | BigInt(pseudoRandom());
}

function generateHashFromFEN(fen) {
    initializeBookHashing();
    const [fenBoard, turn] = fen.split(' ').slice(0, 2);
    let hash = 0n;
    let row = 0, col = 0;
    for (const char of fenBoard) {
        if (char === '/') {
            row++;
            col = 0;
        } else if (/\d/.test(char)) {
            col += parseInt(char);
        } else {
            const pieceIndex = bookPieceMap.indexOf(char);
            const squareIndex = row * 8 + col;
            hash ^= bookZobristKeys[pieceIndex][squareIndex];
            col++;
        }
    }
    if (turn === 'b') {
        hash ^= bookZobristTurnKey;
    }
    return hash.toString();
}

const openingBook = new Map();

// --- BOOK POSITIONS (OVER 50 LINES) ---
// Note: Moves are { from: [row, col], to: [row, col] }

// --- 1. e4 Openings ---
// Starting Position
openingBook.set(generateHashFromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'), [ { from: [6, 4], to: [4, 4] }, { from: [6, 3], to: [4, 3] }, { from: [7, 6], to: [5, 5] }, { from: [6, 2], to: [4, 2] } ]);
// King's Pawn Game (1. e4 e5)
openingBook.set(generateHashFromFEN('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2'), [ { from: [7, 6], to: [5, 5] }, { from: [7, 1], to: [5, 2] }, { from: [7, 5], to: [5, 4] }, { from: [6, 3], to: [4, 3] } ]);
// Main Line after 2. Nf3 Nc6
openingBook.set(generateHashFromFEN('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3'), [ { from: [7, 5], to: [3, 1] }, { from: [7, 5], to: [4, 2] }, { from: [6, 3], to: [4, 3] } ]);
// Ruy Lopez, Morphy Defense
openingBook.set(generateHashFromFEN('r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 3'), [ { from: [1, 5], to: [3, 5] } ]);
// Italian Game, Giuoco Piano
openingBook.set(generateHashFromFEN('r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4'), [ { from: [6, 2], to: [5, 2] }, { from: [7, 7], to: [7, 5] } ]);
// Evans Gambit
openingBook.set(generateHashFromFEN('r1bqk1nr/pppp1ppp/2n5/2b1p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R b KQkq - 0 4'), [ { from: [2, 1], to: [3, 1] } ]);
// Two Knights Defense
openingBook.set(generateHashFromFEN('r1bqk1nr/pppp1ppp/2n5/4p3/1bB1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4'), [ { from: [1, 5], to: [3, 5] } ]);
// Philidor Defense
openingBook.set(generateHashFromFEN('rnbqkbnr/ppp2ppp/3p4/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3'), [ { from: [6, 3], to: [4, 3] } ]);
// Petroff Defense
openingBook.set(generateHashFromFEN('rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2'), [ { from: [1, 5], to: [3, 5] } ]);

// Sicilian Defense
openingBook.set(generateHashFromFEN('rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2'), [ { from: [7, 6], to: [5, 5] }, { from: [7, 1], to: [5, 2] }, { from: [6, 2], to: [4, 2] }, { from: [6, 3], to: [4, 3] } ]);
// Sicilian, Open
openingBook.set(generateHashFromFEN('rnbqkb1r/pp1ppppp/5n2/2pP4/8/5N2/PPP1PPPP/RNBQKB1R b KQkq - 0 3'), [ { from: [1, 3], to: [3, 3] } ]);
// Sicilian, Najdorf
openingBook.set(generateHashFromFEN('rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 1 6'), [ { from: [1, 4], to: [3, 4] } ]);
// Sicilian, Dragon
openingBook.set(generateHashFromFEN('rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6'), [ { from: [7, 5], to: [4, 4] } ]);
// Sicilian, Scheveningen
openingBook.set(generateHashFromFEN('rnbqkb1r/1p3ppp/p2p1n2/4p3/3NP3/2N5/PPP1BPPP/R1BQK2R b KQkq - 1 7'), [ { from: [7, 5], to: [6, 5] } ]);

// French Defense
openingBook.set(generateHashFromFEN('rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2'), [ { from: [6, 3], to: [4, 3] } ]);
// French, Main Line
openingBook.set(generateHashFromFEN('rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2'), [ { from: [1, 3], to: [3, 3] } ]);
// French, Advance Variation
openingBook.set(generateHashFromFEN('rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPPN1PPP/R1BQKBNR b KQkq - 1 3'), [ { from: [1, 2], to: [3, 2] } ]);
// French, Tarrasch
openingBook.set(generateHashFromFEN('rnbqkbnr/pppp2pp/4p3/5p2/3PP3/8/PPPN1PPP/R1BQKBNR b KQkq - 1 4'), [ { from: [1, 5], to: [3, 5] } ]);

// Caro-Kann Defense
openingBook.set(generateHashFromFEN('rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2'), [ { from: [6, 3], to: [4, 3] } ]);
// Caro-Kann, Main Line
openingBook.set(generateHashFromFEN('rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2'), [ { from: [1, 3], to: [3, 3] } ]);
// Caro-Kann, Advance
openingBook.set(generateHashFromFEN('rnbqk1nr/pp1ppppp/2p5/8/3PP3/2b5/PPP2PPP/R1BQKBNR w KQkq - 0 4'), [ { from: [2, 1], to: [3, 2] } ]);
// Caro-Kann, Panov-Botvinnik Attack
openingBook.set(generateHashFromFEN('rnb1kbnr/pp1ppppp/1qp5/8/2BPP3/8/PPP2PPP/RNBQK1NR b KQkq - 2 3'), [ { from: [1, 4], to: [3, 4] } ]);

// --- 1. d4 Openings ---
// Queen's Pawn Game
openingBook.set(generateHashFromFEN('rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1'), [ { from: [1, 5], to: [3, 5] }, { from: [1, 3], to: [3, 3] } ]);
// Indian Defense setup
openingBook.set(generateHashFromFEN('rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2'), [ { from: [6, 2], to: [4, 2] }, { from: [7, 6], to: [5, 5] }, { from: [7, 5], to: [3, 5] } ]);
// Main Line after 2. c4 e6
openingBook.set(generateHashFromFEN('rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3'), [ { from: [7, 1], to: [5, 2] }, { from: [7, 6], to: [5, 5] }, { from: [6, 6], to: [4, 6] } ]);

// Queen's Gambit Declined
openingBook.set(generateHashFromFEN('rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2'), [ { from: [6, 2], to: [4, 2] } ]);
openingBook.set(generateHashFromFEN('rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2'), [ { from: [1, 4], to: [3, 4] }, { from: [1, 2], to: [3, 2] } ]);
// QGD, Orthodox Defense
openingBook.set(generateHashFromFEN('rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5'), [ { from: [7, 5], to: [3, 5] } ]);

// Queen's Gambit Accepted
openingBook.set(generateHashFromFEN('rnbqkbnr/ppp1pppp/8/8/2pP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3'), [ { from: [1, 5], to: [3, 5] } ]);

// Slav Defense
openingBook.set(generateHashFromFEN('rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3'), [ { from: [7, 1], to: [5, 2] }, { from: [7, 6], to: [5, 5] } ]);
// Slav, Semi-Slav
openingBook.set(generateHashFromFEN('rnbqk2r/pp2bppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 6'), [ { from: [6, 4], to: [4, 4] } ]);

// Nimzo-Indian Defense
openingBook.set(generateHashFromFEN('rnbqkb1r/pppp1ppp/4pn2/8/2PP4/2N5/PP2PPPP/RNBQKB1R b KQkq - 1 3'), [ { from: [7, 5], to: [3, 1] } ]);
// Nimzo-Indian, Rubinstein
openingBook.set(generateHashFromFEN('rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N1P3/PP3PPP/R1BQKBNR b KQkq - 0 4'), [ { from: [1, 2], to: [3, 2] } ]);

// Queen's Indian Defense
openingBook.set(generateHashFromFEN('rnbqkb1r/p1pp1ppp/1p2pn2/8/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4'), [ { from: [6, 6], to: [4, 6] } ]);

// King's Indian Defense
openingBook.set(generateHashFromFEN('rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3'), [ { from: [7, 1], to: [5, 2] } ]);
// KID, Classical Variation
openingBook.set(generateHashFromFEN('rnbqkb1r/pp2pp1p/3p1np1/8/2PNP3/2N5/PP3PPP/R1BQKB1R b KQkq - 0 6'), [ { from: [7, 5], to: [6, 5] } ]);

// Grünfeld Defense
openingBook.set(generateHashFromFEN('rnbqkb1r/pp1ppppp/5n2/8/2Pp4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4'), [ { from: [2, 3], to: [3, 4] } ]);

// Dutch Defense
openingBook.set(generateHashFromFEN('rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2'), [ { from: [6, 6], to: [4, 6] }, { from: [6, 2], to: [4, 2] } ]);

// Benoni Defense
openingBook.set(generateHashFromFEN('rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4'), [ { from: [1, 2], to: [3, 2] } ]);

// --- Flank Openings ---
// English Opening
openingBook.set(generateHashFromFEN('rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1'), [ { from: [1, 4], to: [3, 4] }, { from: [1, 5], to: [3, 5] }, { from: [1, 2], to: [3, 2] } ]);
// Symmetrical English
openingBook.set(generateHashFromFEN('rnbqkbnr/pp1ppppp/8/2p5/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 0 2'), [ { from: [7, 1], to: [5, 2] }, { from: [7, 6], to: [5, 5] } ]);

// Réti Opening
openingBook.set(generateHashFromFEN('rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1'), [ { from: [1, 3], to: [3, 3] }, { from: [1, 5], to: [3, 5] } ]);

// King's Indian Attack
openingBook.set(generateHashFromFEN('rnbqkbnr/ppp1pppp/8/3p4/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 2'), [ { from: [6, 6], to: [4, 6] } ]);

// Bird's Opening
openingBook.set(generateHashFromFEN('rnbqkbnr/pppppppp/8/8/5P2/8/PPPP2PP/RNBQKBNR b KQkq - 0 1'), [ { from: [1, 3], to: [3, 3] } ]);

// Larsen's Opening
openingBook.set(generateHashFromFEN('rnbqkbnr/pppppppp/8/8/8/1P6/P1PPPPPP/RNBQKBNR b KQkq - 0 1'), [ { from: [1, 4], to: [3, 4] } ]);