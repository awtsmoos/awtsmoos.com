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
  ['r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 1 5', "Ruy Lopez: Morphy Defense", { from:[7,7], to:[7,5], san:'O-O' }],
  ['r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 5', "Ruy Lopez: Closed Defenses", { from:[2,5], to:[4,4], san:'Be7' }],
  ['r1bqk2r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 2 6', "Ruy Lopez: Closed Main Line", { from:[7,4], to:[6,4], san:'Re1' }],
  ['r1bqk2r/1ppp1ppp/p1n2n2/4p3/B3P3/4RN2/PPPP1PPP/RNBQ1RK1 b kq - 3 6', "Ruy Lopez: Closed Main Line", { from:[1,4], to:[3,4], san:'b5' }],
  ['r1bqk2r/2pp1ppp/p1n2n2/1p2p3/B3P3/4RN2/PPPP1PPP/RNBQ1RK1 w kq - 0 7', "Ruy Lopez: Closed Main Line", { from:[2,0], to:[1,1], san:'Bb3' }],
  ['r1bqk2r/2pp1ppp/p1n2n2/1p2p3/1b2P3/1B3N2/PPPP1PPP/RNBQ1RK1 b kq - 5 7', "Ruy Lopez: Closed Main Line", { from:[0,3], to:[1,3], san:'d6' }],
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
  ['r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', "Italian Game: Main Defenses", { from:[7,5], to:[4,2], san:'Bc5' }, { from:[0,6], to:[2,5], san:'Nf6' }],
  // Italian Game: Giuoco Piano
  ['r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', "Italian Game: Giuoco Piano", { from:[6,2], to:[4,2], san:'c3' }],
  ['r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq - 0 4', "Italian Game: Giuoco Piano", { from:[0,6], to:[2,5], san:'Nf6' }],
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 1 5', "Italian Game: Giuoco Piano", { from:[6,3], to:[4,3], san:'d4' }],
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq d3 0 5', "Italian Game: Giuoco Piano", { from:[4,4], to:[3,3], san:'exd4' }],
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 0 6', "Italian Game: Giuoco Piano", { from:[4,2], to:[3,3], san:'cxd4' }],
  ['r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq - 0 6', "Italian Game: Giuoco Piano", { from:[2,1], to:[4,3], san:'Bb4+' }],
  ['r1bqk2r/pppp1p1p/2n2n2/2b1p3/2b1P1p1/2P2N2/PP1P1PPP/RNBQ1RK1 w kq - 0 7', "Italian Game: Giuoco Piano", { from:[7,1], to:[5,2], san:'Nc3' }],
  ['r1b1k2r/pppp1p1p/2n2n2/2b1p3/2b1P1p1/2P1NN2/PP1P1PPP/R1BQ1RK1 b kq - 1 7', "Italian Game: Giuoco Piano", { from:[0,3], to:[1,3], san:'d6' }],
  ['r1b1k2r/ppp2p1p/2np1n2/2b1p3/2b1P1p1/2P1NN2/PP1P1PPP/R1BQ1RK1 w kq - 3 8', "Italian Game: Giuoco Piano", { from:[7,3], to:[5,3], san:'d4' }],

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
  ['rnb1k2r/1p2bppp/p2p1n2/4p1B1/3NPP2/2N2Q2/PPP3PP/R3KB1R b KQkq - 2 8', "Sicilian: Najdorf, Main Line (6.Bg5)", { from:[7,7], to:[7,5], san:'O-O' }],
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
];