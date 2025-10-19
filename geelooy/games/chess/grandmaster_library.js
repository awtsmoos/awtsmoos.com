/* B"H */

// =================================================================
//      THE GRANDMASTER'S LIBRARY (PURE DATA EDITION)
// =================================================================
// This file contains only raw opening data. It has no logic.
// The engine will process this array into a usable opening book.
// Format: [ FEN_string, { from:[r,c], to:[r,c], san:"move" }, ...other moves... ]

const rawOpeningBook = [

  // --- 1. e4 e5 Openings ---

  // Ruy Lopez (Spanish Game) - Main Lines
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 1 2', { from:[7,5], to:[3,1], san:'Bb5' }],
  ['r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 2 3', { from:[1,0], to:[3,0], san:'a6' }],
  ['r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4', { from:[3,1], to:[2,0], san:'Ba4' }],
  ['r1bqkbnr/1ppp1ppp/p1n5/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4', { from:[1,6], to:[3,5], san:'Nf6' }],
  ['r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 b KQkq - 5 5', { from:[2,5], to:[4,4], san:'Be7' }],

  // Italian Game - Main Lines
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', { from:[7,5], to:[4,2], san:'Bc4' }],
  ['r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 4', { from:[1,6], to:[3,5], san:'Nf6' }], // Giuoco Piano
  ['r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 3 4', { from:[6,2], to:[4,2], san:'c3' }], // Main Line c3

  // Scotch Game
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3', { from:[4,4], to:[3,3], san:'exd4' }],
  ['r1bqkbnr/pppp1ppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4', { from:[5,3], to:[3,3], san:'Nxd4' }],
  ['r1bqkbnr/pppp1ppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4', { from:[1,6], to:[3,5], san:'Nf6' }],

  // King's Gambit
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', { from:[6,5], to:[4,5], san:'f4' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2', { from:[4,4], to:[5,5], san:'exf4' }], // Accepted
  ['rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPP2PP/RNBQKBNR w KQkq - 0 3', { from:[7,6], to:[5,5], san:'Nf3' }],

  // Petroff Defense
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', { from:[1,6], to:[3,5], san:'Nf6' }],
  ['rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', { from:[5,5], to:[4,4], san:'Nxe5' }],
  ['rnbqkb1r/pppp1ppp/8/4N3/4n3/8/PPPP1PPP/RNBQKB1R w KQkq - 0 4', { from:[6,3], to:[4,3], san:'d4' }],

  // --- Sicilian Defense (1. e4 c5) ---
  ['rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', { from:[7,6], to:[5,5], san:'Nf3' }],
  
  // Open Sicilian
  ['rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', { from:[1,3], to:[3,3], san:'d6' }], // ...d6 leads to Najdorf, Dragon, etc.
  ['rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3', { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3', { from:[2,5], to:[3,3], san:'cxd4' }],
  ['rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4', { from:[5,3], to:[3,3], san:'Nxd4' }],
  ['rnbqkbnr/pp2pppp/3p4/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4', { from:[1,6], to:[3,5], san:'Nf6' }],
  ['rnbqkb1r/pp2pppp/3p1n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5', { from:[7,1], to:[5,2], san:'Nc3' }],

  // Najdorf Variation
  ['rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5', { from:[1,0], to:[3,0], san:'a6' }],
  ['rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6', { from:[7,5], to:[6,6], san:'Bg5' }],

  // Dragon Variation
  ['rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5', { from:[1,6], to:[2,6], san:'g6' }],
  ['rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6', { from:[7,4], to:[6,4], san:'Be3' }],
  
  // Anti-Sicilians
  ['rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', { from:[6,2], to:[4,2], san:'c3' }], // Alapin Variation
  ['rnbqkbnr/pp1ppppp/8/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 2', { from:[1,3], to:[3,3], san:'d5' }],


  // --- French Defense (1. e4 e6) ---
  ['rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2', { from:[1,3], to:[3,3], san:'d5' }],
  // Advance Variation
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', { from:[4,4], to:[3,4], san:'e5' }],
  // Tarrasch Variation
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', { from:[7,1], to:[5,2], san:'Nd2' }],
  // Nc3 Variation
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3', { from:[1,6], to:[3,5], san:'Nf6' }], // Classical
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3', { from:[7,5], to:[3,1], san:'Bb4' }], // Winawer


  // --- Caro-Kann Defense (1. e4 c6) ---
  ['rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2', { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', { from:[7,1], to:[5,2], san:'Nc3' }], // Classical
  ['rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', { from:[4,4], to:[3,3], san:'exd5' }], // Exchange
  ['rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', { from:[4,4], to:[3,4], san:'e5' }], // Advance


  // --- 1. d4 d5 Openings ---
  ['rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2', { from:[6,2], to:[4,2], san:'c4' }], // Queen's Gambit
  
  // Queen's Gambit Declined (QGD)
  ['rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2', { from:[1,4], to:[3,4], san:'e6' }],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/ppp2ppp/4p3/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', { from:[1,6], to:[3,5], san:'Nf6' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4', { from:[7,5], to:[6,6], san:'Bg5' }],

  // Slav Defense
  ['rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2', { from:[1,2], to:[3,2], san:'c6' }],
  ['rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkbnr/pp2pppp/2p5/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 3', { from:[1,6], to:[3,5], san:'Nf6' }],
  ['rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4', { from:[7,1], to:[5,2], san:'Nc3' }],

  // London System
  ['rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2', { from:[7,5], to:[5,4], san:'Bf4' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 1 2', { from:[1,6], to:[3,5], san:'Nf6' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR w KQkq - 2 3', { from:[6,4], to:[4,4], san:'e3' }],


  // --- Indian Defenses (1. d4 Nf6) ---
  ['rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2', { from:[6,2], to:[4,2], san:'c4' }],
  
  // Nimzo-Indian Defense
  ['rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2', { from:[1,4], to:[3,4], san:'e6' }],
  ['rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pppp1ppp/4pn2/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', { from:[7,5], to:[3,1], san:'Bb4' }],

  // King's Indian Defense (KID)
  ['rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2', { from:[1,6], to:[2,6], san:'g6' }],
  ['rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4', { from:[6,4], to:[4,4], san:'e4' }],

  // Grünfeld Defense
  ['rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/pp2pp1p/6p1/3p4/2PP4/2N5/PP3PPP/R1BQKBNR b KQkq - 1 5', { from:[3,3], to:[2,2], san:'cxd4' }],

  // Catalan Opening
  ['rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/pppp1ppp/4pn2/8/2PP1N2/8/PP2PPPP/RNBQKB1R b KQkq - 1 3', { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/2PP1N2/8/PP2PPPP/RNBQKB1R w KQkq - 2 4', { from:[6,6], to:[4,6], san:'g3' }],


  // --- Flank & Other Openings ---
  // English Opening
  ['rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1', { from:[1,4], to:[3,4], san:'e5' }], // Main response
  ['rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 0 2', { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1', { from:[1,6], to:[3,5], san:'Nf6' }], // Symmetrical-style
  
  // Réti Opening
  ['rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1', { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 2', { from:[6,2], to:[4,2], san:'c4' }],
  
  // Pirc Defense
  ['rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', { from:[1,3], to:[3,3], san:'d6' }],
  ['rnbqkbnr/ppp1pppp/3p4/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/ppp1pppp/3p4/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2', { from:[1,6], to:[3,5], san:'Nf6' }],
  
  // Scandinavian Defense
  ['rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/pppppppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', { from:[4,4], to:[3,3], san:'exd5' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 2', { from:[3,3], to:[3,3], san:'Qxd5' }],

  // Alekhine's Defense
  ['rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', { from:[1,6], to:[3,5], san:'Nf6' }],
  ['rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2', { from:[4,4], to:[3,4], san:'e5' }],
  ['rnbqkb1r/pppppppp/5n2/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2', { from:[3,5], to:[3,3], san:'Nd5' }],
];