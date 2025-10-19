/* B"H */

// =================================================================
//      THE GRANDMASTER'S LIBRARY v3.0 (COMPREHENSIVE EDITION)
// =================================================================
// This file contains only raw opening data. It has no logic.
// The engine will process this array into a usable opening book.
// Format: [ FEN_string, { from:[r,c], to:[r,c], san:"move" }, ...other moves... ]

const rawOpeningBook = [

  // [----------------------------------------------------------------]
  // [                      STARTING POSITION                         ]
  // [----------------------------------------------------------------]

  ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 
    { from:[6,4], to:[4,4], san:'e4' },   // 1. e4 (King's Pawn Opening)
    { from:[6,3], to:[4,3], san:'d4' },   // 1. d4 (Queen's Pawn Opening)
    { from:[7,6], to:[5,5], san:'Nf3' },  // 1. Nf3 (Réti Opening)
    { from:[6,2], to:[4,2], san:'c4' }    // 1. c4 (English Opening)
  ],

  // [----------------------------------------------------------------]
  // [                    1. e4 OPENINGS (KING'S PAWN)                ]
  // [----------------------------------------------------------------]

  // --- Main Responses to 1. e4 ---
  ['rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    { from:[1,4], to:[3,4], san:'e5' },   // 1...e5 (Open Game)
    { from:[1,2], to:[3,2], san:'c5' },   // 1...c5 (Sicilian Defense)
    { from:[1,4], to:[2,4], san:'e6' },   // 1...e6 (French Defense)
    { from:[1,2], to:[2,2], san:'c6' },   // 1...c6 (Caro-Kann Defense)
    { from:[1,3], to:[3,3], san:'d5' },   // 1...d5 (Scandinavian Defense)
    { from:[1,6], to:[3,5], san:'Nf6' },  // 1...Nf6 (Alekhine's Defense)
    { from:[1,3], to:[2,3], san:'d6' }    // 1...d6 (Pirc Defense)
  ],

  // --- Open Game (1. e4 e5) ---
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
    { from:[7,6], to:[5,5], san:'Nf3' },  // 2. Nf3 (Most common)
    { from:[7,1], to:[5,2], san:'Nc3' },  // 2. Nc3 (Vienna Game)
    { from:[7,5], to:[4,2], san:'Bc4' },  // 2. Bc4 (Bishop's Opening)
    { from:[6,5], to:[4,5], san:'f4' }    // 2. f4 (King's Gambit)
  ],
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    { from:[0,1], to:[2,2], san:'Nc6' },  // 2...Nc6 (Main response)
    { from:[0,6], to:[2,5], san:'Nf6' },  // 2...Nf6 (Petroff Defense)
    { from:[0,3], to:[1,3], san:'d6' }    // 2...d6 (Philidor Defense)
  ],

  // --- Ruy Lopez (Spanish Game) ---
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', { from:[7,5], to:[3,1], san:'Bb5' }],
  ['r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    { from:[1,0], to:[3,0], san:'a6' },   // 3...a6 (Morphy Defense)
    { from:[0,6], to:[2,5], san:'Nf6' }   // 3...Nf6 (Berlin Defense)
  ],
  // Ruy Lopez: Morphy Defense
  ['r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4', { from:[3,1], to:[2,0], san:'Ba4' }],
  ['r1bqkbnr/1ppp1ppp/p1n5/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4', { from:[0,6], to:[2,5], san:'Nf6' }],
  ['r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 1 5', { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 b KQkq - 5 5',
    { from:[1,4], to:[3,4], san:'b5' },   // 5...b5 (Arkhangelsk variation start)
    { from:[2,5], to:[4,4], san:'Be7' },  // 5...Be7 (Closed Ruy Lopez)
    { from:[2,4], to:[4,4], san:'Nxe4' }  // 5...Nxe4 (Open Ruy Lopez)
  ],
  // Ruy Lopez: Closed Main Line
  ['r1bqk2r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w KQkq - 2 6', { from:[7,4], to:[6,4], san:'Re1' }],
  ['r1bqk2r/1ppp1ppp/p1n2n2/4p3/B3P3/4RN2/PPPP1PPP/RNBQ1RK1 b KQkq - 3 6', { from:[1,4], to:[3,4], san:'b5' }],
  ['r1bqk2r/2pp1ppp/p1n2n2/1p2p3/B3P3/4RN2/PPPP1PPP/RNBQ1RK1 w KQkq - 0 7', { from:[2,0], to:[1,1], san:'Bb3' }],
  ['r1bqk2r/2pp1ppp/p1n2n2/1p2p3/1b2P3/1B3N2/PPPP1PPP/RNBQ1RK1 b KQkq - 5 7', { from:[0,3], to:[1,3], san:'d6' }],
  ['r1b1k2r/2pp1ppp/p1nq1n2/1p2p3/1b2P3/1B3N2/PPPP1PPP/RNBQ1RK1 w KQkq - 7 8', { from:[6,2], to:[4,2], san:'c3' }],

  // --- Italian Game ---
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', { from:[7,5], to:[4,2], san:'Bc4' }],
  ['r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    { from:[0,6], to:[2,5], san:'Nf6' },  // 3...Nf6 (Two Knights Defense)
    { from:[7,5], to:[4,2], san:'Bc5' }   // 3...Bc5 (Giuoco Piano)
  ],
  // Italian Game: Giuoco Piano
  ['r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    { from:[6,2], to:[4,2], san:'c3' },   // 4. c3 (Italian Main Line)
    { from:[6,1], to:[4,1], san:'b4' },   // 4. b4 (Evans Gambit)
    { from:[7,7], to:[7,5], san:'O-O'}   // 4. O-O
  ],
  ['r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq - 0 4', { from:[0,6], to:[2,5], san:'Nf6' }],
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 1 5', { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq d3 0 5', { from:[4,4], to:[3,3], san:'exd4' }],
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 0 6', { from:[4,2], to:[3,3], san:'cxd4' }],

  // --- Scotch Game ---
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3', { from:[4,4], to:[3,3], san:'exd4' }],
  ['r1bqkbnr/pppp1ppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4',
    { from:[5,3], to:[3,3], san:'Nxd4' }, // 4. Nxd4 (Main Line)
    { from:[7,5], to:[4,2], san:'Bc4' }   // 4. Bc4 (Scotch Gambit)
  ],
  ['r1bqkbnr/pppp1ppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4',
    { from:[0,6], to:[2,5], san:'Nf6' },  // 4...Nf6
    { from:[7,5], to:[2,2], san:'Bc5' }   // 4...Bc5
  ],
  ['r1bqkb1r/pppp1ppp/2n2n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5', { from:[5,3], to:[2,2], san:'Nxc6' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 2 5', { from:[1,1], to:[2,2], san:'bxc6' }],
  ['r1bqkb1r/p1pp1ppp/2p2n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 6', { from:[4,3], to:[4,4], san:'e5' }],

  // --- King's Gambit ---
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', { from:[6,5], to:[4,5], san:'f4' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq f3 0 2',
    { from:[4,4], to:[5,5], san:'exf4' },  // 2...exf4 (King's Gambit Accepted)
    { from:[1,3], to:[3,3], san:'d5' }    // 2...d5 (Falkbeer Countergambit)
  ],
  ['rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPP2PP/RNBQKBNR w KQkq - 0 3', { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkbnr/pppp1ppp/8/8/4Pp2/5N2/PPPP2PP/RNBQKB1R b KQkq - 1 3', 
    { from:[1,6], to:[2,6], san:'g5' },   // 3...g5 (Classical variation)
    { from:[0,3], to:[1,3], san:'d6'}    // 3...d6
  ],

  // --- Petroff Defense ---
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    { from:[5,5], to:[4,4], san:'Nxe5' }, // 3. Nxe5 (Classical Attack)
    { from:[6,3], to:[4,3], san:'d4' }    // 3. d4 (Steinitz Variation)
  ],
  ['rnbqkb1r/pppp1ppp/5n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 0 3', { from:[1,3], to:[2,3], san:'d6' }],
  ['rnbqkb1r/ppp2ppp/3p1n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 0 4', { from:[5,5], to:[3,5], san:'Nf3' }],
  ['rnbqkb1r/ppp2ppp/3p1n2/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 4', { from:[2,5], to:[4,4], san:'Nxe4' }],
  ['rnbqkb1r/ppp2ppp/3p4/8/4n3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 5', { from:[6,3], to:[4,3], san:'d4' }],

  // --- Sicilian Defense (1. e4 c5) ---
  ['rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
    { from:[7,6], to:[5,5], san:'Nf3' },  // 2. Nf3 (Open Sicilian)
    { from:[7,1], to:[5,2], san:'Nc3' },  // 2. Nc3 (Closed Sicilian)
    { from:[6,2], to:[4,2], san:'c3' },   // 2. c3 (Alapin Variation)
    { from:[6,1], to:[4,1], san:'b4' }    // 2. b4 (Wing Gambit)
  ],
  ['rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    { from:[1,3], to:[2,3], san:'d6' },   // 2...d6 (Najdorf, Dragon, Scheveningen)
    { from:[0,1], to:[2,2], san:'Nc6' },  // 2...Nc6 (Sveshnikov, Classical)
    { from:[1,4], to:[2,4], san:'e6' }    // 2...e6 (Taimanov, Kan)
  ],

  // --- Open Sicilian Main Lines (after 2...d6) ---
  ['rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3', { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3', { from:[2,5], to:[3,3], san:'cxd4' }],
  ['rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4', { from:[5,3], to:[3,3], san:'Nxd4' }],
  ['rnbqkbnr/pp2pppp/3p4/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4', { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pp2pppp/3p1n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5', { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5',
    { from:[1,0], to:[3,0], san:'a6' },   // 5...a6 (Najdorf Variation)
    { from:[1,6], to:[2,6], san:'g6' },   // 5...g6 (Dragon Variation)
    { from:[1,4], to:[2,4], san:'e6' }    // 5...e6 (Scheveningen Variation)
  ],

  // --- Najdorf Variation (6. Bg5) ---
  ['rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    { from:[7,5], to:[6,6], san:'Bg5' },  // 6. Bg5 (Main Line)
    { from:[7,4], to:[5,4], san:'Be3' },  // 6. Be3 (English Attack)
    { from:[6,5], to:[4,5], san:'f3' }    // 6. f3
  ],
  ['rnbqkb1r/1p2pppp/p2p1n2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R b KQkq - 1 6', { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqk2r/1p2pp1p/p2p1np1/6B1/3NP3/2N5/PPP2PPP/R2QKB1R w KQkq - 0 7', { from:[6,5], to:[4,5], san:'f4' }],
  ['rnbqk2r/1p3ppp/p2ppn2/6B1/3NP3/2N5/PPPQ1PPP/R3KB1R b KQkq - 3 8', { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnb1k2r/1p2bppp/p2ppn2/6B1/3NP3/2N5/PPPQ1PPP/R3KB1R w KQkq - 5 9', { from:[7,7], to:[7,5], san:'O-O-O' }],

  // --- Dragon Variation ---
  ['rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6', { from:[7,4], to:[5,4], san:'Be3' }],
  ['rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 1 6', { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/pp2pp1p/3p1np1/8/3NP3/2N1B3/PPP2PPP/R2QKB1R w KQkq - 2 7', { from:[6,5], to:[4,5], san:'f3' }],
  ['rnbqk2r/pp2pp1p/3p1np1/8/3NP3/2N1BP2/PPP3PP/R2QKB1R b KQkq - 0 7', { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqk2r/pp2pp1p/2np1np1/8/3NP3/2N1BP2/PPP3PP/R2QKB1R w KQkq - 1 8', { from:[7,3], to:[3,3], san:'Qd2' }],
  ['r1bqk2r/pp2pp1p/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R b KQkq - 2 8', { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bq1rk1/pp2pp1p/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQkq - 3 9', { from:[7,5], to:[4,2], san:'Bc4' }],

  // --- French Defense (1. e4 e6) ---
  ['rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2', { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
    { from:[7,1], to:[5,2], san:'Nc3' },  // 3. Nc3 (Main Line)
    { from:[7,1], to:[4,3], san:'Nd2' },  // 3. Nd2 (Tarrasch Variation)
    { from:[4,4], to:[3,4], san:'e5' }    // 3. e5 (Advance Variation)
  ],
  // French Defense: Winawer Variation
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3', { from:[7,5], to:[3,1], san:'Bb4' }],
  ['rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4', { from:[4,4], to:[3,4], san:'e5' }],
  ['rnbqk1nr/ppp2ppp/4p3/3pP3/1b1P4/2N5/PPP2PPP/R1BQKBNR b KQkq - 0 4', { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqk1nr/pp3ppp/4p3/2ppP3/1b1P4/2N5/PPP2PPP/R1BQKBNR w KQkq - 1 5', { from:[6,0], to:[4,0], san:'a3' }],
  ['rnbqk1nr/pp3ppp/4p3/2ppP3/1b1P4/P1N5/1PP2PPP/R1BQKBNR b KQkq - 0 5', { from:[3,1], to:[2,2], san:'Bxc3+' }],
  ['rnbqk1nr/pp3ppp/4p3/2ppP3/3P4/P1b5/1PP2PPP/R1BQKBNR w KQkq - 0 6', { from:[1,1], to:[2,2], san:'bxc3' }],

  // --- Caro-Kann Defense (1. e4 c6) ---
  ['rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2', { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
    { from:[7,1], to:[5,2], san:'Nc3' },  // 3. Nc3 (Classical)
    { from:[4,4], to:[5,5], san:'exd5' }, // 3. exd5 (Exchange)
    { from:[4,4], to:[3,4], san:'e5' }    // 3. e5 (Advance)
  ],
  // Caro-Kann: Classical Variation
  ['rnbqkbnr/pp2pppp/2p5/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3', { from:[3,3], to:[4,4], san:'dxe4' }],
  ['rnbqkbnr/pp2pppp/2p5/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4', { from:[2,3], to:[4,4], san:'Nxe4' }],
  ['rnbqkbnr/pp2pppp/2p5/8/4N3/8/PPP2PPP/R1BQKBNR b KQkq - 0 4', 
    { from:[7,5], to:[3,1], san:'Bf5' }, // 4...Bf5 (Main Line)
    { from:[0,6], to:[2,5], san:'Nf6'}   // 4...Nf6
  ],
  ['rnbqk1nr/pp2pppp/2p5/3p4/4N3/8/PPP1PPPP/R1BQKBNR w KQkq - 1 5', { from:[4,4], to:[6,5], san:'Ng3' }],
  ['rnbqk1nr/pp2pppp/2p5/3p4/8/6N1/PPPPPPPP/R1BQKBNR b KQkq - 1 5', { from:[1,4], to:[2,4], san:'e6' }],

  // [----------------------------------------------------------------]
  // [                 1. d4 OPENINGS (QUEEN'S PAWN)                  ]
  // [----------------------------------------------------------------]
  
  // --- Main Responses to 1. d4 ---
  ['rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1',
    { from:[0,6], to:[2,5], san:'Nf6' },  // 1...Nf6 (Indian Defenses)
    { from:[1,3], to:[3,3], san:'d5' },   // 1...d5 (Classical)
    { from:[1,5], to:[3,5], san:'f5' }    // 1...f5 (Dutch Defense)
  ],

  // --- Queen's Gambit (1. d4 d5 2. c4) ---
  ['rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2',
    { from:[6,2], to:[4,2], san:'c4' },   // 2. c4 (Queen's Gambit)
    { from:[7,5], to:[5,4], san:'Bf4' },  // 2. Bf4 (London System)
    { from:[7,6], to:[5,5], san:'Nf3' }   // 2. Nf3 (Colle System setup)
  ],
  ['rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2',
    { from:[1,4], to:[2,4], san:'e6' },   // 2...e6 (Queen's Gambit Declined)
    { from:[1,2], to:[3,2], san:'c6' },   // 2...c6 (Slav Defense)
    { from:[3,3], to:[2,2], san:'dxc4' }  // 2...dxc4 (Queen's Gambit Accepted)
  ],

  // --- Queen's Gambit Declined (QGD) ---
  ['rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4',
    { from:[7,5], to:[6,6], san:'Bg5' },  // 4. Bg5 (Main Line)
    { from:[6,2], to:[7,2], san:'cxd5' }, // 4. cxd5 (Exchange Variation)
    { from:[7,6], to:[5,5], san:'Nf3' }   // 4. Nf3
  ],
  ['rnbqkb1r/ppp2ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq - 3 4', { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnbqk2r/ppp1bppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR w KQkq - 4 5', { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqk2r/ppp1bppp/4pn2/3p2B1/2PP4/2N1P3/PP3PPP/R2QKBNR b KQkq - 0 5', { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/ppp1bppp/4pn2/3p2B1/2PP4/2N1P3/PP3PPP/R2QKBNR w KQ - 1 6', { from:[7,6], to:[5,5], san:'Nf3' }],

  // --- Slav Defense ---
  ['rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkbnr/pp2pppp/2p5/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 3', { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4', { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 3 4', { from:[3,3], to:[2,2], san:'dxc4' }], // Main Line Slav
  ['rnbqkb1r/pp2pppp/2p2n2/8/2pP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5', { from:[6,0], to:[4,0], san:'a4' }],
  ['rnbqkb1r/pp2pppp/2p2n2/8/P1pP4/2N2N2/1P2PPPP/R1BQKB1R b KQkq - 0 5', { from:[7,5], to:[3,1], san:'Bf5' }],

  // --- Indian Defenses (1. d4 Nf6 2. c4) ---
  ['rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2', { from:[6,2], to:[4,2], san:'c4' }],
  ['rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2',
    { from:[1,4], to:[2,4], san:'e6' },   // 2...e6 (Nimzo, Queen's Indian, Bogo)
    { from:[1,6], to:[2,6], san:'g6' },   // 2...g6 (King's Indian, Grünfeld)
    { from:[1,2], to:[3,2], san:'c5' }    // 2...c5 (Benoni Defense)
  ],

  // --- Nimzo-Indian Defense ---
  ['rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pppp1ppp/4pn2/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', { from:[7,5], to:[3,1], san:'Bb4' }],
  // Nimzo-Indian: Rubinstein System
  ['rnbqk2r/pppp1ppp/4pn2/8/1b1P4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4', { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqk2r/pppp1ppp/4pn2/8/1b1P4/2N1P3/PP3PPP/R1BQKBNR b KQkq - 0 4', { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/pppp1ppp/4pn2/8/1b1P4/2N1P3/PP3PPP/R1BQKBNR w KQ - 1 5', { from:[7,5], to:[4,3], san:'Bd3' }],
  ['rnbq1rk1/pppp1ppp/4pn2/8/1b1P4/2NBP3/PP3PPP/R1BQK1NR b KQ - 2 5', { from:[1,3], to:[3,3], san:'d5' }],

  // --- King's Indian Defense (KID) ---
  ['rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2', { from:[1,6], to:[2,6], san:'g6' }],
  ['rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4', { from:[6,4], to:[4,4], san:'e4' }],
  ['rnbqk2r/pppppp1p/5np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq e3 0 4', { from:[1,3], to:[2,3], san:'d6' }],
  ['rnbqk2r/ppp1pp1p/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 5', { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqk2r/ppp1pp1p/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R b KQkq - 1 5', { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/ppp1pp1p/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 2 6', { from:[7,4], to:[5,4], san:'Be2' }],

  // --- Grünfeld Defense ---
  ['rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4', { from:[2,3], to:[3,3], san:'cxd5' }],
  ['rnbqkb1r/ppp1pp1p/5np1/3P4/8/2N5/PP1PPPPP/R1BQKBNR b KQkq - 0 4', { from:[2,5], to:[3,3], san:'Nxd5' }],
  ['rnbqkb1r/ppp1pp1p/8/3n4/8/2N5/PP1PPPPP/R1BQKBNR w KQkq - 0 5', { from:[4,4], to:[5,5], san:'e4' }],
  ['rnbqkb1r/ppp1pp1p/8/3n4/4P3/2N5/PP1P1PPP/R1BQKBNR b KQkq - 0 5', { from:[3,3], to:[2,2], san:'Nxc3' }],
  ['rnbqkb1r/ppp1pp1p/8/8/4P3/2n5/PP1P1PPP/R1BQKBNR w KQkq - 0 6', { from:[1,1], to:[2,2], san:'bxc3' }],

  // [----------------------------------------------------------------]
  // [                 FLANK & OTHER OPENINGS                         ]
  // [----------------------------------------------------------------]

  // --- English Opening (1. c4) ---
  ['rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1',
    { from:[1,4], to:[3,4], san:'e5' },   // 1...e5 (Reversed Sicilian)
    { from:[0,6], to:[2,5], san:'Nf6' },  // 1...Nf6 
    { from:[1,4], to:[2,4], san:'e6' },   // 1...e6
    { from:[1,6], to:[2,6], san:'g6' }    // 1...g6
  ],
  // English: Reversed Sicilian
  ['rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w KQkq e6 0 2', { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR b KQkq - 1 2', { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pppp1ppp/5n2/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq - 2 3', { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/pppp1ppp/5n2/4p3/2P5/2N2N2/PP1PPPPP/R1BQKB1R b KQkq - 3 3', { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/4p3/2P5/2N2N2/PP1PPPPP/R1BQKB1R w KQkq - 4 4', { from:[1,6], to:[3,5], san:'g3' }],

  // --- Réti Opening (1. Nf3) ---
  ['rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1',
    { from:[1,3], to:[3,3], san:'d5' },
    { from:[0,6], to:[2,5], san:'Nf6' }
  ],
  ['rnbqkbnr/ppp1pppp/8/3p4/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 2',
    { from:[6,2], to:[4,2], san:'c4' },
    { from:[1,6], to:[3,5], san:'g3' }   // King's Indian Attack setup
  ],
  ['rnbqkbnr/ppp1pppp/8/3p4/2P5/5N2/PPPPPPPP/RNBQKB1R b KQkq - 0 2', 
    { from:[1,3], to:[2,2], san:'d4' },
    { from:[2,2], to:[3,2], san:'c6' }
  ],

  // --- King's Indian Attack (KIA) ---
  ['rnbqkb1r/pppppppp/5n2/8/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 2 2',
    { from:[1,6], to:[2,6], san:'g6' },
    { from:[1,4], to:[2,4], san:'e6' }
  ],
  ['rnbqkb1r/pppppp1p/5np1/8/8/5NP1/PPPPPP1P/RNBQKB1R w KQkq - 0 3', { from:[7,5], to:[6,5], san:'Bg2' }],
  ['rnbqkb1r/pppppp1p/5np1/8/6P1/5N1P/PPPPPPB1/RNBQK2R b KQkq - 1 3', { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/pppppp1p/5np1/8/6P1/5N1P/PPPPPPB1/RNBQK2R w KQkq - 2 4', { from:[7,7], to:[7,5], san:'O-O' }],
  
  // --- Bird's Opening (1. f4) ---
  ['rnbqkbnr/pppppppp/8/8/5P2/8/PPPPPP1P/RNBQKBNR b KQkq f3 0 1',
    { from:[1,3], to:[3,3], san:'d5' }  // From's Gambit
  ],
  ['rnbqkbnr/ppp1pppp/8/3p4/5P2/8/PPPPPP1P/RNBQKBNR w KQkq - 0 2', { from:[4,4], to:[5,5], san:'exd5' }],
  ['rnbqkbnr/ppp1pppp/8/3P4/5P2/8/PPPPPP1P/RNBQKBNR b KQkq - 0 2', { from:[4,4], to:[3,3], san:'Nf6' }]
];