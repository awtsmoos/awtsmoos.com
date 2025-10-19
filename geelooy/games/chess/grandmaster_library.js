/* B"H */

// =================================================================
//      THE GRANDMASTER'S LIBRARY v2.0 (EXPANDED & ENHANCED)
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

  // --- Responses to 1. e4 ---
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
    { from:[7,6], to:[5,5], san:'Nf3' },  // 2. Nf3 (Main Line)
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
  ['r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 4',
    { from:[1,0], to:[3,0], san:'a6' },   // 3...a6 (Morphy Defense)
    { from:[1,6], to:[3,5], san:'Nf6' }   // 3...Nf6 (Berlin Defense)
  ],
  ['r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4', { from:[3,1], to:[2,0], san:'Ba4' }],
  ['r1bqkbnr/1ppp1ppp/p1n5/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4', { from:[1,6], to:[3,5], san:'Nf6' }],
  ['r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 b KQkq - 5 5',
    { from:[2,5], to:[4,4], san:'Be7' },  // 5...Be7 (Closed Ruy Lopez)
    { from:[2,4], to:[4,4], san:'Nxe4' }  // 5...Nxe4 (Open Ruy Lopez)
  ],
  ['r1bqk2r/1ppp1ppp/p1n2n2/4p3/B3P3/2b2N2/PPPP1PPP/R1BQ1RK1 w KQkq - 0 7', { from:[6,2], to:[4,2], san:'c3' }], // Closed Main Line

  // --- Italian Game ---
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', { from:[7,5], to:[4,2], san:'Bc4' }],
  ['r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 4',
    { from:[1,6], to:[3,5], san:'Nf6' },  // 4...Nf6 (Two Knights Defense)
    { from:[7,5], to:[4,2], san:'Bc5' }   // 4...Bc5 (Giuoco Piano)
  ],
  ['r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 3 4',
    { from:[6,2], to:[4,2], san:'c3' },   // 5. c3 (Italian Main Line)
    { from:[6,1], to:[4,1], san:'b4' }    // 5. b4 (Evans Gambit)
  ],

  // --- Scotch Game ---
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3', { from:[4,4], to:[3,3], san:'exd4' }],
  ['r1bqkbnr/pppp1ppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4',
    { from:[5,3], to:[3,3], san:'Nxd4' }, // 4. Nxd4 (Main Line)
    { from:[7,5], to:[4,2], san:'Bc4' }  // 4. Bc4 (Scotch Gambit)
  ],
  ['r1bqkbnr/pppp1ppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4',
    { from:[1,6], to:[3,5], san:'Nf6' },
    { from:[7,5], to:[2,2], san:'Bc5' }
  ],

  // --- King's Gambit ---
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', { from:[6,5], to:[4,5], san:'f4' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2',
    { from:[4,4], to:[5,5], san:'exf4' },  // 2...exf4 (King's Gambit Accepted)
    { from:[1,3], to:[3,3], san:'d5' }    // 2...d5 (Falkbeer Countergambit)
  ],
  ['rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPP2PP/RNBQKBNR w KQkq - 0 3', { from:[7,6], to:[5,5], san:'Nf3' }],
  
  // --- Petroff Defense ---
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    { from:[5,5], to:[4,4], san:'Nxe5' }, // 3. Nxe5 (Classical Attack)
    { from:[6,3], to:[4,3], san:'d4' }    // 3. d4 (Steinitz Variation)
  ],
  ['rnbqkb1r/pppp1ppp/5n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 0 3', { from:[1,3], to:[2,3], san:'d6' }],

  // --- Sicilian Defense (1. e4 c5) ---
  ['rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
    { from:[7,6], to:[5,5], san:'Nf3' },  // 2. Nf3 (Open Sicilian)
    { from:[7,1], to:[5,2], san:'Nc3' },  // 2. Nc3 (Closed Sicilian)
    { from:[6,2], to:[4,2], san:'c3' },   // 2. c3 (Alapin Variation)
    { from:[6,1], to:[4,1], san:'b4' }    // 2. b4 (Wing Gambit)
  ],
  ['rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    { from:[1,3], to:[2,3], san:'d6' },   // 2...d6
    { from:[0,1], to:[2,2], san:'Nc6' },  // 2...Nc6
    { from:[1,4], to:[2,4], san:'e6' }    // 2...e6
  ],

  // --- Open Sicilian Main Lines (after 2...d6) ---
  ['rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3', { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3', { from:[2,5], to:[3,3], san:'cxd4' }],
  ['rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4', { from:[5,3], to:[3,3], san:'Nxd4' }],
  ['rnbqkbnr/pp2pppp/3p4/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4', { from:[1,6], to:[3,5], san:'Nf6' }],
  ['rnbqkb1r/pp2pppp/3p1n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5', { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5',
    { from:[1,0], to:[3,0], san:'a6' },   // 5...a6 (Najdorf Variation)
    { from:[1,6], to:[2,6], san:'g6' },   // 5...g6 (Dragon Variation)
    { from:[1,4], to:[2,4], san:'e6' }    // 5...e6 (Scheveningen Variation)
  ],

  // --- Najdorf Variation ---
  ['rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    { from:[7,5], to:[6,6], san:'Bg5' },  // 6. Bg5 (Main Line)
    { from:[7,4], to:[5,4], san:'Be3' },  // 6. Be3 (English Attack)
    { from:[6,5], to:[4,5], san:'f3' }    // 6. f3
  ],
  ['rnbqkb1r/1p2pppp/p2p1n2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R b KQkq - 3 6', { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqk2r/1p3ppp/p2ppn2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R w KQkq - 0 7', { from:[6,5], to:[4,5], san:'f4' }],

  // --- Smith-Morra Gambit (Anti-Sicilian) ---
  ['rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3', { from:[6,3], to:[4,3], san:'c3' }],
  ['rnbqkbnr/pp2pppp/3p4/2p5/3PP3/2P2N2/PP3PPP/RNBQKB1R b KQkq - 0 4', { from:[3,3], to:[2,2], san:'dxc3'}],

  // --- French Defense (1. e4 e6) ---
  ['rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2', { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
    { from:[7,1], to:[5,2], san:'Nc3' },  // 3. Nc3 (Main Line)
    { from:[7,1], to:[5,2], san:'Nd2' },  // 3. Nd2 (Tarrasch Variation)
    { from:[4,4], to:[3,4], san:'e5' }    // 3. e5 (Advance Variation)
  ],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3',
    { from:[1,6], to:[3,5], san:'Nf6' },  // 3...Nf6 (Classical)
    { from:[7,5], to:[3,1], san:'Bb4' },  // 3...Bb4 (Winawer)
    { from:[3,3], to:[4,4], san:'dxe4' }  // 3...dxe4 (Rubinstein)
  ],

  // --- Caro-Kann Defense (1. e4 c6) ---
  ['rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2', { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
    { from:[7,1], to:[5,2], san:'Nc3' },  // 3. Nc3 (Classical)
    { from:[4,4], to:[3,3], san:'exd5' }, // 3. exd5 (Exchange)
    { from:[4,4], to:[3,4], san:'e5' }    // 3. e5 (Advance)
  ],
  ['rnbqkbnr/pp2pppp/2p5/3p4/3PP3/2N5/PP3PPP/R1BQKBNR b KQkq - 1 3', { from:[3,3], to:[4,4], san:'dxe4' }],

  // [----------------------------------------------------------------]
  // [                 1. d4 OPENINGS (QUEEN'S PAWN)                  ]
  // [----------------------------------------------------------------]
  
  // --- Responses to 1. d4 ---
  ['rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1',
    { from:[1,6], to:[3,5], san:'Nf6' },  // 1...Nf6 (Indian Defenses)
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
  ['rnbqkb1r/ppp2ppp/4p3/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', { from:[1,6], to:[3,5], san:'Nf6' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4',
    { from:[7,5], to:[6,6], san:'Bg5' },  // 4. Bg5 (Main Line)
    { from:[7,6], to:[5,5], san:'Nf3' }   // 4. Nf3
  ],
  ['rnbqkb1r/ppp2ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq - 3 4', { from:[2,5], to:[4,4], san:'Be7' }],

  // --- Slav Defense ---
  ['rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkbnr/pp2pppp/2p5/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 3', { from:[1,6], to:[3,5], san:'Nf6' }],
  ['rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4', { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 3 4', { from:[3,3], to:[2,2], san:'dxc4' }], // Main Line Slav

  // --- Indian Defenses (1. d4 Nf6 2. c4) ---
  ['rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2', { from:[6,2], to:[4,2], san:'c4' }],
  ['rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2',
    { from:[1,4], to:[2,4], san:'e6' },   // 2...e6 (leads to Nimzo, Queen's Indian, Bogo)
    { from:[1,6], to:[2,6], san:'g6' },   // 2...g6 (leads to King's Indian, Grünfeld)
    { from:[1,2], to:[3,2], san:'c5' }    // 2...c5 (Benoni Defense)
  ],

  // --- Nimzo-Indian Defense ---
  ['rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pppp1ppp/4pn2/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', { from:[7,5], to:[3,1], san:'Bb4' }],

  // --- King's Indian Defense (KID) ---
  ['rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2', { from:[1,6], to:[2,6], san:'g6' }],
  ['rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4', { from:[6,4], to:[4,4], san:'e4' }],
  ['rnbqk2r/pppppp1p/5np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq e3 0 4', { from:[1,3], to:[2,3], san:'d6' }],

  // --- Benoni Defense ---
  ['rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/pppp1ppp/4pn2/8/2PP1N2/8/PP2PPPP/RNBQKB1R b KQkq - 1 3', { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP1N2/8/PP2PPPP/RNBQKB1R w KQkq - 2 4', { from:[1,3], to:[3,3], san:'d5'}],

  // --- Dutch Defense ---
  ['rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR w KQkq f6 0 2',
    { from:[6,6], to:[4,6], san:'g3' },   // 2. g3 (Leningrad setup)
    { from:[6,2], to:[4,2], san:'c4' },   // 2. c4
    { from:[7,5], to:[6,6], san:'Bg5' }   // 2. Bg5 (Staunton Gambit style)
  ],

  // [----------------------------------------------------------------]
  // [                 FLANK & OTHER OPENINGS                         ]
  // [----------------------------------------------------------------]

  // --- English Opening (1. c4) ---
  ['rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1',
    { from:[1,4], to:[3,4], san:'e5' },   // 1...e5 (Reversed Sicilian)
    { from:[1,6], to:[3,5], san:'Nf6' },  // 1...Nf6 (Symmetrical-style)
    { from:[1,4], to:[2,4], san:'e6' },
    { from:[1,6], to:[2,6], san:'g6' }
  ],
  ['rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w KQkq e6 0 2', { from:[7,1], to:[5,2], san:'Nc3' }],

  // --- Réti Opening (1. Nf3) ---
  ['rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1',
    { from:[1,3], to:[3,3], san:'d5' },
    { from:[1,6], to:[3,5], san:'Nf6' }
  ],
  ['rnbqkbnr/ppp1pppp/8/3p4/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 2',
    { from:[6,2], to:[4,2], san:'c4' },
    { from:[6,6], to:[4,6], san:'g3' }   // King's Indian Attack setup
  ],

  // --- King's Indian Attack (KIA) ---
  ['rnbqkb1r/pppppppp/5n2/8/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 2 2',
    { from:[1,6], to:[2,6], san:'g6' },
    { from:[1,4], to:[2,4], san:'e6' }
  ],
  ['rnbqkb1r/pppppp1p/5np1/8/8/5NP1/PPPPPP1P/RNBQKB1R w KQkq - 0 3', { from:[7,5], to:[6,5], san:'Bg2' }],

];