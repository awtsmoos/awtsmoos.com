/* B"H */

// =================================================================
//      THE GRANDMASTER'S LIBRARY v4.0 (EXPANDED & DEEPENED)
// =================================================================
// This file contains a massively expanded and deepened set of opening lines.
// Each line aims for a depth of at least 10 moves per side where theory allows.
//
// NEW FORMAT: [ FEN_string, "Opening Name: Variation", { move_object }, ... ]
// The second element is a descriptive string for UI display.

const rawOpeningBook = [

  // [----------------------------------------------------------------]
  // [                      STARTING POSITION                         ]
  // [----------------------------------------------------------------]

  ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', "Start Position",
    { from:[6,4], to:[4,4], san:'e4' },   // 1. e4 (King's Pawn Opening)
    { from:[6,3], to:[4,3], san:'d4' },   // 1. d4 (Queen's Pawn Opening)
    { from:[7,6], to:[5,5], san:'Nf3' },  // 1. Nf3 (Réti Opening)
    { from:[6,2], to:[4,2], san:'c4' }    // 1. c4 (English Opening)
  ],

  // [----------------------------------------------------------------]
  // [              1. e4 OPENINGS (THE KING'S PAWN)                  ]
  // [----------------------------------------------------------------]

  // --- Main Responses to 1. e4 ---
  ['rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', "King's Pawn Game",
    { from:[1,4], to:[3,4], san:'e5' },   // 1...e5 (Open Game)
    { from:[1,2], to:[3,2], san:'c5' },   // 1...c5 (Sicilian Defense)
    { from:[1,4], to:[2,4], san:'e6' },   // 1...e6 (French Defense)
    { from:[1,2], to:[2,2], san:'c6' },   // 1...c6 (Caro-Kann Defense)
    { from:[1,3], to:[3,3], san:'d5' },   // 1...d5 (Scandinavian Defense)
    { from:[1,6], to:[3,5], san:'Nf6' },  // 1...Nf6 (Alekhine's Defense)
    { from:[1,3], to:[2,3], san:'d6' }    // 1...d6 (Pirc Defense)
  ],

  // --- Open Game Main Lines (1. e4 e5 2. Nf3) ---
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2', "Open Game", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', "Open Game: Main Line", { from:[0,1], to:[2,2], san:'Nc6' }],

  // --- Ruy Lopez (Spanish Game) ---
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', "Ruy Lopez", { from:[7,5], to:[3,1], san:'Bb5' }],
  ['r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', "Ruy Lopez: Main Defenses", { from:[1,0], to:[3,0], san:'a6' }, { from:[0,6], to:[2,5], san:'Nf6' }],
  // Ruy Lopez: Morphy Defense -> Closed Main Line
  ['r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4', "Ruy Lopez: Morphy Defense", { from:[3,1], to:[2,0], san:'Ba4' }],
  ['r1bqkbnr/1ppp1ppp/p1n5/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4', "Ruy Lopez: Morphy Defense", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 1 5', "Ruy Lopez: Morphy Defense", { from:[7,4], to:[7,6], san:'O-O' }],
 
  
    ['r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 5', "Ruy Lopez: Closed Defenses", { from:[2,5], to:[4,4], san:'Be7' }],
  
  
  ['r1bqk2r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 2 6', "Ruy Lopez: Closed Main Line", { from:[7,5], to:[7,4], san:'Re1' }],
  
  
   ['r1bqk2r/1ppp1ppp/p1n2n2/4p3/B3P3/4RN2/PPPP1PPP/RNBQ1RK1 b kq - 3 6', "Ruy Lopez: Closed Main Line", { from:[1,1], to:[3,1], san:'b5' }],
['r1bqk2r/2pp1ppp/p1n2n2/1p2p3/B3P3/4RN2/PPPP1PPP/RNBQ1RK1 w kq - 0 7', "Ruy Lopez: Closed Main Line", { from:[2,0], to:[1,1], san:'Bb3' }],

['r1bqk2r/2pp1ppp/p1n2n2/1p2p3/1b2P3/1B3N2/PPPP1PPP/RNBQ1RK1 b kq - 5 7', "Ruy Lopez: Closed Main Line", { from:[1,3], to:[2,3], san:'d6' }],
 
  
    ['r1b1k2r/2pp1ppp/p1nq1n2/1p2p3/1b2P3/1B3N2/PPPP1PPP/RNBQ1RK1 w kq - 7 8', "Ruy Lopez: Closed Main Line", { from:[6,2], to:[4,2], san:'c3' }],
  ['r1b1k2r/2pp1ppp/p1nq1n2/1p2p3/1b1PP3/1BP2N2/PP3PPP/RNBQ1RK1 b kq - 0 8', "Ruy Lopez: Closed Main Line", { from:[0,7], to:[0,5], san:'O-O' }],
  ['r1b2rk1/2pp1ppp/p1nq1n2/1p2p3/1b1PP3/1BP2N2/PP3PPP/RNBQ1RK1 w - - 1 9', "Ruy Lopez: Closed Main Line", { from:[6,3], to:[5,3], san:'d4' }],
  ['r1b2rk1/2pp1ppp/p1nq1n2/1p2p3/3PP3/1BP2N2/PP3PPP/RNBQ1RK1 b - - 2 9', "Ruy Lopez: Zaitsev Variation", { from:[1,1], to:[2,0], san:'Ba5' }],
  ['1rb2rk1/2pp1ppp/p1nq1n2/bp2p3/3PP3/1BP2N2/PP3PPP/RNBQ1RK1 w - - 3 10', "Ruy Lopez: Zaitsev Variation", { from:[7,3], to:[5,3], san:'d5' }],

  // --- Ruy Lopez: Berlin Defense (The Berlin Wall) ---
  ['r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', "Ruy Lopez: Berlin Defense", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', "Ruy Lopez: Berlin Defense", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4', "Ruy Lopez: Berlin Defense", { from:[2,4], to:[4,4], san:'Nxe4' }],
  ['r1bqkb1r/pppp1ppp/2n5/1B2p3/4n3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 5', "Ruy Lopez: Berlin Defense", { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqkb1r/pppp1ppp/2n5/1B2p3/3Pn3/5N2/PPP2PPP/RNBQ1RK1 b kq - 0 5', "Ruy Lopez: Berlin Defense", { from:[1,3], to:[2,3], san:'Nd6' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/1B2p3/3P4/5N2/PPP2PPP/RNBQ1RK1 w kq - 1 6', "Ruy Lopez: Berlin Defense", { from:[3,1], to:[2,2], san:'Bxc6' }],
  ['r1bqkb1r/pppp1ppp/2B2n2/4p3/3P4/5N2/PPP2PPP/RNBQ1RK1 b kq - 0 6', "Ruy Lopez: Berlin Defense", { from:[3,3], to:[2,2], san:'dxc6' }],
  ['r1bqkb1r/ppp2ppp/2p2n2/4p3/3P4/5N2/PPP2PPP/RNBQ1RK1 w kq - 0 7', "Ruy Lopez: Berlin Defense", { from:[3,3], to:[4,4], san:'dxe5' }],
  ['r1bqkb1r/ppp2ppp/2p2n2/4P3/8/5N2/PPP2PPP/RNBQ1RK1 b kq - 0 7', "Ruy Lopez: Berlin Defense", { from:[2,5], to:[4,4], san:'Nxe5' }],
  ['r1bqkb1r/ppp2ppp/2p5/4n3/8/5N2/PPP2PPP/RNBQ1RK1 w kq - 0 8', "Ruy Lopez: Berlin Endgame", { from:[3,5], to:[4,4], san:'Nxe5' }],

  // --- Italian Game ---
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', "Italian Game", { from:[7,5], to:[4,2], san:'Bc4' }],
  
  
  ['r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', "Italian Game: Main Defenses",
  { from:[0,5], to:[3,2], san:'Bc5' },   // Corrected! Now represents f8 -> c5
  { from:[0,6], to:[2,5], san:'Nf6' }
],
  
  
  // Italian Game: Giuoco Piano (Corrected Sequence)
['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/P2P1PPP/RNBQK2R w KQkq - 1 5', "Italian Game: Giuoco Piano", { from:[6,3], to:[4,3], san:'d4' }],
['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq d3 0 5', "Italian Game: Giuoco Piano", { from:[3,4], to:[4,3], san:'exd4' }],
['r1bqk2r/pppp1ppp/2n2n2/2b5/2BpP3/2P2N2/PP3PPP/RNBQK2R w KQkq - 0 6', "Italian Game: Giuoco Piano", { from:[2,2], to:[3,3], san:'cxd4' }],
['r1bqk2r/pppp1ppp/2n2n2/2b5/3PP3/5N2/PP3PPP/RNBQKB1R b KQkq - 0 6', "Italian Game: Giuoco Piano", { from:[2,1], to:[4,3], san:'Bb4+' }],
['r1bqk2r/1ppp1ppp/p1n2n2/2b5/3PP3/5N2/PP3PPP/RNBQKB1R w KQkq - 0 7', "Italian Game: Giuoco Piano", { from:[7,1], to:[5,2], san:'Nc3' }],
['r1bqk2r/1ppp1ppp/p1n2n2/2b5/3PP3/2N2N2/PP3PPP/R1BQKB1R b KQkq - 1 7', "Italian Game: Giuoco Piano", { from:[2,5], to:[4,4], san:'Nxe4' }],


  
  
  // --- Sicilian Defense ---
  ['rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2', "Sicilian Defense", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', "Sicilian Defense: Open", { from:[1,3], to:[2,3], san:'d6' }, { from:[0,1], to:[2,2], san:'Nc6' }, { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3', "Sicilian Defense: Open", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3', "Sicilian Defense: Open", { from:[2,5], to:[3,3], san:'cxd4' }],
  ['rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4', "Sicilian Defense: Open", { from:[5,3], to:[3,3], san:'Nxd4' }],
  ['rnbqkbnr/pp2pppp/3p4/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4', "Sicilian Defense: Open", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pp2pppp/3p1n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5', "Sicilian Defense: Open", { from:[7,1], to:[5,2], san:'Nc3' }],
  // Sicilian: Najdorf Variation
  ['rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5', "Sicilian Defense: Najdorf Variation", { from:[1,0], to:[3,0], san:'a6' }],
  ['rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6', "Sicilian Defense: Najdorf Variation", { from:[7,5], to:[6,6], san:'Bg5' }, { from:[7,4], to:[5,4], san:'Be3' }],
  ['rnbqkb1r/1p2pppp/p2p1n2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R b KQkq - 1 6', "Sicilian: Najdorf, Main Line (6.Bg5)", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqk2r/1p2bppp/p2p1n2/4p1B1/3NP3/2N5/PPP2PPP/R2QKB1R w KQkq - 3 7', "Sicilian: Najdorf, Main Line (6.Bg5)", { from:[6,5], to:[4,5], san:'f4' }],
  ['rnbqk2r/1p2bppp/p2p1n2/4p1B1/3NPP2/2N5/PPP3PP/R2QKB1R b KQkq - 0 7', "Sicilian: Najdorf, Main Line (6.Bg5)", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnb1k2r/1p2bppp/p2p1n2/4p1B1/3NPP2/2N5/PPP3PP/R2QKB1R w KQkq - 1 8', "Sicilian: Najdorf, Main Line (6.Bg5)", { from:[7,3], to:[5,3], san:'Qf3' }],
  
  ['rnb1k2r/1p2bppp/p2p1n2/4p1B1/3NPP2/2N2Q2/PPP3PP/R3KB1R b KQkq - 2 8', "Sicilian: Najdorf, Main Line (6.Bg5)", { from:[0,4], to:[0,6], san:'O-O' }], // Corrected: e8 to g8 for Black's castling
  
  
  
  ['rnb2rk1/1p2bppp/p2p1n2/4p1B1/3NPP2/2N2Q2/PPP3PP/R3KB1R w KQ - 3 9', "Sicilian: Najdorf, Main Line (6.Bg5)", { from:[7,7], to:[7,5], san:'O-O-O' }],
  ['rnb2rk1/1p2bppp/p2p1n2/4p1B1/3NPP2/2N2Q2/PPP3PP/2KR1B1R b - - 4 9', "Sicilian: Najdorf, Main Line (6.Bg5)", { from:[0,1], to:[2,2], san:'Nbd7' }],
  ['r1b2rk1/1p1nbppp/p2p1n2/4p1B1/3NPP2/2N2Q2/PPP3PP/2KR1B1R w - - 5 10', "Sicilian: Najdorf, Main Line (6.Bg5)", { from:[3,5], to:[5,5], san:'Nf3' }],

  // Sicilian: Dragon Variation
  ['rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6', "Sicilian: Dragon, Yugoslav Attack", { from:[7,4], to:[5,4], san:'Be3' }],
  ['rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 1 6', "Sicilian: Dragon, Yugoslav Attack", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/pp2pp1p/3p1np1/8/3NP3/2N1B3/PPP2PPP/R2QKB1R w KQkq - 2 7', "Sicilian: Dragon, Yugoslav Attack", { from:[6,5], to:[4,5], san:'f3' }],
  ['rnbqk2r/pp2pp1p/3p1np1/8/3NP3/2N1BP2/PPP3PP/R2QKB1R b KQkq - 0 7', "Sicilian: Dragon, Yugoslav Attack", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqk2r/pp2pp1p/2np1np1/8/3NP3/2N1BP2/PPP3PP/R2QKB1R w KQkq - 1 8', "Sicilian: Dragon, Yugoslav Attack", { from:[7,3], to:[3,3], san:'Qd2' }],
  ['r1bqk2r/pp2pp1p/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R b KQkq - 2 8', "Sicilian: Dragon, Yugoslav Attack", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bq1rk1/pp2pp1p/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 3 9', "Sicilian: Dragon, Yugoslav Attack", { from:[7,7], to:[7,5], san:'O-O-O' }],
  ['r1bq1rk1/pp2pp1p/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R b - - 4 9', "Sicilian: Dragon, Yugoslav Attack", { from:[0,3], to:[1,3], san:'d5' }],
  ['r1bq1rk1/pp2pp1p/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 5 10', "Sicilian: Dragon, Yugoslav Attack", { from:[4,4], to:[5,5], san:'exd5' }],
  ['r1bq1rk1/pp2pp1p/2np1np1/8/3N4/2N1BP2/PPPQ2PP/2KR1B1R b - - 0 10', "Sicilian: Dragon, Yugoslav Attack", { from:[2,5], to:[3,3], san:'Nxd5' }],

  // --- French Defense ---
  ['rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', "French Defense", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2', "French Defense", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', "French Defense: Main Variations", { from:[7,1], to:[5,2], san:'Nc3' }, { from:[7,1], to:[4,3], san:'Nd2' }, { from:[4,4], to:[3,4], san:'e5' }],
  // French Defense: Winawer Variation
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3', "French Defense: Winawer Variation", { from:[7,5], to:[3,1], san:'Bb4' }],
  ['rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4', "French Defense: Winawer Variation", { from:[4,4], to:[3,4], san:'e5' }],
  ['rnbqk1nr/ppp2ppp/4p3/3pP3/1b1P4/2N5/PPP2PPP/R1BQKBNR b KQkq - 0 4', "French Defense: Winawer Variation", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqk1nr/pp3ppp/4p3/2ppP3/1b1P4/2N5/PPP2PPP/R1BQKBNR w KQkq - 1 5', "French Defense: Winawer Variation", { from:[6,0], to:[4,0], san:'a3' }],
  ['rnbqk1nr/pp3ppp/4p3/2ppP3/1b1P4/P1N5/1PP2PPP/R1BQKBNR b KQkq - 0 5', "French Defense: Winawer Variation", { from:[3,1], to:[2,2], san:'Bxc3+' }],
  ['rnbqk1nr/pp3ppp/4p3/2ppP3/3P4/P1b5/1PP2PPP/R1BQKBNR w KQkq - 0 6', "French Defense: Winawer Variation", { from:[1,1], to:[2,2], san:'bxc3' }],
  ['rnbqk1nr/pp3ppp/4p3/2ppP3/3P4/P1P5/2P2PPP/R1BQKBNR b KQkq - 0 6', "French Defense: Winawer Variation", { from:[0,6], to:[2,5], san:'Ne7' }],
  ['rnbq1rk1/pp2nppp/4p3/2ppP3/3P4/P1P5/2P2PPP/R1BQKBNR w KQ - 1 7', "French Defense: Winawer Variation", { from:[7,3], to:[6,3], san:'Qg4' }],
  ['rnbq1rk1/pp2nppp/4p3/2ppP3/3P2Q1/P1P5/2P2PPP/R1B1KBNR b KQ - 2 7', "French Defense: Winawer Variation", { from:[2,5], to:[3,2], san:'cxd4' }],
  ['rnbq1rk1/pp2nppp/4p3/3pP3/3p2Q1/P1P5/2P2PPP/R1B1KBNR w KQ - 0 8', "French Defense: Winawer Variation", { from:[2,2], to:[3,3], san:'cxd4' }],

  // --- Caro-Kann Defense ---
  ['rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', "Caro-Kann Defense", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2', "Caro-Kann Defense", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', "Caro-Kann Defense: Main Variations", { from:[7,1], to:[5,2], san:'Nc3' }, { from:[4,4], to:[5,5], san:'exd5' }, { from:[4,4], to:[3,4], san:'e5' }],
  // Caro-Kann: Classical Variation
  ['rnbqkbnr/pp2pppp/2p5/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3', "Caro-Kann: Classical Variation", { from:[3,3], to:[4,4], san:'dxe4' }],
  ['rnbqkbnr/pp2pppp/2p5/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4', "Caro-Kann: Classical Variation", { from:[2,3], to:[4,4], san:'Nxe4' }],
  ['rnbqkbnr/pp2pppp/2p5/8/4N3/8/PPP2PPP/R1BQKBNR b KQkq - 0 4', "Caro-Kann: Classical Variation", { from:[7,5], to:[3,1], san:'Bf5' }],
  ['rnbqk1nr/pp2pppp/2p5/3p4/4N3/8/PPP1PPPP/R1BQKBNR w KQkq - 1 5', "Caro-Kann: Classical Variation", { from:[4,4], to:[6,5], san:'Ng3' }],
  ['rnbqk1nr/pp2pppp/2p5/3p4/8/6N1/PPPPPPPP/R1BQKBNR b KQkq - 1 5', "Caro-Kann: Classical Variation", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqk1nr/pp3ppp/2p1p3/3p4/8/6N1/PPPPPPPP/R1BQKBNR w KQkq - 2 6', "Caro-Kann: Classical Variation", { from:[7,5], to:[5,4], san:'Bd3' }],
  ['rnbqk1nr/pp3ppp/2p1p3/3p4/8/3B2N1/PPPPPPPP/R1BQK1NR b KQkq - 3 6', "Caro-Kann: Classical Variation", { from:[0,6], to:[2,5], san:'Ne7' }],
  ['rnbq1rk1/pp2nppp/2p1p3/3p4/8/3B2N1/PPPPPPPP/R1BQK1NR w KQ - 5 7', "Caro-Kann: Classical Variation", { from:[6,2], to:[4,2], san:'c3' }],
  ['rnbq1rk1/pp2nppp/2p1p3/3p4/2P5/3B2N1/PP1PPPPP/R1BQK1NR b KQ - 0 7', "Caro-Kann: Classical Variation", { from:[1,5], to:[3,5], san:'f5' }],

  // [----------------------------------------------------------------]
  // [              1. d4 OPENINGS (THE QUEEN'S PAWN)                 ]
  // [----------------------------------------------------------------]
  ['rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1', "Queen's Pawn Game", { from:[0,6], to:[2,5], san:'Nf6' }, { from:[1,3], to:[3,3], san:'d5' }],
  
  // --- Queen's Gambit Lines ---
  ['rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2', "Queen's Gambit", { from:[6,2], to:[4,2], san:'c4' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2', "Queen's Gambit: Main Defenses", { from:[1,4], to:[2,4], san:'e6' }, { from:[1,2], to:[3,2], san:'c6' }, { from:[3,3], to:[2,2], san:'dxc4' }],
  // Queen's Gambit Declined (QGD): Orthodox
  ['rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', "QGD: Orthodox Defense", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', "QGD: Orthodox Defense", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4', "QGD: Orthodox Defense", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq - 3 4', "QGD: Orthodox Defense", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnbqk2r/ppp1bppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR w KQkq - 4 5', "QGD: Orthodox Defense", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqk2r/ppp1bppp/4pn2/3p2B1/2PP4/2N1P3/PP3PPP/R2QKBNR b KQkq - 0 5', "QGD: Orthodox Defense", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/ppp1bppp/4pn2/3p2B1/2PP4/2N1P3/PP3PPP/R2QKBNR w KQ - 1 6', "QGD: Orthodox Defense", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbq1rk1/ppp1bppp/4pn2/3p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R b KQ - 2 6', "QGD: Orthodox Defense", { from:[0,1], to:[2,2], san:'Nbd7' }],
  ['r1bq1rk1/pp1nbppp/2p1pn2/3p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ - 3 7', "QGD: Orthodox Defense", { from:[7,3], to:[4,2], san:'Qc2' }],
  ['r1bq1rk1/pp1nbppp/2p1pn2/3p2B1/2PP4/2N1PN2/PPQ2PPP/R3KB1R b KQ - 4 7', "QGD: Orthodox Defense", { from:[1,0], to:[3,0], san:'a6' }],
  ['r1bq1rk1/1p1nbppp/p1p1pn2/3p2B1/2PP4/2N1PN2/PPQ2PPP/R3KB1R w KQ - 5 8', "QGD: Orthodox Defense", { from:[7,0], to:[5,0], san:'a3' }],

  // --- Semi-Slav Defense: Meran Variation ---
  ['rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4', "Semi-Slav Defense", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 3 4', "Semi-Slav Defense", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5', "Semi-Slav Defense", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R b KQkq - 1 5', "Semi-Slav Defense", { from:[0,1], to:[2,2], san:'Nbd7' }],
  ['r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 2 6', "Semi-Slav: Meran Variation", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R b KQkq - 3 6', "Semi-Slav: Meran Variation", { from:[3,3], to:[2,2], san:'dxc4' }],
  ['r1bqkb1r/pp1n1ppp/2p1pn2/8/2pP4/2NBPN2/PP3PPP/R1BQK2R w KQkq - 0 7', "Semi-Slav: Meran Variation", { from:[3,1], to:[2,2], san:'Bxc4' }],
  ['r1bqkb1r/pp1n1ppp/2p1pn2/8/2BP4/2N1PN2/PP3PPP/R1BQK2R b KQkq - 0 7', "Semi-Slav: Meran Variation", { from:[1,4], to:[3,4], san:'b5' }],
  ['r1bqkb1r/pp1n1ppp/2p1pn2/1P6/2BP4/2N1PN2/P4PPP/R1BQK2R w KQkq - 0 8', "Semi-Slav: Meran Variation", { from:[3,1], to:[4,3], san:'Bd3' }],
  ['r1bqkb1r/pp1n1ppp/2p1pn2/1P6/3P4/2NBPN2/P4PPP/R1BQK2R b KQkq - 1 8', "Semi-Slav: Meran Variation", { from:[1,0], to:[3,0], san:'a6' }],
  ['r1bqkb1r/3n1ppp/p1p1pn2/1P6/3P4/2NBPN2/P4PPP/R1BQK2R w KQkq - 0 9', "Semi-Slav: Meran Variation", { from:[1,1], to:[2,2], san:'bxc6' }],
  ['r1bqkb1r/3n1ppp/p1P1pn2/8/3P4/2NBPN2/P4PPP/R1BQK2R b KQkq - 0 9', "Semi-Slav: Meran Variation", { from:[2,2], to:[3,2], san:'cxd5' }],

  // --- Indian Defenses ---
  ['rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2', "Indian Defenses", { from:[6,2], to:[4,2], san:'c4' }],
  ['rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2', "Indian Defenses", { from:[1,4], to:[2,4], san:'e6' }, { from:[1,6], to:[2,6], san:'g6' }],

  // --- Nimzo-Indian Defense ---
  ['rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', "Nimzo-Indian Defense", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pppp1ppp/4pn2/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', "Nimzo-Indian Defense", { from:[7,5], to:[3,1], san:'Bb4' }],
  // Nimzo-Indian: Rubinstein System
  ['rnbqk2r/pppp1ppp/4pn2/8/1b1P4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4', "Nimzo-Indian: Rubinstein System", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqk2r/pppp1ppp/4pn2/8/1b1P4/2N1P3/PP3PPP/R1BQKBNR b KQkq - 0 4', "Nimzo-Indian: Rubinstein System", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/pppp1ppp/4pn2/8/1b1P4/2N1P3/PP3PPP/R1BQKBNR w KQ - 1 5', "Nimzo-Indian: Rubinstein System", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbq1rk1/pppp1ppp/4pn2/8/1b1P4/2N1PN2/PP3PPP/R1BQKB1R b KQ - 2 5', "Nimzo-Indian: Rubinstein System", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbq1rk1/ppp2ppp/4pn2/3p4/1b1P4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 0 6', "Nimzo-Indian: Rubinstein System", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['rnbq1rk1/ppp2ppp/4pn2/3p4/1b1P4/2NBPN2/PP3PPP/R1BQK2R b KQ - 4 6', "Nimzo-Indian: Rubinstein System", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbq1rk1/pp3ppp/4pn2/2pp4/1b1P4/2NBPN2/PP3PPP/R1BQK2R w KQ c6 0 7', "Nimzo-Indian: Rubinstein System", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/pp3ppp/4pn2/2pp4/1b1P4/2NBPN2/PP3PPP/R1BQ1RK1 b - - 5 7', "Nimzo-Indian: Rubinstein System", { from:[0,1], to:[2,2], san:'Nc6' }],

  // --- King's Indian Defense (KID): Mar del Plata Variation ---
  ['rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', "KID", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', "KID", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4', "KID", { from:[6,4], to:[4,4], san:'e4' }],
  ['rnbqk2r/pppppp1p/5np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq e3 0 4', "KID", { from:[1,3], to:[2,3], san:'d6' }],
  ['rnbqk2r/ppp1pp1p/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 5', "KID", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqk2r/ppp1pp1p/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R b KQkq - 1 5', "KID", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/ppp1pp1p/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 2 6', "KID: Classical Variation", { from:[7,4], to:[5,4], san:'Be2' }],
  ['rnbq1rk1/ppp1pp1p/3p1np1/8/2PPP3/2N1BN2/PP3PPP/R2QKB1R b KQ - 3 6', "KID: Classical Variation", { from:[1,4], to:[2,4], san:'e5' }],
  ['rnbq1rk1/ppp2p1p/3p1np1/4p3/2PPP3/2N1BN2/PP3PPP/R2QKB1R w KQ - 0 7', "KID: Classical Variation", { from:[6,3], to:[4,3], san:'d5' }],
  ['rnbq1rk1/ppp2p1p/3p1np1/3Pp3/2P1P3/2N1BN2/PP3PPP/R2QKB1R b KQ - 0 7', "KID: Classical Variation", { from:[0,1], to:[2,2], san:'Nbd7' }],
  ['r1bq1rk1/pppn1p1p/3p1np1/3Pp3/2P1P3/2N1BN2/PP3PPP/R2QKB1R w KQ - 1 8', "KID: Mar del Plata Variation", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bq1rk1/pppn1p1p/3p1np1/3Pp3/2P1P3/2N1BN2/PP3PPP/R2Q1RK1 b - - 2 8', "KID: Mar del Plata Variation", { from:[2,5], to:[4,4], san:'Ne8' }],
  ['r1bq1rk1/pppn1p1p/3p2p1/3Pp3/2P1P3/2n1BN2/PP3PPP/R2Q1RK1 w - - 0 9', "KID: Mar del Plata Variation", { from:[6,1], to:[4,1], san:'b4' }],

  // --- London System ---
  ['rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2', "London System", { from:[7,5], to:[5,4], san:'Bf4' }],
  ['rnbqkb1r/pppppppp/5n2/8/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 2 2', "London System", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR w KQkq - 0 3', "London System", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/4P3/PPP2PPP/RN1QKBNR b KQkq - 0 3', "London System", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkb1r/pp2pppp/2p2n2/3p4/3P1B2/4P3/PPP2PPP/RN1QKBNR w KQkq - 1 4', "London System", { from:[6,2], to:[4,2], san:'c3' }],
  ['rnbqkb1r/pp2pppp/2p2n2/3p4/2PP1B2/4P3/PP3PPP/RN1QKBNR b KQkq - 0 4', "London System", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnbqk2r/pp2bppp/2p2n2/3p4/2PP1B2/4P3/PP3PPP/RN1QKBNR w KQkq - 1 5', "London System", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqk2r/pp2bppp/2p2n2/3p4/2PP1B2/2N1P3/PP3PPP/R2QKBNR b KQkq - 2 5', "London System", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/pp2bppp/2p2n2/3p4/2PP1B2/2N1P3/PP3PPP/R2QKBNR w KQ - 3 6', "London System", { from:[7,5], to:[4,3], san:'Bd3' }],

  // [----------------------------------------------------------------]
  // [                 FLANK & OTHER OPENINGS                         ]
  // [----------------------------------------------------------------]

  // --- English Opening ---
  ['rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1', "English Opening", { from:[1,4], to:[3,4], san:'e5' }, { from:[0,6], to:[2,5], san:'Nf6' }],
  // English: Reversed Sicilian
  ['rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w KQkq e6 0 2', "English: Reversed Sicilian", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR b KQkq - 1 2', "English: Reversed Sicilian", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pppp1ppp/5n2/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq - 2 3', "English: Reversed Sicilian", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/pppp1ppp/5n2/4p3/2P5/2N2N2/PP1PPPPP/R1BQKB1R b KQkq - 3 3', "English: Reversed Sicilian", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/4p3/2P5/2N2N2/PP1PPPPP/R1BQKB1R w KQkq - 4 4', "English: Four Knights", { from:[1,6], to:[3,5], san:'g3' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/4p3/2P5/2N2NP1/PP1PPP1P/R1BQKB1R b KQkq - 0 4', "English: Four Knights", { from:[7,5], to:[3,1], san:'Bb4' }],
  ['r1bqk2r/pppp1ppp/2n2n2/4p3/1bP5/2N2NP1/PP1PPP1P/R1BQKB1R w KQkq - 1 5', "English: Four Knights", { from:[7,5], to:[6,5], san:'Bg2' }],
  ['r1bqk2r/pppp1ppp/2n2n2/4p3/1bP5/2N2NP1/PP1PPPBP/R1BQK2R b KQkq - 2 5', "English: Four Knights", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bq1rk1/pppp1ppp/2n2n2/4p3/1bP5/2N2NP1/PP1PPPBP/R1BQK2R w KQ - 3 6', "English: Four Knights", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bq1rk1/pppp1ppp/2n2n2/4p3/1bP5/2N2NP1/PP1PPPBP/R1BQ1RK1 b - - 4 6', "English: Four Knights", { from:[4,4], to:[5,5], san:'e4' }],
  
  // --- Réti Opening ---
  ['rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1', "Réti Opening", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 2', "Réti Opening", { from:[6,2], to:[4,2], san:'c4' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/2P5/5N2/PPPPPPPP/RNBQKB1R b KQkq - 0 2', "Réti Opening", { from:[3,3], to:[2,2], san:'d4' }],
  ['rnbqkbnr/ppp1pppp/8/8/2pP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 3', "Réti Opening", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqkbnr/ppp1pppp/8/8/2pP4/4P3/PP3PPP/RNBQKBNR b KQkq - 0 3', "Réti Opening", { from:[1,4], to:[3,4], san:'b5' }],
  ['rnbqkbnr/p1p1pppp/8/1p6/2pP4/4P3/PP3PPP/RNBQKBNR w KQkq - 0 4', "Réti Opening", { from:[6,0], to:[4,0], san:'a4' }],
  ['rnbqkbnr/p1p1pppp/8/1p6/P1pP4/4P3/1P3PPP/RNBQKBNR b KQkq - 0 4', "Réti Opening", { from:[1,2], to:[3,2], san:'c6' }],
  ['rnbqkbnr/p3pppp/2p5/1p6/P1pP4/4P3/1P3PPP/RNBQKBNR w KQkq - 0 5', "Réti Opening", { from:[1,1], to:[2,2], san:'bxc3' }],
  ['rnbqkbnr/p3pppp/2p5/1p6/P1pP4/2P1P3/5PPP/RNBQKBNR b KQkq - 0 5', "Réti Opening", { from:[0,6], to:[2,5], san:'Nf6' }],
  
  
  // [----------------------------------------------------------------]
  // [               ADDITIONAL DEEP OPENING LINES (50)               ]
  // [----------------------------------------------------------------]

  // --- 1. e4 Openings ---

  // #1: Scandinavian Defense: Main Line (3...Qa5)
  ['rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', "Scandinavian Defense", { from:[4,4], to:[3,3], san:'exd5' }],
  ['rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2', "Scandinavian Defense", { from:[7,3], to:[3,3], san:'Qxd5' }],
  ['rnbqkb1r/ppp1pppp/8/3q4/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3', "Scandinavian Defense", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/ppp1pppp/8/3q4/8/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 3', "Scandinavian Defense: Main Line", { from:[3,3], to:[4,0], san:'Qa5' }],
  ['rnbqkb1r/ppp1pppp/8/8/8/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 4', "Scandinavian Defense: Main Line", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkb1r/ppp1pppp/8/8/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq - 0 4', "Scandinavian Defense: Main Line", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp1pppp/5n2/8/3P4/2N5/PPP2PPP/R1BQKBNR w KQkq - 1 5', "Scandinavian Defense: Main Line", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/ppp1pppp/5n2/8/3P4/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 2 5', "Scandinavian Defense: Main Line", { from:[1,6], to:[2,6], san:'g6' }],
  ['rnbqkb1r/pp2pppp/5np1/8/3P4/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 3 6', "Scandinavian Defense: Main Line", { from:[7,5], to:[4,2], san:'Bc4' }],
  ['rnbqkb1r/pp2pppp/5np1/8/2BP4/2N2N2/PP3PPP/R1BQK2R b KQkq - 4 6', "Scandinavian Defense: Main Line", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/pp2pp1p/5np1/8/2BP4/2N2N2/PP3PPP/R1BQK2R w KQkq - 0 7', "Scandinavian Defense: Main Line", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbqk2r/pp2pp1p/5np1/8/2BP4/2N2N2/PP3PPP/R1BQ1RK1 b kq - 1 7', "Scandinavian Defense: Main Line", { from:[7,7], to:[7,5], san:'O-O' }],

  // #2: Pirc Defense: Austrian Attack
  ['rnbqkbnr/pp1ppppp/3p4/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', "Pirc Defense", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pp1ppppp/3p4/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2', "Pirc Defense", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pp1ppppp/3p1n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 1 3', "Pirc Defense", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pp1ppppp/3p1n2/8/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 2 3', "Pirc Defense", { from:[1,6], to:[2,6], san:'g6' }],
  ['rnbqkb1r/pp2pp1p/3p1np1/8/3PP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 4', "Pirc Defense: Austrian Attack", { from:[6,5], to:[4,5], san:'f4' }],
  ['rnbqkb1r/pp2pp1p/3p1np1/8/3PPP2/2N5/PP4PP/R1BQKBNR b KQkq - 0 4', "Pirc Defense: Austrian Attack", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/pp2pp1p/3p1np1/8/3PPP2/2N5/PP4PP/R1BQKBNR w KQkq - 1 5', "Pirc Defense: Austrian Attack", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqk2r/pp2pp1p/3p1np1/8/3PPP2/2N2N2/PP4PP/R1BQKB1R b KQkq - 2 5', "Pirc Defense: Austrian Attack", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/pp2pp1p/3p1np1/8/3PPP2/2N2N2/PP4PP/R1BQKB1R w KQ - 3 6', "Pirc Defense: Austrian Attack", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['rnbq1rk1/pp2pp1p/3p1np1/8/3PPP2/2NB1N2/PP4PP/R1BQK2R b KQ - 4 6', "Pirc Defense: Austrian Attack", { from:[0,1], to:[2,2], san:'Nc6' }],
  
  
  ['r1bq1rk1/pp2pp1p/2np1np1/8/3PPP2/2NB1N2/PP4PP/R1BQK2R w KQ - 5 7', "Pirc Defense: Austrian Attack", { from:[7,4], to:[7,6], san:'O-O' }], // Corrected: e1 to g1 for White's castling
  
  
  
  // #3: Alekhine's Defense: Four Pawns Attack
  ['rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2', "Alekhine's Defense", { from:[4,4], to:[3,4], san:'e5' }],
  ['rnbqkb1r/pppppppp/5n2/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2', "Alekhine's Defense", { from:[2,5], to:[3,3], san:'Nd5' }],
  ['rnbqkb1r/pppppppp/8/3n4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 3', "Alekhine's Defense: Four Pawns Attack", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkb1r/pppppppp/8/3n4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 3', "Alekhine's Defense: Four Pawns Attack", { from:[1,3], to:[2,3], san:'d6' }],
  ['rnbqkb1r/ppp1pppp/3p4/3n4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 4', "Alekhine's Defense: Four Pawns Attack", { from:[6,2], to:[4,2], san:'c4' }],
  ['rnbqkb1r/ppp1pppp/3p4/3n4/2PPP3/8/PP3PPP/RNBQKBNR b KQkq - 0 4', "Alekhine's Defense: Four Pawns Attack", { from:[3,3], to:[1,1], san:'Nb6' }],
  ['rnbqkb1r/ppp1pppp/1n1p4/8/2PPP3/8/PP3PPP/RNBQKBNR w KQkq - 1 5', "Alekhine's Defense: Four Pawns Attack", { from:[6,5], to:[4,5], san:'f4' }],
  ['rnbqkb1r/ppp1pppp/1n1p4/8/2PPP1P1/8/PP3P1P/RNBQKBNR b KQkq - 0 5', "Alekhine's Defense: Four Pawns Attack", { from:[1,6], to:[2,6], san:'g6' }],
  ['rnbqkb1r/pp2pppp/1n1p2p1/8/2PPP1P1/8/PP3P1P/RNBQKBNR w KQkq - 1 6', "Alekhine's Defense: Four Pawns Attack", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pp2pppp/1n1p2p1/8/2PPP1P1/2N5/PP3P1P/R1BQKBNR b KQkq - 2 6', "Alekhine's Defense: Four Pawns Attack", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/pp2pp1p/1n1p2p1/8/2PPP1P1/2N5/PP3P1P/R1BQKBNR w KQkq - 3 7', "Alekhine's Defense: Four Pawns Attack", { from:[7,4], to:[5,4], san:'Be3' }],
  ['rnbqk2r/pp2pp1p/1n1p2p1/8/2PPP1P1/2N1B3/PP3P1P/R2QKB1R b KQkq - 4 7', "Alekhine's Defense: Four Pawns Attack", { from:[0,1], to:[2,2], san:'Nc6' }],

  // #4: Two Knights Defense: Fried Liver Attack
  ['r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 4 4', "Two Knights Defense", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 5 5', "Two Knights Defense: Fried Liver Attack", { from:[5,5], to:[6,6], san:'Ng5' }],
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/6N1/PPPP1PPP/RNBQK2R b KQkq - 6 5', "Two Knights Defense: Fried Liver Attack", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/6N1/PPPP1PPP/RNBQK2R w KQ - 7 6', "Two Knights Defense: Fried Liver Attack", { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2BPP3/6N1/PPP2PPP/RNBQK2R b KQ - 0 6', "Two Knights Defense: Fried Liver Attack", { from:[4,4], to:[3,3], san:'exd4' }],
  ['r1bq1rk1/pppp1ppp/2n2n2/2b5/2BpP3/6N1/PPP2PPP/RNBQK2R w KQ - 0 7', "Two Knights Defense: Fried Liver Attack", { from:[6,5], to:[4,5], san:'f4' }],
  ['r1bq1rk1/pppp1ppp/2n2n2/2b5/2BPP3/5N2/PP3PPP/RNBQK2R b KQ - 0 7', "Two Knights Defense: Fried Liver Attack", { from:[2,1], to:[3,3], san:'Bb4+' }],
  ['r1bq1rk1/ppp2ppp/2n2n2/2b5/2BPP3/5N2/PP3PPP/RNBQK2R w KQ - 1 8', "Two Knights Defense: Fried Liver Attack", { from:[6,2], to:[4,2], san:'c3' }],

  // #5: Sicilian Defense: Sveshnikov Variation
  ['rnbqkb1r/pp1ppppp/5n2/2p5/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 3', "Sicilian: 2.Nc3", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 3 4', "Sicilian: Sveshnikov Variation", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq - 4 4', "Sicilian: Sveshnikov Variation", { from:[1,4], to:[3,4], san:'e5' }],
  ['r1bqkb1r/pp1p1ppp/2n2n2/2p1p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq e6 0 5', "Sicilian: Sveshnikov Variation", { from:[3,3], to:[1,1], san:'Nb5' }],
  ['r1bqkb1r/pp1p1ppp/2n2n2/1Np1p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq - 3 5', "Sicilian: Sveshnikov Variation", { from:[1,3], to:[2,3], san:'d6' }],
  ['r1bqkb1r/pp3ppp/2np1n2/1Np1p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 6', "Sicilian: Sveshnikov Variation", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['r1bqkb1r/pp3ppp/2np1n2/1Np1p1B1/4P3/2N2N2/PPP2PPP/R2QKB1R b KQkq - 1 6', "Sicilian: Sveshnikov Variation", { from:[1,0], to:[3,0], san:'a6' }],
  ['r2qkb1r/1p3ppp/p1np1n2/1Np1p1B1/4P3/2N2N2/PPP2PPP/R2QKB1R w KQkq - 0 7', "Sicilian: Sveshnikov Variation", { from:[1,1], to:[0,0], san:'Na3' }],
  ['r2qkb1r/1p3ppp/p1np1n2/4p1B1/4P3/N4N2/PPP2PPP/R2QKB1R b KQkq - 1 7', "Sicilian: Sveshnikov Variation", { from:[2,5], to:[4,4], san:'Be7' }],
  ['r2qk2r/1p2bppp/p1np1n2/4p1B1/4P3/N4N2/PPP2PPP/R2QKB1R w KQkq - 2 8', "Sicilian: Sveshnikov Variation", { from:[6,6], to:[4,4], san:'Bxf6' }],
  ['r2qk2r/1p2bppp/p1np1B2/4p3/4P3/N4N2/PPP2PPP/R2QKB1R b KQkq - 0 8', "Sicilian: Sveshnikov Variation", { from:[6,5], to:[5,5], san:'gxf6' }],
  ['r2qk2r/1p2bp1p/p1np1p2/4p3/4P3/N4N2/PPP2PPP/R2QKB1R w KQkq - 0 9', "Sicilian: Sveshnikov Variation", { from:[6,2], to:[4,2], san:'c3' }],

  
  
  
  
  
  
  // #6: Vienna Game and Gambit
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2', "Vienna Game", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2', "Vienna Game", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pppp1ppp/5n2/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 3', "Vienna Game", { from:[6,5], to:[4,5], san:'f4' }],
  ['rnbqkb1r/pppp1ppp/5n2/4p3/4PP2/2N5/PPPP2PP/R1BQKBNR b KQkq - 0 3', "Vienna Gambit", { from:[3,3], to:[4,4], san:'d5' }],
  ['rnbqkb1r/pppp1ppp/5n2/8/4Pp2/2N5/PPPP2PP/R1BQKBNR w KQkq - 0 4', "Vienna Gambit", { from:[4,5], to:[5,5], san:'fxe5' }],
  ['rnbqkb1r/pppp1ppp/5n2/4p3/8/2N5/PPPPPPPP/R1BQKBNR b KQkq - 1 4', "Vienna Gambit", { from:[2,5], to:[4,4], san:'Nxe4' }],
  ['rnbqkb1r/pppp1ppp/8/8/4n3/2N5/PPPPPPPP/R1BQKBNR w KQkq - 0 5', "Vienna Gambit", { from:[7,3], to:[6,3], san:'Qf3' }],
  ['rnbqkb1r/pppp1ppp/8/8/4n3/2N2Q2/PPPPPPPP/R1B1KBNR b KQkq - 2 5', "Vienna Gambit", { from:[4,4], to:[3,2], san:'Nc5' }],
  ['rnbqkb1r/pppp1ppp/8/2n5/8/2N2Q2/PPPPPPPP/R1B1KBNR w KQkq - 4 6', "Vienna Gambit", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkb1r/pppp1ppp/8/2n5/3P4/2N2Q2/PPP2PPP/R1B1KBNR b KQkq - 0 6', "Vienna Gambit", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnbqk2r/pppp1ppp/8/2n1p3/3P4/2N2Q2/PPP2PPP/R1B1KBNR w KQkq - 1 7', "Vienna Gambit", { from:[7,5], to:[5,4], san:'Be3' }],

  // #7: King's Gambit Accepted: Kieseritzky Gambit
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', "King's Gambit", { from:[6,5], to:[4,5], san:'f4' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq f3 0 2', "King's Gambit Accepted", { from:[4,4], to:[5,5], san:'exf4' }],
  ['rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPP2PP/RNBQKBNR w KQkq - 0 3', "King's Gambit Accepted", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkbnr/pppp1ppp/8/8/4Pp2/5N2/PPPP2PP/RNBQKB1R b KQkq - 1 3', "King's Gambit Accepted", { from:[1,6], to:[2,6], san:'g5' }],
  ['rnbqkbnr/pppp1p1p/8/6p1/4Pp2/5N2/PPPP2PP/RNBQKB1R w KQkq - 0 4', "Kieseritzky Gambit", { from:[6,7], to:[5,7], san:'h4' }],
  ['rnbqkbnr/pppp1p1p/8/6p1/4Pp1P/5N2/PPPP2P1/RNBQKB1R b KQkq - 0 4', "Kieseritzky Gambit", { from:[2,6], to:[3,6], san:'g4' }],
  ['rnbqkbnr/pppp1p1p/8/8/4PppP/5N2/PPPP2P1/RNBQKB1R w KQkq - 0 5', "Kieseritzky Gambit", { from:[3,5], to:[4,4], san:'Ne5' }],
  ['rnbqkbnr/pppp1p1p/8/4N3/4PppP/8/PPPP2P1/RNBQKB1R b KQkq - 1 5', "Kieseritzky Gambit", { from:[0,3], to:[1,3], san:'d6' }],
  ['rnbqkbnr/ppp2p1p/3p4/4N3/4PppP/8/PPPP2P1/RNBQKB1R w KQkq - 0 6', "Kieseritzky Gambit", { from:[4,4], to:[2,2], san:'Nxc6' }],
  ['rnbqkbnr/ppp2p1p/2Np4/8/4PppP/8/PPPP2P1/RNBQKB1R b KQkq - 0 6', "Kieseritzky Gambit", { from:[1,1], to:[2,2], san:'bxc6' }],
  ['rnbqkbnr/p1p2p1p/2pp4/8/4PppP/8/PPPP2P1/RNBQKB1R w KQkq - 0 7', "Kieseritzky Gambit", { from:[6,3], to:[4,3], san:'d4' }],

  // #8: Scotch Game: Mieses Variation
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', "Scotch Game", { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3', "Scotch Game", { from:[4,4], to:[3,3], san:'exd4' }],
  ['r1bqkbnr/pppp1ppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4', "Scotch Game", { from:[5,3], to:[3,3], san:'Nxd4' }],
  ['r1bqkbnr/pppp1ppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4', "Scotch Game", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5', "Scotch Game", { from:[3,3], to:[2,2], san:'Nxc6' }],
  ['r1bqkb1r/pppp1ppp/2N2n2/8/4P3/8/PPP2PPP/RNBQKB1R b KQkq - 0 5', "Scotch Game", { from:[1,1], to:[2,2], san:'bxc6' }],
  ['r1bqkb1r/p1pp1ppp/2p2n2/8/4P3/8/PPP2PPP/RNBQKB1R w KQkq - 0 6', "Scotch Game: Mieses Variation", { from:[4,4], to:[3,4], san:'e5' }],
  ['r1bqkb1r/p1pp1ppp/2p2n2/4P3/8/8/PPP2PPP/RNBQKB1R b KQkq - 0 6', "Scotch Game: Mieses Variation", { from:[7,3], to:[4,4], san:'Qe7' }],
  ['r1b1kb1r/p1ppqppp/2p2n2/4P3/8/8/PPP2PPP/RNBQKB1R w KQkq - 1 7', "Scotch Game: Mieses Variation", { from:[7,3], to:[4,4], san:'Qe2' }],
  ['r1b1kb1r/p1ppqppp/2p2n2/4P3/8/8/PPP1QPPP/RNB1KB1R b KQkq - 2 7', "Scotch Game: Mieses Variation", { from:[2,5], to:[3,3], san:'Nd5' }],
  ['r1b1kb1r/p1ppqppp/2p5/3nP3/8/8/PPP1QPPP/RNB1KB1R w KQkq - 3 8', "Scotch Game: Mieses Variation", { from:[6,2], to:[4,2], san:'c4' }],

  // #9: Petroff Defense: Classical Attack
  ['rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', "Petroff Defense", { from:[5,5], to:[4,4], san:'Nxe5' }],
  ['rnbqkb1r/pppp1ppp/5n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 0 3', "Petroff Defense", { from:[1,3], to:[2,3], san:'d6' }],
  ['rnbqkb1r/ppp2ppp/3p1n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 0 4', "Petroff Defense", { from:[4,4], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/ppp2ppp/3p1n2/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 4', "Petroff Defense", { from:[2,5], to:[4,4], san:'Nxe4' }],
  ['rnbqkb1r/ppp2ppp/3p4/8/4n3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 5', "Petroff Defense: Classical Attack", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkb1r/ppp2ppp/3p4/8/3Pn3/5N2/PP3PPP/RNBQKB1R b KQkq - 0 5', "Petroff Defense: Classical Attack", { from:[1,3], to:[2,3], san:'d5' }],
  ['rnbqkb1r/ppp2ppp/8/3p4/3Pn3/5N2/PP3PPP/RNBQKB1R w KQkq - 0 6', "Petroff Defense: Classical Attack", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['rnbqkb1r/ppp2ppp/8/3p4/3Pn3/3B1N2/PP3PPP/RNBQK2R b KQkq - 1 6', "Petroff Defense: Classical Attack", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnbqk2r/ppp1bppp/8/3p4/3Pn3/3B1N2/PP3PPP/RNBQK2R w KQkq - 2 7', "Petroff Defense: Classical Attack", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbqk2r/ppp1bppp/8/3p4/3Pn3/3B1N2/PP3PPP/RNBQ1RK1 b kq - 3 7', "Petroff Defense: Classical Attack", { from:[0,1], to:[2,2], san:'Nc6' }],

  // #10: Philidor Defense: Hanham Variation
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', "Philidor Defense", { from:[1,3], to:[2,3], san:'d6' }],
  ['rnbqkbnr/ppp2ppp/3p4/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3', "Philidor Defense", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/ppp2ppp/3p4/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3', "Philidor Defense: Hanham Variation", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp2ppp/3p1n2/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 1 4', "Philidor Defense: Hanham Variation", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/ppp2ppp/3p1n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 2 4', "Philidor Defense: Hanham Variation", { from:[0,1], to:[3,3], san:'Nbd7' }],
  ['r1bqkb1r/pppn1ppp/3p1n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 3 5', "Philidor Defense: Hanham Variation", { from:[7,5], to:[4,2], san:'Bc4' }],
  ['r1bqkb1r/pppn1ppp/3p1n2/4p3/2BPP3/2N2N2/PPP2PPP/R1BQK2R b KQkq - 4 5', "Philidor Defense: Hanham Variation", { from:[2,5], to:[4,4], san:'Be7' }],
  ['r1bqk2r/pppn1ppp/3p1n2/4p3/2BPP3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 5 6', "Philidor Defense: Hanham Variation", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bqk2r/pppn1ppp/3p1n2/4p3/2BPP3/2N2N2/PPP2PPP/R1BQ1RK1 b kq - 6 6', "Philidor Defense: Hanham Variation", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bq1rk1/pppn1ppp/3p1n2/4p3/2BPP3/2N2N2/PPP2PPP/R1BQ1RK1 w - - 7 7', "Philidor Defense: Hanham Variation", { from:[6,0], to:[4,0], san:'a4' }],

  // #11: Sicilian Defense: Alapin Variation
  ['rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2', "Sicilian: Alapin Variation", { from:[6,2], to:[4,2], san:'c3' }],
  ['rnbqkbnr/pp1ppppp/8/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 2', "Sicilian: Alapin Variation", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pp1ppppp/5n2/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 3', "Sicilian: Alapin Variation", { from:[4,4], to:[3,4], san:'e5' }],
  ['rnbqkb1r/pp1ppppp/5n2/2p1P3/8/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 3', "Sicilian: Alapin Variation", { from:[2,5], to:[3,3], san:'Nd5' }],
  ['rnbqkb1r/pp1ppppp/8/2p1n3/8/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 4', "Sicilian: Alapin Variation", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkb1r/pp1ppppp/8/2p1n3/3P4/2P5/PP2PPPP/RNBQKBNR b KQkq - 0 4', "Sicilian: Alapin Variation", { from:[2,5], to:[3,3], san:'cxd4' }],
  ['rnbqkb1r/pp1ppppp/8/4n3/3p4/2P5/PP2PPPP/RNBQKBNR w KQkq - 0 5', "Sicilian: Alapin Variation", { from:[2,2], to:[3,3], san:'cxd4' }],
  ['rnbqkb1r/pp1ppppp/8/4n3/3P4/8/PP2PPPP/RNBQKBNR b KQkq - 0 5', "Sicilian: Alapin Variation", { from:[4,4], to:[2,2], san:'Nec6' }],
  ['r1bqkb1r/pp1ppppp/2n5/8/3P4/8/PP2PPPP/RNBQKBNR w KQkq - 1 6', "Sicilian: Alapin Variation", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['r1bqkb1r/pp1ppppp/2n5/8/3P4/5N2/PP2PPPP/R1BQKB1R b KQkq - 2 6', "Sicilian: Alapin Variation", { from:[1,4], to:[2,4], san:'e6' }],

  // #12: Sicilian Defense: Kan Variation
  ['rnbqkb1r/pp1ppppp/5n2/2p1P3/8/5N2/PPPP1PPP/RNBQKB1R b KQkq - 0 3', "Sicilian: Kan Variation", { from:[1,0], to:[3,0], san:'a6' }],
  ['rnbqkb1r/1p1ppppp/5n2/2p1P3/8/5N2/PPPP1PPP/RNBQKB1R w KQkq - 1 4', "Sicilian: Kan Variation", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkb1r/1p1ppppp/5n2/2p1P3/3P4/5N2/P1P2PPP/RNBQKB1R b KQkq - 0 4', "Sicilian: Kan Variation", { from:[2,5], to:[3,3], san:'cxd4' }],
  ['rnbqkb1r/1p1ppppp/5n2/8/3pP3/5N2/P1P2PPP/RNBQKB1R w KQkq - 0 5', "Sicilian: Kan Variation", { from:[5,3], to:[3,3], san:'Nxd4' }],
  ['rnbqkb1r/1p1ppppp/5n2/8/3NP3/8/P1P2PPP/RNBQKB1R b KQkq - 0 5', "Sicilian: Kan Variation", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/1p1ppppp/2n2n2/8/3NP3/8/P1P2PPP/RNBQKB1R w KQkq - 1 6', "Sicilian: Kan Variation", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['r1bqkb1r/1p1ppppp/2n2n2/8/3NP3/2N5/P1P2PPP/R1BQKB1R b KQkq - 2 6', "Sicilian: Kan Variation", { from:[1,3], to:[2,3], san:'d6' }],
  ['r1bqkb1r/1p2pppp/2np1n2/8/3NP3/2N5/P1P2PPP/R1BQKB1R w KQkq - 0 7', "Sicilian: Kan Variation", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['r1bqkb1r/1p2pppp/2np1n2/8/3NP3/2NB4/P1P2PPP/R1BQK2R b KQkq - 1 7', "Sicilian: Kan Variation", { from:[1,6], to:[2,6], san:'g6' }],
  ['r1bqkb1r/1p3p1p/2np1np1/8/3NP3/2NB4/P1P2PPP/R1BQK2R w KQkq - 0 8', "Sicilian: Kan Variation", { from:[3,3], to:[1,1], san:'Nde2' }],

  // #13: French Defense: Tarrasch Variation
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', "French: Tarrasch Variation", { from:[7,1], to:[4,3], san:'Nd2' }],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/3N4/PPP2PPP/RNBQKB1R b KQkq - 1 3', "French: Tarrasch Variation", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/3N4/PPP2PPP/RNBQKB1R w KQkq - 2 4', "French: Tarrasch Variation", { from:[4,4], to:[3,4], san:'e5' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3pP3/8/3N4/PPP2PPP/RNBQKB1R b KQkq - 0 4', "French: Tarrasch Variation", { from:[2,5], to:[3,3], san:'Nfd7' }],
  ['rnbqkb1r/pppn1ppp/4p3/3pP3/8/3N4/PPP2PPP/RNBQKB1R w KQkq - 1 5', "French: Tarrasch Variation", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkb1r/pppn1ppp/4p3/3pP3/3P4/3N4/PPP2PPP/RNBQKB1R b KQkq - 2 5', "French: Tarrasch Variation", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkb1r/pppn1ppp/4p3/2ppP3/3P4/3N4/PPP2PPP/RNBQKB1R w KQkq - 0 6', "French: Tarrasch Variation", { from:[6,2], to:[4,2], san:'c3' }],
  ['rnbqkb1r/pppn1ppp/4p3/2ppP3/3P4/2P1N3/PP3PPP/RNBQKB1R b KQkq - 1 6', "French: Tarrasch Variation", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pppn1ppp/2n1p3/2ppP3/3P4/2P1N3/PP3PPP/R1BQKB1R w KQkq - 2 7', "French: Tarrasch Variation", { from:[7,6], to:[5,5], san:'Nf3' }],

  // #14: Caro-Kann: Panov-Botvinnik Attack
  ['rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', "Caro-Kann: Exchange", { from:[4,4], to:[5,5], san:'exd5' }],
  ['rnbqkbnr/pp2pppp/2p5/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3', "Caro-Kann: Exchange", { from:[2,2], to:[3,3], san:'cxd5' }],
  ['rnbqkbnr/pp2pppp/8/3p4/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4', "Caro-Kann: Panov-Botvinnik", { from:[6,2], to:[4,2], san:'c4' }],
  ['rnbqkbnr/pp2pppp/8/3p4/2PP4/8/PP3PPP/RNBQKBNR b KQkq - 0 4', "Caro-Kann: Panov-Botvinnik", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pp2pppp/5n2/3p4/2PP4/8/PP3PPP/RNBQKBNR w KQkq - 1 5', "Caro-Kann: Panov-Botvinnik", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pp2pppp/5n2/3p4/2PP4/2N5/PP3PPP/R1BQKBNR b KQkq - 2 5', "Caro-Kann: Panov-Botvinnik", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pp2pppp/2n2n2/3p4/2PP4/2N5/PP3PPP/R1BQKBNR w KQkq - 3 6', "Caro-Kann: Panov-Botvinnik", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['r1bqkb1r/pp2pppp/2n2n2/3p2B1/2PP4/2N5/PP3PPP/R2QKBNR b KQkq - 4 6', "Caro-Kann: Panov-Botvinnik", { from:[3,3], to:[4,4], san:'dxc4' }],
  ['r1bqkb1r/pp2pppp/2n2n2/6B1/2pP4/2N5/PP3PPP/R2QKBNR w KQkq - 0 7', "Caro-Kann: Panov-Botvinnik", { from:[6,3], to:[4,3], san:'d5' }],

  // #15: Modern Defense: Standard Line
  ['rnbqkbnr/pppppp1p/6p1/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', "Modern Defense", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pppppp1p/6p1/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2', "Modern Defense", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/pppppp1p/6p1/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 1 3', "Modern Defense", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqk2r/pppppp1p/6p1/8/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 2 3', "Modern Defense", { from:[1,3], to:[2,3], san:'d6' }],
  ['rnbqk2r/ppp1pp1p/3p2p1/8/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4', "Modern Defense", { from:[7,4], to:[5,4], san:'Be3' }],
  ['rnbqk2r/ppp1pp1p/3p2p1/8/3PP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 1 4', "Modern Defense", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbq1k1r/ppp1pp1p/3p1np1/8/3PP3/2N1B3/PPP2PPP/R2QKB1R w KQ - 2 5', "Modern Defense", { from:[7,3], to:[3,3], san:'Qd2' }],
  ['rnbq1k1r/ppp1pp1p/3p1np1/8/3PP3/2N1B3/PPPQ1PPP/R3KB1R b KQ - 3 5', "Modern Defense", { from:[7,4], to:[6,4], san:'Kg7' }],
  ['rnbq1r2/ppp1ppkp/3p1np1/8/3PP3/2N1B3/PPPQ1PPP/R3KB1R w KQ - 4 6', "Modern Defense", { from:[6,5], to:[4,5], san:'f3' }],
  ['rnbq1r2/ppp1ppkp/3p1np1/8/3PP3/2N1BP2/PPPQ2PP/R3KB1R b KQ - 0 6', "Modern Defense", { from:[1,4], to:[2,4], san:'e5' }],

  // --- 1. d4 Openings ---

  // #16: Queen's Gambit Accepted (QGA): Central Variation
  ['rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2', "Queen's Gambit Accepted", { from:[3,3], to:[2,2], san:'dxc4' }],
  ['rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', "Queen's Gambit Accepted", { from:[4,4], to:[5,5], san:'e4' }],
  ['rnbqkbnr/ppp1pppp/8/8/2pPP3/8/PP3PPP/RNBQKBNR b KQkq - 0 3', "Queen's Gambit Accepted", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp1pppp/5n2/8/2pPP3/8/PP3PPP/RNBQKBNR w KQkq - 1 4', "Queen's Gambit Accepted", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/ppp1pppp/5n2/8/2pPP3/2N5/PP3PPP/R1BQKBNR b KQkq - 2 4', "Queen's Gambit Accepted", { from:[1,0], to:[3,0], san:'a6' }],
  ['r2qkb1r/1pp1pppp/p4n2/8/2pPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 5', "Queen's Gambit Accepted", { from:[7,5], to:[3,1], san:'Bxc4' }],
  ['r2qkb1r/1pp1pppp/p4n2/8/2BPP3/2N5/PP3PPP/R1BQK2R b KQkq - 0 5', "Queen's Gambit Accepted", { from:[1,4], to:[3,4], san:'b5' }],
  ['r2qkb1r/1p2pppp/p4n2/1p6/2BPP3/2N5/PP3PPP/R1BQK2R w KQkq - 0 6', "Queen's Gambit Accepted", { from:[3,1], to:[1,1], san:'Bb3' }],
  ['r2qkb1r/1p2pppp/p4n2/1p6/3PP3/1BN5/PP3PPP/R1BQK2R b KQkq - 1 6', "Queen's Gambit Accepted", { from:[1,4], to:[2,4], san:'e6' }],
  ['r2qkb1r/1p3ppp/p3pn2/1p6/3PP3/1BN5/PP3PPP/R1BQK2R w KQkq - 0 7', "Queen's Gambit Accepted", { from:[7,7], to:[7,5], san:'O-O' }],

  // #17: Slav Defense: Main Line
  ['rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', "Slav Defense", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkbnr/pp2pppp/2p5/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 3', "Slav Defense", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4', "Slav Defense", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 3 4', "Slav Defense", { from:[3,3], to:[2,2], san:'dxc4' }],
  ['rnbqkb1r/pp2pppp/2p2n2/8/2pP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5', "Slav Defense: Main Line", { from:[6,0], to:[4,0], san:'a4' }],
  ['rnbqkb1r/pp2pppp/2p2n2/8/P1pP4/2N2N2/1P2PPPP/R1BQKB1R b KQkq - 0 5', "Slav Defense: Main Line", { from:[7,5], to:[3,1], san:'Bf5' }],
  ['rn1qkb1r/pp2pppp/2p2n2/5b2/P1pP4/2N2N2/1P2PPPP/R1BQKB1R w KQkq - 1 6', "Slav Defense: Main Line", { from:[3,5], to:[4,4], san:'Ne5' }],
  ['rn1qkb1r/pp2pppp/2p2n2/4Nb2/P1pP4/2N5/1P2PPPP/R1BQKB1R b KQkq - 2 6', "Slav Defense: Main Line", { from:[0,1], to:[2,2], san:'Nbd7' }],
  ['r2qkb1r/pp1npppp/2p2n2/4Nb2/P1pP4/2N5/1P2PPPP/R1BQKB1R w KQkq - 3 7', "Slav Defense: Main Line", { from:[4,4], to:[2,2], san:'Nxc4' }],
  ['r2qkb1r/pp1npppp/2p2n2/5b2/P1NP4/2N5/1P2PPPP/R1BQKB1R b KQkq - 4 7', "Slav Defense: Main Line", { from:[7,3], to:[4,2], san:'Qc7' }],

  // #18: Grünfeld Defense: Exchange Variation
  ['rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', "Grünfeld Defense", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4', "Grünfeld Defense: Exchange", { from:[2,3], to:[3,3], san:'cxd5' }],
  ['rnbqkb1r/ppp1pp1p/5np1/3P4/8/2N5/PP1PPPPP/R1BQKBNR b KQkq - 0 4', "Grünfeld Defense: Exchange", { from:[2,5], to:[3,3], san:'Nxd5' }],
  ['rnbqkb1r/ppp1pp1p/8/3n4/8/2N5/PP1PPPPP/R1BQKBNR w KQkq - 0 5', "Grünfeld Defense: Exchange", { from:[4,4], to:[5,5], san:'e4' }],
  ['rnbqkb1r/ppp1pp1p/8/3n4/4P3/2N5/PP1P1PPP/R1BQKBNR b KQkq - 0 5', "Grünfeld Defense: Exchange", { from:[3,3], to:[2,2], san:'Nxc3' }],
  ['rnbqkb1r/ppp1pp1p/8/8/4P3/2n5/PP1P1PPP/R1BQKBNR w KQkq - 0 6', "Grünfeld Defense: Exchange", { from:[1,1], to:[2,2], san:'bxc3' }],
  ['rnbqkb1r/ppp1pp1p/8/8/4P3/2P5/P2P1PPP/R1BQKBNR b KQkq - 0 6', "Grünfeld Defense: Exchange", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/ppp1pp1p/8/8/4P3/2P5/P2P1PPP/R1BQKBNR w KQkq - 1 7', "Grünfeld Defense: Exchange", { from:[7,5], to:[4,2], san:'Bc4' }],
  ['rnbqk2r/ppp1pp1p/8/8/2BPP3/2P5/P4PPP/R1BQK1NR b KQkq - 2 7', "Grünfeld Defense: Exchange", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqk2r/ppp1pp1p/2n5/8/2BPP3/2P5/P4PPP/R1BQK1NR w KQkq - 3 8', "Grünfeld Defense: Exchange", { from:[7,6], to:[5,5], san:'Nf3' }],

  // #19: Queen's Indian Defense (QID): Classical Variation
  ['rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', "Queen's Indian Defense", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/pppp1ppp/4pn2/8/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 3', "Queen's Indian Defense", { from:[1,4], to:[3,4], san:'b6' }],
  ['rnbqkb1r/p1pp1ppp/4pn2/8/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4', "Queen's Indian Defense", { from:[1,6], to:[3,5], san:'g3' }],
  ['rnbqkb1r/p1pp1ppp/4pn2/8/2PP4/5NP1/P3PP1P/RNBQKB1R b KQkq - 0 4', "Queen's Indian Defense", { from:[7,5], to:[2,0], san:'Ba6' }],
  ['rnbqkb1r/2pp1ppp/p3pn2/8/2PP4/5NP1/P3PP1P/RNBQKB1R w KQkq - 1 5', "Queen's Indian Defense", { from:[7,3], to:[4,2], san:'Qc2' }],
  ['rnbqkb1r/2pp1ppp/p3pn2/8/2PP4/5NP1/P1Q1PP1P/RNB1KB1R b KQkq - 2 5', "Queen's Indian Defense", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkb1r/2p2ppp/p3pn2/1p6/2PP4/5NP1/P1Q1PP1P/RNB1KB1R w KQkq - 0 6', "Queen's Indian Defense", { from:[7,5], to:[6,5], san:'Bg2' }],
  ['rnbqkb1r/2p2ppp/p3pn2/1p6/2PP4/5NP1/P1Q1PPBP/RNB1K2R b KQkq - 1 6', "Queen's Indian Defense", { from:[2,0], to:[1,1], san:'Bb7' }],
  ['rnbqk2r/1bp2ppp/p3pn2/1p6/2PP4/5NP1/P1Q1PPBP/RNB1K2R w KQkq - 2 7', "Queen's Indian Defense", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbqk2r/1bp2ppp/p3pn2/1p6/2PP4/5NP1/P1Q1PPBP/RNBR2K1 b kq - 3 7', "Queen's Indian Defense", { from:[0,1], to:[2,2], san:'Nbd7' }],

  // #20: Modern Benoni: Main Line
  // #20: Modern Benoni: Main Line
['rnbqkb1r/pppp1ppp/5n2/4p3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', "Modern Benoni", { from:[4,3], to:[3,2], san:'dxc5' }], // Corrected!
  
  ['rnbqkb1r/pppp1ppp/5n2/4p3/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 3', "Modern Benoni", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 0 4', "Modern Benoni", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/2P5/2N5/PP1PPPPP/R1BQKBNR b KQkq - 1 4', "Modern Benoni", { from:[2,5], to:[3,3], san:'cxd4' }],
  ['rnbqkb1r/ppp2ppp/4pn2/8/2pP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 5', "Modern Benoni", { from:[3,3], to:[4,4], san:'Qxd4' }],
  ['rnbqkb1r/ppp2ppp/4pn2/8/3Q4/2N5/PP2PPPP/R1B1KBNR b KQkq - 0 5', "Modern Benoni", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnbqk2r/ppp2ppp/4pn2/8/3Q4/2N5/PP2PPPP/R1B1KBNR w KQkq - 1 6', "Modern Benoni", { from:[4,4], to:[3,3], san:'Qxd8+' }],
  ['rnb1k2r/ppp2ppp/4pn2/8/8/2N5/PP2PPPP/R1B1KBNR b KQkq - 0 6', "Modern Benoni", { from:[7,4], to:[3,3], san:'Kxd8' }],
  ['rnb2r2/ppp2ppp/4pn2/8/8/2N5/PP2PPPP/R1B1KBNR w KQ - 1 7', "Modern Benoni", { from:[7,5], to:[6,6], san:'Bg5' }],

  // #21: Catalan Opening: Open Variation
  ['rnbqkb1r/p1pp1ppp/4pn2/8/1pPP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4', "Catalan Opening", { from:[1,6], to:[3,5], san:'g3' }],
  ['rnbqkb1r/p1pp1ppp/4pn2/8/1pPP4/5NP1/PP2PP1P/RNBQKB1R b KQkq - 1 4', "Catalan Opening", { from:[7,5], to:[6,5], san:'Bg2' }],
  ['rnbqk2r/p1pp1ppp/4pn2/8/1pPP4/5NP1/PP2PPBP/RNBQK2R b KQkq - 2 5', "Catalan Opening", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqk2r/p1p2ppp/4pn2/1p6/1pPP4/5NP1/PP2PPBP/RNBQK2R w KQkq - 0 6', "Catalan Opening: Open", { from:[3,3], to:[2,2], san:'dxc4' }],
  ['rnbqk2r/p1p2ppp/4pn2/1p6/2pP4/5NP1/PP2PPBP/RNBQK2R w KQkq - 0 7', "Catalan Opening: Open", { from:[3,5], to:[4,4], san:'Ne5' }],
  ['rnbqk2r/p1p2ppp/4pn2/1p2N3/2pP4/6P1/PP2PPBP/RNBQK2R b KQkq - 1 7', "Catalan Opening: Open", { from:[1,2], to:[3,2], san:'c6' }],
  ['rnbqk2r/p3bppp/2p1pn2/1p2N3/2pP4/6P1/PP2PPBP/RNBQK2R w KQkq - 3 8', "Catalan Opening: Open", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbqk2r/p3bppp/2p1pn2/1p2N3/2pP4/6P1/PP2PPBP/RNBQ1RK1 b kq - 5 8', "Catalan Opening: Open", { from:[7,7], to:[7,5], san:'O-O' }],

  // #22: Dutch Defense: Leningrad Variation
  ['rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2', "Dutch Defense", { from:[1,5], to:[3,5], san:'f5' }],
  ['rnbqkb1r/ppppp1pp/5n2/5p2/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 1 3', "Dutch Defense", { from:[1,6], to:[3,5], san:'g3' }],
  ['rnbqkb1r/ppppp1pp/5n2/5p2/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq - 0 3', "Dutch Defense: Leningrad", { from:[1,6], to:[2,6], san:'g6' }],
  ['rnbqkb1r/ppp1p1pp/3p1n2/5p2/2PP4/6P1/PP2PP1P/RNBQKBNR w KQkq - 1 4', "Dutch Defense: Leningrad", { from:[7,5], to:[6,5], san:'Bg2' }],
  ['rnbqkb1r/ppp1p1pp/3p1n2/5p2/2PP4/6P1/PP2PPBP/RNBQK1NR b KQkq - 2 4', "Dutch Defense: Leningrad", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/ppp1p1bp/3p1n2/5p2/2PP4/6P1/PP2PPBP/RNBQK1NR w KQkq - 0 5', "Dutch Defense: Leningrad", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqk2r/ppp1p1bp/3p1n2/5p2/2PP4/2N3P1/PP2PPBP/R1BQK1NR b KQkq - 1 5', "Dutch Defense: Leningrad", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/ppp1p1bp/3p1n2/5p2/2PP4/2N3P1/PP2PPBP/R1BQK1NR w KQ - 2 6', "Dutch Defense: Leningrad", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbq1rk1/ppp1p1bp/3p1n2/5p2/2PP4/2N2NP1/PP2PPBP/R1BQK2R b KQ - 3 6', "Dutch Defense: Leningrad", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r2q1rk1/ppp1p1bp/2np1n2/5p2/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 4 7', "Dutch Defense: Leningrad", { from:[6,3], to:[4,3], san:'d5' }],

  // #23: Bogo-Indian Defense
  ['rnbqkb1r/pppp1ppp/4pn2/8/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 3', "Bogo-Indian Defense", { from:[7,5], to:[3,1], san:'Bb4+' }],
  ['rnbqk2r/pppp1ppp/4pn2/8/1b1P4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4', "Bogo-Indian Defense", { from:[7,5], to:[4,3], san:'Bd2' }],
  ['rnbqk2r/pppp1ppp/4pn2/8/1b1P4/3B1N2/PP2PPPP/RNBQKB1R b KQkq - 3 4', "Bogo-Indian Defense", { from:[3,3], to:[4,4], san:'Qe7' }],
  ['rnbqk2r/ppppbppp/4pn2/8/2PP4/3B1N2/PP3PPP/RNBQK2R w KQkq - 4 5', "Bogo-Indian Defense", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqk2r/ppppbppp/4pn2/8/2PP4/2N2N2/PP3PPP/R1BQKB1R b KQkq - 5 5', "Bogo-Indian Defense", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqk2r/pp2bppp/3ppn2/8/2PP4/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 6', "Bogo-Indian Defense", { from:[6,2], to:[4,2], san:'cxd5' }],
  ['rnbqk2r/pp2bppp/3ppn2/2P5/8/2N2N2/PP3PPP/R1BQKB1R b KQkq - 0 6', "Bogo-Indian Defense", { from:[2,5], to:[3,3], san:'Nxd5' }],
  ['rnbqk2r/pp2bppp/3p1n2/4p3/8/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 7', "Bogo-Indian Defense", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbqk2r/pp2bppp/3p1n2/4p3/8/2N2N2/PP3PPP/R1BQ1RK1 b kq - 1 7', "Bogo-Indian Defense", { from:[7,7], to:[7,5], san:'O-O' }],

  // #24: Trompowsky Attack
  ['rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2', "Trompowsky Attack", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['rnbqkb1r/pppppppp/5n2/6B1/3P4/8/PPP1PPPP/RN1QKBNR b KQkq - 2 2', "Trompowsky Attack", { from:[2,5], to:[4,4], san:'Ne4' }],
  ['rnbqkb1r/pppppppp/8/6B1/3Pn3/8/PPP1PPPP/RN1QKBNR w KQkq - 3 3', "Trompowsky Attack", { from:[6,6], to:[5,7], san:'Bh4' }],
  ['rnbqkb1r/pppppppp/8/8/3Pn2B/8/PPP1PPPP/RN1QKBNR b KQkq - 4 3', "Trompowsky Attack", { from:[1,6], to:[2,6], san:'g5' }],
  ['rnbqkb1r/ppp1pppp/8/6p1/3Pn2B/8/PPP1PPPP/RN1QKBNR w KQkq - 0 4', "Trompowsky Attack", { from:[6,5], to:[4,5], san:'f3' }],
  ['rnbqkb1r/ppp1pppp/8/6p1/3Pn2B/5P2/PPP1P1PP/RN1QKBNR b KQkq - 0 4', "Trompowsky Attack", { from:[2,6], to:[3,6], san:'gxh4' }],
  ['rnbqkb1r/ppp1pppp/8/8/3Pn2p/5P2/PPP1P1PP/RN1QKBNR w KQkq - 0 5', "Trompowsky Attack", { from:[4,5], to:[5,5], san:'fxe4' }],
  ['rnbqkb1r/ppp1pppp/8/8/4P2p/8/PPPP1PPP/RN1QKBNR b KQkq - 0 5', "Trompowsky Attack", { from:[1,4], to:[2,4], san:'e5' }],
  ['rnbqkb1r/ppp2ppp/8/3pp3/4P2p/8/PPPP1PPP/RN1QKBNR w KQkq - 0 6', "Trompowsky Attack", { from:[7,6], to:[5,5], san:'Nf3' }],

  // #25: Colle System (Zukertort Variation)
  ['rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2', "Colle System", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/pppppppp/5n2/8/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq - 2 2', "Colle System", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 3', "Colle System", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R b KQkq - 0 3', "Colle System", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R w KQkq - 0 4', "Colle-Zukertort", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/3BPN2/PPP2PPP/RNBQK2R b KQkq - 1 4', "Colle-Zukertort", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkb1r/pp3ppp/4pn2/2pp4/3P4/3BPN2/PPP2PPP/RNBQK2R w KQkq - 2 5', "Colle-Zukertort", { from:[6,1], to:[4,1], san:'b3' }],
  ['rnbqkb1r/pp3ppp/4pn2/2pp4/3P4/1P1BPN2/P1P2PPP/RNBQK2R b KQkq - 0 5', "Colle-Zukertort", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P4/1P1BPN2/P1P2PPP/RNBQK2R w KQkq - 1 6', "Colle-Zukertort", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P4/1P1BPN2/P1P2PPP/RNBQ1RK1 b kq - 2 6', "Colle-Zukertort", { from:[2,5], to:[4,4], san:'Be7' }],

  // --- Flank and Other Openings ---

  // #26: English Opening: Symmetrical Variation
  ['rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1', "English: Symmetrical", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkbnr/pp1ppppp/8/2p5/2P5/8/PP1PPPPP/RNBQKBNR w KQkq c6 0 2', "English: Symmetrical", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkbnr/pp1ppppp/8/2p5/2P5/2N5/PP1PPPPP/R1BQKBNR b KQkq - 1 2', "English: Symmetrical", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pp1ppppp/5n2/2p5/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq - 2 3', "English: Symmetrical", { from:[1,6], to:[3,5], san:'g3' }],
  ['rnbqkb1r/pp1ppppp/5n2/2p5/2P5/2N3P1/PP1PPP1P/R1BQKBNR b KQkq - 0 3', "English: Symmetrical", { from:[1,6], to:[2,6], san:'g6' }],
  ['rnbqkb1r/pp2pppp/5np1/2p5/2P5/2N3P1/PP1PPP1P/R1BQKBNR w KQkq - 1 4', "English: Symmetrical", { from:[7,5], to:[6,5], san:'Bg2' }],
  ['rnbqkb1r/pp2pppp/5np1/2p5/2P5/2N3P1/PP1PPPBP/R1BQK1NR b KQkq - 3 4', "English: Symmetrical", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/pp2ppbp/5np1/2p5/2P5/2N3P1/PP1PPPBP/R1BQK1NR w KQkq - 4 5', "English: Symmetrical", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqk2r/pp2ppbp/5np1/2p5/2P5/2N2NP1/PP1PPPBP/R1BQK2R b KQkq - 5 5', "English: Symmetrical", { from:[7,7], to:[7,5], san:'O-O' }],

  // #27: King's Indian Attack (KIA) vs. French Setup
  ['rnbqkb1r/pppppppp/5n2/8/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 2 2', "KIA", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqkb1r/pp1p1ppp/4pn2/8/8/5NP1/PPPPPP1P/RNBQKB1R w KQkq - 0 3', "KIA", { from:[7,5], to:[6,5], san:'Bg2' }],
  ['rnbqkb1r/pp1p1ppp/4pn2/8/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3', "KIA", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkb1r/pp3ppp/4pn2/3p4/8/5NP1/PPPPPPBP/RNBQK2R w KQkq - 2 4', "KIA", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbqkb1r/pp3ppp/4pn2/3p4/8/5NP1/PPPPPPBP/RNBQ1RK1 b kq - 3 4', "KIA", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnbqk2r/pp3ppp/4pn2/3p4/8/5NP1/PPPPPPBP/RNBQ1RK1 w kq - 4 5', "KIA", { from:[6,3], to:[4,3], san:'d3' }],
  ['rnbqk2r/pp3ppp/4pn2/3p4/8/3P1NP1/PP2PPBP/RNBQ1RK1 b kq - 0 5', "KIA", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqk2r/pp3ppp/2n1pn2/3p4/8/3P1NP1/PP2PPBP/RNBQ1RK1 w kq - 1 6', "KIA", { from:[7,1], to:[4,3], san:'Nbd2' }],
  ['r1bqk2r/pp3ppp/2n1pn2/3p4/8/3P1NP1/PP1NPPBP/R2Q1RK1 b kq - 2 6', "KIA", { from:[7,7], to:[7,5], san:'O-O' }],

  // #28: Bird's Opening: From's Gambit
  ['rnbqkbnr/pppppppp/8/8/5P2/8/PPPPPP1P/RNBQKBNR b KQkq f3 0 1', "Bird's Opening", { from:[1,4], to:[3,4], san:'e5' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/5P2/8/PPPPPP1P/RNBQKBNR w KQkq - 0 2', "From's Gambit", { from:[4,5], to:[3,4], san:'fxe5' }],
  ['rnbqkbnr/pppp1ppp/8/8/4p3/8/PPPPPP1P/RNBQKBNR b KQkq - 0 2', "From's Gambit", { from:[1,3], to:[3,3], san:'d6' }],
  ['rnbqkbnr/ppp2ppp/3p4/8/4p3/8/PPPPPP1P/RNBQKBNR w KQkq - 0 3', "From's Gambit", { from:[4,4], to:[3,3], san:'exd6' }],
  ['rnbqkbnr/ppp2ppp/3P4/8/8/8/PPPPPP1P/RNBQKBNR b KQkq - 0 3', "From's Gambit", { from:[7,5], to:[3,3], san:'Bxd6' }],
  ['rnbqk1nr/ppp2ppp/3b4/8/8/8/PPPPPP1P/RNBQKBNR w KQkq - 0 4', "From's Gambit", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqk1nr/ppp2ppp/3b4/8/8/5N2/PPPPPP1P/RNBQKB1R b KQkq - 1 4', "From's Gambit", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp2ppp/3b1n2/8/8/5N2/PPPPPP1P/RNBQKB1R w KQkq - 2 5', "From's Gambit", { from:[6,3], to:[4,3], san:'d4' }],

  // #29: Larsen's Opening (1. b3)
  ['rnbqkbnr/pppppppp/8/8/8/1P6/P1PPPPPP/RNBQKBNR b KQkq - 0 1', "Larsen's Opening", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/8/1P6/P1PPPPPP/RNBQKBNR w KQkq - 0 2', "Larsen's Opening", { from:[7,5], to:[6,1], san:'Bb2' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/8/1P6/PBPPPPPP/RN1QKBNR b KQkq - 1 2', "Larsen's Opening", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/8/1P6/PBPPPPPP/RN1QKBNR w KQkq - 2 3', "Larsen's Opening", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/8/1P2P3/PBPP1PPP/RN1QKBNR b KQkq - 0 3', "Larsen's Opening", { from:[7,5], to:[4,4], san:'Bf5' }],
  ['rn1qkb1r/ppp1pppp/5n2/3p1b2/8/1P2P3/PBPP1PPP/RN1QKBNR w KQkq - 1 4', "Larsen's Opening", { from:[6,5], to:[4,5], san:'f4' }],
  ['rn1qkb1r/ppp1pppp/5n2/3p1b2/5P2/1P2P3/PBPP2PP/RN1QKBNR b KQkq - 0 4', "Larsen's Opening", { from:[1,4], to:[2,4], san:'e6' }],
  ['rn1qkb1r/pp3ppp/4pn2/3p1b2/5P2/1P2P3/PBPP2PP/RN1QKBNR w KQkq - 1 5', "Larsen's Opening", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rn1qkb1r/pp3ppp/4pn2/3p1b2/5P2/1P2PN2/PBPP2PP/RN1QKB1R b KQkq - 2 5', "Larsen's Opening", { from:[0,1], to:[2,2], san:'Nc6' }],

  // #30: Ruy Lopez: Exchange Variation
  ['r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4', "Ruy Lopez: Exchange", { from:[3,1], to:[2,2], san:'Bxc6' }],
  ['r1bqkbnr/1ppp1ppp/2B5/p3p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4', "Ruy Lopez: Exchange", { from:[3,3], to:[2,2], san:'dxc6' }],
  ['r1bqkbnr/1ppp1ppp/2p5/p3p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5', "Ruy Lopez: Exchange", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bqkbnr/1ppp1ppp/2p5/p3p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 1 5', "Ruy Lopez: Exchange", { from:[1,5], to:[3,5], san:'f6' }],
  ['r1bqkbnr/1ppp2pp/2p2p2/p3p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 6', "Ruy Lopez: Exchange", { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqkbnr/1ppp2pp/2p2p2/p3p3/3PP3/5N2/PPP2PPP/RNBQ1RK1 b kq - 0 6', "Ruy Lopez: Exchange", { from:[4,4], to:[3,3], san:'exd4' }],
  ['r1bqkbnr/1ppp2pp/2p2p2/p7/3pP3/5N2/PPP2PPP/RNBQ1RK1 w kq - 0 7', "Ruy Lopez: Exchange", { from:[5,3], to:[3,3], san:'Nxd4' }],
  ['r1bqkbnr/1ppp2pp/2p2p2/p7/3NP3/8/PPP2PPP/RNBQ1RK1 b kq - 0 7', "Ruy Lopez: Exchange", { from:[2,5], to:[4,4], san:'Ne7' }],
  ['r1bqk2r/1ppp2pp/2p2p2/p7/3NP3/8/PPP2PPP/RNBQ1RK1 w kq - 1 8', "Ruy Lopez: Exchange", { from:[7,1], to:[5,2], san:'Nc3' }],

  // #31: Evans Gambit Accepted
  ['r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', "Evans Gambit", { from:[6,1], to:[4,1], san:'b4' }],
  ['r1bqk1nr/pppp1ppp/2n5/2b1p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R b KQkq - 0 4', "Evans Gambit Accepted", { from:[2,1], to:[1,1], san:'Bxb4' }],
  ['r1bqk1nr/pppp1ppp/2n5/4p3/1bB1P3/5N2/P1PP1PPP/RNBQK2R w KQkq - 0 5', "Evans Gambit Accepted", { from:[6,2], to:[4,2], san:'c3' }],
  ['r1bqk1nr/pppp1ppp/2n5/4p3/1bB1P3/2P2N2/P2P1PPP/RNBQK2R b KQkq - 0 5', "Evans Gambit Accepted", { from:[1,1], to:[4,0], san:'Ba5' }],
  ['r1bqk1nr/pppp1ppp/2n5/b3p3/2B1P3/2P2N2/P2P1PPP/RNBQK2R w KQkq - 1 6', "Evans Gambit Accepted", { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqk1nr/pppp1ppp/2n5/b3p3/2BPP3/2P2N2/P4PPP/RNBQK2R b KQkq - 0 6', "Evans Gambit Accepted", { from:[3,3], to:[4,4], san:'d6' }],
  ['r1bqk1nr/ppp2ppp/2np4/b3p3/2BPP3/2P2N2/P4PPP/RNBQK2R w KQkq - 0 7', "Evans Gambit Accepted", { from:[7,3], to:[1,1], san:'Qb3' }],
  ['r2qk1nr/ppp2ppp/2np4/b3p3/2BPP3/1QP2N2/P4PPP/R1B1K2R b KQkq - 1 7', "Evans Gambit Accepted", { from:[7,3], to:[4,4], san:'Qe7' }],

  // #32: Tarrasch Defense (QGD)
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', "Tarrasch Defense", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4', "Tarrasch Defense", { from:[2,3], to:[3,3], san:'cxd5' }],
  ['rnbqkb1r/pp3ppp/4pn2/3p4/2PP4/2N5/PP3PPP/R1BQKBNR b KQkq - 0 4', "Tarrasch Defense", { from:[4,4], to:[3,3], san:'exd5' }],
  ['rnbqkb1r/pp3ppp/4pn2/3p4/2PP4/2N5/PP3PPP/R1BQKBNR w KQkq - 0 5', "Tarrasch Defense", { from:[3,3], to:[2,2], san:'cxd5' }],
  ['rnbqkb1r/pp3ppp/4pn2/3p4/2P5/2N5/PP3PPP/R1BQKBNR b KQkq - 0 5', "Tarrasch Defense", { from:[2,5], to:[3,3], san:'Nxd5' }],
  ['rnbqkb1r/pp3ppp/4p3/3n4/8/2N5/PP3PPP/R1BQKBNR w KQkq - 0 6', "Tarrasch Defense", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/pp3ppp/4p3/3n4/8/2N2N2/PP3PPP/R1BQKB1R b KQkq - 1 6', "Tarrasch Defense", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r2qkb1r/pp3ppp/2n1p3/3n4/8/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 7', "Tarrasch Defense", { from:[5,3], to:[3,3], san:'Nxd5' }],
  ['r2qkb1r/pp3ppp/2n1p3/3N4/8/5N2/PP3PPP/R1BQKB1R b KQkq - 0 7', "Tarrasch Defense", { from:[7,3], to:[3,3], san:'Qxd5' }],

  // #33: Budapest Gambit
  ['rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2', "Budapest Gambit", { from:[1,4], to:[3,4], san:'e5' }],
  ['rnbqkb1r/pppp1ppp/5n2/4p3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', "Budapest Gambit", { from:[3,3], to:[4,4], san:'dxe5' }],
  ['rnbqkb1r/pppp1ppp/5n2/4P3/2P5/8/PP2PPPP/RNBQKBNR b KQkq - 0 3', "Budapest Gambit", { from:[2,5], to:[6,6], san:'Ng4' }],
  ['rnbqkb1r/pppp1ppp/8/4P3/2P3n1/8/PP2PPPP/RNBQKBNR w KQkq - 1 4', "Budapest Gambit", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/pppp1ppp/8/4P3/2P3n1/5N2/PP2PPPP/RNBQKB1R b KQkq - 2 4', "Budapest Gambit", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pppp1ppp/2n5/4P3/2P3n1/5N2/PP2PPPP/RNBQKB1R w KQkq - 3 5', "Budapest Gambit", { from:[7,5], to:[3,1], san:'Bf4' }],
  ['r1bqkb1r/pppp1ppp/2n5/4P3/2P2Bn1/5N2/PP2PPPP/RN1QKB1R b KQkq - 4 5', "Budapest Gambit", { from:[7,5], to:[3,1], san:'Bb4+' }],
  ['r1bqk2r/pppp1ppp/2n5/4P3/1bP2Bn1/5N2/PP2PPPP/RN1QKB1R w KQkq - 5 6', "Budapest Gambit", { from:[7,1], to:[4,3], san:'Nd2' }],
  ['r1bqk2r/pppp1ppp/2n5/4P3/1bP2Bn1/5N2/PP1NPPPP/R2QKB1R b KQkq - 6 6', "Budapest Gambit", { from:[7,3], to:[4,4], san:'Qe7' }],
  ['r1b1k2r/ppppqppp/2n5/4P3/1bP2Bn1/5N2/PP1NPPPP/R2QKB1R w KQkq - 7 7', "Budapest Gambit", { from:[6,0], to:[4,0], san:'a3' }],

  // #34: Sicilian Najdorf: English Attack
  ['rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6', "Sicilian: English Attack", { from:[7,4], to:[5,4], san:'Be3' }],
  ['rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 1 6', "Sicilian: English Attack", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqk2r/1p2bppp/p2p1n2/4p3/3NP3/2N1B3/PPP2PPP/R2QKB1R w KQkq - 3 7', "Sicilian: English Attack", { from:[6,5], to:[4,5], san:'f3' }],
  ['rnbqk2r/1p2bppp/p2p1n2/4p3/3NP3/2N1BP2/PPP3PP/R2QKB1R b KQkq - 0 7', "Sicilian: English Attack", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/1p2bppp/p2p1n2/4p3/3NP3/2N1BP2/PPP3PP/R2QKB1R w KQ - 1 8', "Sicilian: English Attack", { from:[7,3], to:[3,3], san:'Qd2' }],
  ['rnbq1rk1/1p2bppp/p2p1n2/4p3/3NP3/2N1BP2/PPPQ2PP/R3KB1R b KQ - 2 8', "Sicilian: English Attack", { from:[2,5], to:[4,4], san:'Be6' }],
  ['rnb2rk1/1p2bppp/p2ppn2/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 3 9', "Sicilian: English Attack", { from:[7,7], to:[7,5], san:'O-O-O' }],
  ['rnb2rk1/1p2bppp/p2ppn2/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R b - - 4 9', "Sicilian: English Attack", { from:[0,1], to:[2,2], san:'Nbd7' }],
  ['r1b2rk1/1p1nbppp/p2ppn2/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 5 10', "Sicilian: English Attack", { from:[1,6], to:[3,5], san:'g4' }],

  // #35: Ruy Lopez: Open Variation
  ['r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4', "Ruy Lopez: Open Variation", { from:[2,4], to:[4,4], san:'Nxe4' }],
  ['r1bqkb1r/pppp1ppp/2n5/1B2p3/4n3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 5', "Ruy Lopez: Open Variation", { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqkb1r/pppp1ppp/2n5/1B2p3/3Pn3/5N2/PPP2PPP/RNBQ1RK1 b kq - 0 5', "Ruy Lopez: Open Variation", { from:[1,4], to:[3,4], san:'b5' }],
  ['r1bqkb1r/2pp1ppp/2n5/pB2p3/3Pn3/5N2/PP3PPP/RNBQ1RK1 w kq - 0 6', "Ruy Lopez: Open Variation", { from:[3,1], to:[1,1], san:'Bb3' }],
  ['r1bqkb1r/2pp1ppp/2n5/1p2p3/3Pn3/1B3N2/PP3PPP/RNBQ1RK1 b kq - 1 6', "Ruy Lopez: Open Variation", { from:[1,3], to:[2,3], san:'d5' }],
  ['r1bqkb1r/2p2ppp/2n5/1p1pp3/3Pn3/1B3N2/PP3PPP/RNBQ1RK1 w kq - 0 7', "Ruy Lopez: Open Variation", { from:[3,3], to:[4,4], san:'dxe5' }],
  ['r1bqkb1r/2p2ppp/2n5/1p1pP3/3Pn3/1B3N2/PP3PPP/RNBQ1RK1 b kq - 0 7', "Ruy Lopez: Open Variation", { from:[2,5], to:[4,4], san:'Be6' }],
  ['r2qkb1r/2p2ppp/2n1b3/1p1pP3/3Pn3/1B3N2/PP3PPP/RNBQ1RK1 w kq - 1 8', "Ruy Lopez: Open Variation", { from:[7,1], to:[4,3], san:'Nbd2' }],

  // #36: Four Knights Game: Scotch Variation
  ['r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq - 3 3', "Four Knights Game", { from:[7,5], to:[3,1], san:'Bb4' }],
  ['r1bqk2r/pppp1ppp/2n2n2/4p3/1b2P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4', "Four Knights Game: Spanish", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['r1bqk2r/pppp1ppp/2n2n2/4p3/1b2P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 5 4', "Four Knights Game: Spanish", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bq1rk1/pppp1ppp/2n2n2/4p3/1b2P3/2N2N2/PPPP1PPP/R1BQK2R w KQ - 6 5', "Four Knights: Scotch Variation", { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bq1rk1/pppp1ppp/2n2n2/4p3/1b1PP3/2N2N2/PPP2PPP/R1BQK2R b KQ - 0 5', "Four Knights: Scotch Variation", { from:[3,3], to:[4,4], san:'d6' }],
  ['r1bq1rk1/ppp2ppp/2np1n2/4p3/1b1PP3/2N2N2/PPP2PPP/R1BQK2R w KQ - 0 6', "Four Knights: Scotch Variation", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['r1bq1rk1/ppp2ppp/2np1n2/4p1B1/1b1PP3/2N2N2/PPP2PPP/R2QKB1R b KQ - 1 6', "Four Knights: Scotch Variation", { from:[1,1], to:[2,2], san:'Bxc3+' }],
  ['r1bq1rk1/ppp2ppp/2np1n2/4p1B1/3PP3/2b2N2/PPP2PPP/R2QKB1R w KQ - 0 7', "Four Knights: Scotch Variation", { from:[1,1], to:[2,2], san:'bxc3' }],
  ['r1bq1rk1/ppp2ppp/2np1n2/4p1B1/3PP3/2P2N2/P1P2PPP/R2QKB1R b KQ - 0 7', "Four Knights: Scotch Variation", { from:[7,3], to:[4,4], san:'Qe7' }],

  // #37: King's Indian Defense: Sämisch Variation
  ['rnbq1rk1/ppp1pp1p/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 2 6', "KID: Sämisch Variation", { from:[6,5], to:[4,5], san:'f3' }],
  ['rnbq1rk1/ppp1pp1p/3p1np1/8/2PPP3/2N1BP2/PP4PP/R2QKB1R b KQ - 0 6', "KID: Sämisch Variation", { from:[1,4], to:[2,4], san:'e5' }],
  ['rnbq1rk1/ppp2p1p/3p1np1/4p3/2PPP3/2N1BP2/PP4PP/R2QKB1R w KQ - 0 7', "KID: Sämisch Variation", { from:[6,3], to:[4,3], san:'d5' }],
  ['rnbq1rk1/ppp2p1p/3p1np1/3Pp3/2P1P3/2N1BP2/PP4PP/R2QKB1R b KQ - 0 7', "KID: Sämisch Variation", { from:[0,1], to:[2,2], san:'Nbd7' }],
  ['r1bq1rk1/pppn1p1p/3p1np1/3Pp3/2P1P3/2N1BP2/PP4PP/R2QKB1R w KQ - 1 8', "KID: Sämisch Variation", { from:[7,3], to:[3,3], san:'Qd2' }],
  ['r1bq1rk1/pppn1p1p/3p1np1/3Pp3/2P1P3/2N1BP2/PP1Q2PP/R3KB1R b KQ - 2 8', "KID: Sämisch Variation", { from:[2,5], to:[4,4], san:'Ne8' }],
  ['r1bq1rk1/pppn1p1p/3p2p1/3Pp3/2P1P3/2N1BP2/PP1Q2PP/R3KB1R w - - 3 9', "KID: Sämisch Variation", { from:[1,6], to:[3,5], san:'g4' }],
  ['r1bq1rk1/pppn1p1p/3p2p1/3Pp3/2P1P1P1/2N1BP2/PP1Q3P/R3KB1R b KQ - 0 9', "KID: Sämisch Variation", { from:[1,5], to:[3,5], san:'f5' }],
  ['r1bq1rk1/pppn1p1p/3p2p1/3Ppp2/2P1P1P1/2N1BP2/PP1Q3P/R3KB1R w KQ - 0 10', "KID: Sämisch Variation", { from:[3,5], to:[4,5], san:'gxf5' }],

  // #38: Sicilian Scheveningen: Keres Attack
  ['rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5', "Sicilian: Scheveningen", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqk2r/pp2bppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 1 6', "Sicilian: Keres Attack", { from:[1,6], to:[3,5], san:'g4' }],
  ['rnbqk2r/pp2bppp/3p1n2/8/3N2P1/2N5/PPP2P1P/R1BQKB1R b KQkq - 0 6', "Sicilian: Keres Attack", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/pp2bppp/3p1n2/8/3N2P1/2N5/PPP2P1P/R1BQKB1R w KQ - 1 7', "Sicilian: Keres Attack", { from:[6,7], to:[5,7], san:'h4' }],
  ['rnbq1rk1/pp2bppp/3p1n2/8/3N1P1P/2N5/PPP3P1/R1BQKB1R b KQ - 0 7', "Sicilian: Keres Attack", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bq1rk1/pp2bppp/2np1n2/8/3N1P1P/2N5/PPP3P1/R1BQKB1R w KQ - 1 8', "Sicilian: Keres Attack", { from:[7,4], to:[5,4], san:'Be3' }],
  ['r1bq1rk1/pp2bppp/2np1n2/8/3N1P1P/2N1B3/PPP3P1/R2QKB1R b KQ - 2 8', "Sicilian: Keres Attack", { from:[1,3], to:[3,3], san:'d5' }],
  ['r1bq1rk1/pp2b1pp/2n1pn2/3p4/3N1P1P/2N1B3/PPP3P1/R2QKB1R w KQ - 0 9', "Sicilian: Keres Attack", { from:[7,3], to:[3,3], san:'Qd2' }],

  // #39: French Defense: Advance Variation
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', "French: Advance Variation", { from:[4,4], to:[3,4], san:'e5' }],
  ['rnbqkbnr/ppp2ppp/4p3/3pP3/8/8/PPP2PPP/RNBQKBNR b KQkq - 0 3', "French: Advance Variation", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkbnr/pp3ppp/4p3/2ppP3/8/8/PPP2PPP/RNBQKBNR w KQkq - 0 4', "French: Advance Variation", { from:[6,2], to:[4,2], san:'c3' }],
  ['rnbqkbnr/pp3ppp/4p3/2ppP3/8/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 4', "French: Advance Variation", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkbnr/pp3ppp/2n1p3/2ppP3/8/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 5', "French: Advance Variation", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['r1bqkbnr/pp3ppp/2n1p3/2ppP3/8/2P2N2/PP1P1PPP/RNBQKB1R b KQkq - 2 5', "French: Advance Variation", { from:[7,3], to:[1,1], san:'Qb6' }],
  ['r1b1kbnr/pp3ppp/1qn1p3/2ppP3/8/2P2N2/PP1P1PPP/RNBQKB1R w KQkq - 3 6', "French: Advance Variation", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['r1b1kbnr/pp3ppp/1qn1p3/2ppP3/8/2PB1N2/PP1P1PPP/RNBQK2R b KQkq - 4 6', "French: Advance Variation", { from:[2,5], to:[3,3], san:'Nge7' }],
  ['r1b1kbnr/pp2nppp/1qn1p3/2ppP3/8/2PB1N2/PP1P1PPP/RNBQK2R w KQkq - 5 7', "French: Advance Variation", { from:[7,7], to:[7,5], san:'O-O' }],

  // #40: Caro-Kann Defense: Advance Variation
  ['rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', "Caro-Kann: Advance", { from:[4,4], to:[3,4], san:'e5' }],
  ['rnbqkbnr/pp2pppp/2p5/3pP3/8/8/PPP2PPP/RNBQKBNR b KQkq - 0 3', "Caro-Kann: Advance", { from:[7,5], to:[3,1], san:'Bf5' }],
  ['rn1qkbnr/pp2pppp/2p5/3pPb2/8/8/PPPP1PPP/RNBQKBNR w KQkq - 1 4', "Caro-Kann: Advance", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rn1qkbnr/pp2pppp/2p5/3pPb2/8/5N2/PPPP1PPP/RNBQKB1R b KQkq - 2 4', "Caro-Kann: Advance", { from:[1,4], to:[2,4], san:'e6' }],
  ['rn1qkbnr/pp3ppp/2p1p3/3pPb2/8/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 5', "Caro-Kann: Advance", { from:[7,4], to:[5,4], san:'Be2' }],
  ['rn1qkbnr/pp3ppp/2p1p3/3pPb2/8/5N2/PPPPBPPP/RNBQK2R b KQkq - 2 5', "Caro-Kann: Advance", { from:[0,1], to:[2,2], san:'Nd7' }],
  ['r2qkbnr/pp1n1ppp/2p1p3/3pPb2/8/5N2/PPPPBPPP/RNBQK2R w KQkq - 4 6', "Caro-Kann: Advance", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r2qkbnr/pp1n1ppp/2p1p3/3pPb2/8/5N2/PPPPBPPP/RNBQ1RK1 b kq - 5 6', "Caro-Kann: Advance", { from:[1,2], to:[3,2], san:'c5' }],
  ['r2qkbnr/pp1n1ppp/4p3/2ppPb2/8/5N2/PPPPBPPP/RNBQ1RK1 w kq - 0 7', "Caro-Kann: Advance", { from:[6,3], to:[4,3], san:'d4' }],

  // #41: Blumenfeld Gambit
  ['rnbqkb1r/pppp1ppp/4pn2/8/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 3', "Blumenfeld Gambit", { from:[1,4], to:[3,4], san:'b5' }],
  ['rnbqkb1r/p1pp1ppp/4pn2/1p6/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4', "Blumenfeld Gambit", { from:[3,3], to:[1,1], san:'d5' }],
  ['rnbqkb1r/p1pp1ppp/4pn2/1p1P4/2P5/5N2/PP2PPPP/RNBQKB1R b KQkq - 0 4', "Blumenfeld Gambit", { from:[1,1], to:[2,2], san:'bxc4' }],
  ['rnbqkb1r/p1pp1ppp/4pn2/1p1P4/2p5/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 5', "Blumenfeld Gambit", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/p1pp1ppp/4pn2/1p1P4/2p5/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 1 5', "Blumenfeld Gambit", { from:[0,6], to:[2,5], san:'Nxd5' }],
  ['r1bqkb1r/p1pp1ppp/8/1p1nP3/2p5/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 6', "Blumenfeld Gambit", { from:[2,2], to:[3,3], san:'Nxd5' }],
  ['r1bqkb1r/p1pp1ppp/8/1p1NP3/2p5/5N2/PP3PPP/R1BQKB1R b KQkq - 0 6', "Blumenfeld Gambit", { from:[1,2], to:[3,2], san:'c6' }],
  ['r1bqkb1r/p2p1ppp/2p1p3/1p1NP3/2p5/5N2/PP3PPP/R1BQKB1R w KQkq - 0 7', "Blumenfeld Gambit", { from:[3,3], to:[4,4], san:'Nc3' }],

  // #42: Smith-Morra Gambit Accepted
  ['rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3', "Smith-Morra Gambit", { from:[2,5], to:[3,3], san:'cxd4' }],
  ['rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4', "Smith-Morra Gambit", { from:[6,2], to:[4,2], san:'c3' }],
  ['rnbqkbnr/pp2pppp/3p4/8/3pP3/2P2N2/PP3PPP/RNBQKB1R b KQkq - 0 4', "Smith-Morra Gambit Accepted", { from:[3,3], to:[2,2], san:'dxc3' }],
  ['rnbqkbnr/pp2pppp/3p4/8/8/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 5', "Smith-Morra Gambit Accepted", { from:[5,3], to:[2,2], san:'Nxc3' }],
  ['rnbqkbnr/pp2pppp/3p4/8/8/2N2N2/PP3PPP/R1BQKB1R b KQkq - 0 5', "Smith-Morra Gambit Accepted", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pp2pppp/3p1n2/8/8/2N2N2/PP3PPP/R1BQKB1R w KQkq - 1 6', "Smith-Morra Gambit Accepted", { from:[7,5], to:[4,2], san:'Bc4' }],
  ['rnbqkb1r/pp2pppp/3p1n2/8/2B1P3/2N2N2/PP3PPP/R1BQK2R b KQkq - 2 6', "Smith-Morra Gambit Accepted", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqk2r/pp2bppp/3ppn2/8/2B1P3/2N2N2/PP3PPP/R1BQK2R w KQkq - 0 7', "Smith-Morra Gambit Accepted", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbqk2r/pp2bppp/3ppn2/8/2B1P3/2N2N2/PP3PPP/R1BQ1RK1 b kq - 1 7', "Smith-Morra Gambit Accepted", { from:[0,1], to:[2,2], san:'Nc6' }],

  // #43: Scotch Gambit: Haxo Gambit
  ['r1bqkbnr/pppp1ppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4', "Scotch Gambit", { from:[7,5], to:[4,2], san:'Bc4' }],
  ['r1bqkbnr/pppp1ppp/2n5/8/2B1P3/5N2/PP3PPP/RNBQK2R b KQkq - 0 4', "Scotch Gambit", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/8/2B1P3/5N2/PP3PPP/RNBQK2R w KQkq - 1 5', "Scotch Gambit", { from:[4,4], to:[3,4], san:'e5' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/4P3/2B5/5N2/PP3PPP/RNBQK2R b KQkq - 0 5', "Scotch Gambit", { from:[1,3], to:[3,3], san:'d5' }],
  ['r1bqkb1r/ppp2ppp/2n2n2/3pP3/2B5/5N2/PP3PPP/RNBQK2R w KQkq - 0 6', "Haxo Gambit", { from:[4,4], to:[5,5], san:'exd6' }],
  ['r1bqkb1r/ppp2ppp/2np1n2/8/2B5/5N2/PP3PPP/RNBQK2R b KQkq - 0 6', "Haxo Gambit", { from:[7,5], to:[3,3], san:'Bxd6' }],
  ['r1bqk2r/ppp2ppp/2np1n2/8/2B5/5N2/PP3PPP/RNBQK2R w KQkq - 0 7', "Haxo Gambit", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bqk2r/ppp2ppp/2np1n2/8/2B5/5N2/PP3PPP/RNBQ1RK1 b kq - 1 7', "Haxo Gambit", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bq1rk1/ppp2ppp/2np1n2/8/2B5/5N2/PP3PPP/RNBQ1RK1 w - - 2 8', "Haxo Gambit", { from:[6,7], to:[5,7], san:'h3' }],

  // #44: Ruy Lopez: Archangel Variation
  ['r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 5', "Ruy Lopez: Archangel", { from:[1,4], to:[3,4], san:'b5' }],
  ['r1bqkb1r/2pp1ppp/p1n2n2/1p2p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 6', "Ruy Lopez: Archangel", { from:[2,0], to:[1,1], san:'Bb3' }],
  ['r1bqkb1r/2pp1ppp/p1n2n2/1p2p3/8/1B3N2/PPPP1PPP/RNBQ1RK1 b kq - 1 6', "Ruy Lopez: Archangel", { from:[7,5], to:[2,1], san:'Bb7' }],
  ['r2qkb1r/1bpp1ppp/p1n2n2/1p2p3/8/1B3N2/PPPP1PPP/RNBQ1RK1 w kq - 2 7', "Ruy Lopez: Archangel", { from:[7,4], to:[6,4], san:'Re1' }],
  ['r2qkb1r/1bpp1ppp/p1n2n2/1p2p3/8/1B3N2/PPPP1PPP/RNBQR1K1 b kq - 3 7', "Ruy Lopez: Archangel", { from:[2,5], to:[4,4], san:'Be7' }],
  ['r2qk2r/1bppbppp/p1n2n2/1p2p3/8/1B3N2/PPPP1PPP/RNBQR1K1 w kq - 4 8', "Ruy Lopez: Archangel", { from:[6,2], to:[4,2], san:'c3' }],
  ['r2qk2r/1bppbppp/p1n2n2/1p2p3/8/1BP2N2/PP1P1PPP/RNBQR1K1 b kq - 0 8', "Ruy Lopez: Archangel", { from:[1,3], to:[3,3], san:'d6' }],
  ['r2qk2r/1bppbppp/p1np1n2/1p2p3/8/1BP2N2/PP1P1PPP/RNBQR1K1 w kq - 1 9', "Ruy Lopez: Archangel", { from:[6,0], to:[4,0], san:'a4' }],

  // #45: Colle System: Main Line
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R w KQkq - 0 4', "Colle System", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/3BPN2/PPP2PPP/RNBQK2R b KQkq - 1 4', "Colle System", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnbqk2r/ppp1bppp/4pn2/3p4/3P4/3BPN2/PPP2PPP/RNBQK2R w KQkq - 2 5', "Colle System", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbqk2r/ppp1bppp/4pn2/3p4/3P4/3BPN2/PPP2PPP/RNBQ1RK1 b kq - 3 5', "Colle System", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/ppp1bppp/4pn2/3p4/3P4/3BPN2/PPP2PPP/RNBQ1RK1 w - - 4 6', "Colle System", { from:[7,1], to:[4,3], san:'Nbd2' }],
  ['rnbq1rk1/ppp1bppp/4pn2/3p4/3P4/3BPN2/PPPN1PPP/R1BQ1RK1 b - - 5 6', "Colle System", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbq1rk1/pp2bppp/4pn2/2pp4/3P4/3BPN2/PPPN1PPP/R1BQ1RK1 w - - 0 7', "Colle System", { from:[6,2], to:[4,2], san:'c3' }],
  ['rnbq1rk1/pp2bppp/4pn2/2pp4/3P4/2P1PN2/PP1N1PPP/R1BQ1RK1 b - - 0 7', "Colle System", { from:[0,1], to:[2,2], san:'Nc6' }],

  // #46: Slav Defense: Chebanenko Variation
  ['rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 3 4', "Slav: Chebanenko", { from:[1,0], to:[3,0], san:'a6' }],
  ['rnbqkb1r/1p2pppp/p1p2n2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5', "Slav: Chebanenko", { from:[6,2], to:[4,2], san:'c5' }],
  ['rnbqkb1r/1p2pppp/p1p2n2/2Pp4/3P4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 0 5', "Slav: Chebanenko", { from:[7,5], to:[3,1], san:'Bf5' }],
  ['rn1qkb1r/1p2pppp/p1p2n2/2Pp1b2/3P4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 1 6', "Slav: Chebanenko", { from:[7,5], to:[5,4], san:'Bf4' }],
  ['rn1qkb1r/1p2pppp/p1p2n2/2Pp1b2/3P1B2/2N2N2/PP2PPPP/R2QKB1R b KQkq - 2 6', "Slav: Chebanenko", { from:[0,1], to:[2,2], san:'Nbd7' }],
  ['r2qkb1r/1p1npppp/p1p2n2/2Pp1b2/3P1B2/2N2N2/PP2PPPP/R2QKB1R w KQkq - 3 7', "Slav: Chebanenko", { from:[4,4], to:[5,5], san:'e3' }],
  ['r2qkb1r/1p1npppp/p1p2n2/2Pp1b2/3P1B2/2N1PN2/PP3PPP/R2QKB1R b KQkq - 0 7', "Slav: Chebanenko", { from:[1,7], to:[2,7], san:'h6' }],

  // #47: Grünfeld Defense: Russian System
  ['rnbqkb1r/ppp1pp1p/8/3n4/8/2N5/PP1PPPPP/R1BQKBNR w KQkq - 0 5', "Grünfeld: Russian System", { from:[7,3], to:[1,1], san:'Qb3' }],
  ['rnbqkb1r/ppp1pp1p/8/3n4/8/1QN5/PP1PPPPP/R1B1KBNR b KQkq - 1 5', "Grünfeld: Russian System", { from:[3,3], to:[2,2], san:'Nxc3' }],
  ['rnbqkb1r/ppp1pp1p/8/8/8/1Qn5/PP1PPPPP/R1B1KBNR w KQkq - 0 6', "Grünfeld: Russian System", { from:[1,1], to:[2,2], san:'bxc3' }],
  ['rnbqkb1r/ppp1pp1p/8/8/8/1QP5/P2PPPPP/R1B1KBNR b KQkq - 0 6', "Grünfeld: Russian System", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/ppp1pp1p/8/8/8/1QP5/P2PPPPP/R1B1KBNR w KQkq - 1 7', "Grünfeld: Russian System", { from:[1,6], to:[3,5], san:'g3' }],
  ['rnbqk2r/ppp1pp1p/8/8/8/1QP3P1/P2PPP1P/R1B1KBNR b KQkq - 0 7', "Grünfeld: Russian System", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqk2r/ppp1pp1p/2n5/8/8/1QP3P1/P2PPP1P/R1B1KBNR w KQkq - 1 8', "Grünfeld: Russian System", { from:[7,5], to:[6,5], san:'Bg2' }],
  ['r1bqk2r/ppp1pp1p/2n5/8/8/1QP3P1/P2PPPBP/R1B1K1NR b KQkq - 2 8', "Grünfeld: Russian System", { from:[1,4], to:[2,4], san:'e5' }],

  // #48: Catalan Opening: Closed Variation
  ['rnbqk2r/p1p2ppp/4pn2/1p6/1pPP4/5NP1/PP2PPBP/RNBQK2R w KQkq - 0 6', "Catalan: Closed", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbqk2r/p1p2ppp/4pn2/1p6/1pPP4/5NP1/PP2PPBP/RNBQ1RK1 b kq - 1 6', "Catalan: Closed", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnb1k2r/p1ppbppp/4pn2/1p6/1pPP4/5NP1/PP2PPBP/RNBQ1RK1 w kq - 2 7', "Catalan: Closed", { from:[3,3], to:[4,3], san:'a4' }],
  ['rnb1k2r/p1ppbppp/4pn2/p7/1pPP4/5NP1/PP2PPBP/RNBQ1RK1 b kq - 0 7', "Catalan: Closed", { from:[1,1], to:[2,2], san:'bxa3' }],
  ['rn2k2r/p1ppbppp/4pn2/p7/2PP4/1p3NP1/PP2PPBP/RNBQ1RK1 w kq - 0 8', "Catalan: Closed", { from:[3,5], to:[0,0], san:'Nxa3' }],
  ['rnb1k2r/p1ppbppp/4pn2/p7/2PP4/N4NP1/PP2PPBP/R1BQ1RK1 b kq - 1 8', "Catalan: Closed", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rn2kr2/p1ppb1pp/4pn2/p7/2PP4/N4NP1/PP2PPBP/R1BQ1RK1 w q - 2 9', "Catalan: Closed", { from:[0,2], to:[2,2], san:'Nc2' }]
  
  
  
  
  
  
  
  
  
  // #49: Benko Gambit Accepted
  ['rnbqkb1r/p2ppppp/5n2/1p6/2pP4/2N2N2/PPP1PPPP/R1BQKB1R w KQkq - 0 5', "Benko Gambit", { from:[1,1], to:[2,2], san:'bxc3' }],
  ['rnbqkb1r/p2ppppp/5n2/1p6/2pP4/2P2N2/PP2PPPP/RNBQKB1R b KQkq - 0 5', "Benko Gambit", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqkb1r/p2p1ppp/4pn2/1p6/2pP4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 6', "Benko Gambit Accepted", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['rnbqkb1r/p2p1ppp/4pn2/1p4B1/2pP4/2P2N2/PP2PPPP/RN1QKB1R b KQkq - 1 6', "Benko Gambit Accepted", { from:[0,1], to:[2,2], san:'Nbd7' }],
  ['r2qkb1r/pb1p1ppp/4pn2/1p4B1/2pP4/2P2N2/PP2PPPP/RN1QKB1R w KQkq - 3 7', "Benko Gambit Accepted", { from:[4,4], to:[5,5], san:'e3' }],
  ['r2qkb1r/pb1p1ppp/4pn2/1p4B1/2pP4/2P1PN2/PP3PPP/RN1QKB1R b KQkq - 0 7', "Benko Gambit Accepted", { from:[1,0], to:[3,0], san:'a6' }],
  ['r2qkb1r/1b1p1ppp/p3pn2/1p4B1/2pP4/2P1PN2/PP3PPP/RN1QKB1R w KQkq - 1 8', "Benko Gambit Accepted", { from:[7,1], to:[4,3], san:'Nd2' }],
  ['r2qkb1r/1b1p1ppp/p3pn2/1p4B1/2pP4/2P1PN2/PP1N1PPP/R2QKB1R b KQkq - 2 8', "Benko Gambit Accepted", { from:[2,5], to:[4,4], san:'Be7' }],
  ['r2qk2r/1b1pbppp/p3pn2/1p4B1/2pP4/2P1PN2/PP1N1PPP/R2QKB1R w KQkq - 3 9', "Benko Gambit Accepted", { from:[7,7], to:[7,5], san:'O-O' }],

  
  
  
  // #50: Dutch Defense: Stonewall Variation (Corrected)
['rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 1 2', "Dutch Defense", { from:[1,5], to:[3,5], san:'f5' }],
['rnbqkb1r/ppppp1pp/5n2/5p2/3P4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', "Dutch Defense", { from:[4,4], to:[5,5], san:'e3' }],
['rnbqkb1r/ppppp1pp/5n2/5p2/3P4/4P3/PPP2PPP/RNBQKBNR b KQkq - 0 3', "Dutch Defense", { from:[1,4], to:[2,4], san:'e6' }],
['rnbqk2r/ppppb1pp/4pn2/5p2/3P4/4P3/PPP2PPP/RNBQKBNR w KQkq - 1 4', "Dutch Defense: Stonewall", { from:[7,5], to:[4,3], san:'Bd3' }],
['rnbqk2r/ppppb1pp/4pn2/5p2/3P4/3B4/PPP2PPP/RNBQK1NR b KQkq - 3 4', "Dutch Defense: Stonewall", { from:[1,3], to:[3,3], san:'d5' }],
['rnbqk2r/pp1pb1pp/4pn2/2p2p2/3P4/3B4/PPP2PPP/RNBQK1NR w KQkq - 0 5', "Dutch Defense: Stonewall", { from:[7,6], to:[5,5], san:'Nf3' }],
['rnbqk2r/pp1pb1pp/4pn2/2p2p2/3P4/3BPN2/PPP2PPP/RNBQK2R b KQkq - 1 5', "Dutch Defense: Stonewall", { from:[0,1], to:[2,2], san:'Nc6' }],


  
  
  ,
  // [----------------------------------------------------------------]
  // [           COMPREHENSIVE EXPANSION PACK (FINAL)                 ]
  // [----------------------------------------------------------------]

  // --- COVERING PREVIOUS MISSES & RELATED LINES ---

  // #51: French Defense: Two Knights Variation (Covers 1. e4 e6 2. Nf3)
  ['rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', "French Defense", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkbnr/pppp1ppp/4p3/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', "French Defense: Two Knights", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/4P3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 3', "French Defense: Two Knights", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/4P3/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 1 3', "French Defense: Two Knights", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/4P3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 2 4', "French Defense: Two Knights", { from:[4,4], to:[3,4], san:'e5' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3pP3/8/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 0 4', "French Defense: Two Knights", { from:[2,5], to:[3,3], san:'Nfd7' }],
  ['rnbqkb1r/pppn1ppp/4p3/3pP3/8/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 1 5', "French Defense: Two Knights", { from:[7,5], to:[5,4], san:'Bf4' }],
  ['rnbqkb1r/pppn1ppp/4p3/3pP3/5B2/2N2N2/PPP2PPP/R2QKB1R b KQkq - 3 5', "French Defense: Two Knights", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkb1r/pp1n1ppp/4p3/2ppP3/5B2/2N2N2/PPP2PPP/R2QKB1R w KQkq - 0 6', "French Defense: Two Knights", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkb1r/pp1n1ppp/4p3/2ppP3/3P1B2/2N2N2/PPP2PPP/R2QKB1R b KQkq - 0 6', "French Defense: Two Knights", { from:[0,1], to:[2,2], san:'Nc6' }],

  // #52: English Opening: Anglo-Scandinavian (Covers 1. c4 d5)
  ['rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1', "English Opening", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/2P5/8/PP1PPPPP/RNBQKBNR w KQkq d6 0 2', "English: Anglo-Scandinavian", { from:[2,3], to:[3,3], san:'cxd5' }],
  ['rnbqkbnr/ppp1pppp/8/3P4/8/8/PP1PPPPP/RNBQKBNR b KQkq - 0 2', "English: Anglo-Scandinavian", { from:[7,3], to:[3,3], san:'Qxd5' }],
  ['rnbqkb1r/ppp1pppp/8/3q4/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3', "English: Anglo-Scandinavian", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/ppp1pppp/8/3q4/8/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 3', "English: Anglo-Scandinavian", { from:[3,3], to:[4,0], san:'Qa5' }],
  ['rnb1kb1r/ppp1pppp/8/q7/8/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 4', "English: Anglo-Scandinavian", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnb1kb1r/ppp1pppp/8/q7/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq - 0 4', "English: Anglo-Scandinavian", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnb1kb1r/ppp1pppp/5n2/q7/3P4/2N5/PPP2PPP/R1BQKBNR w KQkq - 1 5', "English: Anglo-Scandinavian", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnb1kb1r/ppp1pppp/5n2/q7/3P4/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 2 5', "English: Anglo-Scandinavian", { from:[7,5], to:[3,1], san:'Bf5' }],

  // --- NEW SICILIAN DEFENSE SIDELINES ---

  // #53: Sicilian Defense: Taimanov Variation
  ['rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5', "Sicilian Defense: Main Line", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqk2r/pp2bppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 1 6', "Sicilian: Taimanov Variation", { from:[7,4], to:[5,4], san:'Be3' }],
  ['rnbqk2r/pp2bppp/3p1n2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 2 6', "Sicilian: Taimanov Variation", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqk2r/pp2bppp/2np1n2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R w KQkq - 3 7', "Sicilian: Taimanov Variation", { from:[6,5], to:[4,5], san:'f3' }],
  ['r1bqk2r/pp2bppp/2np1n2/8/3NP3/2N1BP2/PPP3PP/R2QKB1R b KQkq - 0 7', "Sicilian: Taimanov Variation", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bq1rk1/pp2bppp/2np1n2/8/3NP3/2N1BP2/PPP3PP/R2QKB1R w KQ - 1 8', "Sicilian: Taimanov Variation", { from:[7,3], to:[3,3], san:'Qd2' }],
  ['r1bq1rk1/pp2bppp/2np1n2/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R b KQ - 2 8', "Sicilian: Taimanov Variation", { from:[1,3], to:[3,3], san:'d5' }],
  ['r1bq1rk1/pp2bppp/2n2n2/3p4/3N4/2N1BP2/PPPQ2PP/R3KB1R w KQ - 3 9', "Sicilian: Taimanov Variation", { from:[4,4], to:[5,5], san:'exd5' }],
  ['r1bq1rk1/pp2bppp/2n5/3p4/3N4/2N1BP2/PPPQ2PP/R3KB1R b KQ - 0 9', "Sicilian: Taimanov Variation", { from:[2,5], to:[3,3], san:'Nxd5' }],

  // #54: Sicilian Defense: Accelerated Dragon
  ['rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 1 5', "Sicilian: Accelerated Dragon", { from:[1,6], to:[2,6], san:'g6' }],
  ['rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6', "Sicilian: Accelerated Dragon", { from:[7,4], to:[5,4], san:'Be3' }],
  ['rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 1 6', "Sicilian: Accelerated Dragon", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/pp2pp1p/3p1np1/8/3NP3/2N1B3/PPP2PPP/R2QKB1R w KQkq - 2 7', "Sicilian: Maroczy Bind", { from:[6,2], to:[4,2], san:'c4' }],
  ['rnbqk2r/pp2pp1p/3p1np1/2P5/4P3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 0 7', "Sicilian: Maroczy Bind", { from:[3,3], to:[2,2], san:'dxc5' }],
  ['rnbqk2r/pp2pp1p/6p1/2p5/4P3/2N1B3/PPP2PPP/R2QKB1R w KQkq - 0 8', "Sicilian: Maroczy Bind", { from:[7,3], to:[3,3], san:'Qxd8+' }],
  ['rnb1k2r/pp2pp1p/6p1/2p5/4P3/2N1B3/PPP2PPP/R3KB1R b KQkq - 1 8', "Sicilian: Maroczy Bind", { from:[7,4], to:[3,3], san:'Kxd8' }],
  ['rnb2r2/pp2pp1p/6p1/2p5/4P3/2N1B3/PPP2PPP/R3KB1R w KQ - 2 9', "Sicilian: Maroczy Bind", { from:[7,7], to:[7,5], san:'O-O-O' }],

  // #55: Sicilian Defense: Classical Variation
  ['rnbqkb1r/pp1ppppp/5n2/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', "Sicilian: Open", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 3 4', "Sicilian: Classical Variation", { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqkb1r/pp1ppppp/2n2n2/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 4', "Sicilian: Classical Variation", { from:[2,5], to:[3,3], san:'cxd4' }],
  ['r1bqkb1r/pp1ppppp/2n2n2/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 5', "Sicilian: Classical Variation", { from:[5,3], to:[3,3], san:'Nxd4' }],
  ['r1bqkb1r/pp1ppppp/2n2n2/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 1 5', "Sicilian: Classical Variation", { from:[1,3], to:[2,3], san:'d6' }],
  ['r1bqkb1r/pp2pppp/2np1n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 2 6', "Sicilian: Richter-Rauzer Attack", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['r1bqkb1r/pp2pppp/2np1n2/6B1/3NP3/8/PPP2PPP/RN1QKB1R b KQkq - 3 6', "Sicilian: Richter-Rauzer Attack", { from:[1,4], to:[2,4], san:'e6' }],
  ['r1bqk2r/pp2bppp/2nppn2/6B1/3NP3/8/PPP2PPP/RN1QKB1R w KQkq - 5 7', "Sicilian: Richter-Rauzer Attack", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['r1bqk2r/pp2bppp/2nppn2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R b KQkq - 6 7', "Sicilian: Richter-Rauzer Attack", { from:[7,7], to:[7,5], san:'O-O' }],

  // --- NEW QUEEN'S GAMBIT & INDIAN DEFENSE SIDELINES ---

  // #56: Queen's Gambit Declined: Ragozin Variation
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', "QGD: Main Line", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4', "QGD: Ragozin Variation", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 3 4', "QGD: Ragozin Variation", { from:[7,5], to:[3,1], san:'Bb4' }],
  ['rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 4 5', "QGD: Ragozin Variation", { from:[7,3], to:[4,2], san:'Qc2' }],
  ['rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PPQ1PPPP/R1B1KB1R b KQkq - 5 5', "QGD: Ragozin Variation", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PPQ1PPPP/R1B1KB1R w KQ - 6 6', "QGD: Ragozin Variation", { from:[6,0], to:[4,0], san:'a3' }],
  ['rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/P1N2N2/1PQ1PPPP/R1B1KB1R b KQ - 0 6', "QGD: Ragozin Variation", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnbq1rk1/pp2bppp/4pn2/3p4/2PP4/P1N2N2/1PQ1PPPP/R1B1KB1R w KQ - 1 7', "QGD: Ragozin Variation", { from:[7,5], to:[6,6], san:'Bg5' }],

  // #57: QGD: Cambridge Springs Defense
  ['r1bq1rk1/pp1nbppp/2p1pn2/3p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ - 3 7', "QGD: Orthodox", { from:[0,1], to:[2,2], san:'Nbd7' }],
  ['r1bq1rk1/pp1nbppp/2p1pn2/3p2B1/2PP4/2N1PN2/PPQ2PPP/R3KB1R b KQ - 4 7', "QGD: Cambridge Springs", { from:[7,3], to:[4,0], san:'Qa5' }],
  ['r1b2rk1/pp1nbppp/2p1pn2/q2p2B1/2PP4/2N1PN2/PPQ2PPP/R3KB1R w KQ - 5 8', "QGD: Cambridge Springs", { from:[3,3], to:[4,3], san:'Nd2' }],
  ['r1b2rk1/pp1nbppp/2p1pn2/q2p2B1/2PP4/2N1PN2/PP1N1PPP/R2QKB1R b KQ - 6 8', "QGD: Cambridge Springs", { from:[1,3], to:[3,3], san:'dxc4' }],
  ['r1b2rk1/pp1nbppp/2p1pn2/q5B1/2pP4/2N1PN2/PP1N1PPP/R2QKB1R w KQ - 0 9', "QGD: Cambridge Springs", { from:[6,6], to:[4,4], san:'Bxf6' }],
  ['r1b2rk1/pp1nbppp/2p1pB2/q7/2pP4/2N1PN2/PP1N1PPP/R2QKB1R b KQ - 0 9', "QGD: Cambridge Springs", { from:[2,5], to:[5,5], san:'Nxf6' }],
  ['r1b2rk1/pp1nb1pp/2p1pn2/q7/2pP4/2N1PN2/PP1N1PPP/R2QKB1R w KQ - 0 10', "QGD: Cambridge Springs", { from:[3,3], to:[2,2], san:'Nxc4' }],

  // #58: Queen's Gambit Declined: Semi-Tarrasch Defense
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 3 4', "QGD: Semi-Tarrasch", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5', "QGD: Semi-Tarrasch", { from:[2,3], to:[3,3], san:'cxd5' }],
  ['rnbqkb1r/pp3ppp/4pn2/3p4/3P4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 0 5', "QGD: Semi-Tarrasch", { from:[2,5], to:[3,3], san:'Nxd5' }],
  ['rnbqkb1r/pp3ppp/4p3/3n4/8/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 6', "QGD: Semi-Tarrasch", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqkb1r/pp3ppp/4p3/3n4/8/2N1PN2/PP3PPP/R1BQKB1R b KQkq - 0 6', "QGD: Semi-Tarrasch", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pp3ppp/2n1p3/3n4/8/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 1 7', "QGD: Semi-Tarrasch", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['r1bqkb1r/pp3ppp/2n1p3/3n4/8/2NBPN2/PP3PPP/R1BQK2R b KQkq - 2 7', "QGD: Semi-Tarrasch", { from:[2,5], to:[4,4], san:'Be7' }],
  ['r1bqk2r/pp2bppp/2n1p3/3n4/8/2NBPN2/PP3PPP/R1BQK2R w KQkq - 0 8', "QGD: Semi-Tarrasch", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bqk2r/pp2bppp/2n1p3/3n4/8/2NBPN2/PP3PPP/R1BQ1RK1 b kq - 1 8', "QGD: Semi-Tarrasch", { from:[7,7], to:[7,5], san:'O-O' }],

  // --- NEW STANDALONE OPENINGS & GAMBITS ---

  // #59: Nimzowitsch Defense
  ['rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', "Nimzowitsch Defense", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkbnr/pppppppp/2n5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2', "Nimzowitsch Defense", { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqkbnr/pppppppp/2n5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2', "Nimzowitsch Defense", { from:[1,3], to:[3,3], san:'d5' }],
  ['r1bqkbnr/ppp1pppp/2n5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', "Nimzowitsch Defense", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['r1bqkbnr/ppp1pppp/2n5/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3', "Nimzowitsch Defense", { from:[3,3], to:[4,4], san:'dxe4' }],
  ['r1bqkbnr/ppp1pppp/2n5/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4', "Nimzowitsch Defense", { from:[6,3], to:[4,3], san:'d5' }],
  ['r1bqkbnr/ppp1pppp/2n5/3P4/8/2N5/PPP2PPP/R1BQKBNR b KQkq - 0 4', "Nimzowitsch Defense", { from:[2,2], to:[4,4], san:'Ne5' }],
  ['r1bqk1nr/ppp1pppp/8/3pn3/8/2N5/PPPQPPPP/R1B1KBNR w KQkq - 2 5', "Nimzowitsch Defense", { from:[7,3], to:[5,3], san:'Qd4' }],
  ['r1bqk1nr/ppp1pppp/8/3pn3/3Q4/2N5/PPP1PPPP/R1B1KBNR b KQkq - 3 5', "Nimzowitsch Defense", { from:[4,4], to:[2,2], san:'Nc6' }],

  // #60: Blackmar-Diemer Gambit
  ['rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2', "Blackmar-Diemer Gambit", { from:[4,4], to:[5,5], san:'e4' }],
  ['rnbqkb1r/pppppppp/5n2/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2', "Blackmar-Diemer Gambit", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', "Blackmar-Diemer Gambit", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3', "Blackmar-Diemer Gambit", { from:[3,3], to:[4,4], san:'dxe4' }],
  ['rnbqkb1r/ppp1pppp/5n2/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4', "Blackmar-Diemer Gambit", { from:[6,5], to:[4,5], san:'f3' }],
  ['rnbqkb1r/ppp1pppp/5n2/8/3Pp3/2N2P2/PPP3PP/R1BQKBNR b KQkq - 0 4', "Blackmar-Diemer Gambit Accepted", { from:[4,4], to:[5,5], san:'exf3' }],
  ['rnbqkb1r/ppp1pppp/5n2/8/8/2N2p2/PPPP2PP/R1BQKBNR w KQkq - 0 5', "Blackmar-Diemer Gambit Accepted", { from:[5,3], to:[5,5], san:'Nxf3' }],
  ['rnbqkb1r/ppp1pppp/8/8/8/2N2N2/PPPP2PP/R1BQKB1R b KQkq - 1 5', "Blackmar-Diemer Gambit Accepted", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqk2r/ppp1bppp/4pn2/8/8/2N2N2/PPPP2PP/R1BQKB1R w KQkq - 3 6', "Blackmar-Diemer Gambit Accepted", { from:[7,5], to:[4,3], san:'Bd3' }],

  // #61: Torre Attack
  ['rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2', "Torre Attack", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/pppppppp/5n2/8/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq - 2 2', "Torre Attack", { from:[1,6], to:[2,6], san:'g6' }],
  ['rnbqkb1r/pppppp1p/5np1/8/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 3', "Torre Attack", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['rnbqkb1r/pppppp1p/5np1/6B1/3P4/5N2/PPP1PPPP/RN1QKB1R b KQkq - 1 3', "Torre Attack", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/pppppp1p/5np1/6B1/3P4/5N2/PPP1PPPP/RN1QKB1R w KQkq - 2 4', "Torre Attack", { from:[7,1], to:[4,3], san:'Nbd2' }],
  ['rnbqk2r/pppppp1p/5np1/6B1/3P4/5N2/PPPNPPPP/R2QKB1R b KQkq - 3 4', "Torre Attack", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/pppppp1p/5np1/6B1/3P4/5N2/PPPNPPPP/R2QKB1R w KQ - 4 5', "Torre Attack", { from:[6,2], to:[4,2], san:'c3' }],
  ['rnbq1rk1/pppppp1p/5np1/6B1/3P4/2P2N2/PP1NPPPP/R2QKB1R b KQ - 0 5', "Torre Attack", { from:[1,3], to:[3,3], san:'d6' }],
  ['rnbq1rk1/ppp1pp1p/3p1np1/6B1/3P4/2P2N2/PP1NPPPP/R2QKB1R w KQ - 0 6', "Torre Attack", { from:[4,4], to:[5,5], san:'e4' }],

  // #62: Owen's Defense
  ['rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', "Owen's Defense", { from:[1,4], to:[3,4], san:'b6' }],
  ['rnbqkbnr/p1pppppp/1p6/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', "Owen's Defense", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/p1pppppp/1p6/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2', "Owen's Defense", { from:[7,5], to:[2,0], san:'Bb7' }],
  ['rnbqkbnr/p2ppppp/1p6/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 1 3', "Owen's Defense", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['rnbqkbnr/p2ppppp/1p6/8/3PP3/3B4/PP3PPP/RNBQK1NR b KQkq - 2 3', "Owen's Defense", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/p2ppppp/1p3n2/8/3PP3/3B4/PP3PPP/RNBQK1NR w KQkq - 3 4', "Owen's Defense", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/p2ppppp/1p3n2/8/3PP3/3B4/PP3PPP/RNBQK1NR b KQkq - 4 4', "Owen's Defense", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqk2r/p2pbppp/1p2pn2/8/3PP3/3B4/PP3PPP/RNBQK1NR w KQkq - 0 5', "Owen's Defense", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqk2r/p2pbppp/1p2pn2/8/3PP3/3B1N2/PP3PPP/RNBQK2R b KQkq - 1 5', "Owen's Defense", { from:[7,7], to:[7,5], san:'O-O' }]
  
  
  
  
  ,
  // [----------------------------------------------------------------]
  // [         ENCYCLOPEDIC EXPANSION (COVERING ALL SIDELINES)        ]
  // [----------------------------------------------------------------]

  // --- COVERING THE LATEST MISS & OTHER FRENCH DEFENSE SIDELINES ---

  // #63: French Defense: Steinitz Attack (3. Bd3)
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', "French Defense", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/3B4/PPP2PPP/RNBQK1NR b KQkq - 1 3', "French: Steinitz Attack", { from:[3,3], to:[4,4], san:'dxe4' }],
  ['rnbqkbnr/ppp2ppp/4p3/8/3Pp3/3B4/PPP2PPP/RNBQK1NR w KQkq - 0 4', "French: Steinitz Attack", { from:[3,1], to:[4,4], san:'Bxe4' }],
  ['rnbqkbnr/ppp2ppp/4p3/8/4B3/8/PPPP1PPP/RNBQK1NR b KQkq - 0 4', "French: Steinitz Attack", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp2ppp/4pn2/8/4B3/8/PPPP1PPP/RNBQK1NR w KQkq - 1 5', "French: Steinitz Attack", { from:[4,4], to:[5,4], san:'Be3' }],
  ['rnbqkb1r/ppp2ppp/4pn2/8/8/4B3/PPPP1PPP/RN1QK1NR b KQkq - 2 5', "French: Steinitz Attack", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnbqk2r/ppp1bppp/4pn2/8/8/4B3/PPPP1PPP/RN1QK1NR w KQkq - 3 6', "French: Steinitz Attack", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqk2r/ppp1bppp/4pn2/8/8/4BN2/PPPP1PPP/R2QKB1R b KQkq - 4 6', "French: Steinitz Attack", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/ppp1bppp/4pn2/8/8/4BN2/PPPP1PPP/R2QKB1R w KQ - 5 7', "French: Steinitz Attack", { from:[6,2], to:[4,2], san:'c4' }],

  // #64: French Defense: Exchange Variation
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', "French: Exchange Variation", { from:[4,4], to:[5,5], san:'exd5' }],
  ['rnbqkbnr/ppp2ppp/4p3/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3', "French: Exchange Variation", { from:[4,4], to:[3,3], san:'exd5' }],
  ['rnbqkbnr/ppp2ppp/8/3p4/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4', "French: Exchange Variation", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['rnbqkbnr/ppp2ppp/8/3p4/3P4/3B4/PPP2PPP/RNBQK1NR b KQkq - 1 4', "French: Exchange Variation", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkbnr/ppp2ppp/2n5/3p4/3P4/3B4/PPP2PPP/RNBQK1NR w KQkq - 2 5', "French: Exchange Variation", { from:[6,2], to:[4,2], san:'c3' }],
  ['r1bqkbnr/ppp2ppp/2n5/3p4/3P4/2P1B3/PP3PPP/RN1QKBNR b KQkq - 0 5', "French: Exchange Variation", { from:[7,5], to:[3,1], san:'Bd6' }],
  ['r1bqk2r/ppp2ppp/2nb4/3p4/3P4/2P1B3/PP3PPP/RN1QKBNR w KQkq - 1 6', "French: Exchange Variation", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['r1bqk2r/ppp2ppp/2nb4/3p4/3P4/2P1BN2/PP3PPP/R2QKB1R b KQkq - 2 6', "French: Exchange Variation", { from:[7,7], to:[7,5], san:'O-O' }],

  // --- MORE 1. e4 SIDELINES ---

  // #65: Danish Gambit
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2', "Center Game", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2', "Center Game", { from:[4,4], to:[3,3], san:'exd4' }],
  ['rnbqkbnr/pppp1ppp/8/8/3pP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', "Danish Gambit", { from:[6,2], to:[4,2], san:'c3' }],
  ['rnbqkbnr/pppp1ppp/8/8/3pP3/2P5/PP3PPP/RNBQKBNR b KQkq - 0 3', "Danish Gambit Accepted", { from:[3,3], to:[2,2], san:'dxc3' }],
  ['rnbqkbnr/pppp1ppp/8/8/4P3/2p5/PP3PPP/RNBQKBNR w KQkq - 0 4', "Danish Gambit Accepted", { from:[7,5], to:[3,1], san:'Bc4' }],
  ['rnbqkbnr/pppp1ppp/8/8/2B1P3/2p5/PP3PPP/RNBQK1NR b KQkq - 1 4', "Danish Gambit Accepted", { from:[2,2], to:[1,1], san:'cxb2' }],
  ['rnbqkbnr/p1pp1ppp/8/1p6/2B1P3/8/Pp3PPP/RNBQK1NR w KQkq - 0 5', "Danish Gambit Accepted", { from:[3,1], to:[1,1], san:'Bxb2' }],
  ['rnbqkbnr/p1pp1ppp/8/1p6/4P3/8/PB3PPP/RN1QKBNR b KQkq - 0 5', "Danish Gambit Accepted", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/p1pp1ppp/5n2/1p6/4P3/8/PB3PPP/RN1QKBNR w KQkq - 1 6', "Danish Gambit Accepted", { from:[7,1], to:[5,2], san:'Nc3' }],

  // #66: Elephant Gambit
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', "Elephant Gambit", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PP1P1PPP/RNBQKB1R w KQkq - 0 3', "Elephant Gambit", { from:[4,4], to:[3,3], san:'exd5' }],
  ['rnbqkbnr/pppp1ppp/8/8/4P3/5N2/PP1P1PPP/RNBQKB1R b KQkq - 0 3', "Elephant Gambit", { from:[1,3], to:[2,3], san:'d4' }],
  ['rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PP1P1PPP/RNBQKB1R w KQkq - 0 4', "Elephant Gambit", { from:[5,3], to:[3,3], san:'Nxd4' }],
  ['rnbqkbnr/ppp2ppp/8/3p4/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4', "Elephant Gambit", { from:[7,5], to:[3,3], san:'Bxd4' }],
  ['rnbqk2r/ppp2ppp/8/3p4/3BP3/8/PPP2PPP/RN1QKB1R b KQkq - 0 5', "Elephant Gambit", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqk2r/ppp1bppp/4p3/3p4/3BP3/8/PPP2PPP/RN1QKB1R w KQkq - 1 6', "Elephant Gambit", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqk2r/ppp1bppp/4p3/3p4/3BP3/2N5/PPP2PPP/R2QKB1R b KQkq - 2 6', "Elephant Gambit", { from:[7,7], to:[7,5], san:'O-O' }],

  // #67: Latvian Gambit
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', "Latvian Gambit", { from:[1,5], to:[3,5], san:'f5' }],
  ['rnbqkbnr/pppp2pp/8/4pp2/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3', "Latvian Gambit", { from:[5,3], to:[4,4], san:'Nxe5' }],
  ['rnbqkbnr/pppp2pp/8/4Np2/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 0 3', "Latvian Gambit", { from:[7,3], to:[4,4], san:'Qe7' }],
  ['rnb1kbnr/ppppq1pp/8/4Np2/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 1 4', "Latvian Gambit", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnb1kbnr/ppppq1pp/8/4Np2/3PP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4', "Latvian Gambit", { from:[1,3], to:[2,3], san:'d6' }],
  ['rnb1kbnr/ppp1q1pp/3p4/4Np2/3PP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 5', "Latvian Gambit", { from:[4,4], to:[2,2], san:'Nf3' }],
  ['rnb1kbnr/ppp1q1pp/3p4/5p2/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 1 5', "Latvian Gambit", { from:[1,5], to:[2,5], san:'fxe4' }],
  ['rnb1kbnr/ppp1q1pp/3p4/8/3Pp3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 6', "Latvian Gambit", { from:[3,5], to:[4,4], san:'Nfd2' }],

  // --- MORE 1. d4 & FLANK SIDELINES ---

  // #68: Albin Countergambit
  ['rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2', "Albin Countergambit", { from:[1,4], to:[3,4], san:'e5' }],
  ['rnbqkbnr/ppp2ppp/8/3pp3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', "Albin Countergambit", { from:[3,3], to:[4,4], san:'dxe5' }],
  ['rnbqkbnr/ppp2ppp/8/3pP3/2P5/8/PP2PPPP/RNBQKBNR b KQkq - 0 3', "Albin Countergambit", { from:[1,3], to:[3,3], san:'d4' }],
  ['rnbqkbnr/ppp2ppp/8/8/3pP3/8/PP2PPPP/RNBQKBNR w KQkq - 0 4', "Albin Countergambit", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkbnr/ppp2ppp/8/8/3pP3/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 4', "Albin Countergambit", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkbnr/ppp2ppp/2n5/8/3pP3/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 5', "Albin Countergambit", { from:[1,6], to:[3,5], san:'g3' }],
  ['r1bqkbnr/ppp2ppp/2n5/8/3pP3/5NP1/PP2PP1P/RNBQKB1R b KQkq - 0 5', "Albin Countergambit", { from:[7,5], to:[3,1], san:'Bb4+' }],
  ['r1bqk1nr/ppp2ppp/2n5/8/1b1pP3/5NP1/PP2PP1P/RNBQKB1R w KQkq - 1 6', "Albin Countergambit", { from:[7,5], to:[4,3], san:'Bd2' }],

  // #69: Chigorin Defense
  ['rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2', "Chigorin Defense", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkbnr/ppp1pppp/2n5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 1 3', "Chigorin Defense", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['r1bqkbnr/ppp1pppp/2n5/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 2 3', "Chigorin Defense", { from:[3,3], to:[2,2], san:'dxc4' }],
  ['r1bqkbnr/ppp1pppp/2n5/8/2pP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4', "Chigorin Defense", { from:[6,3], to:[4,3], san:'d5' }],
  ['r1bqkbnr/ppp1pppp/2n5/8/2pP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 0 4', "Chigorin Defense", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['r1bqkb1r/ppp1pppp/2n2n2/8/2pP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 5', "Chigorin Defense", { from:[4,4], to:[5,5], san:'e3' }],
  ['r1bqkb1r/ppp1pppp/2n2n2/8/2pP4/4PN2/PP3PPP/RNBQKB1R b KQkq - 0 5', "Chigorin Defense", { from:[7,5], to:[3,1], san:'Bg4' }],
  ['r2qkb1r/ppp1pppp/2n2n2/8/2pP2b1/4PN2/PP3PPP/RNBQKB1R w KQkq - 1 6', "Chigorin Defense", { from:[7,1], to:[5,2], san:'Nc3' }],

  // #70: Stonewall Attack
  ['rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2', "Stonewall Attack", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqkb1r/pppppppp/5n2/8/3P4/4P3/PPP2PPP/RNBQKBNR b KQkq - 0 2', "Stonewall Attack", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/3P4/4P3/PPP2PPP/RNBQKBNR w KQkq - 0 3', "Stonewall Attack", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/3P4/3BP3/PPP2PPP/RNBQK1NR b KQkq - 2 3', "Stonewall Attack", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkb1r/pp2pppp/5n2/2pp4/3P4/3BP3/PPP2PPP/RNBQK1NR w KQkq - 0 4', "Stonewall Attack", { from:[6,2], to:[4,2], san:'c3' }],
  ['rnbqkb1r/pp2pppp/5n2/2pp4/2PP4/3BP3/PP3PPP/RNBQK1NR b KQkq - 0 4', "Stonewall Attack", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pp2pppp/2n2n2/2pp4/2PP4/3BP3/PP3PPP/RNBQK1NR w KQkq - 1 5', "Stonewall Attack", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['r1bqkb1r/pp2pppp/2n2n2/2pp4/2PP4/3BPN2/PP3PPP/RNBQK2R b KQkq - 2 5', "Stonewall Attack", { from:[1,4], to:[2,4], san:'e6' }],
  ['r1bqk2r/pp2bppp/2n1pn2/2pp4/2PP4/3BPN2/PP3PPP/RNBQK2R w KQkq - 0 6', "Stonewall Attack", { from:[7,7], to:[7,5], san:'O-O' }],

  // #71: Veresov Attack
  ['rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2', "Veresov Attack", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pppppppp/5n2/8/3P4/2N5/PPP1PPPP/R1BQKBNR b KQkq - 2 2', "Veresov Attack", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/3P4/2N5/PPP1PPPP/R1BQKBNR w KQkq - 0 3', "Veresov Attack", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p2B1/3P4/2N5/PPP1PPPP/R2QKBNR b KQkq - 1 3', "Veresov Attack", { from:[0,1], to:[2,2], san:'Nbd7' }],
  ['r2qkb1r/pppbpppp/5n2/3p2B1/3P4/2N5/PPP1PPPP/R2QKBNR w KQkq - 2 4', "Veresov Attack", { from:[6,5], to:[4,5], san:'f3' }],
  ['r2qkb1r/pppbpppp/5n2/3p2B1/3P4/2N2P2/PPP1P1PP/R2QKBNR b KQkq - 0 4', "Veresov Attack", { from:[1,2], to:[3,2], san:'c5' }],
  ['r2qkb1r/pp1bpppp/5n2/2pp2B1/3P4/2N2P2/PPP1P1PP/R2QKBNR w KQkq - 0 5', "Veresov Attack", { from:[4,4], to:[5,5], san:'e4' }],
  ['r2qkb1r/pp1bpppp/5n2/2pp2B1/3PP3/2N2P2/PPP1P1PP/R2QKBNR b KQkq - 0 5', "Veresov Attack", { from:[3,3], to:[4,4], san:'dxe4' }],
  ['r2qkb1r/pp1bpppp/5n2/2p3B1/3pP3/2N2P2/PPP1P1PP/R2QKBNR w KQkq - 0 6', "Veresov Attack", { from:[2,2], to:[4,4], san:'Nxe4' }],

  // #72: Grob's Attack
  ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', "Grob's Attack", { from:[1,6], to:[3,5], san:'g4' }],
  ['rnbqkbnr/pppppppp/8/8/6P1/8/PPPPPP1P/RNBQKBNR b KQkq - 0 1', "Grob's Attack", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/6P1/8/PPPPPP1P/RNBQKBNR w KQkq - 0 2', "Grob's Attack", { from:[7,5], to:[6,5], san:'Bg2' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/6P1/8/PPPPPPBP/RNBQK1NR b KQkq - 1 2', "Grob's Attack", { from:[1,2], to:[3,2], san:'c6' }],
  ['rnbqkbnr/pp2pppp/2p5/3p4/6P1/8/PPPPPPBP/RNBQK1NR w KQkq - 0 3', "Grob's Attack", { from:[6,7], to:[5,7], san:'h3' }],
  ['rnbqkbnr/pp2pppp/2p5/3p4/6P1/7P/PPPPPPBP/RNBQK1NR b KQkq - 1 3', "Grob's Attack", { from:[1,4], to:[3,4], san:'e5' }],
  ['rnbqkbnr/pp3ppp/2p5/3pp1P1/8/7P/PPPPPPBP/RNBQK1NR w KQkq - 0 4', "Grob's Attack", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pp3ppp/2p5/3pp1P1/3P4/7P/PPP1PPBP/RNBQK1NR b KQkq - 0 4', "Grob's Attack", { from:[2,5], to:[4,4], san:'e4' }]
  
  
  ,
  // [----------------------------------------------------------------]
  // [       ULTRA-COMPREHENSIVE EXPANSION (FINAL COLLECTION)         ]
  // [----------------------------------------------------------------]

  // --- COVERING THE BISHOP'S OPENING & RELATED LINES ---

  // #73: Bishop's Opening (Covers the latest miss)
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2', "Bishop's Opening", { from:[7,5], to:[4,2], san:'Bc4' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 3', "Bishop's Opening", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 4', "Bishop's Opening: Berlin Defense", { from:[6,3], to:[4,3], san:'d3' }],
  ['rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/3P4/PPP2PPP/RNBQK1NR b KQkq - 0 4', "Bishop's Opening: Berlin Defense", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P4/PPP2PPP/RNBQK1NR w KQkq - 1 5', "Bishop's Opening: Berlin Defense", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 2 5', "Bishop's Opening: Berlin Defense", { from:[7,5], to:[3,1], san:'Bb4' }],
  ['r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 3 6', "Bishop's Opening: Berlin Defense", { from:[6,2], to:[4,2], san:'c3' }],
  ['r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2PP1N2/P4PPP/RNBQK2R b KQkq - 0 6', "Bishop's Opening: Berlin Defense", { from:[3,1], to:[2,0], san:'Ba5' }],
  ['r2qk2r/pppp1ppp/2n2n2/b3p3/2B1P3/2PP1N2/P4PPP/RNBQK2R w KQkq - 1 7', "Bishop's Opening: Berlin Defense", { from:[7,7], to:[7,5], san:'O-O' }],

  // --- HYPER-EXPANDED 1. e4 SYSTEMS ---

  // #74: Göring Gambit
  ['rnbqkbnr/pppp1ppp/8/8/3pP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', "Center Game", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkbnr/pppp1ppp/8/8/3pP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 1 3', "Center Game", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkbnr/pppp1ppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 2 4', "Göring Gambit", { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqkbnr/pppp1ppp/2n5/8/3pP3/3P1N2/PPP2PPP/RNBQKB1R b KQkq - 0 4', "Göring Gambit Accepted", { from:[3,3], to:[4,3], san:'Nxd4' }],
  ['r1bqkbnr/pppp1ppp/2n5/8/8/3P1N2/PPPp1PPP/RNBQKB1R w KQkq - 0 5', "Göring Gambit Accepted", { from:[6,2], to:[4,2], san:'c3' }],
  ['r1bqkbnr/pppp1ppp/2n5/8/8/2P2N2/PP1p1PPP/RNBQKB1R b KQkq - 0 5', "Göring Gambit Accepted", { from:[3,3], to:[2,2], san:'dxc3' }],
  ['r1bqkbnr/pppp1ppp/2n5/8/8/2p2N2/PP3PPP/RNBQKB1R w KQkq - 0 6', "Göring Gambit Accepted", { from:[7,1], to:[2,2], san:'Nxc3' }],
  ['r1bqkbnr/pppp1ppp/2n5/8/8/2N2N2/PP3PPP/R1BQKB1R b KQkq - 0 6', "Göring Gambit Accepted", { from:[0,6], to:[2,5], san:'Nf6' }],

  // #75: Max Lange Attack
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 1 5', "Italian Game", { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq d3 0 5', "Italian Game", { from:[4,4], to:[3,3], san:'exd4' }],
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 0 6', "Max Lange Attack", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQ1RK1 b kq - 0 6', "Max Lange Attack", { from:[2,5], to:[4,4], san:'Nxe4' }],
  ['r1bqk2r/pppp1ppp/2n5/2b1p3/2B1n3/2P2N2/PP1P1PPP/RNBQ1RK1 w kq - 0 7', "Max Lange Attack", { from:[7,4], to:[6,4], san:'Re1' }],
  ['r1bqk2r/pppp1ppp/2n5/2b1p3/2B1n3/2P2N2/PP1P1PPP/RNBQR1K1 b kq - 1 7', "Max Lange Attack", { from:[1,3], to:[2,3], san:'d5' }],
  ['r1bqk2r/pppp1p1p/2n5/2bpP3/2B1n3/2P2N2/PP3PPP/RNBQR1K1 w kq - 0 8', "Max Lange Attack", { from:[3,1], to:[4,4], san:'Bxd5' }],

  // #76: Sicilian Defense: Pin Variation
  ['rnbqkb1r/pp1ppppp/5n2/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 2 3', "Sicilian Defense", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqkb1r/pp1p1ppp/4pn2/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 3 4', "Sicilian: Pin Variation", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkb1r/pp1p1ppp/4pn2/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 4', "Sicilian: Pin Variation", { from:[2,5], to:[3,3], san:'cxd4' }],
  ['rnbqkb1r/pp1p1ppp/4pn2/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 5', "Sicilian: Pin Variation", { from:[5,3], to:[3,3], san:'Nxd4' }],
  ['rnbqkb1r/pp1p1ppp/4pn2/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 1 5', "Sicilian: Pin Variation", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pp1p1ppp/2n1pn2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 2 6', "Sicilian: Pin Variation", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['r1bqkb1r/pp1p1ppp/2n1pn2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 3 6', "Sicilian: Pin Variation", { from:[7,5], to:[3,1], san:'Bb4' }],
  ['r1bqk2r/pp1p1ppp/2n1pn2/8/1b1NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 7', "Sicilian: Pin Variation", { from:[3,3], to:[2,2], san:'Nxc6' }],

  // #77: Caro-Kann: Fantasy Variation
  ['rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', "Caro-Kann: Fantasy", { from:[6,5], to:[4,5], san:'f3' }],
  ['rnbqkbnr/pp2pppp/2p5/3p4/3PP3/5P2/PPP3PP/RNBQKBNR b KQkq - 0 3', "Caro-Kann: Fantasy", { from:[3,3], to:[4,4], san:'dxe4' }],
  ['rnbqkbnr/pp2pppp/2p5/8/3Pp3/5P2/PPP3PP/RNBQKBNR w KQkq - 0 4', "Caro-Kann: Fantasy", { from:[4,5], to:[3,4], san:'fxe4' }],
  ['rnbqkbnr/pp2pppp/2p5/8/4p3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 4', "Caro-Kann: Fantasy", { from:[1,4], to:[3,4], san:'e5' }],
  ['rnbqkbnr/pp3ppp/2p5/4p3/4p3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 5', "Caro-Kann: Fantasy", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkbnr/pp3ppp/2p5/4p3/4p3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 5', "Caro-Kann: Fantasy", { from:[7,5], to:[3,1], san:'Bg4' }],
  ['rn1qkbnr/pp3ppp/2p5/4p3/4p1b1/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 6', "Caro-Kann: Fantasy", { from:[6,7], to:[5,7], san:'h3' }],

  // #78: Scotch Game: Classical Variation
  ['r1bqkbnr/pppp1ppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4', "Scotch: Classical", { from:[7,5], to:[2,2], san:'Bc5' }],
  ['r1bqk1nr/pppp1ppp/2n5/2b5/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5', "Scotch: Classical", { from:[7,4], to:[5,4], san:'Be3' }],
  ['r1bqk1nr/pppp1ppp/2n5/2b5/3NP3/4B3/PPP2PPP/RN1QKB1R b KQkq - 2 5', "Scotch: Classical", { from:[7,3], to:[5,5], san:'Qf6' }],
  ['r1b1k1nr/pppp1ppp/2n2q2/2b5/3NP3/4B3/PPP2PPP/RN1QKB1R w KQkq - 3 6', "Scotch: Classical", { from:[6,2], to:[4,2], san:'c3' }],
  ['r1b1k1nr/pppp1ppp/2n2q2/2b5/3NP3/2P1B3/PP3PPP/RN1QKB1R b KQkq - 0 6', "Scotch: Classical", { from:[0,6], to:[2,5], san:'Nge7' }],
  ['r1b1k2r/ppppnppp/2n2q2/2b5/3NP3/2P1B3/PP3PPP/RN1QKB1R w KQkq - 1 7', "Scotch: Classical", { from:[7,5], to:[4,2], san:'Bc4' }],
  ['r1b1k2r/ppppnppp/2n2q2/2b5/2BNP3/2P1B3/PP3PPP/RN1QK2R b KQkq - 2 7', "Scotch: Classical", { from:[1,3], to:[3,3], san:'d5' }],

  // --- HYPER-EXPANDED 1. d4 & FLANK SYSTEMS ---

  // #79: King's Indian Defense: Fianchetto Variation
  ['rnbq1rk1/ppp1pp1p/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 2 6', "KID: Fianchetto", { from:[1,6], to:[3,5], san:'g3' }],
  ['rnbq1rk1/ppp1pp1p/3p1np1/8/2PPP3/2N2NP1/PP3P1P/R1BQKB1R b KQ - 0 6', "KID: Fianchetto", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r2q1rk1/ppp1pp1p/2np1np1/8/2PPP3/2N2NP1/PP3P1P/R1BQKB1R w KQ - 1 7', "KID: Fianchetto", { from:[7,5], to:[6,5], san:'Bg2' }],
  ['r2q1rk1/ppp1pp1p/2np1np1/8/2PPP3/2N2NP1/PP3PBP/R1BQK2R b KQ - 2 7', "KID: Fianchetto", { from:[1,4], to:[2,4], san:'e5' }],
  ['r2q1rk1/ppp2p1p/2np1np1/4p3/2PPP3/2N2NP1/PP3PBP/R1BQK2R w KQ - 0 8', "KID: Fianchetto", { from:[6,3], to:[4,3], san:'d5' }],
  ['r2q1rk1/ppp2p1p/2np1np1/3Pp3/2P1P3/2N2NP1/PP3PBP/R1BQK2R b KQ - 0 8', "KID: Fianchetto", { from:[2,5], to:[4,4], san:'Ne7' }],
  ['r2q1rk1/pppn1p1p/3p1np1/3Pp3/2P1P3/2N2NP1/PP3PBP/R1BQK2R w KQ - 1 9', "KID: Fianchetto", { from:[7,7], to:[7,5], san:'O-O' }],

  // #80: English Opening: Mikenas-Carls Variation
  ['rnbqkbnr/pp1ppppp/8/2p5/2P5/8/PP1PPPPP/RNBQKBNR w KQkq c6 0 2', "English Opening", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkbnr/pp1ppppp/8/2p5/2P5/2N5/PP1PPPPP/R1BQKBNR b KQkq - 1 2', "English Opening", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkbnr/pp1ppppp/2n5/2p5/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq - 2 3', "English: Mikenas-Carls", { from:[4,4], to:[5,5], san:'e4' }],
  ['r1bqkbnr/pp1ppppp/2n5/2p5/2P1P3/2N5/PP1P1PPP/R1BQKBNR b KQkq - 0 3', "English: Mikenas-Carls", { from:[1,6], to:[2,6], san:'g6' }],
  ['r1bqkbnr/pp2pppp/2np2p1/2p5/2P1P3/2N5/PP1P1PPP/R1BQKBNR w KQkq - 0 4', "English: Mikenas-Carls", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['r1bqkbnr/pp2pppp/2np2p1/2p5/2P1P3/2N2N2/PP1P1PPP/R1BQKB1R b KQkq - 1 4', "English: Mikenas-Carls", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['r1bqk2r/pp2ppbp/2np2p1/2p5/2P1P3/2N2N2/PP1P1PPP/R1BQKB1R w KQkq - 2 5', "English: Mikenas-Carls", { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqk2r/pp2ppbp/2np2p1/2p5/2PPP3/2N2N2/PP3PPP/R1BQKB1R b KQkq - 0 5', "English: Mikenas-Carls", { from:[2,5], to:[3,3], san:'cxd4' }],
  ['r1bqk2r/pp2ppbp/2np2p1/8/3pP3/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 6', "English: Mikenas-Carls", { from:[5,3], to:[3,3], san:'Nxd4' }],

  // #81: English Opening: Botvinnik System
  ['r1bqkb1r/pppp1ppp/2n2n2/4p3/2P5/2N2NP1/PP1PPP1P/R1BQKB1R b KQkq - 0 4', "English: Four Knights", { from:[1,3], to:[3,3], san:'d5' }],
  ['r1bqkb1r/ppp2ppp/2n2n2/3pp3/2P5/2N2NP1/PP1PPP1P/R1BQKB1R w KQkq - 0 5', "English: Botvinnik System", { from:[2,3], to:[3,3], san:'cxd5' }],
  ['r1bqkb1r/ppp2ppp/2n2n2/3P4/8/2N2NP1/PP1PPP1P/R1BQKB1R b KQkq - 0 5', "English: Botvinnik System", { from:[2,5], to:[3,3], san:'Nxd5' }],
  ['r1bqkb1r/ppp2ppp/2n5/3n4/8/2N2NP1/PP1PPP1P/R1BQKB1R w KQkq - 1 6', "English: Botvinnik System", { from:[7,5], to:[6,5], san:'Bg2' }],
  ['r1bqkb1r/ppp2ppp/2n5/3n4/8/2N2NP1/PP1PPPBP/R1BQK2R b KQkq - 2 6', "English: Botvinnik System", { from:[3,3], to:[1,1], san:'Nb6' }],
  ['r1bqkb1r/ppp2ppp/1nn5/8/8/2N2NP1/PP1PPPBP/R1BQK2R w KQkq - 3 7', "English: Botvinnik System", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bqkb1r/ppp2ppp/1nn5/8/8/2N2NP1/PP1PPPBP/R1BQ1RK1 b kq - 4 7', "English: Botvinnik System", { from:[2,5], to:[4,4], san:'Be7' }],
  ['r1bqk2r/ppp1bppp/1nn5/8/8/2N2NP1/PP1PPPBP/R1BQ1RK1 w kq - 5 8', "English: Botvinnik System", { from:[6,3], to:[4,3], san:'d4' }],

  // #82: Polish Opening (Orangutan)
  ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', "Polish Opening", { from:[6,1], to:[4,1], san:'b4' }],
  ['rnbqkbnr/pppppppp/8/8/1P6/8/P1PPPPPP/RNBQKBNR b KQkq - 0 1', "Polish Opening", { from:[1,4], to:[3,4], san:'e5' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/1P6/8/P1PPPPPP/RNBQKBNR w KQkq - 0 2', "Polish Opening", { from:[7,5], to:[6,1], san:'Bb2' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/1P6/8/PBPPPPPP/RN1QKBNR b KQkq - 1 2', "Polish Opening", { from:[7,5], to:[3,1], san:'Bxb4' }],
  ['rnbqk1nr/pppp1ppp/8/4p3/1b6/8/PBPPPPPP/RN1QKBNR w KQkq - 0 3', "Polish Opening", { from:[1,1], to:[3,1], san:'Bxe5' }],
  ['rnbqk1nr/pppp1ppp/8/4B3/1b6/8/P1PPPPPP/RN1QKBNR b KQkq - 0 3', "Polish Opening", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbq1k1r/pppp1ppp/5n2/4B3/1b6/8/P1PPPPPP/RN1QKBNR w KQ - 1 4', "Polish Opening", { from:[6,2], to:[4,2], san:'c3' }],
  ['rnbq1k1r/pppp1ppp/5n2/4B3/1b6/2P5/P2PPPPP/RN1QKBNR b KQ - 0 4', "Polish Opening", { from:[3,1], to:[4,0], san:'Ba5' }],

  // #83: Hippo Defense (Setup)
  ['rnbqkbnr/pppp1p1p/6p1/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', "Hippo Defense Setup", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkbnr/pppp1p1p/6p1/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', "Hippo Defense Setup", { from:[1,3], to:[2,3], san:'d6' }],
  ['rnbqkbnr/ppp2p1p/3p2p1/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3', "Hippo Defense Setup", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/ppp2p1p/3p2p1/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3', "Hippo Defense Setup", { from:[0,1], to:[2,2], san:'Nd7' }],
  ['r1bqkbnr/ppp1np1p/3p2p1/3Pp3/4P3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4', "Hippo Defense Setup", { from:[7,5], to:[4,2], san:'Bc4' }],
  ['r1bqkbnr/ppp1np1p/3p2p1/3Pp3/2B1P3/5N2/PPP2PPP/RNBQK2R b KQkq - 1 4', "Hippo Defense Setup", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['r1bqk2r/ppp1npbp/3p2p1/3Pp3/2B1P3/5N2/PPP2PPP/RNBQK2R w KQkq - 2 5', "Hippo Defense Setup", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bqk2r/ppp1npbp/3p2p1/3Pp3/2B1P3/5N2/PPP2PPP/RNBQ1RK1 b kq - 3 5', "Hippo Defense Setup", { from:[7,7], to:[7,5], san:'O-O' }]
  
  
  
  ,
  // [----------------------------------------------------------------]
  // [      THE ENCYCLOPEDIC & ULTIMATE EXPANSION (FINAL PACK)        ]
  // [----------------------------------------------------------------]

  // --- COVERING THE VIENNA GAME 2...Nc6 & OTHER e4 SIDELINES ---

  // #84: Vienna Game: 2...Nc6 Variation (Covers the final miss)
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2', "Vienna Game: Main Line", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 3', "Vienna Game: 2...Nc6", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq - 3 3', "Vienna Game: Four Knights", { from:[0,6], to:[2,5], san:'Nf6' }], // Transposes to Four Knights
  ['r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4', "Vienna Game: Four Knights", { from:[7,5], to:[3,1], san:'Bb5' }], // Transposes to Ruy Lopez
  // Add a direct line for the Vienna Gambit after 2...Nc6
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 3', "Vienna Game: 2...Nc6", { from:[6,5], to:[4,5], san:'f4' }],
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4PP2/2N5/PPPP2PP/R1BQKBNR b KQkq - 0 3', "Vienna Gambit: 2...Nc6", { from:[4,4], to:[5,5], san:'exf4' }],
  ['r1bqkbnr/pppp1ppp/2n5/8/4Pp2/2N5/PPPP2PP/R1BQKBNR w KQkq - 0 4', "Vienna Gambit: 2...Nc6", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['r1bqkbnr/pppp1ppp/2n5/8/4Pp2/2N2N2/PPPP2PP/R1BQKB1R b KQkq - 1 4', "Vienna Gambit: 2...Nc6", { from:[1,6], to:[2,6], san:'g5' }],

  // #85: Philidor Defense Counter-Gambit
  ['rnbqkbnr/ppp2ppp/3p4/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3', "Philidor Defense", { from:[1,5], to:[3,5], san:'f5' }],
  ['rnbqkbnr/ppp3pp/3p4/4pp2/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4', "Philidor Counter-Gambit", { from:[3,3], to:[4,4], san:'dxe5' }],
  ['rnbqkbnr/ppp3pp/3p4/4Pp2/8/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 4', "Philidor Counter-Gambit", { from:[5,5], to:[4,4], san:'fxe4' }],
  ['rnbqkbnr/ppp3pp/3p4/4p3/4p3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 5', "Philidor Counter-Gambit", { from:[3,5], to:[6,6], san:'Ng5' }],
  ['rnbqkbnr/ppp3pp/3p4/4p1N1/4p3/8/PPPP1PPP/RNBQKB1R b KQkq - 1 5', "Philidor Counter-Gambit", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/p1p3pp/8/3pppN1/4p3/8/PPPP1PPP/RNBQKB1R w KQkq - 0 6', "Philidor Counter-Gambit", { from:[6,3], to:[4,3], san:'d4' }],

  // #86: Italian Game: Evans Gambit Declined
  ['r1bqk1nr/pppp1ppp/2n5/2b1p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R b KQkq - 0 4', "Evans Gambit Declined", { from:[7,5], to:[3,1], san:'Bb6' }],
  ['r1bqk1nr/pppp1ppp/1bn5/4p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R w KQkq - 1 5', "Evans Gambit Declined", { from:[6,0], to:[4,0], san:'a4' }],
  ['r1bqk1nr/pppp1ppp/1bn5/4p3/P1B1P3/5N2/2PP1PPP/RNBQK2R b KQkq - 0 5', "Evans Gambit Declined", { from:[1,0], to:[3,0], san:'a6' }],
  ['r2qk1nr/1ppp1ppp/p1n5/1b2p3/P1B1P3/5N2/2PP1PPP/RNBQK2R w KQkq - 0 6', "Evans Gambit Declined", { from:[0,0], to:[1,1], san:'axb5' }],
  ['r2qk1nr/1ppp1ppp/p1n5/1b2p3/1bB1P3/5N2/2PP1PPP/RNBQK2R b KQkq - 0 6', "Evans Gambit Declined", { from:[3,1], to:[2,2], san:'Bxc4' }],
  ['r2qk1nr/1ppp1ppp/p1n5/4p3/1bB1P3/2P2N2/3P1PPP/RNBQK2R b KQkq - 0 7', "Evans Gambit Declined", { from:[3,1], to:[2,0], san:'Ba5' }],

  // #87: King's Gambit Declined: Falkbeer Countergambit
  ['rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq f3 0 2', "King's Gambit Declined", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/pppp1ppp/8/3Pp3/4P3/8/PPP2PPP/RNBQKBNR b KQkq - 0 3', "Falkbeer Countergambit", { from:[1,2], to:[3,2], san:'c6' }],
  ['rnbqkbnr/pp3ppp/2p5/3Pp3/4P3/8/PPP2PPP/RNBQKBNR w KQkq - 0 4', "Falkbeer Countergambit", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkbnr/pp3ppp/2p5/3Pp3/4P3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 4', "Falkbeer Countergambit", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pp3ppp/2p2n2/3Pp3/4P3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 5', "Falkbeer Countergambit", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/pp3ppp/2p2n2/3Pp3/4P3/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 3 5', "Falkbeer Countergambit", { from:[2,5], to:[4,4], san:'Be7' }],

  // #88: Ponziani Opening
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', "Ponziani Opening", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', "Ponziani Opening", { from:[6,2], to:[4,2], san:'c3' }],
  ['r1bqkbnr/pppp1ppp/2n5/4p3/4P3/2P2N2/PP1P1PPP/RNBQKB1R b KQkq - 0 3', "Ponziani Opening", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2P2N2/PP1P1PPP/RNBQKB1R w KQkq - 1 4', "Ponziani Opening", { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/2P2N2/PP3PPP/RNBQKB1R b KQkq - 0 4', "Ponziani Opening", { from:[2,4], to:[3,3], san:'Nxe4' }],
  ['r1bqkb1r/pppp1ppp/2n5/4p3/3Pn3/2P2N2/PP3PPP/RNBQKB1R w KQkq - 0 5', "Ponziani Opening", { from:[3,3], to:[4,4], san:'d5' }],
  ['r1bqkb1r/pppp1ppp/2n5/3Pp3/4n3/2P2N2/PP3PPP/RNBQKB1R b KQkq - 0 5', "Ponziani Opening", { from:[2,5], to:[4,4], san:'Be7' }],

  // --- HYPER-EXPANDED 1. d4 & FLANK SYSTEMS ---

  // #89: Benoni Defense: Old Benoni
  ['rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2', "Old Benoni", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkb1r/p1pppppp/5n2/1p6/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', "Old Benoni", { from:[6,3], to:[4,3], san:'d5' }],
  ['rnbqkb1r/p1pppppp/5n2/1p1P4/2P5/8/PP2PPPP/RNBQKBNR b KQkq - 0 3', "Old Benoni", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqkb1r/p1pp1ppp/4pn2/1p1P4/2P5/8/PP2PPPP/RNBQKBNR w KQkq - 1 4', "Old Benoni", { from:[2,3], to:[3,3], san:'cxd4' }],
  ['rnbqkb1r/p1pp1ppp/4pn2/1p1P4/3P4/8/PP2PPPP/RNBQKBNR b KQkq - 0 4', "Old Benoni", { from:[7,5], to:[3,1], san:'Bb4+' }],
  ['rnbqk2r/p1pp1ppp/4pn2/1p1P4/1b1P4/8/PP2PPPP/RNBQKBNR w KQkq - 1 5', "Old Benoni", { from:[7,5], to:[4,3], san:'Bd2' }],
  ['rnbqk2r/p1pp1ppp/4pn2/1p1P4/1b1P4/3B4/PP2PPPP/RN1QKBNR b KQkq - 2 5', "Old Benoni", { from:[0,6], to:[2,5], san:'Nxd5' }],

  // #90: Dutch Defense: Ilyin-Zhenevsky System
  ['rnbqkb1r/p1pp1ppp/4pn2/1p1P4/2P5/5N2/PP2PPPP/RNBQKB1R b KQkq - 0 4', "Dutch Ilyin-Zhenevsky", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqkb1r/p1pp1ppp/4p3/1p1P4/2P5/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 5', "Dutch Ilyin-Zhenevsky", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/p1pp1ppp/4p3/1p1P4/2P5/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 1 5', "Dutch Ilyin-Zhenevsky", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbq1b1r/p1pp1ppp/4p3/1p1P4/2P5/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 6', "Dutch Ilyin-Zhenevsky", { from:[4,4], to:[5,5], san:'e4' }],
  ['rnbq1b1r/p1pp1ppp/4p3/1p1P4/2P1P3/2N2N2/PP3PPP/R1BQKB1R b KQkq - 0 6', "Dutch Ilyin-Zhenevsky", { from:[1,1], to:[2,2], san:'b4' }],
  ['rnbq1b1r/p1pp1ppp/4p3/3P4/1pP1P3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 7', "Dutch Ilyin-Zhenevsky", { from:[2,2], to:[0,0], san:'Na4' }],

  // #91: Reti Opening: King's Indian Attack
  ['rnbqkbnr/ppp1pppp/8/3p4/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 2', "Reti Opening", { from:[1,6], to:[3,5], san:'g3' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 1 2', "King's Indian Attack", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/8/5NP1/PPPPPP1P/RNBQKB1R w KQkq - 2 3', "King's Indian Attack", { from:[7,5], to:[6,5], san:'Bg2' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 3 3', "King's Indian Attack", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqk2r/ppp1bppp/4pn2/3p4/8/5NP1/PPPPPPBP/RNBQK2R w KQkq - 4 4', "King's Indian Attack", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbqk2r/ppp1bppp/4pn2/3p4/8/5NP1/PPPPPPBP/RNBQ1RK1 b kq - 5 4', "King's Indian Attack", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/ppp1bppp/4pn2/3p4/8/5NP1/PPPPPPBP/RNBQ1RK1 w - - 6 5', "King's Indian Attack", { from:[6,3], to:[4,3], san:'d3' }],
  ['rnbq1rk1/ppp1bppp/4pn2/3p4/8/3P1NP1/PP2PPBP/RNBQ1RK1 b - - 0 5', "King's Indian Attack", { from:[1,2], to:[3,2], san:'c5' }],

  // #92: Sokolsky Opening (Polish / Orangutan)
  ['rnbqkbnr/pppppppp/8/8/1P6/8/P1PPPPPP/RNBQKBNR b KQkq - 0 1', "Sokolsky Opening", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/1P6/8/P1PPPPPP/RNBQKBNR w KQkq - 0 2', "Sokolsky Opening", { from:[7,5], to:[6,1], san:'Bb2' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/1P6/8/PBPPPPPP/RN1QKBNR b KQkq - 1 2', "Sokolsky Opening", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/1P6/8/PBPPPPPP/RN1QKBNR w KQkq - 2 3', "Sokolsky Opening", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/1P2P3/8/P1PP1PPP/RNBQKBNR b KQkq - 0 3', "Sokolsky Opening", { from:[7,5], to:[4,4], san:'Bf5' }],
  ['rn1qkb1r/ppp1pppp/5n2/3p1b2/1P2P3/8/P1PP1PPP/RNBQKBNR w KQkq - 0 4', "Sokolsky Opening", { from:[4,4], to:[3,3], san:'exd5' }],
  ['rn1qkb1r/ppp1pppp/5n2/3p1b2/1P1P4/8/P1P1PPPP/RNBQKBNR b KQkq - 1 4', "Sokolsky Opening", { from:[1,4], to:[2,4], san:'e6' }],

  // #93: English Defense
  ['rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2', "English Defense", { from:[1,4], to:[3,4], san:'b6' }],
  ['rnbqkb1r/p1pppppp/1p3n2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', "English Defense", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/p1pppppp/1p3n2/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', "English Defense", { from:[7,5], to:[2,0], san:'Bb7' }],
  ['rnbqkbnr/p2ppppp/1p3n2/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4', "English Defense", { from:[6,3], to:[4,3], san:'d5' }],
  ['rnbqkbnr/p2ppppp/1p3n2/2pP4/2P5/2N5/PP2PPPP/R1BQKBNR b KQkq - 0 4', "English Defense", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqkbnr/p2p1ppp/1p2p3/2pP4/2P5/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 5', "English Defense", { from:[4,4], to:[5,5], san:'e4' }],
  ['rnbqkbnr/p2p1ppp/1p2p3/2pP4/2P1P3/2N5/PP3PPP/R1BQKBNR b KQkq - 0 5', "English Defense", { from:[3,3], to:[4,4], san:'dxe4' }],

  // #94: Van't Kruijs Opening
  ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', "Van't Kruijs Opening", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 1', "Van't Kruijs Opening", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/8/4P3/PPPP1PPP/RNBQKBNR w KQkq - 0 2', "Van't Kruijs Opening", { from:[6,3], to:[4,3], san:'d4' }], // Transposes to French
  ['rnbqkbnr/ppp1pppp/8/3p4/3P4/4P3/PPP2PPP/RNBQKBNR b KQkq - 0 2', "Van't Kruijs Opening", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/3P4/4P3/PPP2PPP/RNBQKBNR w KQkq - 1 3', "Van't Kruijs Opening", { from:[7,6], to:[5,5], san:'Nf3' }],

  // #95: Amar Opening (Paris Gambit)
  ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', "Amar Opening", { from:[7,7], to:[5,7], san:'Nh3' }],
  ['rnbqkbnr/pppppppp/8/8/8/7N/PPPPPPPP/RNBQKB1R b KQkq - 1 1', "Amar Opening", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/8/7N/PPPPPPPP/RNBQKB1R w KQkq - 0 2', "Amar Opening", { from:[1,6], to:[3,5], san:'g3' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/8/6PN/PPPPPP1P/RNBQKB1R b KQkq - 1 2', "Amar Opening", { from:[1,4], to:[3,4], san:'e5' }],
  ['rnbqkbnr/ppp2ppp/8/3pp3/8/6PN/PPPPPP1P/RNBQKB1R w KQkq - 0 3', "Paris Gambit", { from:[6,5], to:[4,5], san:'f4' }],
  ['rnbqkbnr/ppp2ppp/8/3pp3/5P2/6PN/PPPPP2P/RNBQKB1R b KQkq - 0 3', "Paris Gambit", { from:[4,4], to:[5,5], san:'exf4' }],

  // #96: Durkin Opening (Sodium Attack)
  ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', "Durkin Opening", { from:[7,0], to:[5,0], san:'Na3' }],
  ['rnbqkbnr/pppppppp/8/8/8/N7/PPPPPPPP/R1BQKBNR b KQkq - 1 1', "Durkin Opening", { from:[1,4], to:[3,4], san:'e5' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/8/N7/PPPPPPPP/R1BQKBNR w KQkq - 0 2', "Durkin Opening", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/3P4/N7/PPP1PPPP/R1BQKBNR b KQkq - 0 2', "Durkin Opening", { from:[4,4], to:[3,3], san:'exd4' }],
  ['rnbqkbnr/pppp1ppp/8/8/3p4/N7/PPP1PPPP/R1BQKBNR w KQkq - 0 3', "Durkin Opening", { from:[7,3], to:[3,3], san:'Qxd4' }],

  // #97: Kádas Opening
  ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', "Kádas Opening", { from:[6,7], to:[5,7], san:'h4' }],
  ['rnbqkbnr/pppppppp/8/8/7P/8/PPPPPP1P/RNBQKBNR b KQkq - 0 1', "Kádas Opening", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/7P/8/PPPPPP1P/RNBQKBNR w KQkq - 0 2', "Kádas Opening", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/7P/3B4/PPPPPP1P/RNBQK1NR b KQkq - 1 2', "Kádas Opening", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkbnr/pp2pppp/8/2pp4/7P/3B4/PPPPPP1P/RNBQK1NR w KQkq - 0 3', "Kádas Opening", { from:[6,2], to:[4,2], san:'c3' }],

  // #98: Mieses Opening
  ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', "Mieses Opening", { from:[6,3], to:[4,3], san:'d3' }],
  ['rnbqkbnr/pppppppp/8/8/8/3P4/PPP1PPPP/RNBQKBNR b KQkq - 0 1', "Mieses Opening", { from:[1,4], to:[3,4], san:'e5' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/8/3P4/PPP1PPPP/RNBQKBNR w KQkq - 0 2', "Mieses Opening", { from:[4,4], to:[5,5], san:'e4' }], // Transposes
  ['rnbqkbnr/pppp1ppp/8/4p3/4P3/3P4/PPP2PPP/RNBQKBNR b KQkq - 0 2', "Mieses Opening", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pppp1ppp/5n2/4p3/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq - 1 3', "Mieses Opening", { from:[7,6], to:[5,5], san:'Nf3' }],

  // #99: Ware Opening
  ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', "Ware Opening", { from:[6,0], to:[4,0], san:'a4' }],
  ['rnbqkbnr/pppppppp/8/8/P7/8/1PPPPPPP/RNBQKBNR b KQkq - 0 1', "Ware Opening", { from:[1,4], to:[3,4], san:'e5' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/P7/8/1PPPPPPP/RNBQKBNR w KQkq - 0 2', "Ware Opening", { from:[6,7], to:[5,7], san:'h4' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/P6P/8/1PPPPPP1/RNBQKBNR b KQkq - 0 2', "Ware Opening", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp2ppp/8/3pp3/P6P/8/1PPPPPP1/RNBQKBNR w KQkq - 0 3', "Ware Opening", { from:[4,4], to:[3,3], san:'exd5' }],
  ['rnbqkbnr/ppp2ppp/8/3P4/P6P/8/1PPPPPP1/RNBQKBNR b KQkq - 0 3', "Ware Opening", { from:[7,3], to:[3,3], san:'Qxd5' }],

  // #100: Anderssen's Opening
  ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', "Anderssen's Opening", { from:[6,0], to:[5,0], san:'a3' }],
  ['rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq - 0 1', "Anderssen's Opening", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/8/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 2', "Anderssen's Opening", { from:[7,5], to:[4,2], san:'Bf4' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/5B2/P7/1PPPPPPP/RN1QKBNR b KQkq - 1 2', "Anderssen's Opening", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/5B2/P7/1PPPPPPP/RN1QKBNR w KQkq - 2 3', "Anderssen's Opening", { from:[4,4], to:[5,5], san:'e3' }]
  
  
  
  ,
  // [----------------------------------------------------------------]
  // [         THE ULTIMATE & ENCYCLOPEDIC EXPANSION (FINAL)          ]
  // [----------------------------------------------------------------]

  // --- COVERING THE ITALIAN FOUR KNIGHTS & RELATED LINES ---

  // #101: Four Knights Game: Italian Variation (Covers the miss)
  ['r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4', "Four Knights Game", { from:[7,5], to:[4,2], san:'Bc4' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 5 4', "Four Knights: Italian Variation", { from:[7,5], to:[3,1], san:'Bb4' }],
  ['r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 5', "Four Knights: Italian Variation", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2N2N2/PPPP1PPP/R1BQ1RK1 b kq - 7 5', "Four Knights: Italian Variation", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bq1rk1/pppp1ppp/2n2n2/4p3/1bB1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 8 6', "Four Knights: Italian Variation", { from:[6,3], to:[4,3], san:'d3' }],
  ['r1bq1rk1/pppp1ppp/2n2n2/4p3/1b1PP3/2N2N2/PPP2PPP/R1BQ1RK1 b - - 0 6', "Four Knights: Italian Variation", { from:[1,1], to:[2,2], san:'Bxc3' }],
  ['r1bq1rk1/pppp1ppp/2n2n2/4p3/3PP3/1Pb2N2/P1P2PPP/R1BQ1RK1 w - - 0 7', "Four Knights: Italian Variation", { from:[1,1], to:[2,2], san:'bxc3' }],
  ['r1bq1rk1/pppp1ppp/2n2n2/4p3/3PP3/2P2N2/P1P2PPP/R1BQ1RK1 b - - 0 7', "Four Knights: Italian Variation", { from:[4,4], to:[3,3], san:'exd4' }],

  // --- MAJOR NEW OPENING SYSTEMS ---

  // #102: Closed Sicilian
  ['rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2', "Closed Sicilian", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkbnr/pp1ppppp/8/2p5/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2', "Closed Sicilian", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkbnr/pp1ppppp/2n5/2p5/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 3', "Closed Sicilian", { from:[1,6], to:[3,5], san:'g3' }],
  ['r1bqkbnr/pp1ppppp/2n5/2p5/4P3/2N3P1/PPPP1P1P/R1BQKBNR b KQkq - 0 3', "Closed Sicilian", { from:[1,6], to:[2,6], san:'g6' }],
  ['r1bqkbnr/pp2pppp/2np2p1/2p5/4P3/2N3P1/PPPP1P1P/R1BQKBNR w KQkq - 1 4', "Closed Sicilian", { from:[7,5], to:[6,5], san:'Bg2' }],
  ['r1bqkbnr/pp2pppp/2np2p1/2p5/4P3/2N3P1/PPPPPPBP/R1BQK1NR b KQkq - 3 4', "Closed Sicilian", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['r1bqk2r/pp2ppbp/2np2p1/2p5/4P3/2N3P1/PPPPPPBP/R1BQK1NR w KQkq - 4 5', "Closed Sicilian", { from:[6,3], to:[4,3], san:'d3' }],
  ['r1bqk2r/pp2ppbp/2np2p1/2p5/4P3/2NP2P1/PPP1PPBP/R1BQK1NR b KQkq - 0 5', "Closed Sicilian", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['r1bq1rk1/pp2ppbp/2np1np1/2p5/4P3/2NP2P1/PPP1PPBP/R1BQK1NR w KQ - 1 6', "Closed Sicilian", { from:[6,5], to:[4,5], san:'f4' }],

  // #103: Sicilian: Grand Prix Attack
  ['rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2', "Grand Prix Attack", { from:[6,5], to:[4,5], san:'f4' }],
  ['rnbqkbnr/pp1ppppp/8/2p5/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2', "Grand Prix Attack", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/pp2pppp/8/2pp4/4PP2/8/PPPP2PP/RNBQKBNR w KQkq - 0 3', "Grand Prix Attack", { from:[4,4], to:[3,3], san:'exd5' }],
  ['rnbqkbnr/pp2pppp/8/3p4/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 3', "Grand Prix Attack", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pp2pppp/5n2/3p4/4PP2/8/PPPP2PP/RNBQKBNR w KQkq - 1 4', "Grand Prix Attack", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pp2pppp/5n2/3p4/4PP2/2N5/PPP3PP/R1BQKBNR b KQkq - 0 4', "Grand Prix Attack", { from:[3,3], to:[4,4], san:'dxe4' }],
  ['rnbqkb1r/pp2pppp/5n2/8/3ppP2/2N5/PPP3PP/R1BQKBNR w KQkq - 0 5', "Grand Prix Attack", { from:[7,3], to:[4,4], san:'Qxd4' }],
  ['rnbqkb1r/pp2pppp/5n2/8/3Q1P2/2N5/PPP3PP/R1B1KBNR b KQkq - 0 5', "Grand Prix Attack", { from:[7,3], to:[3,3], san:'Qxd4' }],

  // #104: Colle-Zukertort System
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/3BPN2/PPP2PPP/RNBQK2R b KQkq - 1 4', "Colle-Zukertort", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkb1r/pp3ppp/4pn2/2pp4/3P4/3BPN2/PPP2PPP/RNBQK2R w KQkq - 2 5', "Colle-Zukertort", { from:[6,1], to:[4,1], san:'b3' }],
  ['rnbqkb1r/pp3ppp/4pn2/2pp4/3P4/1P1BPN2/P1P2PPP/RNBQK2R b KQkq - 0 5', "Colle-Zukertort", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P4/1P1BPN2/P1P2PPP/RNBQK2R w KQkq - 1 6', "Colle-Zukertort", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P4/1P1BPN2/P1P2PPP/RNBQ1RK1 b kq - 2 6', "Colle-Zukertort", { from:[3,3], to:[2,2], san:'cxd4' }],
  ['r1bqkb1r/pp3ppp/2n1pn2/8/2pP4/1P1BPN2/P4PPP/RNBQ1RK1 w kq - 0 7', "Colle-Zukertort", { from:[4,4], to:[3,3], san:'exd4' }],

  // #105: QGD: Lasker Defense
  ['r1bq1rk1/pp1nbppp/2p1pn2/3p2B1/2PP4/2N1PN2/PPQ2PPP/R3KB1R b KQ - 4 7', "QGD Orthodox", { from:[2,5], to:[4,4], san:'Ne4' }],
  ['r1bq1rk1/pp1nbppp/2p1p3/3p2B1/2PPn3/2N1PN2/PPQ2PPP/R3KB1R w KQ - 1 8', "QGD: Lasker Defense", { from:[6,6], to:[4,4], san:'Bxe7' }],
  ['r1bq1rk1/pp2bppp/2p1p3/3p4/2PPn3/2N1PN2/PPQ2PPP/R3KB1R b KQ - 0 8', "QGD: Lasker Defense", { from:[7,3], to:[4,4], san:'Qxe7' }],
  ['r1b2rk1/pp2qppp/2p1p3/3p4/2PPn3/2N1PN2/PPQ2PPP/R3KB1R w KQ - 1 9', "QGD: Lasker Defense", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['r1b2rk1/pp2qppp/2p1p3/3p4/2PPn3/2NBPN2/PPQ2PPP/R3K2R b KQ - 2 9', "QGD: Lasker Defense", { from:[1,5], to:[3,5], san:'f5' }],
  ['r1b2rk1/pp2q1pp/2p1p3/3p1p2/2PPn3/2NBPN2/PPQ2PPP/R3K2R w KQ - 0 10', "QGD: Lasker Defense", { from:[7,7], to:[7,5], san:'O-O' }],

  // #106: QGD: Tartakower (Makogonov-Bondarevsky) System
  ['r1bq1rk1/pp1nbppp/2p1pn2/3p2B1/2PP4/2N1PN2/PPQ2PPP/R3KB1R b KQ - 4 7', "QGD Orthodox", { from:[1,7], to:[2,7], san:'h6' }],
  ['r1bq1rk1/pp1nbpp1/2p1pn1p/3p2B1/2PP4/2N1PN2/PPQ2PPP/R3KB1R w KQ - 0 8', "QGD: Tartakower System", { from:[6,6], to:[5,7], san:'Bh4' }],
  ['r1bq1rk1/pp1nbpp1/2p1pn1p/3p4/2PP3B/2N1PN2/PPQ2PPP/R3KB1R b KQ - 1 8', "QGD: Tartakower System", { from:[1,4], to:[3,4], san:'b6' }],
  ['r1bqr1k1/pp1nbpp1/1qp1pn1p/3p4/2PP3B/2N1PN2/PPQ2PPP/R3KB1R w KQ - 2 9', "QGD: Tartakower System", { from:[2,3], to:[3,3], san:'cxd5' }],
  ['r1bqr1k1/pp1nbpp1/1qp1pn1p/3P4/7B/2N1PN2/PPQ2PPP/R3KB1R b KQ - 0 9', "QGD: Tartakower System", { from:[4,4], to:[3,3], san:'exd5' }],
  ['r1bqr1k1/pp1nbpp1/1qp2n1p/3p4/7B/2N1PN2/PPQ2PPP/R3KB1R w KQ - 1 10', "QGD: Tartakower System", { from:[7,5], to:[4,3], san:'Bd3' }],

  // #107: Slav Defense: Geller Gambit
  ['rnbqkb1r/pp2pppp/2p2n2/8/P1pP4/2N2N2/1P2PPPP/R1BQKB1R b KQkq - 0 5', "Slav Defense", { from:[7,5], to:[3,1], san:'Bf5' }],
  ['rn1qkb1r/pp2pppp/2p2n2/5b2/P1pP4/2N2N2/1P2PPPP/R1BQKB1R w KQkq - 1 6', "Slav Geller Gambit", { from:[4,4], to:[5,5], san:'e4' }],
  ['rn1qkb1r/pp2pppp/2p2n2/5b2/P1pPP3/2N2N2/1P3PPP/R1BQKB1R b KQkq - 0 6', "Slav Geller Gambit", { from:[5,5], to:[4,4], san:'Bxe4' }],
  ['rn1qkb1r/pp2pppp/2p2n2/8/P1pPb3/2N2N2/1P3PPP/R1BQKB1R w KQkq - 0 7', "Slav Geller Gambit", { from:[2,2], to:[4,4], san:'Nxe4' }],
  ['rn1qkb1r/pp2pppp/2p2n2/8/P1pPN3/5N2/1P3PPP/R1BQKB1R b KQkq - 0 7', "Slav Geller Gambit", { from:[2,5], to:[4,4], san:'Nxe4' }],
  ['rn1qkb1r/pp2pppp/2p5/8/P1pPn3/5N2/1P3PPP/R1BQKB1R w KQkq - 0 8', "Slav Geller Gambit", { from:[7,5], to:[3,1], san:'Bxc4' }],

  // #108: Staunton Gambit (Dutch Defense)
  ['rnbqkb1r/ppppp1pp/5n2/5p2/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 1 3', "Dutch Defense", { from:[4,4], to:[5,5], san:'e4' }],
  ['rnbqkb1r/ppppp1pp/5n2/5p2/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 3', "Staunton Gambit", { from:[5,5], to:[4,4], san:'fxe4' }],
  ['rnbqkb1r/ppppp2p/5n2/8/2PPp3/8/PP3PPP/RNBQKBNR w KQkq - 0 4', "Staunton Gambit Accepted", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/ppppp2p/5n2/8/2PPp3/2N5/PP3PPP/R1BQKBNR b KQkq - 1 4', "Staunton Gambit Accepted", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbq1b1r/ppppp2p/5n2/8/2PPp3/2N5/PP3PPP/R1BQKBNR w KQkq - 2 5', "Staunton Gambit Accepted", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['rnbq1b1r/ppppp2p/5n2/6p1/2PPp1B1/2N5/PP3PPP/R1BQK1NR b KQkq - 3 5', "Staunton Gambit Accepted", { from:[1,7], to:[2,7], san:'h6' }],

  // #109: Englund Gambit
  ['rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1', "Englund Gambit", { from:[1,4], to:[3,4], san:'e5' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2', "Englund Gambit Accepted", { from:[3,3], to:[4,4], san:'dxe5' }],
  ['rnbqkbnr/pppp1ppp/8/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2', "Englund Gambit Accepted", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkbnr/pppp1ppp/2n5/4P3/8/8/PPPP1PPP/RNBQKBNR w KQkq - 1 3', "Englund Gambit Accepted", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['r1bqkbnr/pppp1ppp/2n5/4P3/8/5N2/PPPP1PPP/RNBQKB1R b KQkq - 2 3', "Englund Gambit Accepted", { from:[7,3], to:[4,4], san:'Qe7' }],
  ['r1b1kbnr/ppppqppp/2n5/4P3/8/5N2/PPPP1PPP/RNBQKB1R w KQkq - 3 4', "Englund Gambit Accepted", { from:[7,5], to:[3,1], san:'Bf4' }],

  // #110: Bird's Opening: From's Gambit Declined
  ['rnbqkbnr/pppp1ppp/8/4p3/5P2/8/PPPPPP1P/RNBQKBNR w KQkq - 0 2', "From's Gambit", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/5P2/5N2/PPPPP1PP/RNBQKB1R b KQkq - 1 2', "Bird's Opening", { from:[0,6], to:[2,5], san:'Nf6' }], // Transposes
  // A true decline
  ['rnbqkbnr/pppp1ppp/8/4p3/5P2/8/PPPPPP1P/RNBQKBNR w KQkq - 0 2', "From's Gambit Declined", { from:[4,4], to:[5,5], san:'e4' }],
  ['rnbqkbnr/pppp1ppp/8/8/4pP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2', "Bird's Opening", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkbnr/ppp2ppp/8/3pp3/4pP2/8/PPPP2PP/RNBQKBNR w KQkq - 0 3', "Bird's Opening", { from:[6,3], to:[4,3], san:'d3' }],
  ['rnbqkbnr/ppp2ppp/8/3pp3/4pP2/3P4/PPP3PP/RNBQKBNR b KQkq - 0 3', "Bird's Opening", { from:[0,6], to:[2,5], san:'Nf6' }],

  // #111: Reti Opening: Advance Variation
  ['rnbqkbnr/ppp1pppp/8/3p4/2P5/5N2/PPPPPPPP/RNBQKB1R b KQkq - 0 2', "Reti Opening", { from:[3,3], to:[4,3], san:'d4' }],
  ['rnbqkbnr/ppp1pppp/8/8/2pP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 3', "Reti Advance Variation", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqkbnr/ppp1pppp/8/8/2pP4/4P3/PP3PPP/RNBQKBNR b KQkq - 0 3', "Reti Advance Variation", { from:[1,4], to:[3,4], san:'b5' }],
  ['rnbqkbnr/p1p1pppp/8/1p6/2pP4/4P3/PP3PPP/RNBQKBNR w KQkq - 0 4', "Reti Advance Variation", { from:[6,0], to:[4,0], san:'a4' }],
  ['rnbqkbnr/p1p1pppp/8/1p6/P1pP4/4P3/1P3PPP/RNBQKBNR b KQkq - 0 4', "Reti Advance Variation", { from:[1,2], to:[3,2], san:'c6' }],
  ['rnbqkbnr/p3pppp/2p5/1p6/P1pP4/4P3/1P3PPP/RNBQKBNR w KQkq - 0 5', "Reti Advance Variation", { from:[1,1], to:[2,2], san:'axb5' }],

  // #112: Sicilian Defense: Smith-Morra Declined
  ['rnbqkbnr/pp2pppp/3p4/8/3pP3/2P2N2/PP3PPP/RNBQKB1R b KQkq - 0 4', "Smith-Morra Declined", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pp2pppp/3p1n2/8/3pP3/2P2N2/PP3PPP/RNBQKB1R w KQkq - 1 5', "Smith-Morra Declined", { from:[2,2], to:[3,3], san:'cxd4' }],
  ['rnbqkb1r/pp2pppp/3p1n2/8/3PP3/5N2/PP3PPP/RNBQKB1R b KQkq - 0 5', "Smith-Morra Declined", { from:[2,5], to:[3,3], san:'Nxe4' }],
  ['rnbqkb1r/pp2pppp/3p4/8/3nP3/5N2/PP3PPP/RNBQKB1R w KQkq - 0 6', "Smith-Morra Declined", { from:[5,3], to:[3,3], san:'Nxd4' }],
  ['rnbqkb1r/pp2pppp/3p4/8/3N4/8/PPP2PPP/RNBQKB1R b KQkq - 0 6', "Smith-Morra Declined", { from:[1,4], to:[2,4], san:'e5' }],
  ['rnbqk2r/pp2bppp/3p4/4p3/3N4/8/PPP2PPP/RNBQKB1R w KQkq - 0 7', "Smith-Morra Declined", { from:[3,3], to:[1,1], san:'Nb3' }],
  
  // #113: Ruy Lopez: Steinitz Defense
  ['r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', "Ruy Lopez: Steinitz", { from:[1,3], to:[2,3], san:'d6' }],
  ['r1bqkbnr/ppp2ppp/2np4/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4', "Ruy Lopez: Steinitz", { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqkbnr/ppp2ppp/2np4/1B2p3/3PP3/5N2/PPP2PPP/RNBQK2R b KQkq - 0 4', "Ruy Lopez: Steinitz", { from:[7,5], to:[3,1], san:'Bd7' }],
  ['r2qkbnr/pppb1ppp/2np4/1B2p3/3PP3/5N2/PPP2PPP/RNBQK2R w KQkq - 1 5', "Ruy Lopez: Steinitz", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['r2qkbnr/pppb1ppp/2np4/1B2p3/3PP3/2N2N2/PPP2PPP/R1BQK2R b KQkq - 2 5', "Ruy Lopez: Steinitz", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['r2qkb1r/pppb1ppp/2np1n2/1B2p3/3PP3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 3 6', "Ruy Lopez: Steinitz", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r2qkb1r/pppb1ppp/2np1n2/1B2p3/3PP3/2N2N2/PPP2PPP/R1BQ1RK1 b kq - 4 6', "Ruy Lopez: Steinitz", { from:[2,5], to:[4,4], san:'Be7' }]
  
  
  
  ,
  // [----------------------------------------------------------------]
  // [                 NEW EXPANSION PACK (35 LINES)                  ]
  // [----------------------------------------------------------------]

  // --- NEW LINES FOR 1. e4 OPENINGS ---

  // #1: Scotch Game: Schmidt Variation
  ['r1bqkbnr/pppp1ppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4', "Scotch Game: Schmidt Variation", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5', "Scotch Game: Schmidt Variation", { from:[3,3], to:[2,2], san:'Nxc6' }],
  ['r1bqkb1r/pppp1ppp/2N2n2/8/4P3/8/PPP2PPP/RNBQKB1R b KQkq - 0 5', "Scotch Game: Schmidt Variation", { from:[1,1], to:[2,2], san:'bxc6' }],
  ['r1bqkb1r/p1pp1ppp/2p2n2/8/4P3/8/PPP2PPP/RNBQKB1R w KQkq - 0 6', "Scotch Game: Schmidt Variation", { from:[7,4], to:[5,4], san:'Bd3' }],
  ['r1bqkb1r/p1pp1ppp/2p2n2/8/4P3/3B4/PPP2PPP/RNBQK2R b KQkq - 1 6', "Scotch Game: Schmidt Variation", { from:[1,3], to:[3,3], san:'d5' }],
  ['r1bqkb1r/p1p2ppp/2p2n2/3p4/4P3/3B4/PPP2PPP/RNBQK2R w KQkq - 0 7', "Scotch Game: Schmidt Variation", { from:[4,4], to:[3,3], san:'exd5' }],
  ['r1bqkb1r/p1p2ppp/2p2n2/3P4/8/3B4/PPP2PPP/RNBQK2R b KQkq - 0 7', "Scotch Game: Schmidt Variation", { from:[2,2], to:[3,3], san:'cxd5' }],
  ['r1bqkb1r/p4ppp/5n2/3p4/8/3B4/PPP2PPP/RNBQK2R w KQkq - 0 8', "Scotch Game: Schmidt Variation", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bqkb1r/p4ppp/5n2/3p4/8/3B4/PPP2PPP/RNBQ1RK1 b kq - 1 8', "Scotch Game: Schmidt Variation", { from:[2,5], to:[4,4], san:'Be7' }],
  ['r1bqk2r/p3bppp/5n2/3p4/8/3B4/PPP2PPP/RNBQ1RK1 w kq - 2 9', "Scotch Game: Schmidt Variation", { from:[7,1], to:[5,2], san:'Nc3' }],

  // #2: Giuoco Pianissimo (Quiet Italian)
  ['r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', "Italian: Giuoco Pianissimo", { from:[6,3], to:[4,3], san:'d3' }],
  ['r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 0 4', "Italian: Giuoco Pianissimo", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 1 5', "Italian: Giuoco Pianissimo", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R b KQkq - 2 5', "Italian: Giuoco Pianissimo", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 3 6', "Italian: Giuoco Pianissimo", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 b kq - 4 6', "Italian: Giuoco Pianissimo", { from:[1,3], to:[2,3], san:'d6' }],
  ['r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w kq - 0 7', "Italian: Giuoco Pianissimo", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['r1bqk2r/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 b kq - 1 7', "Italian: Giuoco Pianissimo", { from:[1,7], to:[2,7], san:'h6' }],
  ['r1bqk2r/ppp2pp1/2np1n1p/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w kq - 0 8', "Italian: Giuoco Pianissimo", { from:[6,6], to:[5,7], san:'Bh4' }],
  ['r1bqk2r/ppp2pp1/2np1n1p/2b1p3/2B1P2B/2NP1N2/PPP2PPP/R2Q1RK1 b kq - 1 8', "Italian: Giuoco Pianissimo", { from:[1,6], to:[2,6], san:'g5' }],

  // #3: Sicilian Defense: Kalashnikov Variation
  ['rnbqkb1r/pp1ppppp/5n2/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 2 3', "Sicilian: Kalashnikov Variation", { from:[1,4], to:[3,4], san:'e5' }],
  ['rnbqkb1r/pp1p1ppp/5n2/2p1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq e6 0 4', "Sicilian: Kalashnikov Variation", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkb1r/pp1p1ppp/5n2/2p1p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 4', "Sicilian: Kalashnikov Variation", { from:[2,5], to:[3,3], san:'cxd4' }],
  ['rnbqkb1r/pp1p1ppp/5n2/4p3/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 5', "Sicilian: Kalashnikov Variation", { from:[5,3], to:[3,3], san:'Nxd4' }],
  ['rnbqkb1r/pp1p1ppp/5n2/4p3/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 5', "Sicilian: Kalashnikov Variation", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pp1p1ppp/2n2n2/4p3/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 6', "Sicilian: Kalashnikov Variation", { from:[3,3], to:[2,2], san:'Nxc6' }],
  ['r1bqkb1r/pp1p1ppp/2N2n2/4p3/4P3/8/PPP2PPP/RNBQKB1R b KQkq - 0 6', "Sicilian: Kalashnikov Variation", { from:[1,1], to:[2,2], san:'bxc6' }],
  ['r1bqkb1r/p2p1ppp/2p2n2/4p3/4P3/8/PPP2PPP/RNBQKB1R w KQkq - 0 7', "Sicilian: Kalashnikov Variation", { from:[7,4], to:[5,4], san:'Bd3' }],
  ['r1bqkb1r/p2p1ppp/2p2n2/4p3/4P3/3B4/PPP2PPP/RNBQK2R b KQkq - 1 7', "Sicilian: Kalashnikov Variation", { from:[1,3], to:[2,3], san:'d5' }],

  // #4: Ruy Lopez: Cozio Defense Deferred
  ['r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', "Ruy Lopez: Cozio Defense Deferred", { from:[1,0], to:[3,0], san:'a6' }],
  ['r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4', "Ruy Lopez: Cozio Defense Deferred", { from:[3,1], to:[2,0], san:'Ba4' }],
  ['r1bqkbnr/1ppp1ppp/p1n5/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4', "Ruy Lopez: Cozio Defense Deferred", { from:[2,5], to:[4,4], san:'Nge7' }],
  ['r1bqk2r/1pppnpbp/p1n3p1/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 2 6', "Ruy Lopez: Cozio Defense Deferred", { from:[6,2], to:[4,2], san:'c3' }],
  ['r1bqk2r/1pppnpbp/p1n3p1/4p3/B3P3/2P2N2/PP1P1PPP/RNBQ1RK1 b kq - 0 6', "Ruy Lopez: Cozio Defense Deferred", { from:[1,4], to:[3,4], san:'b5' }],
  ['r1bqk2r/2ppnpbp/p1n3p1/1p2p3/B3P3/2P2N2/PP1P1PPP/RNBQ1RK1 w kq - 0 7', "Ruy Lopez: Cozio Defense Deferred", { from:[2,0], to:[1,1], san:'Bb3' }],
  ['r1bqk2r/2ppnpbp/p1n3p1/1p2p3/8/1BP2N2/PP1P1PPP/RNBQ1RK1 b kq - 1 7', "Ruy Lopez: Cozio Defense Deferred", { from:[1,3], to:[3,3], san:'d5' }],
  ['r1bqk2r/2p1npbp/p1n3p1/1p1pp3/8/1BP2N2/PP1P1PPP/RNBQ1RK1 w kq - 0 8', "Ruy Lopez: Cozio Defense Deferred", { from:[4,4], to:[3,3], san:'exd5' }],
  ['r1bqk2r/2p1npbp/p1n3p1/1p1Pp3/8/1BP2N2/PP1P1PPP/RNBQ1RK1 b kq - 0 8', "Ruy Lopez: Cozio Defense Deferred", { from:[2,4], to:[3,3], san:'Nxd5' }],

  // #5: French Defense: Rubinstein Variation
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', "French Defense: Rubinstein", { from:[7,1], to:[4,3], san:'Nd2' }],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/3N4/PPP2PPP/RNBQKB1R b KQkq - 1 3', "French Defense: Rubinstein", { from:[3,3], to:[4,4], san:'dxe4' }],
  ['rnbqkbnr/ppp2ppp/4p3/8/3Pp3/3N4/PPP2PPP/RNBQKB1R w KQkq - 0 4', "French Defense: Rubinstein", { from:[3,3], to:[4,4], san:'Nxe4' }],
  ['rnbqkbnr/ppp2ppp/4p3/8/4N3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4', "French Defense: Rubinstein", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp2ppp/4pn2/8/4N3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5', "French Defense: Rubinstein", { from:[4,4], to:[2,2], san:'Nxf6+' }],
  ['rnbqkb1r/ppp2ppp/4pB2/8/8/8/PPP2PPP/RN1QKBNR b KQkq - 0 5', "French Defense: Rubinstein", { from:[7,3], to:[5,5], san:'Qxf6' }],
  ['rnb1kb1r/ppp2ppp/4pq2/8/8/8/PPP2PPP/RN1QKBNR w KQkq - 0 6', "French Defense: Rubinstein", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnb1kb1r/ppp2ppp/4pq2/8/8/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 6', "French Defense: Rubinstein", { from:[7,5], to:[3,1], san:'Bb4' }],
  ['rnb1k2r/ppp2ppp/4pq2/8/1b6/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 7', "French Defense: Rubinstein", { from:[7,3], to:[3,3], san:'Qd2' }],
  ['rnb1k2r/ppp2ppp/4pq2/8/1b6/2N5/PPPQ1PPP/R1B1KBNR b KQkq - 2 7', "French Defense: Rubinstein", { from:[7,7], to:[7,5], san:'O-O' }],

  // #6: Alekhine's Defense: Modern Variation
  ['rnbqkb1r/pppppppp/5n2/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2', "Alekhine's Defense", { from:[2,5], to:[3,3], san:'Nd5' }],
  ['rnbqkb1r/pppppppp/8/3n4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 3', "Alekhine's Defense: Modern", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkb1r/pppppppp/8/3n4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 3', "Alekhine's Defense: Modern", { from:[1,3], to:[2,3], san:'d6' }],
  ['rnbqkb1r/ppp1pppp/3p4/3n4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 4', "Alekhine's Defense: Modern", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/ppp1pppp/3p4/3n4/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 1 4', "Alekhine's Defense: Modern", { from:[7,5], to:[6,6], san:'Bg4' }],
  ['rnbqkb1r/ppp2ppp/3p4/3n4/3Pp2B/5N2/PPP1PPPP/RN1QKB1R w KQkq - 2 5', "Alekhine's Defense: Modern", { from:[7,5], to:[4,3], san:'Be2' }],
  ['rnbqkb1r/ppp2ppp/3p4/3n4/3Pp2B/4PN2/PPP1BPPP/RN1QK2R b KQkq - 3 5', "Alekhine's Defense: Modern", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnbqk2r/ppp1bppp/3p4/3n4/3Pp2B/4PN2/PPP1BPPP/RN1QK2R w KQkq - 0 6', "Alekhine's Defense: Modern", { from:[5,7], to:[4,4], san:'Bxe7' }],
  ['rnbqk2r/ppp1Bppp/3p4/3n4/3Pp3/4PN2/PPP1BPPP/RN1QK2R b KQkq - 0 6', "Alekhine's Defense: Modern", { from:[7,3], to:[4,4], san:'Qxe7' }],
  ['rnb1k2r/ppp1qppp/3p4/3n4/3Pp3/4PN2/PPP1BPPP/RN1QK2R w KQkq - 0 7', "Alekhine's Defense: Modern", { from:[5,3], to:[3,3], san:'Nfd2' }],

  // #7: Petroff Defense: Cochrane Gambit
  ['rnbqkb1r/ppp2ppp/3p1n2/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 4', "Petroff Defense", { from:[2,5], to:[4,4], san:'Nxe4' }],
  ['rnbqkb1r/ppp2ppp/3p4/8/4n3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 5', "Petroff: Cochrane Gambit", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkb1r/ppp2ppp/3p4/8/3Pn3/5N2/PP3PPP/RNBQKB1R b KQkq - 0 5', "Petroff: Cochrane Gambit", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkb1r/ppp2ppp/8/3p4/3Pn3/5N2/PP3PPP/RNBQKB1R w KQkq - 0 6', "Petroff: Cochrane Gambit", { from:[5,3], to:[2,2], san:'Nxf7' }],
  ['rnbqkb1r/ppp2Npp/8/3p4/3Pn3/8/PP3PPP/RNBQKB1R b KQkq - 0 6', "Petroff: Cochrane Gambit", { from:[7,4], to:[5,5], san:'Kxf7' }],
  ['rnbqkb1r/ppp2kpp/8/3p4/3Pn3/8/PP3PPP/RNBQKB1R w KQ - 0 7', "Petroff: Cochrane Gambit", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['rnbqkb1r/ppp2kpp/8/3p4/3Pn3/3B4/PP3PPP/RNBQK2R b KQ - 1 7', "Petroff: Cochrane Gambit", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp2kpp/5n2/3p4/3P4/3B4/PP3PPP/RNBQK2R w KQ - 2 8', "Petroff: Cochrane Gambit", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbqkb1r/ppp2kpp/5n2/3p4/3P4/3B4/PP3PPP/RNBQ1RK1 b Q - 3 8', "Petroff: Cochrane Gambit", { from:[2,5], to:[4,4], san:'Be7' }],

  // #8: Caro-Kann Defense: Two Knights Variation
  ['rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', "Caro-Kann Defense", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkbnr/pp2pppp/2p5/3p4/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 1 3', "Caro-Kann: Two Knights", { from:[3,3], to:[4,4], san:'dxe4' }],
  ['rnbqkbnr/pp2pppp/2p5/8/3Pp3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4', "Caro-Kann: Two Knights", { from:[5,3], to:[4,4], san:'Nxe4' }],
  ['rnbqkbnr/pp2pppp/2p5/8/4N3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4', "Caro-Kann: Two Knights", { from:[0,1], to:[2,2], san:'Nd7' }],
  ['r2qkbnr/pp1npppp/2p5/8/4N3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5', "Caro-Kann: Two Knights", { from:[4,4], to:[3,1], san:'Ng3' }],
  ['r2qkbnr/pp1npppp/2p5/8/8/6N1/PPP2PPP/RNBQKB1R b KQkq - 1 5', "Caro-Kann: Two Knights", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['r2qkb1r/pp1n1ppp/2p2n2/8/8/6N1/PPP2PPP/RNBQKB1R w KQkq - 0 6', "Caro-Kann: Two Knights", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['r2qkb1r/pp1n1ppp/2p2n2/8/8/3B2N1/PPP2PPP/R1BQK2R b KQkq - 2 6', "Caro-Kann: Two Knights", { from:[2,5], to:[4,4], san:'Be7' }],
  ['r2qk2r/pp1nbppp/2p2n2/8/8/3B2N1/PPP2PPP/R1BQK2R w KQkq - 3 7', "Caro-Kann: Two Knights", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r2qk2r/pp1nbppp/2p2n2/8/8/3B2N1/PPP2PPP/R1BQ1RK1 b kq - 4 7', "Caro-Kann: Two Knights", { from:[7,7], to:[7,5], san:'O-O' }],

  // #9: Scandinavian Defense: Mieses-Kotroc Variation
  ['rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2', "Scandinavian Defense", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp1pppp/5n2/3P4/8/8/PPPP1PPP/RNBQKBNR w KQkq - 1 3', "Scandinavian: Mieses-Kotroc", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkb1r/ppp1pppp/5n2/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3', "Scandinavian: Mieses-Kotroc", { from:[2,5], to:[3,3], san:'Nxd5' }],
  ['rnbqkb1r/ppp1pppp/8/3n4/3P4/8/PP2PPPP/RNBQKBNR w KQkq - 0 4', "Scandinavian: Mieses-Kotroc", { from:[6,2], to:[4,2], san:'c4' }],
  ['rnbqkb1r/ppp1pppp/8/3n4/2PP4/8/PP3PPP/RNBQKBNR b KQkq - 0 4', "Scandinavian: Mieses-Kotroc", { from:[3,3], to:[1,1], san:'Nb6' }],
  ['rnbqkb1r/ppp1pppp/1n6/8/2PP4/8/PP3PPP/RNBQKBNR w KQkq - 1 5', "Scandinavian: Mieses-Kotroc", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/ppp1pppp/1n6/8/2PP4/2N5/PP3PPP/R1BQKBNR b KQkq - 2 5', "Scandinavian: Mieses-Kotroc", { from:[1,4], to:[2,4], san:'e5' }],
  ['rnbqkb1r/ppp2ppp/1n6/4p3/2PP4/2N5/PP3PPP/R1BQKBNR w KQkq e6 0 6', "Scandinavian: Mieses-Kotroc", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/ppp2ppp/1n6/4p3/2PP4/2N2N2/PP3PPP/R1BQKB1R b KQkq - 1 6', "Scandinavian: Mieses-Kotroc", { from:[4,4], to:[3,3], san:'exd4' }],
  ['rnbqkb1r/ppp2ppp/1n6/8/2Pp4/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 7', "Scandinavian: Mieses-Kotroc", { from:[7,3], to:[3,3], san:'Qxd4' }],

  // #10: Ruy Lopez: Schliemann Defense
  ['r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', "Ruy Lopez: Schliemann Defense", { from:[1,5], to:[3,5], san:'f5' }],
  ['r1bqkbnr/pppp2pp/2n5/1B2pp2/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4', "Ruy Lopez: Schliemann Defense", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['r1bqkbnr/pppp2pp/2n5/1B2pp2/4P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 1 4', "Ruy Lopez: Schliemann Defense", { from:[5,5], to:[4,4], san:'fxe4' }],
  ['r1bqkbnr/pppp2pp/2n5/1B6/4p3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 5', "Ruy Lopez: Schliemann Defense", { from:[5,3], to:[4,4], san:'Nxe4' }],
  ['r1bqkbnr/pppp2pp/2n5/1B6/4N3/5N2/PPPP1PPP/R1BQK2R b KQkq - 0 5', "Ruy Lopez: Schliemann Defense", { from:[1,3], to:[3,3], san:'d5' }],
  ['r1bqkbnr/ppp3pp/2n5/1B1pp3/4N3/5N2/PPPP1PPP/R1BQK2R w KQkq - 0 6', "Ruy Lopez: Schliemann Defense", { from:[4,4], to:[2,2], san:'Nxc6' }],
  ['r1bqkbnr/ppp3pp/2N5/1B1pp3/8/5N2/PPPP1PPP/R1BQK2R b KQkq - 0 6', "Ruy Lopez: Schliemann Defense", { from:[1,1], to:[2,2], san:'bxc6' }],
  ['r1bqkbnr/p1p3pp/2p5/1B1pp3/8/5N2/PPPP1PPP/R1BQK2R w KQkq - 0 7', "Ruy Lopez: Schliemann Defense", { from:[3,1], to:[4,4], san:'Bxc6+' }],
  ['r1bqkbnr/p1p3pp/2B5/3pp3/8/5N2/PPPP1PPP/R1BQK2R b KQkq - 0 7', "Ruy Lopez: Schliemann Defense", { from:[2,5], to:[4,4], san:'Bd7' }],

  // --- NEW LINES FOR 1. d4 OPENINGS ---

  // #11: Queen's Gambit Declined: Exchange Variation, Positional Line
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 3 4', "QGD Exchange: Positional", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 4 5', "QGD Exchange: Positional", { from:[2,3], to:[3,3], san:'cxd5' }],
  ['rnbqk2r/ppp1bppp/4pn2/3P4/3P4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 0 5', "QGD Exchange: Positional", { from:[4,4], to:[3,3], san:'exd5' }],
  ['rnbqk2r/ppp1bppp/8/3p4/3P4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 6', "QGD Exchange: Positional", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['rnbqk2r/ppp1bppp/8/3p2B1/3P4/2N2N2/PP2PPPP/R2QKB1R b KQkq - 1 6', "QGD Exchange: Positional", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/ppp1bppp/8/3p2B1/3P4/2N2N2/PP2PPPP/R2QKB1R w KQ - 2 7', "QGD Exchange: Positional", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbq1rk1/ppp1bppp/8/3p2B1/3P4/2N1PN2/PP3PPP/R2QKB1R b KQ - 0 7', "QGD Exchange: Positional", { from:[1,2], to:[3,2], san:'c6' }],
  ['rnbq1rk1/pp2bppp/2p5/3p2B1/3P4/2N1PN2/PP3PPP/R2QKB1R w KQ - 0 8', "QGD Exchange: Positional", { from:[7,3], to:[4,2], san:'Qc2' }],
  ['rnbq1rk1/pp2bppp/2p5/3p2B1/3P4/2N1PN2/PPQ2PPP/R3KB1R b KQ - 1 8', "QGD Exchange: Positional", { from:[0,1], to:[2,2], san:'Nbd7' }],

  // #12: Nimzo-Indian Defense: Sämisch Variation
  ['rnbqk2r/pppp1ppp/4pn2/8/1b1P4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4', "Nimzo-Indian: Sämisch Variation", { from:[6,0], to:[4,0], san:'a3' }],
  ['rnbqk2r/pppp1ppp/4pn2/8/1b1P4/P1N5/1PP1PPPP/R1BQKBNR b KQkq - 0 4', "Nimzo-Indian: Sämisch Variation", { from:[3,1], to:[2,2], san:'Bxc3+' }],
  ['rnbqk2r/pppp1ppp/4pn2/8/3P4/P1b5/1PP1PPPP/R1BQKBNR w KQkq - 0 5', "Nimzo-Indian: Sämisch Variation", { from:[1,1], to:[2,2], san:'bxc3' }],
  ['rnbqk2r/pppp1ppp/4pn2/8/3P4/P1P5/2P1PPPP/R1BQKBNR b KQkq - 0 5', "Nimzo-Indian: Sämisch Variation", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqk2r/p2p1ppp/4pn2/1pp5/3P4/P1P5/2P1PPPP/R1BQKBNR w KQkq - 0 6', "Nimzo-Indian: Sämisch Variation", { from:[6,5], to:[4,5], san:'f3' }],
  ['rnbqk2r/p2p1ppp/4pn2/1pp5/3P4/P1P2P2/2P1P1PP/R1BQKBNR b KQkq - 0 6', "Nimzo-Indian: Sämisch Variation", { from:[7,3], to:[1,1], san:'Qb6' }],
  ['rnb1k2r/p2p1ppp/1q2pn2/1pp5/3P4/P1P2P2/2P1P1PP/R1BQKBNR w KQkq - 1 7', "Nimzo-Indian: Sämisch Variation", { from:[4,4], to:[5,5], san:'e4' }],
  ['rnb1k2r/p2p1ppp/1q2pn2/1pp5/3PP3/P1P2P2/2P3PP/R1BQKBNR b KQkq - 0 7', "Nimzo-Indian: Sämisch Variation", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1b1k2r/p2p1ppp/1qn1pn2/1pp5/3PP3/P1P2P2/2P3PP/R1BQKBNR w KQkq - 1 8', "Nimzo-Indian: Sämisch Variation", { from:[7,4], to:[5,4], san:'Be2' }],

  // #13: Grünfeld Defense: Taimanov Variation
  ['rnbqkb1r/ppp1pp1p/8/3n4/8/2N5/PP1PPPPP/R1BQKBNR w KQkq - 0 5', "Grünfeld Defense: Taimanov", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/ppp1pp1p/8/3n4/8/2N2N2/PP1PPPPP/R1BQKB1R b KQkq - 1 5', "Grünfeld Defense: Taimanov", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/ppp1pp1p/8/3n4/8/2N2N2/PP1PPPPP/R1BQKB1R w KQkq - 3 6', "Grünfeld Defense: Taimanov", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqk2r/ppp1pp1p/8/3n4/8/2N1PN2/PP1P1PPP/R1BQKB1R b KQkq - 0 6', "Grünfeld Defense: Taimanov", { from:[3,3], to:[2,2], san:'Nxc3' }],
  ['rnbqk2r/ppp1pp1p/8/8/8/2n1PN2/PP1P1PPP/R1BQKB1R w KQkq - 0 7', "Grünfeld Defense: Taimanov", { from:[1,1], to:[2,2], san:'bxc3' }],
  ['rnbqk2r/ppp1pp1p/8/8/8/2P1PN2/P2P1PPP/R1BQKB1R b KQkq - 0 7', "Grünfeld Defense: Taimanov", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqk2r/p2ppp1p/8/1pp5/8/2P1PN2/P2P1PPP/R1BQKB1R w KQkq - 0 8', "Grünfeld Defense: Taimanov", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['rnbqk2r/p2ppp1p/8/1pp5/8/2PBPB2/P2P1PPP/R1BQK2R b KQkq - 1 8', "Grünfeld Defense: Taimanov", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqk2r/p2ppp1p/2n5/1pp5/8/2PBPB2/P2P1PPP/R1BQK2R w KQkq - 2 9', "Grünfeld Defense: Taimanov", { from:[7,7], to:[7,5], san:'O-O' }],

  // #14: Slav Defense: Chameleon Variation
  ['rnbqkb1r/pp2pppp/2p2n2/8/P1pP4/2N2N2/1P2PPPP/R1BQKB1R b KQkq - 0 5', "Slav Defense: Chameleon", { from:[0,1], to:[2,2], san:'Nbd7' }],
  ['r2qkb1r/pp1npppp/2p2n2/8/P1pP4/2N2N2/1P2PPPP/R1BQKB1R w KQkq - 1 6', "Slav Defense: Chameleon", { from:[4,4], to:[5,5], san:'e3' }],
  ['r2qkb1r/pp1npppp/2p2n2/8/P1pP4/2N1PN2/1P3PPP/R1BQK2R b KQkq - 0 6', "Slav Defense: Chameleon", { from:[7,3], to:[4,2], san:'Qc7' }],
  ['r2q1b1r/pp1nkppp/2p2n2/8/P1pP4/2N1PN2/1P3PPP/R1BQK2R w KQ - 1 7', "Slav Defense: Chameleon", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r2q1b1r/pp1nkppp/2p2n2/8/P1pP4/2N1PN2/1P3PPP/R1BQ1RK1 b Q - 2 7', "Slav Defense: Chameleon", { from:[1,6], to:[2,6], san:'g6' }],
  ['r2q1b1r/pp1nkp1p/2p2np1/8/P1pP4/2N1PN2/1P3PPP/R1BQ1RK1 w Q - 0 8', "Slav Defense: Chameleon", { from:[4,4], to:[5,5], san:'e4' }],
  ['r2q1b1r/pp1nkp1p/2p2np1/8/P1pPP3/2N1PN2/1P4PP/R1BQ1RK1 b Q - 0 8', "Slav Defense: Chameleon", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['r2q1rk1/pp1nkpbp/2p2np1/8/P1pPP3/2N1PN2/1P4PP/R1BQ1RK1 w Q - 1 9', "Slav Defense: Chameleon", { from:[5,3], to:[5,5], san:'Nxf6+' }],
  ['r2q1rk1/pp1nkpbp/2p2N2/8/P1pPP3/2N5/1P4PP/R1BQ1RK1 b Q - 0 9', "Slav Defense: Chameleon", { from:[6,5], to:[5,5], san:'Bxf6' }],

  // #15: King's Indian Defense: Averbakh Variation
  ['rnbq1rk1/ppp1pp1p/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 2 6', "KID: Averbakh Variation", { from:[7,4], to:[5,4], san:'Be2' }],
  ['rnbq1rk1/ppp1pp1p/3p1np1/8/2PPP3/2N1BN2/PP3PPP/R2QKB1R b KQ - 3 6', "KID: Averbakh Variation", { from:[1,4], to:[2,4], san:'e5' }],
  ['rnbq1rk1/ppp2p1p/3p1np1/4p3/2PPP3/2N1BN2/PP3PPP/R2QKB1R w KQ - 0 7', "KID: Averbakh Variation", { from:[6,3], to:[4,3], san:'d5' }],
  ['rnbq1rk1/ppp2p1p/3p1np1/3Pp3/2P1P3/2N1BN2/PP3PPP/R2QKB1R b KQ - 0 7', "KID: Averbakh Variation", { from:[7,5], to:[6,6], san:'Bg4' }],
  ['rnbq1rk1/ppp2p1p/3p1np1/3Pp1B1/2P1P3/2N1BN2/PP3PPP/R2QKB1R w KQ - 1 8', "KID: Averbakh Variation", { from:[7,4], to:[5,4], san:'Be2' }],
  ['rnbq1rk1/ppp2p1p/3p1np1/3Pp1B1/2P1P3/2N1BN2/PP2BPPP/R2QK2R b KQ - 2 8', "KID: Averbakh Variation", { from:[0,1], to:[2,2], san:'Nbd7' }],
  ['r1bq1rk1/pppn1p1p/3p1np1/3Pp1B1/2P1P3/2N1BN2/PP2BPPP/R2QK2R w KQ - 3 9', "KID: Averbakh Variation", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bq1rk1/pppn1p1p/3p1np1/3Pp1B1/2P1P3/2N1BN2/PP2BPPP/R2Q1RK1 b - - 4 9', "KID: Averbakh Variation", { from:[1,0], to:[3,0], san:'a5' }],
  ['r2q1rk1/pppn1p1p/3p1np1/p2Pp1B1/2P1P3/2N1BN2/PP2BPPP/R2Q1RK1 w - - 0 10', "KID: Averbakh Variation", { from:[3,5], to:[4,3], san:'Nd2' }],

  // #16: Catalan Opening: Bogo-Indian Variation
  ['rnbqkb1r/p1pp1ppp/4pn2/8/1pPP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4', "Catalan: Bogo-Indian", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/p1pp1ppp/4pn2/8/1pPP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 1 4', "Catalan: Bogo-Indian", { from:[7,5], to:[3,1], san:'Bb4' }],
  ['rnbqk2r/p1pp1ppp/4pn2/8/1pPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5', "Catalan: Bogo-Indian", { from:[7,4], to:[5,4], san:'Be2' }],
  ['rnbqk2r/p1pp1ppp/4pn2/8/1pPP4/2N1BN2/PP2PPPP/R2QKB1R b KQkq - 3 5', "Catalan: Bogo-Indian", { from:[1,0], to:[3,0], san:'a5' }],
  ['r2qk2r/2pp1ppp/p3pn2/8/1pPP4/2N1BN2/PP2PPPP/R2QKB1R w KQkq - 0 6', "Catalan: Bogo-Indian", { from:[6,0], to:[4,0], san:'a4' }],
  ['r2qk2r/2pp1ppp/p3pn2/8/PpPP4/2N1BN2/1P2PPPP/R2QKB1R b KQkq - 0 6', "Catalan: Bogo-Indian", { from:[3,1], to:[2,2], san:'bxc3' }],
  ['r2qk2r/2pp1ppp/p3pn2/8/2PP4/P1p1BN2/1P2PPPP/R2QKB1R w KQkq - 0 7', "Catalan: Bogo-Indian", { from:[1,1], to:[2,2], san:'bxc3' }],
  ['r2qk2r/2pp1ppp/p3pn2/8/2PP4/P1P1BN2/5PPP/R2QK2R b KQkq - 0 7', "Catalan: Bogo-Indian", { from:[7,7], to:[7,5], san:'O-O' }],

  // #17: Benko Gambit: Zaitsev System
  ['rnbqkb1r/p2ppppp/5n2/1p6/2pP4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 6', "Benko Gambit: Zaitsev", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['rnbqkb1r/p2ppppp/5n2/1p4B1/2pP4/2P2N2/PP2PPPP/RN1QKB1R b KQkq - 1 6', "Benko Gambit: Zaitsev", { from:[7,5], to:[2,0], san:'Bb7' }],
  ['r2qkb1r/pb1ppppp/5n2/1p4B1/2pP4/2P2N2/PP2PPPP/RN1QKB1R w KQkq - 2 7', "Benko Gambit: Zaitsev", { from:[7,1], to:[4,3], san:'Nbd2' }],
  ['r2qkb1r/pb1ppppp/5n2/1p4B1/2pP4/2P2N2/PP1NPPPP/R2QKB1R b KQkq - 3 7', "Benko Gambit: Zaitsev", { from:[1,4], to:[2,4], san:'e6' }],
  ['r2qkb1r/pb1p1ppp/4pn2/1p4B1/2pP4/2P2N2/PP1NPPPP/R2QKB1R w KQkq - 4 8', "Benko Gambit: Zaitsev", { from:[4,4], to:[5,5], san:'e4' }],
  ['r2qkb1r/pb1p1ppp/4pn2/1p4B1/2pPP3/2P2N2/PP1N1PPP/R2QKB1R b KQkq - 0 8', "Benko Gambit: Zaitsev", { from:[1,7], to:[2,7], san:'h6' }],
  ['r2qkb1r/pb1p1p1p/4pn1p/1p4B1/2pPP3/2P2N2/PP1N1PPP/R2QKB1R w KQkq - 0 9', "Benko Gambit: Zaitsev", { from:[6,6], to:[5,7], san:'Bh4' }],
  ['r2qkb1r/pb1p1p1p/4pn1p/1p6/2pPP2B/2P2N2/PP1N1PPP/R2QKB1R b KQkq - 1 9', "Benko Gambit: Zaitsev", { from:[2,5], to:[4,4], san:'Be7' }],
  ['r2qk2r/pb1pbp1p/4pn1p/1p6/2pPP2B/2P2N2/PP1N1PPP/R2QKB1R w KQkq - 2 10', "Benko Gambit: Zaitsev", { from:[7,4], to:[5,4], san:'Be2' }],

  // #18: Modern Benoni: Taimanov Variation
  ['rnbqkb1r/p1pp1ppp/4pn2/1p1P4/2P5/8/PP2PPPP/RNBQKBNR w KQkq - 1 4', "Modern Benoni: Taimanov", { from:[1,1], to:[2,2], san:'b4' }],
  ['rnbqkb1r/p1pp1ppp/4pn2/3P4/1pP5/8/PP2PPPP/RNBQKBNR w KQkq - 0 5', "Modern Benoni: Taimanov", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/p1pp1ppp/4pn2/3P4/1pP5/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 5', "Modern Benoni: Taimanov", { from:[7,5], to:[2,0], san:'Ba6' }],
  ['rnbqk2r/p1pp1ppp/4pn2/3P4/1pP5/5N2/PP1BPPPP/R2QKB1R w KQkq - 3 6', "Modern Benoni: Taimanov", { from:[3,1], to:[2,0], san:'Bxa6' }],
  ['rnbqk2r/p1pp1ppp/B3pn2/3P4/1pP5/5N2/PP1BPPPP/R2QK2R b KQkq - 0 6', "Modern Benoni: Taimanov", { from:[2,5], to:[2,0], san:'Nxa6' }],
  ['r1bqk2r/p1pp1ppp/n3pn2/3P4/1pP5/5N2/PP1BPPPP/R2QK2R w KQkq - 1 7', "Modern Benoni: Taimanov", { from:[3,3], to:[4,3], san:'dxe6' }],
  ['r1bqk2r/p1pp1ppp/n3P3/8/1pP5/5N2/PP1BPPPP/R2QK2R b KQkq - 0 7', "Modern Benoni: Taimanov", { from:[5,5], to:[4,3], san:'fxe6' }],
  ['r1bqk2r/p1pp2pp/n3p3/8/1pP5/5N2/PP1BPPPP/R2QK2R w KQkq - 0 8', "Modern Benoni: Taimanov", { from:[4,4], to:[5,5], san:'e4' }],
  ['r1bqk2r/p1pp2pp/n3p3/8/1pP1P3/5N2/PP1B1PPP/R2QK2R b KQkq - 0 8', "Modern Benoni: Taimanov", { from:[7,7], to:[7,5], san:'O-O' }],

  // #19: Torre Attack: Classical Defense
  ['rnbqkb1r/pppppppp/5n2/8/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq - 2 2', "Torre Attack: Classical", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 3', "Torre Attack: Classical", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p2B1/3P4/5N2/PPP1PPPP/RN1QKB1R b KQkq - 1 3', "Torre Attack: Classical", { from:[2,5], to:[4,4], san:'Ne4' }],
  ['rnbqkb1r/ppp1pppp/8/3p2B1/3Pn3/5N2/PPP1PPPP/RN1QKB1R w KQkq - 2 4', "Torre Attack: Classical", { from:[6,6], to:[5,7], san:'Bh4' }],
  ['rnbqkb1r/ppp1pppp/8/3p4/3Pn2B/5N2/PPP1PPPP/RN1QKB1R b KQkq - 3 4', "Torre Attack: Classical", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkb1r/pp2pppp/8/2pp4/3Pn2B/5N2/PPP1PPPP/RN1QKB1R w KQkq - 0 5', "Torre Attack: Classical", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqkb1r/pp2pppp/8/2pp4/3Pn2B/4PN2/PPP2PPP/RN1QKB1R b KQkq - 1 5', "Torre Attack: Classical", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pp2pppp/2n5/2pp4/3Pn2B/4PN2/PPP2PPP/RN1QKB1R w KQkq - 2 6', "Torre Attack: Classical", { from:[6,2], to:[4,2], san:'c3' }],
  ['r1bqkb1r/pp2pppp/2n5/2pp4/3Pn2B/2P1PN2/PP3PPP/RN1QKB1R b KQkq - 0 6', "Torre Attack: Classical", { from:[7,3], to:[1,1], san:'Qb6' }],

  

,
  // [----------------------------------------------------------------]
  // [         NEW EXPANSION PACK (CONTINUED & FINALIZED)             ]
  // [----------------------------------------------------------------]

  // #20: Dutch Defense: Hopton Attack (Corrected)
  ['rnbqkb1r/ppppp1pp/5n2/5p2/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 1 3', "Dutch Defense: Hopton Attack", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['rnbqkb1r/ppppp1pp/5n2/5pB1/2PP4/8/PP2PPPP/RN1QKBNR b KQkq - 2 3', "Dutch Defense: Hopton Attack", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqk2r/ppppb1pp/4pn2/5pB1/2PP4/8/PP2PPPP/RN1QKBNR w KQkq - 4 4', "Dutch Defense: Hopton Attack", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqk2r/ppppb1pp/4pn2/5pB1/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq - 5 4', "Dutch Defense: Hopton Attack", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/ppppb1pp/4pn2/5pB1/2PP4/2N5/PP2PPPP/R2QKBNR w KQ - 6 5', "Dutch Defense: Hopton Attack", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbq1rk1/ppppb1pp/4pn2/5pB1/2PP4/2N1P3/PP3PPP/R2QKBNR b KQ - 0 5', "Dutch Defense: Hopton Attack", { from:[1,1], to:[3,1], san:'b6' }],
  ['rnbq1rk1/p1ppb1pp/1p2pn2/5pB1/2PP4/2N1P3/PP3PPP/R2QKBNR w KQ - 0 6', "Dutch Defense: Hopton Attack", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbq1rk1/p1ppb1pp/1p2pn2/5pB1/2PP4/2N1PN2/PP3PPP/R2QKB1R b KQ - 1 6', "Dutch Defense: Hopton Attack", { from:[7,5], to:[1,1], san:'Bb7' }],
  ['r2q1rk1/pbppb1pp/1p2pn2/5pB1/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ - 2 7', "Dutch Defense: Hopton Attack", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['r2q1rk1/pbppb1pp/1p2pn2/5pB1/2PP4/2NBPN2/PP3PPP/R2QK2R b KQ - 3 7', "Dutch Defense: Hopton Attack", { from:[1,3], to:[3,3], san:'d5' }],
  ['r2q1rk1/pbppb1pp/1p2pn2/3p1pB1/2PP4/2NBPN2/PP3PPP/R2QK2R w KQ - 0 8', "Dutch Defense: Hopton Attack", { from:[2,3], to:[3,3], san:'cxd5' }],

  // --- NEW FLANK & HYPERMODERN OPENINGS ---

  // #21: English Opening: King's English, Four Knights Variation
  ['rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1', "English: King's English", { from:[1,4], to:[3,4], san:'e5' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w KQkq e6 0 2', "English: King's English", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkbnr/pppp1ppp/8/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR b KQkq - 1 2', "English: King's English", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/pppp1ppp/5n2/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq - 2 3', "English: King's English", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/pppp1ppp/5n2/4p3/2P5/2N2N2/PP1PPPPP/R1BQKB1R b KQkq - 3 3', "English: King's English", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/4p3/2P5/2N2N2/PP1PPPPP/R1BQKB1R w KQkq - 4 4', "English: Four Knights, Fianchetto", { from:[1,6], to:[3,5], san:'g3' }],
  ['r1bqkb1r/pppp1ppp/2n2n2/4p3/2P5/2N2NP1/PP1PPP1P/R1BQKB1R b KQkq - 0 4', "English: Four Knights, Fianchetto", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['r1bqk2r/ppppppbp/2n2n2/6p1/2P5/2N2NP1/PP1PPP1P/R1BQKB1R w KQkq - 1 5', "English: Four Knights, Fianchetto", { from:[7,5], to:[6,5], san:'Bg2' }],
  ['r1bqk2r/ppppppbp/2n2n2/6p1/2P5/2N2NP1/PP1PPPBP/R1BQK2R b KQkq - 2 5', "English: Four Knights, Fianchetto", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bq1rk1/ppppppbp/2n2n2/6p1/2P5/2N2NP1/PP1PPPBP/R1BQK2R w KQ - 3 6', "English: Four Knights, Fianchetto", { from:[7,7], to:[7,5], san:'O-O' }],

  // #22: Reti Opening: New York System
  ['rnbqkbnr/ppp1pppp/8/3p4/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 2', "Reti Opening", { from:[6,2], to:[4,2], san:'c4' }],
  ['rnbqkbnr/ppp1pppp/8/3p4/2P5/5N2/PPPPPPPP/RNBQKB1R b KQkq - 0 2', "Reti Opening", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/2P5/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 3', "Reti Opening: New York System", { from:[6,1], to:[4,1], san:'b3' }],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/2P5/1P3N2/P2PPPPP/RNBQKB1R b KQkq - 0 3', "Reti Opening: New York System", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/2P5/1P3N2/P2PPPPP/RNBQKB1R w KQkq - 1 4', "Reti Opening: New York System", { from:[7,5], to:[6,1], san:'Bb2' }],
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/2P5/1P3N2/PB1PPPPP/RN1QKB1R b KQkq - 2 4', "Reti Opening: New York System", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnbqk2r/ppp1bppp/4pn2/3p4/2P5/1P3N2/PB1PPPPP/RN1QKB1R w KQkq - 3 5', "Reti Opening: New York System", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqk2r/ppp1bppp/4pn2/3p4/2P5/1P2PN2/PB1P1PPP/RN1QKB1R b KQkq - 0 5', "Reti Opening: New York System", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/ppp1bppp/4pn2/3p4/2P5/1P2PN2/PB1P1PPP/RN1QKB1R w KQ - 1 6', "Reti Opening: New York System", { from:[7,1], to:[5,2], san:'Nc3' }],

  // #23: Queen's Indian Defense: Classical, Main Line
  ['rnbqkb1r/p1pp1ppp/4pn2/8/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4', "Queen's Indian Defense", { from:[1,6], to:[3,5], san:'g3' }],
  ['rnbqkb1r/p1pp1ppp/4pn2/8/2PP4/5NP1/P3PP1P/RNBQKB1R b KQkq - 0 4', "Queen's Indian Defense", { from:[7,5], to:[1,1], san:'Bb7' }],
  ['rnbqk2r/p1pp1ppp/4pn2/8/1bPP4/5NP1/P3PP1P/RNBQKB1R w KQkq - 1 5', "Queen's Indian Defense", { from:[7,5], to:[6,5], san:'Bg2' }],
  ['rnbqk2r/p1pp1ppp/4pn2/8/1bPP4/5NP1/P3PPBP/RNBQK2R b KQkq - 2 5', "Queen's Indian Defense", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/p1pp1ppp/4pn2/8/1bPP4/5NP1/P3PPBP/RNBQK2R w KQ - 3 6', "Queen's Indian Defense", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/p1pp1ppp/4pn2/8/1bPP4/5NP1/P3PPBP/RNBQ1RK1 b - - 4 6', "Queen's Indian Defense", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbq1rk1/p1p2ppp/4pn2/1p1p4/1bPP4/5NP1/P3PPBP/RNBQ1RK1 w - - 0 7', "Queen's Indian Defense", { from:[2,3], to:[3,3], san:'cxd5' }],
  ['rnbq1rk1/p1p2ppp/4pn2/1p1P4/1b1P4/5NP1/P3PPBP/RNBQ1RK1 b - - 0 7', "Queen's Indian Defense", { from:[4,4], to:[3,3], san:'exd5' }],
  ['rnbq1rk1/p1p2ppp/8/1p1p4/1b1P4/5NP1/P3PPBP/RNBQ1RK1 w - - 0 8', "Queen's Indian Defense", { from:[7,3], to:[4,2], san:'Qc2' }],

  // #24: Sicilian Defense: Löwenthal Variation
  ['r1bqkb1r/pp1ppppp/2n2n2/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 1 5', "Sicilian: Löwenthal Variation", { from:[1,4], to:[3,4], san:'e5' }],
  ['r1bqkb1r/pp1p1ppp/2n2n2/4p3/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 6', "Sicilian: Löwenthal Variation", { from:[3,3], to:[1,1], san:'Nb3' }],
  ['r1bqkb1r/pp1p1ppp/2n2n2/4p3/4P3/1N6/PPP2PPP/RNBQKB1R b KQkq - 2 6', "Sicilian: Löwenthal Variation", { from:[1,3], to:[3,3], san:'d5' }],
  ['r1bqkb1r/pp3ppp/2n2n2/3pp3/4P3/1N6/PPP2PPP/RNBQKB1R w KQkq - 0 7', "Sicilian: Löwenthal Variation", { from:[4,4], to:[3,3], san:'exd5' }],
  ['r1bqkb1r/pp3ppp/2n2n2/3Pp3/8/1N6/PPP2PPP/RNBQKB1R b KQkq - 0 7', "Sicilian: Löwenthal Variation", { from:[7,3], to:[3,3], san:'Qxd5' }],
  ['r1b1kb1r/pp3ppp/2n2n2/3q4/8/1N6/PPP2PPP/RNBQKB1R w KQkq - 0 8', "Sicilian: Löwenthal Variation", { from:[7,3], to:[3,3], san:'Qxd5' }],
  ['r1b1kb1r/pp3ppp/2n2n2/3N4/8/1N6/PPP2PPP/R1B1KB1R b KQkq - 0 8', "Sicilian: Löwenthal Variation", { from:[2,5], to:[3,3], san:'Nxd5' }],
  ['r1b1kb1r/pp3ppp/2n5/3n4/8/1N6/PPP2PPP/R1B1KB1R w KQkq - 2 9', "Sicilian: Löwenthal Variation", { from:[7,5], to:[2,0], san:'Ba3' }],

  // #25: French Defense: Fort Knox Variation
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', "French Defense: Fort Knox", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3', "French Defense: Fort Knox", { from:[3,3], to:[4,4], san:'dxe4' }],
  ['rnbqkbnr/ppp2ppp/4p3/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4', "French Defense: Fort Knox", { from:[2,3], to:[4,4], san:'Nxe4' }],
  ['rnbqkbnr/ppp2ppp/4p3/8/4N3/8/PPP2PPP/R1BQKBNR b KQkq - 0 4', "French Defense: Fort Knox", { from:[7,5], to:[4,4], san:'Bd7' }],
  ['rnbqk2r/pppb1ppp/4p3/8/4N3/8/PPP2PPP/R1BQKBNR w KQkq - 1 5', "French Defense: Fort Knox", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqk2r/pppb1ppp/4p3/8/4N3/5N2/PPP2PPP/R1BQK2R b KQkq - 0 5', "French Defense: Fort Knox", { from:[3,1], to:[4,4], san:'Bxb5' }],
  ['rnbqk2r/ppp2ppp/4p3/1B6/4N3/5N2/PPP2PPP/R1BQK2R b KQkq - 0 6', "French Defense: Fort Knox", { from:[7,3], to:[3,3], san:'Qxd1+' }],
  ['rnb1k2r/ppp2ppp/4p3/1B6/4N3/5N2/PPP2PPP/R1B1K2R w KQkq - 0 7', "French Defense: Fort Knox", { from:[7,4], to:[3,3], san:'Kxd1' }],
  ['rnb1k2r/ppp2ppp/4p3/1B6/4N3/5N2/PPP2PPP/R1B1K2R b KQkq - 1 7', "French Defense: Fort Knox", { from:[1,2], to:[3,2], san:'c6' }],

  // #26: Two Knights Defense: Traxler Counterattack
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 5 5', "Two Knights: Traxler Counterattack", { from:[5,5], to:[6,6], san:'Ng5' }],
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/6N1/PPPP1PPP/RNBQK2R b KQkq - 6 5', "Two Knights: Traxler Counterattack", { from:[2,1], to:[3,1], san:'Bc5' }],
  ['r2qk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/6N1/PPPP1PPP/RNBQK2R w KQkq - 0 6', "Two Knights: Traxler Counterattack", { from:[6,6], to:[4,5], san:'Nxf7' }],
  ['r2qk2r/pppp1pP1/2n2n2/2b1p3/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 6', "Two Knights: Traxler Counterattack", { from:[5,5], to:[4,5], san:'Bxf2+' }],
  ['r2qk2r/pppp1pP1/2n2n2/8/2B1P3/8/PPPP1bPP/RNBQK2R w KQkq - 0 7', "Two Knights: Traxler Counterattack", { from:[7,4], to:[5,5], san:'Kxf2' }],
  ['r2qk2r/pppp1pP1/2n2n2/8/2B1P3/8/PPPP1KPP/RNBQ3R b kq - 0 7', "Two Knights: Traxler Counterattack", { from:[2,5], to:[4,4], san:'Nxe4+' }],
  ['r2qk2r/pppp1pP1/2n5/8/2B1n3/8/PPPP1KPP/RNBQ3R w kq - 1 8', "Two Knights: Traxler Counterattack", { from:[5,5], to:[6,5], san:'Kg1' }],
  ['r2qk2r/pppp1pP1/2n5/8/2B1n3/8/PPPP2PP/RNBQ1RK1 b kq - 0 8', "Two Knights: Traxler Counterattack", { from:[7,3], to:[2,3], san:'Qh4' }],
  ['r2q3r/pppp1pP1/2n5/8/2B1n2q/8/PPPP2PP/RNBQ1RK1 w q - 1 9', "Two Knights: Traxler Counterattack", { from:[6,6], to:[5,7], san:'gxh8=Q+' }],

  // #27: Budapest Gambit: Fajarowicz Variation
  ['rnbqkb1r/pppp1ppp/5n2/4p3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', "Budapest Gambit", { from:[3,3], to:[4,4], san:'dxe5' }],
  ['rnbqkb1r/pppp1ppp/5n2/4P3/2P5/8/PP2PPPP/RNBQKBNR b KQkq - 0 3', "Budapest Gambit: Fajarowicz", { from:[2,5], to:[4,4], san:'Ne4' }],
  ['rnbqkb1r/pppp1ppp/8/4p3/2P1n3/8/PP1PPPPP/RNBQKBNR w KQkq - 0 4', "Budapest Gambit: Fajarowicz", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/pppp1ppp/8/4p3/2P1n3/5N2/PP1PPPPP/RNBQKB1R b KQkq - 2 4', "Budapest Gambit: Fajarowicz", { from:[1,3], to:[2,3], san:'d6' }],
  ['rnbqkb1r/ppp2ppp/3p4/4p3/2P1n3/5N2/PP1PPPPP/RNBQKB1R w KQkq - 0 5', "Budapest Gambit: Fajarowicz", { from:[6,3], to:[4,3], san:'d4' }],
  ['rnbqkb1r/ppp2ppp/3p4/4p3/2PPn3/5N2/PP2PPPP/RNBQKB1R b KQkq - 0 5', "Budapest Gambit: Fajarowicz", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnbqk2r/ppp2ppp/3p4/4p3/2PPn3/5N2/PP2PPPP/RNBQKB1R w KQkq - 1 6', "Budapest Gambit: Fajarowicz", { from:[7,1], to:[5,2], san:'Nbd2' }],
  ['rnbqk2r/ppp2ppp/3p4/4p3/2PPn3/5N2/PP1NPPPP/R1BQKB1R b KQkq - 3 6', "Budapest Gambit: Fajarowicz", { from:[2,5], to:[5,5], san:'Nf6' }],
  ['rnbqk2r/ppp2ppp/3p1n2/4p3/2PP4/5N2/PP1NPPPP/R1BQKB1R w KQkq - 0 7', "Budapest Gambit: Fajarowicz", { from:[4,4], to:[5,5], san:'e3' }],

  // #28: Trompowsky Attack: Classical Defense
  ['rnbqkb1r/pppppppp/5n2/6B1/3P4/8/PPP1PPPP/RN1QKBNR b KQkq - 2 2', "Trompowsky Attack", { from:[1,4], to:[2,4], san:'e6' }],
  ['rnbqkb1r/pp1p1ppp/4pn2/6B1/3P4/8/PPP1PPPP/RN1QKBNR w KQkq - 0 3', "Trompowsky Attack", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqkb1r/pp1p1ppp/4pn2/6B1/3P4/4P3/PPP2PPP/RN1QKBNR b KQkq - 0 3', "Trompowsky Attack", { from:[1,7], to:[2,7], san:'h6' }],
  ['rnbqkb1r/pp1p1p1p/4pn1p/6B1/3P4/4P3/PPP2PPP/RN1QKBNR w KQkq - 0 4', "Trompowsky Attack", { from:[6,6], to:[5,7], san:'Bh4' }],
  ['rnbqkb1r/pp1p1p1p/4pn1p/8/3P3B/4P3/PPP2PPP/RN1QKBNR b KQkq - 1 4', "Trompowsky Attack", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnbqk2r/pp1pbp1p/4pn1p/8/3P3B/4P3/PPP2PPP/RN1QKBNR w KQkq - 2 5', "Trompowsky Attack", { from:[7,1], to:[4,3], san:'Nbd2' }],
  ['rnbqk2r/pp1pbp1p/4pn1p/8/3P3B/4P3/PP1N1PPP/R2QKBNR b KQkq - 3 5', "Trompowsky Attack", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqk2r/pp2bp1p/4pn1p/3p4/3P3B/4P3/PP1N1PPP/R2QKBNR w KQkq - 0 6', "Trompowsky Attack", { from:[7,5], to:[4,3], san:'Bd3' }],
  ['rnbqk2r/pp2bp1p/4pn1p/3p4/3P3B/3BP3/PP1N1PPP/R2QK1NR b KQkq - 1 6', "Trompowsky Attack", { from:[0,1], to:[2,2], san:'Nc6' }],

  // #29: London System: Main Line with ...c5
  ['rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/4P3/PPP2PPP/RN1QKBNR b KQkq - 0 3', "London System", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkb1r/pp2pppp/5n2/2pp4/3P1B2/4P3/PPP2PPP/RN1QKBNR w KQkq - 0 4', "London System", { from:[6,2], to:[4,2], san:'c3' }],
  ['rnbqkb1r/pp2pppp/5n2/2pp4/2PP1B2/4P3/PP3PPP/RN1QKBNR b KQkq - 0 4', "London System", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pp2pppp/2n2n2/2pp4/2PP1B2/4P3/PP3PPP/RN1QKBNR w KQkq - 1 5', "London System", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['r1bqkb1r/pp2pppp/2n2n2/2pp4/2PP1B2/2N1P3/PP3PPP/R2QKBNR b KQkq - 2 5', "London System", { from:[3,3], to:[2,2], san:'dxc4' }],
  ['r1bqkb1r/pp2pppp/2n2n2/8/2pP1B2/2N1P3/PP3PPP/R2QKBNR w KQkq - 0 6', "London System", { from:[6,3], to:[4,3], san:'d5' }],
  ['r1bqkb1r/pp2pppp/2n2n2/3P4/5B2/2N1P3/PP3PPP/R2QKBNR b KQkq - 0 6', "London System", { from:[2,5], to:[3,3], san:'Nxd5' }],
  ['r1bqkb1r/pp2pppp/2n5/3n4/5B2/2N1P3/PP3PPP/R2QKBNR w KQkq - 0 7', "London System", { from:[7,3], to:[3,3], san:'Qxd5' }],
  ['r1bqkb1r/pp2pppp/2n5/3Q4/5B2/2N1P3/PP3PPP/R3KBNR b KQkq - 0 7', "London System", { from:[2,5], to:[4,4], san:'Be7' }],

  // #30: Pirc Defense: Byrne Variation
  ['rnbqkb1r/pp2pp1p/3p1np1/8/3PP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 4', "Pirc Defense: Byrne Variation", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['rnbqkb1r/pp2pp1p/3p1np1/6B1/3PP3/2N5/PP3PPP/R2QKB1R b KQkq - 1 4', "Pirc Defense: Byrne Variation", { from:[7,5], to:[6,5], san:'Bg7' }],
  ['rnbqk2r/pp2ppbp/3p1np1/6B1/3PP3/2N5/PP3PPP/R2QKB1R w KQkq - 2 5', "Pirc Defense: Byrne Variation", { from:[7,3], to:[3,3], san:'Qd2' }],
  ['rnbqk2r/pp2ppbp/3p1np1/6B1/3PP3/2N5/PP1Q1PPP/R3KB1R b KQkq - 3 5', "Pirc Defense: Byrne Variation", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbq1rk1/pp2ppbp/3p1np1/6B1/3PP3/2N5/PP1Q1PPP/R3KB1R w KQ - 4 6', "Pirc Defense: Byrne Variation", { from:[7,7], to:[7,5], san:'O-O-O' }],
  ['rnbq1rk1/pp2ppbp/3p1np1/6B1/3PP3/2N5/PP1Q1PPP/2KR1B1R b - - 5 6', "Pirc Defense: Byrne Variation", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r2q1rk1/pp2ppbp/2np1np1/6B1/3PP3/2N5/PP1Q1PPP/2KR1B1R w - - 6 7', "Pirc Defense: Byrne Variation", { from:[6,3], to:[4,3], san:'d5' }],
  ['r2q1rk1/pp2ppbp/2np1np1/3P2B1/4P3/2N5/PP1Q1PPP/2KR1B1R b - - 0 7', "Pirc Defense: Byrne Variation", { from:[2,5], to:[4,4], san:'Ne5' }],
  ['r2q1rk1/pp2ppbp/2np2p1/3Pn1B1/4P3/2N5/PP1Q1PPP/2KR1B1R w - - 1 8', "Pirc Defense: Byrne Variation", { from:[7,4], to:[5,4], san:'Be2' }],
  
  // --- UNUSUAL & GAMBIT LINES ---

  // #31: King's Gambit Accepted: Muzio Gambit
  ['rnbqkbnr/pppp1p1p/8/6p1/4Pp1P/5N2/PPPP2P1/RNBQKB1R b KQkq - 0 4', "King's Gambit", { from:[2,6], to:[3,6], san:'g4' }],
  ['rnbqkbnr/pppp1p1p/8/8/4PppP/5N2/PPPP2P1/RNBQKB1R w KQkq - 0 5', "Muzio Gambit", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbqkbnr/pppp1p1p/8/8/4PppP/5N2/PPPP2P1/RNBQ1RK1 b kq - 1 5', "Muzio Gambit", { from:[2,5], to:[5,5], san:'gxf3' }],
  ['rnbqkbnr/pppp1p1p/8/8/4Pp2/5p2/PPPP2P1/RNBQ1RK1 w kq - 0 6', "Muzio Gambit", { from:[7,3], to:[5,5], san:'Qxf3' }],
  ['rnbqkbnr/pppp1p1p/8/8/4Pp2/5Q2/PPPP2P1/RNB2RK1 b kq - 1 6', "Muzio Gambit", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkbnr/pppp1p1p/2n5/8/4Pp2/5Q2/PPPP2P1/RNB2RK1 w kq - 2 7', "Muzio Gambit", { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqkbnr/pppp1p1p/2n5/8/3PPp2/5Q2/PPP3P1/RNB2RK1 b kq - 0 7', "Muzio Gambit", { from:[2,5], to:[4,4], san:'Nxd4' }],
  ['r1bqkbnr/pppp1p1p/8/8/3nPp2/5Q2/PPP3P1/RNB2RK1 w kq - 0 8', "Muzio Gambit", { from:[5,3], to:[3,3], san:'Qxd4' }],
  ['r1bqkbnr/pppp1p1p/8/8/3QPp2/8/PPP3P1/RNB2RK1 b kq - 0 8', "Muzio Gambit", { from:[7,3], to:[6,3], san:'Qf6' }],

  // #32: QGD: Vienna Variation
  ['rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3', "QGD: Vienna Variation", { from:[7,5], to:[3,1], san:'Bb4' }],
  ['rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4', "QGD: Vienna Variation", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['rnbqk2r/ppp2ppp/4pn2/3p2B1/1bPP4/2N5/PP2PPPP/R2QKBNR b KQkq - 3 4', "QGD: Vienna Variation", { from:[1,7], to:[2,7], san:'h6' }],
  ['rnbqk2r/ppp2pp1/4pn1p/3p2B1/1bPP4/2N5/PP2PPPP/R2QKBNR w KQkq - 0 5', "QGD: Vienna Variation", { from:[6,6], to:[4,4], san:'Bxf6' }],
  ['rnbqk2r/ppp2pp1/4pB1p/3p4/1bPP4/2N5/PP2PPPP/R2QKBNR b KQkq - 0 5', "QGD: Vienna Variation", { from:[7,3], to:[5,5], san:'Qxf6' }],
  ['rnb1k2r/ppp2pp1/4pq1p/3p4/1bPP4/2N5/PP2PPPP/R2QKBNR w KQkq - 2 6', "QGD: Vienna Variation", { from:[6,0], to:[4,0], san:'a3' }],
  ['rnb1k2r/ppp2pp1/4pq1p/3p4/1bPP4/P1N5/1P2PPPP/R2QKBNR b KQkq - 0 6', "QGD: Vienna Variation", { from:[3,1], to:[2,2], san:'Bxc3+' }],
  ['rnb1k2r/ppp2pp1/4pq1p/3p4/2PP4/P1b5/1P2PPPP/R2QKBNR w KQkq - 0 7', "QGD: Vienna Variation", { from:[1,1], to:[2,2], san:'bxc3' }],
  ['rnb1k2r/ppp2pp1/4pq1p/3p4/2PP4/P1P5/2P1PPPP/R2QKBNR b KQkq - 0 7', "QGD: Vienna Variation", { from:[7,7], to:[7,5], san:'O-O' }],

  // #33: Benko Gambit Declined: Fianchetto Variation
  ['rnbqkb1r/pp1ppppp/5n2/2p5/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2', "Benko Gambit Declined", { from:[1,1], to:[3,1], san:'b5' }],
  ['rnbqkb1r/p2ppppp/5n2/1p6/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', "Benko Gambit Declined", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['rnbqkb1r/p2ppppp/5n2/1p6/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 3', "Benko Gambit Declined", { from:[1,6], to:[2,6], san:'g6' }],
  ['rnbqkb1r/p2ppp1p/5np1/1p6/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4', "Benko Gambit Declined", { from:[1,6], to:[3,5], san:'g3' }],
  ['rnbqkb1r/p2ppp1p/5np1/1p6/2PP4/5NP1/PP2PP1P/RNBQKB1R b KQkq - 0 4', "Benko Gambit Declined", { from:[7,5], to:[1,1], san:'Bb7' }],
  ['rnbqk2r/p2ppp1p/5np1/1p6/2PP4/5NP1/PP1bPP1P/RNBQKB1R w KQkq - 0 5', "Benko Gambit Declined", { from:[7,5], to:[6,5], san:'Bg2' }],
  ['rnbqk2r/p2ppp1p/5np1/1p6/2PP4/5NP1/PP1bPPBP/RNBQK2R b KQkq - 1 5', "Benko Gambit Declined", { from:[2,5], to:[4,4], san:'Be7' }],
  ['rnbqk2r/p2pbp1p/5np1/1p6/2PP4/5NP1/PP1BPPBP/RNBQK2R w KQkq - 2 6', "Benko Gambit Declined", { from:[7,7], to:[7,5], san:'O-O' }],
  ['rnbqk2r/p2pbp1p/5np1/1p6/2PP4/5NP1/PP1BPPBP/RNBQ1RK1 b kq - 3 6', "Benko Gambit Declined", { from:[0,1], to:[2,2], san:'Nbd7' }],

  // #34: Sicilian Defense: Chekhover Variation
  ['rnbqkb1r/pp2pppp/3p1n2/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 1 5', "Sicilian: Chekhover Variation", { from:[7,3], to:[3,3], san:'Qd4' }],
  ['rnbqkb1r/pp2pppp/3p1n2/8/3Q4/8/PPP2PPP/RNB1KBNR w KQkq - 1 6', "Sicilian: Chekhover Variation", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pp2pppp/3p1n2/8/3Q4/2N5/PPP2PPP/R1B1KBNR b KQkq - 2 6', "Sicilian: Chekhover Variation", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pp2pppp/2np1n2/8/3Q4/2N5/PPP2PPP/R1B1KBNR w KQkq - 3 7', "Sicilian: Chekhover Variation", { from:[7,5], to:[6,6], san:'Bg5' }],
  ['r1bqkb1r/pp2pppp/2np1n2/6B1/3Q4/2N5/PPP2PPP/R3KBNR b KQkq - 4 7', "Sicilian: Chekhover Variation", { from:[1,3], to:[3,3], san:'d5' }],
  ['r1bqkb1r/pp3ppp/2n2n2/3p2B1/3Q4/2N5/PPP2PPP/R3KBNR w KQkq - 0 8', "Sicilian: Chekhover Variation", { from:[6,6], to:[4,4], san:'Bxf6' }],
  ['r1bqkb1r/pp3ppp/2n2B2/3p4/3Q4/2N5/PPP2PPP/R3KBNR b KQkq - 0 8', "Sicilian: Chekhover Variation", { from:[6,5], to:[5,5], san:'gxf6' }],
  ['r1bqkb1r/pp3p1p/2n2p2/3p4/3Q4/2N5/PPP2PPP/R3KBNR w KQkq - 0 9', "Sicilian: Chekhover Variation", { from:[3,3], to:[3,3], san:'Qxd5' }],

  // #35: Jobava London System
  ['rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2', "Jobava London System", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['rnbqkb1r/pppppppp/5n2/8/3P4/2N5/PPP1PPPP/R1BQKBNR b KQkq - 2 2', "Jobava London System", { from:[1,3], to:[3,3], san:'d5' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/3P4/2N5/PPP1PPPP/R1BQKBNR w KQkq - 0 3', "Jobava London System", { from:[7,5], to:[3,1], san:'Bf4' }],
  ['rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/2N5/PPP1PPPP/R2QKBNR b KQkq - 1 3', "Jobava London System", { from:[1,2], to:[3,2], san:'c5' }],
  ['rnbqkb1r/pp2pppp/5n2/2pp4/3P1B2/2N5/PPP1PPPP/R2QKBNR w KQkq - 2 4', "Jobava London System", { from:[4,4], to:[5,5], san:'e3' }],
  ['rnbqkb1r/pp2pppp/5n2/2pp4/3P1B2/4P3/PPN2PPP/R2QKBNR b KQkq - 0 4', "Jobava London System", { from:[0,1], to:[2,2], san:'Nc6' }],
  ['r1bqkb1r/pp2pppp/2n2n2/2pp4/3P1B2/4P3/PPN2PPP/R2QKBNR w KQkq - 1 5', "Jobava London System", { from:[7,6], to:[5,5], san:'Nf3' }],
  ['r1bqkb1r/pp2pppp/2n2n2/2pp4/3P1B2/4PN2/PPN2PPP/R2QKB1R b KQkq - 0 5', "Jobava London System", { from:[3,3], to:[2,2], san:'dxc4' }],
  ['r1bqkb1r/pp2pppp/2n2n2/8/2pP1B2/4PN2/PPN2PPP/R2QKB1R w KQkq - 0 6', "Jobava London System", { from:[7,5], to:[2,2], san:'Bxc4' }]
  
  
  


];