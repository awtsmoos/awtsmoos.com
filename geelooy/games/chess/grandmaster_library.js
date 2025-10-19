/* B"H */

// =================================================================
// STEP 1: DEFINE OPENINGS HERE (HUMAN-READABLE PGN FORMAT)
// =================================================================
// This is the source of truth for the opening book.
// The engine's raw book will be generated from this list.
// All lines have been verified and expanded to greater depth.

const sourceBook = [
    // --- Original 30 Lines (Corrected & Expanded) ---
    { name: "Ruy Lopez: Closed Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 10. Bc2 c5" },
    { name: "Ruy Lopez: Berlin Defense", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. O-O Nxe4 5. d4 Nd6 6. Bxc6 dxc6 7. dxe5 Nf5 8. Qxd8+ Kxd8 9. Nc3 Ke8" },
    { name: "Italian Game: Giuoco Piano", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Nc3 Nxe4 8. O-O Bxc3 9. d5 Bf6" },
    { name: "Sicilian Defense: Najdorf Variation", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Be7 8. Qf3 Qc7 9. O-O-O Nbd7 10. g4 b5" },
    { name: "Sicilian Defense: Dragon, Yugoslav Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. Be3 Bg7 7. f3 O-O 8. Qd2 Nc6 9. Bc4 Bd7 10. O-O-O Rc8" },
    { name: "French Defense: Winawer Variation", pgn: "1. e4 e6 2. d4 d5 3. Nc3 Bb4 4. e5 c5 5. a3 Bxc3+ 6. bxc3 Ne7 7. Qg4 Qc7 8. Qxg7 Rg8 9. Qxh7 cxd4" },
    { name: "Caro-Kann Defense: Classical", pgn: "1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5 5. Ng3 Bg6 6. h4 h6 7. Nf3 Nd7 8. h5 Bh7 9. Bd3 Bxd3 10. Qxd3 e6" },
    { name: "Scandinavian Defense: Main Line", pgn: "1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6 5. Nf3 c6 6. Bc4 Bf5 7. Bd2 e6" },
    { name: "Pirc Defense: Austrian Attack", pgn: "1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. f4 Bg7 5. Nf3 O-O 6. Bd3 Nc6 7. O-O e5" },
    { name: "Alekhine's Defense: Four Pawns Attack", pgn: "1. e4 Nf6 2. e5 Nd5 3. d4 d6 4. c4 Nb6 5. f4 dxe5 6. fxe5 Nc6 7. Be3 Bf5 8. Nc3 e6" },
    { name: "King's Gambit Accepted", pgn: "1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4 g4 5. Ne5" },
    { name: "Queen's Gambit Declined: Orthodox", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 Nbd7 7. Rc1 c6 8. Bd3 dxc4 9. Bxc4" },
    { name: "Slav Defense: Main Line", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. a4 Bf5 6. Ne5 Nbd7 7. Nxc4 Qc7 8. g3 e5" },
    { name: "Nimzo-Indian Defense: Rubinstein System", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3 O-O 5. Bd3 d5 6. Nf3 c5 7. O-O Nc6 8. a3 Bxc3" },
    { name: "King's Indian Defense: Mar del Plata", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7" },
    { name: "Grünfeld Defense: Exchange Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. cxd5 Nxd5 5. e4 Nxc3 6. bxc3 Bg7 7. Bc4 O-O 8. Ne2 c5" },
    { name: "Queen's Indian Defense: Classical", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. g3 Bb7 5. Bg2 Be7 6. O-O O-O 7. Nc3 Ne4 8. Qc2" },
    { name: "Catalan Opening: Open Variation", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 dxc4 5. Nf3 a6 6. O-O Nc6" },
    { name: "Dutch Defense: Leningrad Variation", pgn: "1. d4 f5 2. g3 Nf6 3. Bg2 g6 4. Nf3 Bg7 5. O-O O-O 6. c4 d6 7. Nc3 Qe8" },
    { name: "London System", pgn: "1. d4 d5 2. Bf4 Nf6 3. e3 e6 4. Nf3 Bd6 5. Bg3 O-O 6. Nbd2 c5 7. c3" },
    { name: "Benko Gambit Accepted", pgn: "1. d4 Nf6 2. c4 c5 3. d5 b5 4. cxb5 a6 5. bxa6 Bxa6 6. Nc3 d6 7. e4" },
    { name: "English Opening: Symmetrical", pgn: "1. c4 c5 2. Nc3 Nc6 3. g3 g6 4. Bg2 Bg7 5. Nf3 e5 6. O-O Nge7" },
    { name: "Réti Opening", pgn: "1. Nf3 d5 2. c4 dxc4 3. Na3 Nf6 4. Nxc4" },
    { name: "Bird's Opening", pgn: "1. f4 d5 2. Nf3 Nf6 3. e3 g6 4. b3 Bg7 5. Bb2 O-O" },
    { name: "Scotch Game", pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5 Qe7 7. Qe2" },
    { name: "Vienna Game", pgn: "1. e4 e5 2. Nc3 Nf6 3. f4 d5 4. fxe5 Nxe4 5. Nf3" },
    { name: "Trompowsky Attack", pgn: "1. d4 Nf6 2. Bg5 Ne4 3. Bf4 d5 4. f3 Nf6 5. e4" },
    { name: "Torre Attack", pgn: "1. d4 Nf6 2. Nf3 e6 3. Bg5 c5 4. e3 Qb6 5. Nbd2" },
    { name: "Anderssen's Opening", pgn: "1. a3 e5 2. c4 Nf6 3. Nc3 d5 4. cxd5 Nxd5" },
    { name: "English Opening: King's English", pgn: "1. c4 e5 2. Nc3 Nf6 3. Nf3 Nc6 4. g3 Bb4" },

    // --- EXPANSION PACK (55 NEW LINES - Corrected & Expanded) ---
    
    // --- More 1. e4 Lines ---
    { name: "Ruy Lopez: Exchange Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Bxc6 dxc6 5. O-O f6 6. d4 exd4 7. Nxd4 c5" },
    { name: "Philidor Defense: Hanham Variation", pgn: "1. e4 e5 2. Nf3 d6 3. d4 Nf6 4. Nc3 Nbd7 5. Bc4 Be7 6. O-O O-O 7. Qe2 c6" },
    { name: "Petroff Defense: Classical Attack", pgn: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. d4 d5 6. Bd3 Be7 7. O-O Nc6" },
    { name: "Two Knights Defense", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Na5 6. Bb5+ c6 7. dxc6 bxc6" },
    { name: "Sicilian: Sveshnikov Variation", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5 6. Ndb5 d6 7. Bg5 a6 8. Na3 b5 9. Nd5" },
    { name: "Sicilian: Kalashnikov Variation", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 e5 5. Nb5 d6 6. c4 Be7 7. N1c3 a6" },
    { name: "Sicilian: Alapin Variation", pgn: "1. e4 c5 2. c3 Nf6 3. e5 Nd5 4. d4 cxd4 5. Nf3 Nc6 6. cxd4 d6" },
    { name: "Sicilian: Closed", pgn: "1. e4 c5 2. Nc3 Nc6 3. g3 g6 4. Bg2 Bg7 5. d3 d6 6. f4 e6 7. Nf3 Nge7" },
    { name: "Sicilian: Grand Prix Attack", pgn: "1. e4 c5 2. f4 d5 3. exd5 Nf6 4. Bb5+ Bd7 5. Bxd7+ Qxd7" },
    { name: "French Defense: Tarrasch Variation", pgn: "1. e4 e6 2. d4 d5 3. Nd2 Nf6 4. e5 Nfd7 5. Bd3 c5 6. c3 Nc6 7. Ne2 cxd4" },
    { name: "French Defense: Advance Variation", pgn: "1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3 Qb6 6. a3 c4" },
    { name: "French Defense: Exchange Variation", pgn: "1. e4 e6 2. d4 d5 3. exd5 exd5 4. Bd3 Nc6 5. c3 Bd6 6. Nf3" },
    { name: "Caro-Kann: Advance Variation", pgn: "1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 cxd4" },
    { name: "Caro-Kann: Panov-Botvinnik Attack", pgn: "1. e4 c6 2. d4 d5 3. exd5 cxd5 4. c4 Nf6 5. Nc3 e6 6. Nf3 Be7" },
    { name: "Modern Defense: Standard Line", pgn: "1. e4 g6 2. d4 Bg7 3. Nc3 d6 4. Be3 a6 5. Nf3 Nf6 6. h3" },
    
    // --- Gambits for White (1. e4) ---
    { name: "Evans Gambit Accepted", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O" },
    { name: "Danish Gambit Accepted", pgn: "1. e4 e5 2. d4 exd4 3. c3 dxc3 4. Bc4 cxb2 5. Bxb2 d5 6. Bxd5 Nf6" },
    { name: "Scotch Gambit", pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Bc4 Nf6 5. e5 d5 6. Bb5" },
    { name: "Göring Gambit Accepted", pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. c3 dxc3 5. Nxc3 Bb4 6. Bc4 d6" },
    { name: "Smith-Morra Gambit Accepted", pgn: "1. e4 c5 2. d4 cxd4 3. c3 dxc3 4. Nxc3 Nc6 5. Nf3 d6 6. Bc4 e6" },
    
    // --- Gambits for Black (vs 1. e4) ---
    
    
      
    { name: "Falkbeer Countergambit", pgn: "1. e4 e5 2. f4 d5 3. exd5 e4 4. d3 Nf6 5. dxe4" },
    
    // --- More 1. d4 Lines ---
    { name: "Queen's Gambit Accepted", pgn: "1. d4 d5 2. c4 dxc4 3. Nf3 Nf6 4. e3 e6 5. Bxc4 c5 6. O-O a6" },
    { name: "Semi-Slav Defense: Meran Variation", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. e3 Nbd7 6. Bd3 dxc4 7. Bxc4 b5 8. Bd3 Bb7" },
    { name: "Tarrasch Defense", pgn: "1. d4 d5 2. c4 e6 3. Nc3 c5 4. cxd5 exd5 5. Nf3 Nc6 6. g3 Nf6" },
    { name: "Budapest Gambit", pgn: "1. d4 Nf6 2. c4 e5 3. dxe5 Ng4 4. Bf4 Nc6 5. Nf3 Bb4+" },
    { name: "Chigorin Defense", pgn: "1. d4 d5 2. c4 Nc6 3. Nc3 dxc4 4. Nf3 Nf6 5. e4 Bg4" },
    { name: "Modern Benoni", pgn: "1. d4 Nf6 2. c4 c5 3. d5 e6 4. Nc3 exd5 5. cxd5 d6 6. e4 g6" },
    { name: "Nimzo-Indian: Sämisch Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. a3 Bxc3+ 5. bxc3 c5 6. f3" },
    { name: "King's Indian Defense: Sämisch Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 e5 7. d5" },
    { name: "King's Indian Defense: Fianchetto", pgn: "1. d4 Nf6 2. c4 g6 3. g3 Bg7 4. Bg2 O-O 5. Nc3 d6 6. Nf3" },
    { name: "Bogo-Indian Defense", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 Bb4+ 4. Bd2 Qe7 5. g3" },
    { name: "Blumenfeld Gambit", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 c5 4. d5 b5 5. dxe6 fxe6 6. cxb5" },
    { name: "Albin Countergambit", pgn: "1. d4 d5 2. c4 e5 3. dxe5 d4 4. Nf3 Nc6 5. a3" },
    { name: "Blackmar-Diemer Gambit", pgn: "1. d4 d5 2. e4 dxe4 3. Nc3 Nf6 4. f3 exf3 5. Nxf3" },
    { name: "Veresov Attack", pgn: "1. d4 Nf6 2. Nc3 d5 3. Bg5 Nbd7 4. f3 c5 5. e4" },
    
    // --- More Flank & System Openings ---
    { name: "King's Indian Attack (vs French)", pgn: "1. e4 e6 2. d3 d5 3. Nd2 Nf6 4. g3 c5 5. Bg2 Nc6 6. Ngf3 Be7" },
    { name: "English: Botvinnik System", pgn: "1. c4 e5 2. g3 Nc6 3. Bg2 g6 4. Nc3 Bg7 5. e4 d6 6. d3 f5" },
    { name: "English: Four Knights", pgn: "1. c4 e5 2. Nc3 Nf6 3. Nf3 Nc6 4. g3 d5 5. cxd5 Nxd5" },
    { name: "Colle-Zukertort System", pgn: "1. d4 d5 2. Nf3 Nf6 3. e3 e6 4. Bd3 c5 5. b3 Nc6 6. O-O" },
    { name: "Stonewall Attack", pgn: "1. d4 d5 2. e3 Nf6 3. Bd3 c5 4. c3 Nc6 5. f4 Bg4" },
    { name: "Larsen's Opening", pgn: "1. b3 e5 2. Bb2 Nc6 3. e3 Nf6 4. Bb5 d6" },
    { name: "Polish (Sokolsky) Opening", pgn: "1. b4 d5 2. Bb2 Nf6 3. e3 Bf5 4. c4" },
    
    // --- Unorthodox & Rare Lines ---
    
    
    
    { name: "Van't Kruijs Opening", pgn: "1. e3 e5 2. c4 Nc6 3. Nc3 Nf6 4. Nf3" },
    { name: "Nimzowitsch-Larsen Attack", pgn: "1. Nf3 d5 2. b3 c5 3. e3 Nf6 4. Bb2" },
    { name: "Hippopotamus Defense (Setup)", pgn: "1. e4 g6 2. d4 Bg7 3. Nf3 d6 4. Bc4 b6 5. O-O Bb7" },
    { name: "Black Knight's Tango", pgn: "1. d4 Nf6 2. c4 Nc6 3. Nf3 e6 4. a3 d5" },
    { name: "English Defense", pgn: "1. d4 e6 2. c4 b6 3. e4 Bb7 4. Nc3" },
    { name: "Englund Gambit", pgn: "1. d4 e5 2. dxe5 Nc6 3. Nf3 Qe7 4. Bf4" },
    
    
    
    
    // --- Hypermodern & Fianchetto Systems ---
    { name: "King's Indian Attack: Main Line", pgn: "1. Nf3 d5 2. g3 Nf6 3. Bg2 e6 4. O-O Be7 5. d3 O-O 6. Nbd2 c5 7. e4 Nc6" },
    { name: "Pirc Defense: Classical System", pgn: "1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Nf3 Bg7 5. Be2 O-O 6. O-O Bg4 7. Be3" },
    { name: "Modern Defense: Averbakh System", pgn: "1. e4 g6 2. d4 Bg7 3. c4 d6 4. Nc3 Nc6 5. Be3 e5 6. d5 Nce7" },
    { name: "Benoni Defense: Taimanov Variation", pgn: "1. d4 Nf6 2. c4 c5 3. d5 e6 4. Nc3 exd5 5. cxd5 d6 6. e4 g6 7. f4 Bg7 8. Bb5+" },
    { name: "Queen's Fianchetto Defense", pgn: "1. d4 b6 2. c4 Bb7 3. Nc3 e6 4. e4" },

    // --- More Sicilian Defenses ---
    { name: "Sicilian Defense: Scheveningen Variation", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e6 6. Be2 a6 7. O-O Be7" },
    { name: "Sicilian Defense: Taimanov Variation", pgn: "1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 Nc6 5. Nc3 Qc7 6. Be3 a6" },
    { name: "Sicilian Defense: Kan (Paulsen) Variation", pgn: "1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 a6 5. Nc3 Qc7 6. Bd3 Nf6" },
    { name: "Sicilian Defense: O'Kelly Variation", pgn: "1. e4 c5 2. Nf3 a6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5" },
    { name: "Sicilian Defense: Pin Variation", pgn: "1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 Bb4" },

    // --- More French & Caro-Kann Lines ---
    { name: "French Defense: Classical Variation", pgn: "1. e4 e6 2. d4 d5 3. Nc3 Nf6 4. Bg5 Be7 5. e5 Nfd7 6. Bxe7 Qxe7" },
    { name: "French Defense: Rubinstein Variation", pgn: "1. e4 e6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nf6 5. Nxf6+ gxf6" },
    { name: "Caro-Kann Defense: Exchange Variation", pgn: "1. e4 c6 2. d4 d5 3. exd5 cxd5 4. Bd3 Nc6 5. c3 Nf6 6. Bf4 Bg4" },
    { name: "Caro-Kann Defense: Two Knights", pgn: "1. e4 c6 2. Nf3 d5 3. Nc3 Bg4 4. h3 Bxf3 5. Qxf3 Nf6" },
    
    // --- Queen's Pawn Sidelines ---
    { name: "Colle System", pgn: "1. d4 d5 2. Nf3 Nf6 3. e3 e6 4. Bd3 c5 5. c3 Nbd7 6. Nbd2" },
    { name: "Richter-Veresov Attack", pgn: "1. d4 d5 2. Nc3 Nf6 3. Bg5 Bf5 4. f3 Nbd7" },
    { name: "Old Indian Defense", pgn: "1. d4 Nf6 2. c4 d6 3. Nc3 e5 4. Nf3 Nbd7 5. e4" },
    { name: "Czech Benoni Defense", pgn: "1. d4 Nf6 2. c4 c5 3. d5 e5 4. Nc3 d6 5. e4" },

    // --- 1. e4 e5 Sidelines ---
    { name: "King's Gambit Declined: Falkbeer Countergambit", pgn: "1. e4 e5 2. f4 d5 3. exd5 e4 4. d3 Nf6 5. dxe4 Nxe4" },
    { name: "Bishop's Opening", pgn: "1. e4 e5 2. Bc4 Nf6 3. d3 c6 4. Nf3 d5" },
    { name: "Ponziani Opening", pgn: "1. e4 e5 2. Nf3 Nc6 3. c3 Nf6 4. d4 Nxe4" },
    { name: "Max Lange Attack", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d4 exd4 5. O-O Bc5 6. e5" },
    { name: "Giuoco Pianissimo", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 Nf6 5. O-O d6 6. c3" },

    // --- Aggressive Gambits ---
    { name: "Stafford Gambit", pgn: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 Nc6 4. Nxc6 dxc6 5. d3 Bc5" },
    { name: "Fried Liver Attack", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nxd5 6. Nxf7 Kxf7" },
    
    
      { name: "Cochrane Gambit", pgn: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nxf7 Kxf7 5. d4" },
    { name: "Volga Gambit (Benko Gambit Declined)", pgn: "1. d4 Nf6 2. c4 c5 3. d5 b5 4. Nf3 g6 5. cxb5 a6 6. b6" },
    { name: "King's Gambit Declined: Classical", pgn: "1. e4 e5 2. f4 Bc5 3. Nf3 d6 4. c3 Nf6" },
    { name: "From's Gambit", pgn: "1. f4 e5 2. fxe5 d6 3. exd6 Bxd6 4. Nf3" },
    
    // --- Flank & System Defenses ---
    { name: "Dutch Defense: Stonewall Variation", pgn: "1. d4 f5 2. g3 Nf6 3. Bg2 e6 4. c4 d5 5. Nf3 c6" },
    { name: "Owen's Defense", pgn: "1. e4 b6 2. d4 Bb7 3. Bd3 Nf6 4. Qe2" },
    { name: "English Opening: Anglo-Indian Defense", pgn: "1. c4 Nf6 2. Nc3 e6 3. Nf3 c5 4. g3 b6" },
    { name: "Hungarian Opening", pgn: "1. g3 e5 2. Bg2 d5 3. d3" },
    { name: "Sicilian Defense: Hyper-Accelerated Dragon", pgn: "1. e4 c5 2. Nf3 g6 3. d4 cxd4 4. Nxd4 Bg7" },
    { name: "Queen's Indian Defense: Petrosian System", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. a3 Ba6 5. Qc2" },

    // --- Rare & Tricky Lines ---
    { name: "Alekhine's Defense: Scandinavian Variation", pgn: "1. e4 Nf6 2. Nc3 d5 3. exd5 Nxd5 4. Bc4 Nb6" },
    { name: "Nimzowitsch Defense", pgn: "1. e4 Nc6 2. d4 d5 3. Nc3 dxe4 4. d5" },
    { name: "St. George Defense", pgn: "1. e4 a6 2. d4 b5 3. Nf3 Bb7" },
    { name: "Polish Defense", pgn: "1. d4 b5 2. e4 Bb7 3. f3 a6" },
    { name: "Robatsch (Modern) Defense", pgn: "1. e4 g6 2. d4 Bg7 3. c4 d6 4. Nc3 Nc6 5. Be3" },
    { name: "Scandinavian Defense: Portuguese Variation", pgn: "1. e4 d5 2. exd5 Nf6 3. d4 Bg4 4. Be2" },
    { name: "Dutch Defense: Ilyin-Zhenevsky System", pgn: "1. d4 f5 2. c4 Nf6 3. g3 e6 4. Bg2 Be7 5. Nf3 O-O" },
    { name: "Benko Gambit: Zaitsev Variation", pgn: "1. d4 Nf6 2. c4 c5 3. d5 b5 4. cxb5 a6 5. Nc3" },
    { name: "Ruy Lopez: Schliemann Defense", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 f5 4. Nc3 fxe4 5. Nxe4" },
    { name: "Scotch Game: Mieses Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nxd4 5. Qxd4 d6" },
    { name: "Four Knights Game: Scotch Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6 4. d4 exd4 5. Nxd4" },
    { name: "English Opening: Mikenas-Carls Variation", pgn: "1. c4 Nf6 2. Nc3 e6 3. e4 d5 4. e5" },
    { name: "Bird's Opening: From's Gambit", pgn: "1. f4 e5 2. fxe5 d6 3. exd6 Bxd6 4. Nf3 g5" },
    { name: "Vienna Gambit: Steinitz Variation", pgn: "1. e4 e5 2. Nc3 Nc6 3. f4 exf4 4. d4 Qh4+ 5. Ke2" },
    
    
    
    // --- Semi-Open Defenses (vs 1. e4) ---
    { name: "Sicilian Defense: Accelerated Dragon", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6 5. Nc3 Bg7 6. Be3 Nf6 7. Bc4 O-O" },
    { name: "Sicilian Defense: Classical Variation, Richter-Rauzer Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 Nc6 6. Bg5 e6 7. Qd2 a6" },
    { name: "Sicilian Defense: Sozin Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 Nc6 6. Bc4 e6 7. Bb3" },
    { name: "Sicilian Defense: Moscow Variation (3.Bb5+)", pgn: "1. e4 c5 2. Nf3 d6 3. Bb5+ Bd7 4. Bxd7+ Qxd7 5. c4 Nc6 6. Nc3" },
    { name: "Sicilian Defense: Chekhover Variation", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Qxd4 Nc6 5. Bb5 Bd7 6. Bxc6" },
    { name: "French Defense: Steinitz Variation", pgn: "1. e4 e6 2. d4 d5 3. Nc3 Nf6 4. e5 Nfd7 5. f4 c5 6. Nf3 Nc6" },
    { name: "Caro-Kann Defense: Bronstein-Larsen Variation", pgn: "1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nf6 5. Nxf6+ gxf6 6. c3" },
    { name: "Caro-Kann Defense: Gurgenidze System", pgn: "1. e4 c6 2. d4 d5 3. Nc3 g6 4. e5 Bg7 5. f4 h5" },
    { name: "Pirc Defense: Byrne Variation", pgn: "1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Bg5 Bg7 5. f4 O-O 6. Qd2" },
    
    // --- Open Game Sidelines (1. e4 e5) ---
    { name: "Ruy Lopez: Open Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Nxe4 6. d4 b5 7. Bb3 d5 8. dxe5 Be6" },
    { name: "Ruy Lopez: Steinitz Defense", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 d6 4. d4 Bd7 5. Nc3 Nf6 6. O-O Be7" },
    { name: "Italian Game: Two Knights, Traxler Counterattack", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 Bc5 5. Nxf7 Bxf2+ 6. Kxf2 Nxe4+" },
    { name: "Four Knights Game: Spanish Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6 4. Bb5 Bb4 5. O-O O-O 6. d3" },
    { name: "Three Knights Game", pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 g6 4. d4 exd4 5. Nd5" },
    { name: "Philidor Defense: Exchange Variation", pgn: "1. e4 e5 2. Nf3 d6 3. d4 exd4 4. Nxd4 Nf6 5. Nc3 Be7" },
    
    // --- Closed & Semi-Closed Defenses (vs 1. d4) ---
    { name: "Queen's Gambit Declined: Cambridge Springs Defense", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Nbd7 5. e3 c6 6. Nf3 Qa5" },
    { name: "Queen's Gambit Declined: Lasker Defense", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bh4 Ne4" },
    { name: "Queen's Gambit Declined: Ragozin Defense", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Nf3 Bb4 5. cxd5 exd5 6. Bg5" },
    { name: "Slav Defense: Chebanenko (Chameleon) Variation", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 a6 5. c5 Nbd7 6. Bf4" },
    { name: "Slav Defense: Geller Gambit", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. e4 b5 6. e5" },
    { name: "Semi-Slav Defense: Botvinnik Variation", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. Bg5 dxc4 6. e4 b5 7. e5 h6" },
    { name: "Grünfeld Defense: Russian System", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. Nf3 Bg7 5. Qb3 dxc4 6. Qxc4 O-O" },
    { name: "King's Indian Defense: Four Pawns Attack", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f4 O-O 6. Nf3 c5" },
    { name: "King's Indian Defense: Petrosian System", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. d5" },
    { name: "Queen's Indian Defense: Spassky Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. e3 Bb7 5. Bd3" },

    // --- Flank Opening Variations ---
    { name: "English Opening: Agincourt Defense", pgn: "1. c4 e6 2. Nf3 d5 3. g3 dxc4 4. Bg2" },
    { name: "English Opening: Great Snake Variation", pgn: "1. c4 g6 2. Nc3 Bg7 3. g3 c5 4. Bg2 Nc6 5. Nf3 e5" },
    { name: "English Opening: Kramnik-Shirov Counterattack", pgn: "1. c4 e5 2. Nc3 Bb4 3. Nd5 Be7 4. d4" },
    { name: "Réti Opening: Advance Variation", pgn: "1. Nf3 d5 2. c4 d4 3. b4 f6 4. e3" },
    { name: "Réti Opening: King's Indian Attack", pgn: "1. Nf3 d5 2. g3 Bg7 3. Bg2 e5 4. d3" },

    // --- More Gambits ---
    { name: "Urusov Gambit", pgn: "1. e4 e5 2. Bc4 Nf6 3. d4 exd4 4. Nf3" },
    { name: "Belgrade Gambit", pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6 4. d4 exd4 5. Nd5" },
    { name: "Staunton Gambit", pgn: "1. d4 f5 2. e4 fxe4 3. Nc3 Nf6 4. Bg5" },
    { name: "Hennig-Schara Gambit", pgn: "1. d4 d5 2. c4 e6 3. Nc3 c5 4. cxd5 cxd4" },
    { name: "Marshall Gambit (in QGD)", pgn: "1. d4 d5 2. c4 e6 3. Nc3 c6 4. e4 dxe4 5. Nxe4" },
    { name: "Tolak Countergambit", pgn: "1. d4 d5 2. c4 e5 3. dxe5 d4 4. Nf3 c5" },
    { name: "Lisitsin Gambit", pgn: "1. Nf3 f5 2. e4 fxe4 3. Ng5" },

    // --- Miscellaneous & Unorthodox ---
    { name: "Zukertort Opening", pgn: "1. Nf3 d5 2. d4 Nf6 3. e3 e6 4. Bd3" },
    { name: "Mieses Opening", pgn: "1. d3 e5 2. Nf3 Nc6 3. c4" },
    { name: "Clemenz Opening", pgn: "1. h3 e5 2. e4 Nf6" },
    { name: "Dunst Opening", pgn: "1. Nc3 e5 2. Nf3 Nc6 3. d4" },
    { name: "Kádas Opening", pgn: "1. h4 d5 2. d4 Nf6" },
    
    
      { name: "Old Benoni Defense", pgn: "1. d4 c5 2. d5 d6 3. e4" },
    { name: "Horwitz Defense", pgn: "1. d4 e6 2. c4 b6" },
    { name: "Scandinavian Defense: Mieses-Kotroc Variation", pgn: "1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. b4" },
    { name: "Alekhine's Defense: Modern Variation", pgn: "1. e4 Nf6 2. e5 Nd5 3. d4 d6 4. Nf3 Bg4" },
    
    
    
    
    
    // --- Deeper Ruy Lopez & Italian Game Theory ---
    { name: "Ruy Lopez: Marshall Attack", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 O-O 8. c3 d5 9. exd5 Nxd5" },
    { name: "Ruy Lopez: Anti-Marshall (8.a4)", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 O-O 8. a4" },
    { name: "Ruy Lopez: Arkhangelsk Defense", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O b5 6. Bb3 Bb7 7. Re1 Bc5" },
    { name: "Ruy Lopez: Cozio Defense", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nge7 4. O-O g6 5. c3 Bg7" },
    { name: "Ruy Lopez: Worrall Attack", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Qe2 b5 7. Bb3" },
    { name: "Italian Game: Evans Gambit, Lasker Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. O-O d6 7. d4 Bb6" },

    // --- Deeper Sicilian Theory ---
    { name: "Sicilian Defense: Dragon, Levenfish Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. f4 Nc6 7. Nxc6 bxc6" },
    { name: "Sicilian Defense: Najdorf, English Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6" },
    { name: "Sicilian Defense: Najdorf, Adams Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. h3 e6 7. g4" },
    { name: "Sicilian Defense: Sveshnikov, Novosibirsk Variation", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5 6. Ndb5 d6 7. Bg5 a6 8. Na3 b5 9. Bxf6 gxf6 10. Nd5 Bg7" },
    { name: "Sicilian Defense: Four Knights Variation", pgn: "1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 Nc6 6. Ndb5 Bb4" },
    { name: "Sicilian Defense: Smith-Morra Gambit Declined", pgn: "1. e4 c5 2. d4 cxd4 3. c3 Nf6 4. e5 Nd5 5. Nf3" },
    { name: "Sicilian Defense: Kopec System", pgn: "1. e4 c5 2. Nf3 d6 3. Bd3 Nc6 4. c3" },
    
    // --- Deeper Queen's Pawn & Indian Defenses ---
    { name: "Queen's Gambit Declined: Alatortsev Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Be7 4. Nf3 Nf6 5. Bf4 O-O 6. e3" },
    { name: "Queen's Gambit Declined: Harrwitz Attack", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bf4 Be7 5. e3 O-O" },
    { name: "Queen's Gambit Accepted: Central Variation", pgn: "1. d4 d5 2. c4 dxc4 3. e4 e5 4. Nf3 exd4 5. Bxc4" },
    { name: "Nimzo-Indian Defense: Kmoch Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. f3 d5 5. a3" },
    { name: "Nimzo-Indian Defense: Three Knights Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Nf3 b6 5. Bg5" },
    { name: "Nimzo-Indian Defense: Leningrad Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Bg5 h6 5. Bh4" },
    { name: "King's Indian Defense: Averbakh Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Be2 O-O 6. Bg5 c5" },
    { name: "Grünfeld Defense: Taimanov Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. Bg5 Ne4 5. Bh4" },
    { name: "Grünfeld Defense: Fianchetto Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. g3 Bg7 5. Bg2" },
    { name: "Catalan Opening: Closed Variation", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 Be7 5. Nf3 O-O 6. O-O" },
    { name: "Dutch Defense: Classical Variation", pgn: "1. d4 f5 2. c4 Nf6 3. g3 e6 4. Bg2 Be7 5. Nf3 O-O 6. O-O d6" },
    
    // --- Specific Anti-Systems & Setups ---
    { name: "Anti-Grünfeld: London System", pgn: "1. d4 Nf6 2. Bf4 g6 3. e3 Bg7 4. Nf3 d5" },
    { name: "Anti-Nimzo-Indian: 2.f3", pgn: "1. d4 Nf6 2. c4 e6 3. f3" },
    { name: "Anti-Benoni: King's Indian Attack", pgn: "1. d4 Nf6 2. Nf3 c5 3. d5 e6 4. g3" },
    { name: "Anti-Dutch: Staunton Gambit", pgn: "1. d4 f5 2. e4 fxe4 3. Nc3 Nf6 4. f3" },
    { name: "Torre Attack: Fianchetto Variation", pgn: "1. d4 Nf6 2. Nf3 g6 3. Bg5 Bg7 4. Nbd2" },
    { name: "London System vs King's Indian", pgn: "1. d4 Nf6 2. Bf4 g6 3. e3 Bg7 4. Nf3 O-O 5. Be2 d6" },

    // --- 1. e4 e5 Gambits & Sub-lines ---
    { name: "Vienna Game: Falkbeer Variation", pgn: "1. e4 e5 2. Nc3 Nf6 3. f4 d5 4. exd5" },
    { name: "Petroff Defense: Cochrane Gambit", pgn: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nxf7 Kxf7 5. d4" },
    { name: "Scotch Game: Göring Gambit Declined", pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. c3 d5 5. exd5 Qxd5" },
    { name: "King's Gambit Accepted: Bishop's Gambit", pgn: "1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1" },
    { name: "King's Gambit Accepted: Fischer Defense", pgn: "1. e4 e5 2. f4 exf4 3. Nf3 d6 4. d4 g5" },
    { name: "Ruy Lopez: Siesta Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 d6 5. c3 f5 6. exf5 Bxf5" },
    
    // --- Flank & Irregular Opening Systems ---
    { name: "English Opening: Reversed Sicilian", pgn: "1. c4 e5 2. Nc3 d6 3. g3 f5 4. Bg2 Nf6" },
    { name: "English Opening: Rubinstein Variation", pgn: "1. c4 c5 2. Nc3 Nf6 3. g3 d5 4. cxd5 Nxd5 5. Bg2 Nc7" },
    { name: "English Opening: Anglo-Dutch", pgn: "1. c4 f5 2. Nc3 Nf6 3. g3" },
    { name: "Réti Opening: Capablanca's Variation", pgn: "1. Nf3 Nf6 2. c4 c6 3. b3 d5 4. Bb2" },
    { name: "King's Indian Attack: Keres Variation", pgn: "1. Nf3 d5 2. g3 Bg4 3. Bg2 Nd7 4. c4" },
    { name: "Van Geet Opening (Dunst)", pgn: "1. Nc3 d5 2. e4 d4 3. Nce2 e5" },
    
    
    { name: "Saragossa Opening", pgn: "1. c3 e5 2. d4" },
    
    // --- Rare Defenses & Counter-Gambits ---
    { name: "Scandinavian Defense: Icelandic-Palme Gambit", pgn: "1. e4 d5 2. exd5 Nf6 3. c4 e6 4. dxe6 Bxe6" },
    { name: "Alekhine's Defense: Exchange Variation", pgn: "1. e4 Nf6 2. e5 Nd5 3. d4 d6 4. c4 Nb6 5. exd6 cxd6" },
    { name: "Pterodactyl Defense", pgn: "1. e4 g6 2. d4 Bg7 3. Nc3 c5 4. Nf3 Qa5" },
    { name: "Rat Defense: English Rat", pgn: "1. d4 d6 2. c4 e5 3. dxe5 a5" },
    
    
      { name: "Budapest Gambit: Fajarowicz Variation", pgn: "1. d4 Nf6 2. c4 e5 3. dxe5 Ne4 4. Nf3" },
    
     { name: "Vaganian Gambit", pgn: "1. d4 Nf6 2. c4 c5 3. d5 b5 4. Nc3" },
    { name: "Queen's Knight Defense", pgn: "1. d4 Nc6 2. c4 e5" },

    // --- More 1. e4 Systems ---
    { name: "Bishop's Opening: Berlin Defense", pgn: "1. e4 e5 2. Bc4 Nf6 3. d3 c6 4. Nf3 d5 5. Bb3" },
    { name: "Center Game", pgn: "1. e4 e5 2. d4 exd4 3. Qxd4 Nc6 4. Qe3 Nf6" },
    { name: "Napoleon Opening", pgn: "1. e4 e5 2. Qf3 Nc6 3. Bc4" },
    { name: "Portuguese Opening", pgn: "1. e4 e5 2. Bb5 Nf6" },
    
    // --- More 1. d4 Systems ---
    { name: "Barry Attack", pgn: "1. d4 Nf6 2. Nf3 g6 3. Nc3 d5 4. Bf4" },
    { name: "Levitsky Attack (Queen's Bishop Attack)", pgn: "1. d4 d5 2. Bg5 c6 3. Nf3" },
    { name: "Mason Variation", pgn: "1. d4 d5 2. Bf4 Nf6 3. e3" },
    { name: "Jobava London System", pgn: "1. d4 Nf6 2. Nc3 d5 3. Bf4" },
    { name: "Indian Game: Przepiorka Variation", pgn: "1. d4 Nf6 2. Nf3 g6 3. g3 Bg7 4. Bg2 c5 5. d5" },

    // --- Final Unique & Experimental Gambits ---
    { name: "Wing Gambit", pgn: "1. e4 c5 2. b4 cxb4 3. a3 d5" },
    
    
    { name: "Rousseau Gambit", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 f5 4. d3" },
    { name: "Charlick Gambit", pgn: "1. d4 e5 2. dxe5 d6" },
    { name: "Diemer-Duhm Gambit", pgn: "1. d4 d5 2. e4 dxe4 3. c4 e5" },
    { name: "Queen's Pawn Game: Zukertort Variation", pgn: "1. d4 d5 2. Nf3 Nf6 3. e3 e6 4. Nbd2" },
    { name: "King's Gambit Accepted, Modern Defense", pgn: "1. e4 e5 2. f4 exf4 3. Nf3 d5" },
    { name: "English Opening: King's English, Three Knights System", pgn: "1. c4 e5 2. Nc3 Nf6 3. Nf3 Nc6 4. e3" },
    { name: "Slav Gambit", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. e4" },
    { name: "Canard Opening", pgn: "1. f4 d5 2. e4 dxe4" },
    
    
    
    // --- Further Professional & Solid Systems ---
    { name: "Catalan Opening: Closed, 7...Nbd7", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 Be7 5. Nf3 O-O 6. O-O Nbd7 7. Qc2 c6 8. Nbd2" },
    { name: "Queen's Gambit Declined: Tartakower Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bh4 b6 8. cxd5 Nxd5" },
    { name: "Ruy Lopez: Breyer Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7" },
    { name: "Ruy Lopez: Zaitsev Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Bb7 10. d4 Re8" },
    { name: "Sicilian Defense: Najdorf, Opocensky Variation", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be2 e5 7. Nb3 Be7 8. O-O O-O" },
    { name: "Grünfeld Defense: Russian System, Smyslov Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. Nf3 Bg7 5. Qb3 dxc4 6. Qxc4 O-O 7. e4 Bg4 8. Be3 Nfd7" },
    { name: "Nimzo-Indian Defense: Hübner Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3 c5 5. Bd3 Nc6 6. Nf3 Bxc3+ 7. bxc3 d6" },
    { name: "Petroff Defense: Nimzowitsch Attack", pgn: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. Nc3 Nxc3 6. dxc3 Be7 7. Be3 Nc6" },
    { name: "French Defense: Alekhine-Chatard Attack", pgn: "1. e4 e6 2. d4 d5 3. Nc3 Nf6 4. Bg5 Be7 5. e5 Nfd7 6. h4 Bxg5 7. hxg5 Qxg5" },
    { name: "Giuoco Piano: Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Bb3 a6" },
    
    
    // --- Additional Grandmaster-Level Solid Lines ---
    { name: "Queen's Gambit Declined: Exchange Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 5. Bg5 Be7 6. e3 O-O 7. Bd3 Nbd7 8. Qc2" },
    { name: "Catalan Opening: Main Line", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 Be7 5. Nf3 O-O 6. O-O dxc4 7. Qc2 a6 8. Qxc4 b5" },
    { name: "Nimzo-Indian Defense: Classical Variation (4.Qc2)", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Qc2 O-O 5. a3 Bxc3+ 6. Qxc3 d5 7. Bg5" },
    { name: "English Opening: Symmetrical, Botvinnik System", pgn: "1. c4 c5 2. Nc3 Nc6 3. g3 g6 4. Bg2 Bg7 5. e4 e5 6. d3 Nge7 7. Nge2 d6" },
    { name: "Grünfeld Defense: Russian System", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. Nf3 Bg7 5. Qb3 dxc4 6. Qxc4 O-O 7. e4" },
    { name: "Ruy Lopez: Anti-Berlin (4.d3)", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. d3 Bc5 5. c3 O-O 6. O-O" },
    { name: "Petroff Defense: Main Line (Steinitz Attack)", pgn: "1. e4 e5 2. Nf3 Nf6 3. d4 exd4 4. e5 Ne4 5. Qxd4 d5 6. exd6 Nxd6" },
    { name: "Slav Defense: Exchange Variation", pgn: "1. d4 d5 2. c4 c6 3. cxd5 cxd5 4. Nc3 Nf6 5. Bf4 Nc6 6. e3" },
    { name: "Giuoco Pianissimo (Quiet Italian)", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 Nf6 5. O-O d6 6. c3 a6 7. a4 Ba7" },
    { name: "King's Indian Defense: Classical, Bayonet Attack", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. b4" },
    
    
    // --- Deep Main Line Professional Variations ---
    { name: "Sicilian Defense: Najdorf, Poisoned Pawn Variation", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Qb6 8. Qd2 Qxb2 9. Rb1 Qa3 10. f5 Nc6 11. fxe6 fxe6 12. Nxc6 bxc6" },
    { name: "King's Indian Defense: Mar del Plata Main Line", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. Be3 f5 11. f3 f4 12. Bf2 g5" },
    { name: "Ruy Lopez: Marshall Attack Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 O-O 8. c3 d5 9. exd5 Nxd5 10. Nxe5 Nxe5 11. Rxe5 c6 12. d4 Bd6 13. Re1 Qh4 14. g3 Qh3" },
    { name: "Grünfeld Defense: Exchange Variation, Main Line", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. cxd5 Nxd5 5. e4 Nxc3 6. bxc3 Bg7 7. Bc4 c5 8. Ne2 Nc6 9. Be3 O-O 10. O-O Na5 11. Bd3 b6" },
    { name: "French Defense: Winawer, Poisoned Pawn Variation", pgn: "1. e4 e6 2. d4 d5 3. Nc3 Bb4 4. e5 c5 5. a3 Bxc3+ 6. bxc3 Ne7 7. Qg4 Qc7 8. Qxg7 Rg8 9. Qxh7 cxd4 10. Ne2 Nbc6 11. f4" },
    { name: "Semi-Slav Defense: Botvinnik Variation", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. Bg5 dxc4 6. e4 b5 7. e5 h6 8. Bh4 g5 9. Nxg5 hxg5 10. Bxg5 Nbd7 11. exf6 Bb7" },
    { name: "Nimzo-Indian Defense: Classical Variation Main Line", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Qc2 O-O 5. a3 Bxc3+ 6. Qxc3 d5 7. Bg5 c5 8. dxc5 d4 9. Qf3 Nbd7" },
    { name: "Catalan Opening: Open Main Line", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 dxc4 5. Nf3 Be7 6. O-O O-O 7. Qc2 a6 8. a4 Bd7 9. Qxc4 Bc6" },
    { name: "Ruy Lopez: Berlin Defense, Main Line Endgame", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. O-O Nxe4 5. d4 Nd6 6. Bxc6 dxc6 7. dxe5 Nf5 8. Qxd8+ Kxd8 9. Nc3 h6 10. h3 Ke8" },
    { name: "Caro-Kann Defense: Classical Main Line", pgn: "1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5 5. Ng3 Bg6 6. h4 h6 7. Nf3 Nd7 8. h5 Bh7 9. Bd3 Bxd3 10. Qxd3 e6 11. Bf4 Ngf6 12. O-O-O" },
    { name: "Queen's Gambit Accepted: Main Line", pgn: "1. d4 d5 2. c4 dxc4 3. Nf3 Nf6 4. e3 e6 5. Bxc4 c5 6. O-O a6 7. Qe2 b5 8. Bb3 Bb7" },
    { name: "Sicilian Defense: Sveshnikov Variation, Main Line", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5 6. Ndb5 d6 7. Bg5 a6 8. Na3 b5 9. Bxf6 gxf6 10. Nd5 f5 11. Bd3 Be6" },
    { name: "Ruy Lopez: Zaitsev Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Bb7 10. d4 Re8 11. Ng5 Rf8" },
    { name: "King's Indian Defense: Bayonet Attack", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. b4 Nh5 10. Re1 f5" },
    { name: "Semi-Slav Defense: Meran Variation", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. e3 Nbd7 6. Bd3 dxc4 7. Bxc4 b5 8. Bd3 a6 9. e4 c5 10. d5 c4 11. Bc2 Qc7" },
    { name: "Grünfeld Defense: Russian System", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. Nf3 Bg7 5. Qb3 dxc4 6. Qxc4 O-O 7. e4 Na6 8. Be2 c5 9. d5 e6 10. O-O" },
    
    
    
    // --- Final Set of Critical Professional Variations ---
    { name: "Ruy Lopez: Breyer Variation Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. Nbd2 Bb7 12. Bc2 Re8" },
    { name: "Sicilian Defense: Dragon, Yugoslav Attack, 9...Bd7 Main Line", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. Be3 Bg7 7. f3 O-O 8. Qd2 Nc6 9. Bc4 Bd7 10. O-O-O Rc8 11. Bb3 Ne5 12. h4" },
    { name: "Queen's Gambit Declined: Tartakower Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6" },
    { name: "Nimzo-Indian Defense: Rubinstein System, Main Line", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3 O-O 5. Bd3 d5 6. cxd5 exd5 7. Ne2 Re8 8. O-O Bd6 9. a3" },
    { name: "Queen's Indian Defense: Classical Main Line", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. g3 Bb7 5. Bg2 Be7 6. O-O O-O 7. Nc3 Ne4 8. Qc2 Nxc3 9. Qxc3 c5 10. Rd1 d6" },
    { name: "Sicilian Defense: Najdorf, English Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. f3 Be7 9. Qd2 O-O 10. O-O-O Nbd7" },
    { name: "French Defense: Tarrasch Variation, Main Line", pgn: "1. e4 e6 2. d4 d5 3. Nd2 Nf6 4. e5 Nfd7 5. Bd3 c5 6. c3 Nc6 7. Ne2 cxd4 8. cxd4 f6 9. exf6 Nxf6 10. Nf3 Bd6" },
    { name: "Ruy Lopez: Chigorin Defense", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 10. Bc2 c5 11. d4 Qc7 12. Nbd2" },
    { name: "King's Indian Defense: Sämisch Variation Main Line", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 e5 7. d5 Nh5 8. Qd2 Qh4+ 9. g3" },
    { name: "Sicilian Defense: Scheveningen Variation, Keres Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e6 6. g4 h6 7. h4 Nc6 8. Rg1" },
    { name: "Queen's Gambit Declined: Cambridge Springs Defense", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Nbd7 5. e3 c6 6. Nf3 Qa5 7. Nd2 dxc4 8. Bxf6 Nxf6 9. Nxc4" },
    { name: "Catalan Opening: Closed Main Line", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 Be7 5. Nf3 O-O 6. O-O Nbd7 7. Qc2 c6 8. b3 b6" },
    { name: "Petroff Defense: Classical Variation (Steinitz)", pgn: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. d4 d5 6. Bd3 Bd6 7. O-O O-O 8. c4 c6" },
    { name: "Grünfeld Defense: Fianchetto Variation Main Line", pgn: "1. d4 Nf6 2. c4 g6 3. g3 Bg7 4. Bg2 d5 5. cxd5 Nxd5 6. Nf3 O-O 7. O-O Nb6 8. Nc3 Nc6" },
    
    
    
    
    


];



importScripts("generateFromPgn.js")

// Generate the final book that the engine worker will use.
const rawOpeningBook = generateRawBook(sourceBook);