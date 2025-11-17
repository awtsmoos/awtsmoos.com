/* B"H */

// =================================================================
// STEP 1: DEFINE OPENINGS HERE (HUMAN-READABLE PGN FORMAT)
// =================================================================
// This is the source of truth for the opening book.
// The engine's raw book will be generated from this list.
// All lines have been verified and expanded to greater depth.

const sourceBook = [
    // --- I. Adding Top-Tier, Solid Defenses & Systems ---

{ name: "Petroff Defense: Main Line", pgn: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. d4 d5 6. Bd3 Bd6 7. O-O O-O 8. c4 c6" },
// WHY: The Petroff is the symbol of solidity and is used by top Grandmasters to neutralize aggressive 1. e4 players. Adding this makes your engine rock-solid as Black.

{ name: "Queen's Gambit Declined: Exchange Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 5. Bg5 Be7 6. e3 O-O 7. Bd3 Nbd7 8. Qc2" },
// WHY: This is a strategically rich and common variation. It often leads to a "minority attack" plan and teaches the engine deep positional concepts. It's a must-have for any serious d4 repertoire.

{ name: "Jobava London System", pgn: "1. d4 Nf6 2. Nc3 d5 3. Bf4 a6 4. e3 e6 5. Nf3 c5 6. Be2" },
// WHY: This is an extremely popular and trendy system at all levels. It's aggressive and avoids the deep theory of other openings. Your engine needs to know how to play both with and against this setup.


// --- II. Deepening Theory in Critical Main Lines ---

{ name: "Sicilian Defense: Najdorf, English Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. f3 Be7 9. Qd2 O-O 10. O-O-O" },
// WHY: The English Attack is arguably the most critical and complex response to the Najdorf, the king of Sicilians. Your library has the Najdorf, but adding this specific, deep main line is essential for top-level play.

{ name: "Ruy Lopez: Breyer Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4" },
// WHY: While you have many Ruy Lopez lines, the Breyer is a strategically profound and solid system favored by positional players. It adds a quieter, more nuanced dimension to your engine's 1...e5 defense.

{ name: "Catalan Opening: Closed Main Line", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 Be7 5. Nf3 O-O 6. O-O Nbd7 7. Qc2" },
// WHY: The Catalan is a premier system for White. This variation is the most solid and common way for both sides to play, leading to a deep strategic battle. This will significantly strengthen your engine's 1. d4 play.
    
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
    { name: "George Defense", pgn: "1. e4 a6 2. d4 b5 3. Nf3 Bb7" },
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
    
    { name: "Réti Opening: King's Indian Attack", pgn: "1. Nf3 d5 2. g3 g6 3. Bg2 Bg7 4. O-O e5 5. d3" },
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
    { name: "Wing Gambit: Main Line", pgn: "1. e4 c5 2. b4 cxb4 3. a3 d5 4. exd5 Qxd5 5. Nf3 e5 6. axb4 Bxb4 7. c3 Be7 8. Na3 Nc6 9. Nb5 Qd8" },
    { name: "Rousseau Gambit: Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 f5 4. d3 Nf6 5. O-O Bc5 6. Nc3 d6 7. Bg5 Na5 8. exf5 Nxc4 9. dxc4 c6" },
    { name: "Charlick Gambit (Hartlaub Gambit)", pgn: "1. d4 e5 2. dxe5 d6 3. exd6 Bxd6 4. Nf3 Nf6 5. Bg5 h6 6. Bh4 Nc6 7. Nc3 g5 8. Bg3 Bxg3 9. hxg3 Qxd1+ 10. Rxd1" },
    { name: "Diemer-Duhm Gambit: Main Line", pgn: "1. d4 d5 2. e4 dxe4 3. c4 e5 4. d5 f5 5. Nc3 Nf6 6. f3 Bc5 7. fxe4 O-O 8. Nf3 fxe4 9. Ng5 Bf2+ 10. Kxf2 Ng4+" },
    { name: "Queen's Pawn Game: Zukertort Variation (Colle-Zukertort)", pgn: "1. d4 d5 2. Nf3 Nf6 3. e3 e6 4. Nbd2 c5 5. b3 Nc6 6. Bb2 Be7 7. a3 O-O 8. Bd3 b6 9. O-O Bb7 10. Qe2" },
    { name: "King's Gambit Accepted, Modern (Fischer) Defense", pgn: "1. e4 e5 2. f4 exf4 3. Nf3 d5 4. exd5 Nf6 5. Bb5+ c6 6. dxc6 bxc6 7. Bc4 Nd5 8. O-O Be7 9. d4 O-O 10. Bxd5 cxd5" },
    { name: "English Opening: King's English, Three Knights System", pgn: "1. c4 e5 2. Nc3 Nf6 3. Nf3 Nc6 4. e3 Bb4 5. Qc2 O-O 6. Nd5 Re8 7. a3 Bf8 8. d3 d6 9. Be2" },
    { name: "Slav Gambit: Main Line", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. e4 b5 6. e5 Nd5 7. a4 e6 8. axb5 Nxc3 9. bxc3 cxb5 10. Ng5 Bb7 11. Qh5" },
    { name: "Canard Opening (Against d5)", pgn: "1. f4 d5 2. e4 dxe4 3. Nc3 Nf6 4. Qe2 Bf5 5. Qb5+ Bd7 6. Qxb7 Nc6 7. Nb5 Nd5 8. c3 Rb8 9. Qa6" },
    
    
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
   
    
    { name: "Caro-Kann Defense: Classical Main Line", pgn: "1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5 5. Ng3 Bg6 6. h4 h6 7. Nf3 Nd7 8. h5 Bh7 9. Bd3 Bxd3 10. Qxd3 e6 11. Bf4 Ngf6 12. O-O-O Qa5 13. Kb1 Be7" },
      
      
    
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
    
    
    
    
    /* B"H */

// =================================================================
// This pack contains additional grandmaster-level openings and deeper
// variations of existing lines to make the book even more comprehensive.

    // --- Major Anti-Sicilian Systems ---
    { name: "Sicilian Defense: Rossolimo Variation", pgn: "1. e4 c5 2. Nf3 Nc6 3. Bb5 g6 4. Bxc6 bxc6 5. O-O Bg7 6. Re1 e5 7. b4 cxb4 8. a3 b3 9. cxb3 Ne7 10. Bb2 d6 11. d4 exd4 12. Bxd4" },
    { name: "Sicilian Defense: Moscow Variation (3.Bb5+)", pgn: "1. e4 c5 2. Nf3 d6 3. Bb5+ Nd7 4. d4 cxd4 5. Qxd4 a6 6. Bxd7+ Bxd7 7. O-O e5 8. Qd3 Rc8 9. c4 Be7 10. Nc3" },
    { name: "Sicilian Defense: Alapin, Main Line", pgn: "1. e4 c5 2. c3 d5 3. exd5 Qxd5 4. d4 Nf6 5. Nf3 e6 6. Be3 cxd4 7. cxd4 Nc6 8. Nc3 Qd6 9. a3 Be7 10. Bd3 O-O" },

    // --- Deeper Lines in 1.e4 e5 ---
    { name: "Ruy Lopez: Anti-Marshall System (8.a4)", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 O-O 8. a4 Bb7 9. d3 d6 10. Nbd2 Na5 11. Ba2 c5 12. Nf1 Re8 13. Ng3" },
    { name: "Scotch Game: Classical Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Bc5 5. Be3 Qf6 6. c3 Nge7 7. Bc4 Ne5 8. Be2 Qg6 9. O-O d6 10. f3 O-O" },
    { name: "Italian Game: Two Knights, Polerio Defense", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Na5 6. Bb5+ c6 7. dxc6 bxc6 8. Be2 h6 9. Nf3 e4 10. Ne5 Bd6 11. d4" },
    { name: "Petroff Defense: Main Line, Jaenisch Attack", pgn: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. d4 d5 6. Bd3 Nc6 7. O-O Be7 8. c4 Nb4 9. Be2 O-O 10. Nc3 Bf5" },
    { name: "King's Gambit Accepted: Cunningham Defense", pgn: "1. e4 e5 2. f4 exf4 3. Nf3 Be7 4. Bc4 Bh4+ 5. g3 fxg3 6. O-O gxh2+ 7. Kh1 d5 8. Bxd5 Nf6" },

    // --- Deeper Lines in 1.d4 Openings ---
    { name: "Queen's Gambit Declined: Vienna Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Nf3 dxc4 5. e4 Bb4 6. Bg5 c5 7. Bxc4 cxd4 8. Nxd4 Bxc3+ 9. bxc3 Qa5 10. Bb5+ Nbd7 11. Bxf6 Qxc3+ 12. Kf1 gxf6" },
    { name: "Semi-Slav Defense: Anti-Meran (Botvinnik System)", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. Bg5 h6 6. Bh4 dxc4 7. e4 g5 8. Bg3 b5 9. Be2 Bb7 10. O-O Nbd7" },
    { name: "Modern Benoni: Fianchetto Variation", pgn: "1. d4 Nf6 2. c4 c5 3. d5 e6 4. Nc3 exd5 5. cxd5 d6 6. Nf3 g6 7. g3 Bg7 8. Bg2 O-O 9. O-O a6 10. a4 Re8 11. Nd2 Nbd7 12. h3 Rb8" },
    { name: "Nimzo-Indian Defense: Classical (4.Qc2) Main Line", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Qc2 O-O 5. a3 Bxc3+ 6. Qxc3 d5 7. Bg5 c5 8. dxc5 d4 9. Qf3 Nbd7 10. b4 a5 11. Rd1 axb4 12. axb4" },
    { name: "Grünfeld Defense: Exchange, Classical Main Line", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. cxd5 Nxd5 5. e4 Nxc3 6. bxc3 Bg7 7. Bc4 c5 8. Ne2 O-O 9. O-O Nc6 10. Be3 Bg4 11. f3 Na5 12. Bd3 cxd4 13. cxd4 Be6 14. Rc1" },
    { name: "King's Indian Defense: Gligoric System", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. Be3 Ng4 8. Bg5 f6 9. Bh4 Nc6 10. d5 Ne7 11. Nd2 Nh6" },
    { name: "Catalan Opening: Open, Classical Main Line", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 dxc4 5. Nf3 Be7 6. O-O O-O 7. Qc2 a6 8. a4 Bd7 9. Qxc4 Bc6 10. Bg5 Nbd7 11. Nc3 h6 12. Bxf6 Nxf6" },

    // --- Other Major Systems and Defenses ---
    { name: "French Defense: Winawer, Advance Variation", pgn: "1. e4 e6 2. d4 d5 3. Nc3 Bb4 4. e5 c5 5. a3 Bxc3+ 6. bxc3 Ne7 7. a4 Nbc6 8. Nf3 Qa5 9. Bd2 Bd7 10. Be2 f6" },
    { name: "Caro-Kann Defense: Fantasy Variation", pgn: "1. e4 c6 2. d4 d5 3. f3 dxe4 4. fxe4 e5 5. Nf3 Bg4 6. Bc4 Nd7 7. O-O Ngf6 8. c3 Bd6 9. Be3 O-O 10. Nbd2" },
    { name: "English Opening: Reversed Dragon", pgn: "1. c4 e5 2. Nc3 Nf6 3. g3 d5 4. cxd5 Nxd5 5. Bg2 Nb6 6. Nf3 Nc6 7. O-O Be7 8. a3 O-O 9. b4 Be6 10. Rb1 f6 11. d3 a5" },
    { name: "Réti Opening: New York System", pgn: "1. Nf3 d5 2. c4 e6 3. g3 Nf6 4. Bg2 Be7 5. O-O O-O 6. b3 c5 7. Bb2 Nc6 8. e3 b6 9. Nc3 Ba6" },

/* B"H */

// This pack adds a diverse range of sound but less common grandmaster
// openings, including aggressive gambits and tricky positional systems.


    // --- Aggressive and Tricky Gambits ---
    { name: "King's Gambit, Kieseritzky Gambit", pgn: "1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4 g4 5. Ne5 Nf6 6. d4 d6 7. Nd3 Nxe4 8. Bxf4 Bg7 9. c3 O-O" },
    { name: "Benko Gambit: Nescafe Frappe Attack", pgn: "1. d4 Nf6 2. c4 c5 3. d5 b5 4. cxb5 a6 5. Nc3 axb5 6. e4 b4 7. Nb5 d6 8. Bf4" },
    { name: "Scotch Gambit: Haxo Gambit", pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Bc4 Bc5 5. c3 d5 6. exd5 Qe7+ 7. Kf1 Ne5" },
    { name: "Blumenfeld Gambit Accepted", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 c5 4. d5 b5 5. dxe6 fxe6 6. cxb5 d5 7. e3 Bd6 8. Nc3 O-O" },
    { name: "Latvian Gambit", pgn: "1. e4 e5 2. Nf3 f5 3. Nxe5 Qf6 4. d4 d6 5. Nc4 fxe4 6. Nc3 Qg6 7. f3 exf3 8. Qxf3" },
    { name: "Elephant Gambit", pgn: "1. e4 e5 2. Nf3 d5 3. exd5 e4 4. Qe2 Nf6 5. d3 Qxd5 6. Nbd2 Be7 7. dxe4" },

    // --- Sound but Less Common 1. e4 Systems ---
    { name: "Vienna Game: Mieses Variation", pgn: "1. e4 e5 2. Nc3 Nc6 3. g3 Nf6 4. Bg2 Bc5 5. d3 d6 6. Na4 Bb6 7. Ne2" },
    { name: "Pirc Defense: 150 Attack", pgn: "1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. h4 h5 8. Nh3" },
    { name: "Alekhine's Defense: Chase Variation", pgn: "1. e4 Nf6 2. e5 Nd5 3. c4 Nb6 4. b3 d6 5. exd6 cxd6 6. d4 g6" },
    { name: "Philidor Defense: Larsen Variation", pgn: "1. e4 e5 2. Nf3 d6 3. d4 exd4 4. Nxd4 g6 5. Nc3 Bg7 6. Be3 Nf6" },
    { name: "Giuoco Piano: Scotch Gambit Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d4 exd4 5. c3 Nf6 6. cxd4 Bb4+ 7. Nc3" },

    // --- Respected d-pawn and Flank Systems ---
    { name: "Grünfeld Defense: Hungarian Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. Nf3 Bg7 5. Bg5 Ne4 6. cxd5 Nxg5 7. Nxg5 e6 8. Nf3 exd5" },
    { name: "Queen's Indian Defense: Fianchetto Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. g3 Bb7 5. Bg2 c5 6. d5 exd5 7. Nh4 g6 8. cxd5 Bg7" },
    { name: "Trompowsky Attack: Raptor Variation", pgn: "1. d4 Nf6 2. Bg5 Ne4 3. h4 c5 4. d5 Qb6 5. Nd2 Nxg5 6. hxg5 Qxb2 7. g6" },
    { name: "English Opening: Agincourt Defense", pgn: "1. c4 e6 2. Nf3 d5 3. g3 c5 4. Bg2 Nc6 5. O-O Nf6 6. cxd5 exd5 7. d4" },
    { name: "King's Indian Attack: Spassky Variation", pgn: "1. Nf3 Nf6 2. g3 b5 3. Bg2 Bb7 4. O-O e6 5. d3 c5 6. e4 d6" },
    { name: "Catalan Opening: Bogo-Indian Variation", pgn: "1. d4 Nf6 2. c4 e6 3. g3 Bb4+ 4. Bd2 Qe7 5. Bg2 Nc6 6. Nf3 Bxd2+ 7. Nbxd2 d6" },

    // --- Hypermodern and Fianchetto Setups ---
    { name: "Modern Defense: Tiger's Modern", pgn: "1. e4 g6 2. d4 Bg7 3. Nc3 d6 4. Nf3 a6 5. a4 b6 6. Bc4 e6 7. O-O Ne7" },
    { name: "Larsen's Opening: Classical Variation", pgn: "1. b3 d5 2. Bb2 Nf6 3. e3 Bf5 4. c4 e6 5. Nf3 Nbd7 6. Be2 h6" },
    { name: "Van Geet Opening: Reversed Scandinavian", pgn: "1. Nc3 d5 2. e4 dxe4 3. Nxe4 Qd5 4. Nc3 Qa5 5. d4 Nf6 6. Bd2" },
    { name: "Hippopotamus Defense", pgn: "1. e4 b6 2. d4 Bb7 3. Bd3 e6 4. Nf3 g6 5. O-O Bg7 6. Re1 d6 7. c3 Ne7" },
    
    // --- Deep Theory in Major Complexes (Third Expansion) ---
    { name: "Ruy Lopez: Neo-Arkhangelsk Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O b5 6. Bb3 Bc5 7. a4 Rb8 8. c3 d6 9. d4 Bb6 10. axb5 axb5 11. Na3 O-O 12. Nxb5 Bg4" },
    { name: "Sicilian Defense: Najdorf, Polugaevsky Variation", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 b5 8. e5 dxe5 9. fxe5 Qc7 10. exf6 Qe5+ 11. Be2 Qxg5 12. O-O Ra7" },
    { name: "Caro-Kann Defense: Advance, Short Variation", pgn: "1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 cxd4 7. Nxd4 Ne7 8. O-O Nbc6 9. Bb5 a6 10. Ba4 b5 11. Bb3 Nxd4 12. Bxd4 Nc6" },
    { name: "French Defense: Tarrasch, Guimard Variation", pgn: "1. e4 e6 2. d4 d5 3. Nd2 Nc6 4. Ngf3 Nf6 5. e5 Nd7 6. Nb3 a5 7. a4 Be7 8. Bb5 Na7 9. Be2 b6 10. O-O O-O" },
    { name: "Nimzo-Indian Defense: Fischer Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3 b6 5. Ne2 Ba6 6. a3 Be7 7. Nf4 d5 8. cxd5 Bxf1 9. Kxf1 exd5 10. g4 c6 11. g5 Nfd7" },
    { name: "King's Indian Defense: Makogonov System", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. h3 e5 7. d5 a5 8. Bg5 Na6 9. Be2 Qe8 10. g4 Nd7 11. a3" },
    { name: "Grünfeld Defense: Prins Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. Nf3 Bg7 5. Qa4+ Bd7 6. Qb3 dxc4 7. Qxc4 O-O 8. e4 Na6 9. Be2 c5 10. d5 b5 11. Nxb5 Bxb5 12. Qxb5" },
    { name: "Catalan Opening: Open, Alekhine Variation", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 dxc4 5. Nf3 c5 6. O-O Nc6 7. Qa4 Bd7 8. Qxc4 b5 9. Qd3 c4 10. Qc2 Rc8" },
    { name: "Slav Defense: Krause Attack", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. a4 Bf5 6. Ne5 Na6 7. e3 Nb4 8. Bxc4 e6 9. O-O Bd6 10. Qe2 h6" },

    // --- Modern and Respected Sidelines ---
    { name: "Sicilian Defense: Sveshnikov, Positional Line", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5 6. Ndb5 d6 7. Bg5 a6 8. Na3 b5 9. Bxf6 gxf6 10. Nd5 f5 11. c3 Bg7 12. exf5 Bxf5 13. Nc2 O-O" },
    { name: "Petroff Defense: Italian Variation", pgn: "1. e4 e5 2. Nf3 Nf6 3. Bc4 Nxe4 4. Nc3 Nxc3 5. dxc3 f6 6. O-O c6 7. Nh4 g6 8. f4 d5 9. Bb3" },
    { name: "Scandinavian Defense: 3...Qd6 Variation", pgn: "1. e4 d5 2. exd5 Qxd5 3. Nc3 Qd6 4. d4 Nf6 5. Nf3 c6 6. Ne5 Nbd7 7. f4 Nb6 8. Be2 g6 9. O-O Bg7 10. a4 a5" },
    { name: "English Opening: Symmetrical, Keres Variation", pgn: "1. c4 c5 2. Nc3 Nc6 3. g3 g6 4. Bg2 Bg7 5. Nf3 e6 6. d4 cxd4 7. Nb5 d5 8. cxd5 Qa5+ 9. Qd2 Qxb5 10. dxc6 bxc6 11. Nxd4" },
    { name: "Réti Opening: Lasker's System", pgn: "1. Nf3 d5 2. c4 e6 3. b3 Nf6 4. g3 Be7 5. Bg2 O-O 6. O-O c5 7. Bb2 Nc6 8. cxd5 exd5 9. d4 Ne4 10. dxc5" },
    { name: "Dutch Defense: Stonewall, Modern Setup", pgn: "1. d4 f5 2. g3 Nf6 3. Bg2 e6 4. Nf3 d5 5. O-O Bd6 6. c4 c6 7. b3 Qe7 8. a4 a5 9. Ba3 Bxa3 10. Nxa3" },
    { name: "Queen's Gambit Declined: Rubinstein Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 Nbd7 7. Qc2 c5 8. Rd1 Qa5 9. Bd3 h6 10. Bh4 cxd4" },
    { name: "King's Indian Attack vs. Caro-Kann", pgn: "1. e4 c6 2. d3 d5 3. Nd2 g6 4. Ngf3 Bg7 5. g3 Nf6 6. Bg2 O-O 7. O-O dxe4 8. dxe4 Na6 9. Qe2" },
    { name: "Modern Defense: Austrian Attack, Gurgenidze System", pgn: "1. e4 g6 2. d4 Bg7 3. Nc3 c6 4. f4 d5 5. e5 h5 6. Nf3 Bg4 7. Be2 Nh6 8. O-O e6" },
    { name: "Torre Attack: Main Line with ...h6", pgn: "1. d4 Nf6 2. Nf3 e6 3. Bg5 h6 4. Bh4 c5 5. e3 b6 6. Nbd2 Bb7 7. c3 Be7 8. Bd3 O-O 9. O-O d6" },
    
    
    // =================================================================
    //         ELITE GRANDMASTER REPERTOIRE EXPANSION (v3.0)
    // =================================================================
    // This pack adds the remaining critical, theoretically-heavy opening
    // systems required for a complete, modern, top-tier repertoire.

    // --- Premier Anti-Sicilian Systems: The Rossolimo ---
    { name: "Sicilian: Rossolimo Variation, Main Line", pgn: "1. e4 c5 2. Nf3 Nc6 3. Bb5 g6 4. Bxc6 bxc6 5. O-O Bg7 6. Re1 e5 7. b4 cxb4 8. a3 c5 9. axb4 cxb4 10. d4" },
    { name: "Sicilian: Rossolimo Variation, ...d6 Line", pgn: "1. e4 c5 2. Nf3 Nc6 3. Bb5 d6 4. O-O Bd7 5. Re1 Nf6 6. c3 a6 7. Ba4 b5 8. Bc2 e5 9. h3" },
    { name: "Sicilian: Rossolimo Variation, ...e6 Line", pgn: "1. e4 c5 2. Nf3 Nc6 3. Bb5 e6 4. O-O Nge7 5. Re1 a6 6. Bf1 d5 7. exd5 Nxd5 8. d4" },

    // --- Deeper Italian Theory: The Giuoco Pianissimo ---
    { name: "Italian: Giuoco Pianissimo, Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 Nf6 5. O-O d6 6. c3 a6 7. a4 Ba7 8. Re1 O-O 9. h3 Ne7 10. d4" },
    { name: "Italian: Giuoco Pianissimo, d4-d5 ideas", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 Nf6 5. O-O d6 6. c3 O-O 7. Nbd2 a5 8. Re1 Be6 9. Bb5" },
    { name: "Italian: Two Knights, Modern Bishop Check", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3 d5 5. exd5 Nxd5 6. O-O Be7 7. Re1 Bf6" },

    // --- Deeper Catalan Theory: The Open Catalan Main Lines ---
    { name: "Catalan: Open, Main Line (8...Bd7)", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 dxc4 5. Nf3 Be7 6. O-O O-O 7. Qc2 a6 8. a4 Bd7 9. Qxc4 Bc6 10. Bf4 a5 11. Nc3" },
    { name: "Catalan: Open, Classical Variation", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 dxc4 5. Nf3 c5 6. O-O Nc6 7. Qa4 Bd7 8. Qxc4 b5 9. Qd3 Rc8 10. dxc5" },
    { name: "Catalan: Open, Bogo-Indian Setup", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 Bb4+ 5. Bd2 Be7 6. Nf3 O-O 7. O-O c6 8. Qc2" },

    // --- Deeper Slav & Semi-Slav Theory ---
    { name: "Semi-Slav: Moscow Variation (6.Bxf6)", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. Bg5 h6 6. Bxf6 Qxf6 7. e3 Nd7 8. Bd3 dxc4 9. Bxc4" },
    { name: "Semi-Slav: Anti-Moscow Variation (6.Bh4)", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. Bg5 h6 6. Bh4 dxc4 7. e4 g5 8. Bg3 b5 9. Be2 Bb7 10. O-O" },
    { name: "Slav: Chebanenko Variation, Main Line (5.c5)", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 a6 5. c5 Nbd7 6. Bf4 Nh5 7. Bd2 Nhf6 8. Qc2 g6 9. e4" },
    { name: "Slav: Chebanenko Variation, Quiet Line (5.e3)", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 a6 5. e3 b5 6. c5 g6 7. Bd3 Bg7 8. O-O" },

    // --- Deeper Nimzo-Indian & Queen's Indian Theory ---
    { name: "Nimzo-Indian: Fianchetto Variation Main Line", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. g3 O-O 5. Bg2 d5 6. Nf3 dxc4 7. O-O Nc6 8. a3 Be7 9. e4" },
    { name: "Nimzo-Indian: Sämisch, Panno Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. a3 Bxc3+ 5. bxc3 c5 6. f3 Nc6 7. e4 d6" },
    { name: "Queen's Indian Defense: Bogo-Indian Hybrid", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 Bb4+ 4. Bd2 a5 5. g3 b6 6. Bg2 Bb7 7. O-O O-O" },

    // --- Other Important Grandmaster Systems ---
    { name: "English Opening: Symmetrical, Anti-Benoni", pgn: "1. c4 c5 2. Nf3 Nf6 3. d4 cxd4 4. Nxd4 e6 5. Nc3 Bb4" },
    { name: "Reti Opening: Modern Main Line", pgn: "1. Nf3 d5 2. c4 c6 3. g3 Nf6 4. Bg2 Bf5 5. cxd5 cxd5 6. Qb3 Qc8 7. Nc3 e6 8. d3" },
    { name: "Petroff Defense: Modern Attack", pgn: "1. e4 e5 2. Nf3 Nf6 3. d4 Nxe4 4. Bd3 d5 5. Nxe5 Nd7 6. Nxd7 Bxd7 7. O-O Bd6 8. c4" },
    { name: "Scotch Game: Mieses Variation, Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5 Qe7 7. Qe2 Nd5 8. c4 Bb7 9. Nd2" },
    
    // =================================================================
//         ELITE GRANDMASTER REPERTOIRE EXPANSION (v3.0)
// =================================================================
// This pack adds the remaining critical, theoretically-heavy opening
// systems required for a complete, modern, top-tier repertoire.

// --- Premier Anti-Sicilian Systems: The Rossolimo ---
{ name: "Sicilian: Rossolimo Variation, Main Line", pgn: "1. e4 c5 2. Nf3 Nc6 3. Bb5 g6 4. Bxc6 bxc6 5. O-O Bg7 6. Re1 e5 7. b4 cxb4 8. a3 c5 9. axb4 cxb4 10. d4" },
// WHY: The Rossolimo is a top-tier, professional weapon against the Sicilian. This deep line covers the most critical and complex ideas.

{ name: "Sicilian: Rossolimo Variation, ...d6 Line", pgn: "1. e4 c5 2. Nf3 Nc6 3. Bb5 d6 4. O-O Bd7 5. Re1 Nf6 6. c3 a6 7. Ba4 b5 8. Bc2 e5 9. h3" },
// WHY: Covers the solid ...d6 setup, leading to a more strategic, Ruy Lopez-style game.

{ name: "Sicilian: Rossolimo Variation, ...e6 Line", pgn: "1. e4 c5 2. Nf3 Nc6 3. Bb5 e6 4. O-O Nge7 5. Re1 a6 6. Bf1 d5 7. exd5 Nxd5 8. d4" },
// WHY: Covers the flexible ...e6 setup, a very common and important response.

// --- Deeper Italian Theory: The Giuoco Pianissimo ---
{ name: "Italian: Giuoco Pianissimo, Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 Nf6 5. O-O d6 6. c3 a6 7. a4 Ba7 8. Re1 O-O 9. h3 Ne7 10. d4" },
// WHY: The modern "Quiet Italian" is the most popular opening at the elite level. This line is the absolute main line, essential for modern theory.

{ name: "Italian: Giuoco Pianissimo, d4-d5 ideas", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 Nf6 5. O-O d6 6. c3 O-O 7. Nbd2 a5 8. Re1 Be6 9. Bb5" },
// WHY: A critical alternative plan in the Pianissimo, showing a deeper strategic understanding of the structure.

{ name: "Italian: Two Knights, Modern Bishop Check", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3 d5 5. exd5 Nxd5 6. O-O Be7 7. Re1 Bf6" },
// WHY: This is a modern and respected way to handle the Two Knights, adding nuance beyond the aggressive Ng5 lines.

// --- Deeper Catalan Theory: The Open Catalan Main Lines ---
{ name: "Catalan: Open, Main Line (8...Bd7)", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 dxc4 5. Nf3 Be7 6. O-O O-O 7. Qc2 a6 8. a4 Bd7 9. Qxc4 Bc6 10. Bf4 a5 11. Nc3" },
// WHY: The Open Catalan is a battleground of modern theory. This is the absolute main line, reaching a deep and complex middlegame.

{ name: "Catalan: Open, Classical Variation", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 dxc4 5. Nf3 c5 6. O-O Nc6 7. Qa4 Bd7 8. Qxc4 b5 9. Qd3 Rc8 10. dxc5" },
// WHY: A critical and sharp alternative for Black, creating immediate pawn tension. The engine must know this theory.

// --- Deeper Slav & Semi-Slav Theory ---
{ name: "Semi-Slav: Moscow Variation (6.Bxf6)", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. Bg5 h6 6. Bxf6 Qxf6 7. e3 Nd7 8. Bd3 dxc4 9. Bxc4" },
// WHY: An extremely important and popular variation of the Semi-Slav, aiming for a small but lasting positional edge for White.

{ name: "Semi-Slav: Anti-Moscow Variation (6.Bh4)", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. Bg5 h6 6. Bh4 dxc4 7. e4 g5 8. Bg3 b5 9. Be2 Bb7 10. O-O" },
// WHY: The ultra-sharp and tactical response to the Moscow system. This is where modern GMs fight for the win.

{ name: "Slav: Chebanenko Variation, Main Line (5.c5)", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 a6 5. c5 Nbd7 6. Bf4 Nh5 7. Bd2 Nhf6 8. Qc2 g6 9. e4" },
// WHY: The Chebanenko (or "Chameleon") Slav with 4...a6 is very popular. This line covers the most principled and aggressive response.

// --- Deeper Nimzo-Indian & King's Indian Theory ---
{ name: "Nimzo-Indian: Sämisch, Panno Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. a3 Bxc3+ 5. bxc3 c5 6. f3 Nc6 7. e4 d6" },
// WHY: This is Black's most respected way to fight against the aggressive Sämisch Variation of the Nimzo-Indian.

{ name: "King's Indian: Bayonet Attack Main Line", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. b4 Nh5 10. g3" },
// WHY: The Bayonet Attack (9. b4) is a critical modern try against the KID. This PGN provides the deep main line theory.

{ name: "King's Indian: Gligoric System", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. Be3 Ng4 8. Bg5 f6 9. Bh4" },
// WHY: The Gligoric System is a major, solid alternative to the main lines, aiming for positional pressure. A complete KID repertoire needs this.

// --- Deepening Other Major Systems ---
{ name: "Grünfeld: Exchange, Classical Main Line", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. cxd5 Nxd5 5. e4 Nxc3 6. bxc3 Bg7 7. Bc4 c5 8. Ne2 O-O 9. O-O Nc6 10. Be3 Bg4 11. f3 Na5 12. Bd3 cxd4 13. cxd4 Be6 14. Rc1" },
// WHY: This is the absolute deepest and most critical line of the entire Grünfeld Defense.

{ name: "Ruy Lopez: Anti-Marshall System (8.a4)", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 O-O 8. a4 Bb7 9. d3 d6 10. Nbd2" },
// WHY: The Marshall Attack is so dangerous that many GMs choose this Anti-Marshall system instead. It's a critical part of modern Ruy Lopez theory.

{ name: "French Defense: Winawer, Advance Variation", pgn: "1. e4 e6 2. d4 d5 3. Nc3 Bb4 4. e5 c5 5. a3 Bxc3+ 6. bxc3 Ne7 7. a4 Nbc6 8. Nf3 Qa5 9. Bd2" },
// WHY: Deepens the existing Winawer lines with a key positional idea (7. a4), essential for handling this complex opening.

{ name: "Caro-Kann: Fantasy Variation", pgn: "1. e4 c6 2. d4 d5 3. f3 dxe4 4. fxe4 e5 5. Nf3 Bg4 6. Bc4 Nd7 7. O-O Ngf6 8. c3" },
// WHY: The Fantasy Variation is a tricky and aggressive way to play against the Caro-Kann, and it's very popular at club and online levels.

{ name: "English Opening: Reversed Dragon", pgn: "1. c4 e5 2. Nc3 Nf6 3. g3 d5 4. cxd5 Nxd5 5. Bg2 Nb6 6. Nf3 Nc6 7. O-O Be7 8. a3 O-O 9. b4 Be6 10. Rb1" },
// WHY: One of the most important and tactical variations of the English Opening.

// ---  Set of Deep Theoretical Lines ---
{ name: "Sicilian: Sveshnikov, Positional Line (11.c3)", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5 6. Ndb5 d6 7. Bg5 a6 8. Na3 b5 9. Bxf6 gxf6 10. Nd5 f5 11. c3 Bg7 12. exf5 Bxf5 13. Nc2" },
{ name: "Petroff: Modern Attack", pgn: "1. e4 e5 2. Nf3 Nf6 3. d4 Nxe4 4. Bd3 d5 5. Nxe5 Nd7 6. Nxd7 Bxd7 7. O-O Bd6 8. c4" },
{ name: "Scotch Game: Mieses Variation, Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5 Qe7 7. Qe2 Nd5 8. c4 Ba6 9. b3" },
{ name: "Caro-Kann: Advance, Short Variation", pgn: "1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 cxd4 7. Nxd4 Ne7 8. O-O Nbc6 9. Bb5" },
{ name: "French: Tarrasch, Guimard Variation", pgn: "1. e4 e6 2. d4 d5 3. Nd2 Nc6 4. Ngf3 Nf6 5. e5 Nd7 6. Nb3 a5 7. a4 Be7" },
{ name: "Nimzo-Indian: Fischer Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3 b6 5. Ne2 Ba6 6. a3 Be7 7. Nf4 d5 8. cxd5" },
{ name: "Ruy Lopez: Neo-Arkhangelsk Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O b5 6. Bb3 Bc5 7. a4 Rb8 8. c3 d6 9. d4 Bb6" },
{ name: "Sicilian: Najdorf, Polugaevsky Variation", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 b5 8. e5 dxe5 9. fxe5 Qc7 10. exf6" },
{ name: "Benko Gambit: Nescafe Frappe Attack", pgn: "1. d4 Nf6 2. c4 c5 3. d5 b5 4. cxb5 a6 5. Nc3 axb5 6. e4 b4 7. Nb5 d6 8. Bf4" },
{ name: "Slav: Krause Attack", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. a4 Bf5 6. Ne5 Na6 7. e3 Nb4 8. Bxc4" },



// =================================================================
//         THE GRANDMASTER ENCYCLOPEDIA PACK (v8.0)
// =================================================================
// This is a massive, comprehensive expansion of over 60 lines, designed
// to elevate the engine's opening knowledge to an elite, encyclopedic level.

// --- I. DEEPENING THE RUY LOPEZ (THE SPANISH GAME) ---

{ name: "Ruy Lopez: Marshall Attack Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 O-O 8. c3 d5 9. exd5 Nxd5 10. Nxe5 Nxe5 11. Rxe5 c6 12. d4 Bd6" },
// WHY: The Marshall Attack is one of the most important and tactical gambits in all of chess. This is the absolute main line.

{ name: "Ruy Lopez: Anti-Marshall System (8.a4)", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 O-O 8. a4 Bb7 9. d3 d6" },
// WHY: The professional's choice to avoid the Marshall. A critical and deep positional system.

{ name: "Ruy Lopez: Zaitsev Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Bb7 10. d4 Re8" },
// WHY: A favorite of former World Champion Anatoly Karpov, the Zaitsev is a complex and highly respected fighting defense.

{ name: "Ruy Lopez: Arkhangelsk Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O b5 6. Bb3 Bb7 7. Re1 Bc5" },
// WHY: A sharp and tactical variation where Black develops the light-squared bishop to an active post early.

{ name: "Ruy Lopez: Open Variation Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Nxe4 6. d4 b5 7. Bb3 d5 8. dxe5 Be6 9. c3" },
// WHY: A classical and highly complex alternative to the Closed Ruy Lopez, leading to very different pawn structures.


// --- II. EXPANDING THE SICILIAN DEFENSE REPERTOIRE ---

{ name: "Sicilian Defense: Sveshnikov Variation Main Line", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5 6. Ndb5 d6 7. Bg5 a6 8. Na3 b5 9. Bxf6 gxf6 10. Nd5 f5" },
// WHY: A top-tier, aggressive, and theoretically massive variation of the Sicilian, favored by Magnus Carlsen.

{ name: "Sicilian Defense: Classical Variation, Richter-Rauzer Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 Nc6 6. Bg5 e6 7. Qd2 a6 8. O-O-O Bd7" },
// WHY: Before the Najdorf, this was the king of the Sicilians. It remains a powerful and respected system.

{ name: "Sicilian Defense: Taimanov Variation", pgn: "1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 Nc6 5. Nc3 Qc7 6. Be3 a6 7. Qd2 Nf6" },
// WHY: An extremely flexible and popular system that can transpose to many other lines, requiring precise knowledge.

{ name: "Sicilian Defense: Kan (Paulsen) Variation", pgn: "1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 a6 5. Nc3 Qc7 6. Bd3" },
// WHY: A quiet and positional cousin of the Taimanov, aiming for a solid structure.

{ name: "Sicilian Defense: Scheveningen Variation, Keres Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e6 6. g4 h6" },
// WHY: The Keres Attack (6.g4) is the most aggressive and dangerous way to play against the solid Scheveningen setup.

{ name: "Sicilian Defense: Four Knights Variation", pgn: "1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 Nc6 6. Ndb5 Bb4" },
// WHY: A sharp and tactical line that often leads to wild, unbalanced positions.


// --- III. MASTERING THE QUEEN'S GAMBIT AND RELATED OPENINGS ---

{ name: "Queen's Gambit Declined: Tartakower Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bh4 b6" },
// WHY: A hugely important and reliable system for Black, preparing to fianchetto the queen's bishop to solve its development problems.

{ name: "Queen's Gambit Declined: Lasker Defense", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bh4 Ne4" },
// WHY: A classic and rock-solid defense, aiming to simplify the position and neutralize White's initiative.

{ name: "Queen's Gambit Declined: Ragozin Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Nf3 Bb4 5. Bg5 h6" },
// WHY: A modern and highly aggressive hybrid of the QGD and Nimzo-Indian, very popular at the top level.

{ name: "Semi-Slav Defense: Botvinnik (Anti-Moscow) Variation", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. Bg5 h6 6. Bh4 dxc4 7. e4 g5 8. Bg3 b5" },
// WHY: One of the most complex, tactical, and deeply analyzed openings in all of chess. Essential for a top-tier engine.

{ name: "Semi-Slav Defense: Moscow Variation", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. Bg5 h6 6. Bxf6 Qxf6" },
// WHY: The quieter but still very challenging positional alternative to the Botvinnik system.

{ name: "Slav Defense: Chebanenko (Chameleon) Variation", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 a6 5. c5 Nbd7 6. Bf4" },
// WHY: An extremely popular modern interpretation of the Slav, creating a unique and flexible pawn structure.


// --- IV. MAJOR KING'S INDIAN AND GRÜNFELD DEFENSE SYSTEMS ---

{ name: "King's Indian Defense: Sämisch Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 e5" },
// WHY: A powerful and aggressive system against the KID, aiming for a massive pawn center.

{ name: "King's Indian Defense: Four Pawns Attack", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f4 O-O 6. Nf3 c5" },
// WHY: The most ambitious and space-gaining setup for White, leading to a sharp, tactical battle.

{ name: "King's Indian Defense: Fianchetto Variation", pgn: "1. d4 Nf6 2. c4 g6 3. g3 Bg7 4. Bg2 O-O 5. Nc3 d6 6. Nf3" },
// WHY: A quieter, positional way to play against the KID, fighting for control of the key d5-square.

{ name: "Grünfeld Defense: Russian System (Qb3)", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. Nf3 Bg7 5. Qb3 dxc4 6. Qxc4 O-O 7. e4" },
// WHY: Along with the Exchange variation, this is the other main pillar of modern Grünfeld theory.

{ name: "Grünfeld Defense: Fianchetto Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. g3 Bg7 5. Bg2 dxc4" },
// WHY: A major positional alternative for White, leading to a different kind of strategic battle.


// --- V. CRITICAL ANTI-SICILIAN SYSTEMS ---

{ name: "Sicilian Defense: Rossolimo Variation", pgn: "1. e4 c5 2. Nf3 Nc6 3. Bb5 g6 4. Bxc6 bxc6 5. O-O Bg7" },
// WHY: The most popular and respected professional weapon against 2...Nc6 Sicilians. Absolutely essential.

{ name: "Sicilian Defense: Moscow Variation (3.Bb5+)", pgn: "1. e4 c5 2. Nf3 d6 3. Bb5+ Nd7 4. d4 cxd4 5. Qxd4" },
// WHY: A critical sideline that avoids the main lines of the Najdorf/Dragon and poses unique positional problems.

{ name: "Sicilian Defense: Alapin Variation (2.c3)", pgn: "1. e4 c5 2. c3 Nf6 3. e5 Nd5 4. d4 cxd4 5. Nf3" },
// WHY: An extremely common choice at all levels, completely changing the nature of the game and avoiding open Sicilian theory.


// --- VI. EXPANDING THE 1.e4 e5 REPERTOIRE (BEYOND RUY LOPEZ) ---

{ name: "Scotch Game: Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5" },
// WHY: A classical opening that leads to a sharp, open game. A must-know for any 1.e4 e5 player.

{ name: "Four Knights Game: Spanish Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6 4. Bb5 Bb4 5. O-O O-O" },
// WHY: A solid, symmetrical, and strategically complex opening system.

{ name: "Evans Gambit Accepted", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4" },
// WHY: A romantic and still dangerous gambit that leads to a wide-open tactical fight.

{ name: "Two Knights Defense: Polerio Defense", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Na5 6. Bb5+ c6 7. dxc6 bxc6 8. Be2" },
// WHY: The main line and theoretically correct way to handle the aggressive 4.Ng5, a critical test of opening knowledge.


// --- VII. ADDING MORE MAJOR SYSTEMS & DEFENSES ---

{ name: "Modern Benoni Defense", pgn: "1. d4 Nf6 2. c4 c5 3. d5 e6 4. Nc3 exd5 5. cxd5 d6 6. e4 g6" },
// WHY: A sharp, asymmetrical, and fighting defense against 1.d4, aiming for dynamic counterplay.

{ name: "Bogo-Indian Defense", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 Bb4+ 4. Bd2 Qe7 5. g3" },
// WHY: A solid and respected system that avoids the deep theory of the Nimzo-Indian.

{ name: "Queen's Indian Defense: Petrosian System", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. a3 Ba6 5. Qc2" },
// WHY: An important and tricky system for White to create problems for the solid Queen's Indian setup.

{ name: "Dutch Defense: Stonewall Variation", pgn: "1. d4 f5 2. g3 Nf6 3. Bg2 e6 4. c4 d5 5. Nf3 c6 6. O-O Bd6" },
// WHY: The most famous and solid setup for the Dutch Defense, creating a fortress-like pawn structure.

{ name: "English Opening: Four Knights, King's Indian Fianchetto", pgn: "1. c4 Nf6 2. Nc3 e5 3. Nf3 Nc6 4. g3" },
// WHY: A major and highly flexible system in the English that can lead to a variety of different middlegame structures.

// =================================================================
//         FRENCH DEFENSE TRANSPOSITIONAL PATCH (v7.0)
// =================================================================

{ name: "French Defense: Advance Variation (2.e5), Main Line", pgn: "1. e4 e6 2. e5 c5 3. c3 Nc6 4. d4 cxd4 5. cxd4 d6 6. Nf3 dxe5 7. Nxe5" },
// WHY: THIS IS THE CRITICAL FIX. It teaches the engine that the best response to the immediate 2.e5 is 2...c5, immediately challenging the pawn chain. This is the main line and leads to a complex, strategically rich game that a strong engine must know.

{ name: "French Defense: Advance Variation (2.e5), Punishing 2...Nc6", pgn: "1. e4 e6 2. e5 Nc6 3. d4 d5 4. Nf3 f6 5. Bb5" },
// WHY: This teaches the engine how to play as WHITE against the move its own AI just made (2...Nc6). It shows the correct plan: solidify the center with d4, develop the knight, and put pressure on Black's setup with Bb5, securing a clear advantage.
// ---  THEORETICALLY CRITICAL LINES ---

{ name: "Nimzo-Indian: Leningrad Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Bg5 h6 5. Bh4 c5 6. d5" },
{ name: "French Defense: Steinitz Variation", pgn: "1. e4 e6 2. d4 d5 3. Nc3 Nf6 4. e5 Nfd7 5. f4 c5" },
{ name: "Caro-Kann: Panov-Botvinnik Attack Main Line", pgn: "1. e4 c6 2. d4 d5 3. exd5 cxd5 4. c4 Nf6 5. Nc3 e6 6. Nf3 Bb4" },
{ name: "Catalan: Open, Classical Main Line", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 dxc4 5. Nf3 Be7 6. O-O O-O 7. Qc2 a6 8. a4 Bd7 9. Qxc4 Bc6 10. Bg5" },
{ name: "Pirc Defense: Classical (Two Knights) System", pgn: "1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Nf3 Bg7 5. Be2 O-O 6. O-O" },


// =================================================================
//         ALEKHINE'S DEFENSE SIDELINE PATCH (v11.0)
// =================================================================

{ name: "Alekhine's Defense: Kmoch Variation", pgn: "1. e4 Nf6 2. e5 Nd5 3. Bc4 Nb6 4. Bb3 c5 5. d3 Nc6" },
// WHY: THIS IS THE DIRECT FIX. It covers the 3.Bc4 sideline you tested. The engine will now instantly know that 3...Nb6 is the correct reply and will know the main theoretical continuation.

{ name: "Alekhine's Defense: The Chase Variation", pgn: "1. e4 Nf6 2. e5 Nd5 3. c4 Nb6 4. c5 Nd5 5. Nc3" },
// WHY: This is the other major, aggressive sideline the engine must know. It's a critical theoretical battleground in the Alekhine's.

    



// =================================================================
//         THE GRANDMASTER'S FINAL CHAPTER (v12.0 - DEFINITIVE)
// =================================================================
// This final, exhaustive expansion pack adds nearly 60 of the most
// critical, deep, and theoretically sound main lines in modern chess,
// completing the engine's grandmaster-level repertoire.

// --- I. The Complete Queen's Gambit Complex ---

{ name: "Queen's Gambit Accepted: Main Line, 7.Qe2", pgn: "1. d4 d5 2. c4 dxc4 3. Nf3 Nf6 4. e3 e6 5. Bxc4 c5 6. O-O a6 7. Qe2 b5 8. Bb3 Bb7 9. Rd1 Nbd7" },
// WHY: The absolute main line of the QGA. This deep, strategic position is one of the most important in all of chess.

{ name: "Queen's Gambit Accepted: Central Variation", pgn: "1. d4 d5 2. c4 dxc4 3. e4 e5 4. Nf3 exd4 5. Bxc4 Nc6 6. O-O Be6" },
// WHY: A sharp and aggressive way to play against the QGA, leading to open, tactical positions.

{ name: "Tarrasch Defense: Main Line, Rubinstein Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 c5 4. cxd5 exd5 5. Nf3 Nc6 6. g3 Nf6 7. Bg2 Be7 8. O-O O-O 9. Bg5" },
// WHY: The most critical test of the Tarrasch Defense, creating an Isolated Queen's Pawn and a deep strategic fight.

{ name: "Queen's Gambit Declined: Cambridge Springs Defense", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Nbd7 5. e3 c6 6. Nf3 Qa5 7. Nd2" },
// WHY: A tricky and respected counter-attacking system for Black, setting several subtle traps.

{ name: "Semi-Slav Defense: Anti-Meran Gambit (Reynolds Gambit)", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. e3 Nbd7 6. Bd3 dxc4 7. Bxc4 b5 8. Bd3 a6 9. e4 c5 10. e5" },
// WHY: A sharp, modern gambit line in the Meran that the engine must know how to handle as both sides.


// --- II. Elite Sicilian Main Lines ---

{ name: "Sicilian Defense: Accelerated Dragon, Maroczy Bind", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6 5. c4 Bg7 6. Be3 Nf6 7. Nc3 O-O" },
// WHY: White's most principled and positionally sound response to the Accelerated Dragon, clamping down on Black's counterplay.

{ name: "Sicilian Defense: Kalashnikov Variation", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 e5 5. Nb5 d6 6. c4" },
// WHY: A close cousin of the Sveshnikov, this is a modern and theoretically heavy system that is vital for a complete Sicilian repertoire.

{ name: "Sicilian Defense: Najdorf, Poisoned Pawn Variation", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Qb6 8. Qd2 Qxb2 9. Rb1 Qa3" },
// WHY: One of the most legendary, complex, and deeply analyzed variations in chess history, famously championed by Bobby Fischer.

{ name: "Sicilian Defense: Dragon, Yugoslav Attack, 9.O-O-O", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. Be3 Bg7 7. f3 O-O 8. Qd2 Nc6 9. O-O-O d5" },
// WHY: The most aggressive and critical continuation of the Yugoslav Attack, where Black strikes back immediately in the center.

{ name: "Sicilian Defense: Scheveningen Variation, Main Line", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e6 6. Be2 a6 7. O-O Be7 8. f4 O-O" },
// WHY: A classic and resilient Sicilian setup, creating a "small center" of pawns. Essential knowledge.


// --- III. Modern Ruy Lopez Theory ---

{ name: "Ruy Lopez: Anti-Berlin with 4.d3", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. d3 Bc5 5. c3 O-O 6. O-O Re8" },
// WHY: Due to the solidity of the Berlin Defense, this has become the modern main line for many top GMs who want to avoid the drawish endgame.

{ name: "Ruy Lopez: Chigorin Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 10. Bc2 c5 11. d4 Qc7" },
// WHY: A classical and strategically profound defense, central to the history and theory of the Ruy Lopez.

{ name: "Ruy Lopez: Smyslov (Fianchetto) Defense", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 g6 4. c3 a6 5. Ba4" },
// WHY: A solid, hypermodern approach where Black fianchettoes the king's bishop, leading to unique positional struggles.

{ name: "Ruy Lopez: Steinitz Defense Deferred (Modern Steinitz)", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 d6 5. c3" },
// WHY: A more flexible and modern version of the old Steinitz Defense, keeping options open for Black.


// --- IV. Nimzo-Indian and King's Indian Main Lines ---

{ name: "Nimzo-Indian Defense: Classical Variation (4.Qc2)", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Qc2 O-O 5. a3 Bxc3+ 6. Qxc3 d5 7. Bg5" },
// WHY: One of the two most important and popular variations of the Nimzo-Indian, leading to a deep strategic battle.

{ name: "Nimzo-Indian Defense: Rubinstein Variation Main Line", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3 O-O 5. Bd3 d5 6. cxd5 exd5 7. Ne2 Re8" },
// WHY: The other main pillar of the Nimzo, creating a solid pawn structure and a complex middlegame.

{ name: "Nimzo-Indian Defense: Hübner Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3 c5 5. Bd3 Nc6 6. Nf3 Bxc3+ 7. bxc3 d6" },
// WHY: A sharp and strategically complex system where Black attacks White's doubled pawns.

{ name: "King's Indian Defense: Classical, Bayonet Attack", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. b4" },
// WHY: The Bayonet Attack (9.b4) is the modern main line and most critical test of the entire King's Indian Defense.

{ name: "King's Indian Defense: Petrosian System", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. d5" },
// WHY: A solid and positional system for White, aiming to restrict Black's activity. A favorite of many world champions.

{ name: "King's Indian Defense: Averbakh Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Be2 O-O 6. Bg5" },
// WHY: An aggressive system where White develops the bishop to g5 early, putting immediate pressure on Black's setup.


// --- V. Core Openings & Systems ---

{ name: "English Opening: Reversed Dragon", pgn: "1. c4 e5 2. Nc3 Nf6 3. g3 d5 4. cxd5 Nxd5 5. Bg2 Nb6" },
// WHY: A highly theoretical and important way for Black to play against the English, creating a reversed version of the Sicilian Dragon.

{ name: "Catalan Opening: Open, Classical Main Line", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 dxc4 5. Nf3 Be7 6. O-O O-O 7. Qc2 a6 8. a4 Bd7 9. Qxc4 Bc6 10. Bg5" },
// WHY: This is the deepest and most critical main line of the entire Open Catalan complex.

{ name: "French Defense: Tarrasch Variation, Main Line", pgn: "1. e4 e6 2. d4 d5 3. Nd2 Nf6 4. e5 Nfd7 5. Bd3 c5 6. c3 Nc6 7. Ne2 cxd4 8. cxd4 f6" },
// WHY: The most important and theoretically heavy variation of the solid Tarrasch Defense.

{ name: "Caro-Kann Defense: Classical Main Line (Steinitz)", pgn: "1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5 5. Ng3 Bg6 6. h4 h6 7. Nf3 Nd7 8. h5 Bh7 9. Bd3 Bxd3 10. Qxd3 e6 11. Bf4" },
// WHY: The absolute main line of the Caro-Kann, leading to a deep and complex middlegame where both sides have numerous plans.

{ name: "Dutch Defense: Classical Variation", pgn: "1. d4 f5 2. c4 Nf6 3. g3 e6 4. Bg2 Be7 5. Nf3 O-O 6. O-O d6" },
// WHY: A very solid and strategically sound way to play the Dutch, controlling the center and preparing for a kingside expansion.

// --- And at least 30 more essential lines to ensure encyclopedic knowledge ---

{ name: "Nimzo-Indian: Kmoch Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. f3 d5 5. a3" },
{ name: "Grünfeld: Taimanov Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. Bg5 Ne4 5. Bh4" },
{ name: "Sicilian: Najdorf, Adams Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. h3 e6 7. g4" },
{ name: "French: Alekhine-Chatard Attack", pgn: "1. e4 e6 2. d4 d5 3. Nc3 Nf6 4. Bg5 Be7 5. e5 Nfd7 6. h4" },
{ name: "QGD: Harrwitz Attack", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bf4" },
{ name: "English: Botvinnik System", pgn: "1. c4 e5 2. g3 Nc6 3. Bg2 g6 4. Nc3 Bg7 5. e4 d6 6. d3" },
{ name: "Pirc: Byrne Variation", pgn: "1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Bg5" },
{ name: "Slav: Geller Gambit", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. e4 b5 6. e5" },
{ name: "Ruy Lopez: Worrall Attack", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. Qe2" },
{ name: "Sicilian: O'Kelly Variation", pgn: "1. e4 c5 2. Nf3 a6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5" },
{ name: "Caro-Kann: Two Knights Variation", pgn: "1. e4 c6 2. Nf3 d5 3. Nc3 Bg4 4. h3" },
{ name: "Dutch: Ilyin-Zhenevsky System", pgn: "1. d4 f5 2. c4 Nf6 3. g3 e6 4. Bg2 Be7" },
{ name: "Reti: Capablanca's Variation", pgn: "1. Nf3 Nf6 2. c4 c6 3. b3 d5 4. Bb2" },
{ name: "King's Indian: Averbakh Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Be2 O-O 6. Bg5" },
{ name: "Nimzo-Indian: Three Knights Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Nf3 b6" },
{ name: "QGA: Alekhine Variation", pgn: "1. d4 d5 2. c4 dxc4 3. Nf3 a6" },
{ name: "Sicilian: Sozin Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 Nc6 6. Bc4 e6" },
{ name: "French: Rubinstein Variation", pgn: "1. e4 e6 2. d4 d5 3. Nc3 dxe4 4. Nxe4" },
{ name: "Petroff: Cochrane Gambit", pgn: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nxf7" },
{ name: "English: Mikenas-Carls Variation", pgn: "1. c4 Nf6 2. Nc3 e6 3. e4" },
{ name: "Benko Gambit: Zaitsev Variation", pgn: "1. d4 Nf6 2. c4 c5 3. d5 b5 4. cxb5 a6 5. Nc3" },
{ name: "Ruy Lopez: Schliemann Defense", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 f5 4. Nc3" },
{ name: "Sicilian: Grand Prix Attack", pgn: "1. e4 c5 2. f4 d5 3. exd5 Nf6" },

{ name: "King's Gambit Declined: Classical Variation", pgn: "1. e4 e5 2. f4 Bc5 3. Nf3 d6" },
{ name: "Four Knights: Scotch Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6 4. d4 exd4 5. Nxd4" },
{ name: "QGD: Alatortsev Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Be7 4. Nf3 Nf6 5. Bf4" },
{ name: "Vienna Game: Stanley Variation", pgn: "1. e4 e5 2. Nc3 Nf6 3. Bc4 Nxe4" },
{ name: "Trompowsky Attack: Main Line", pgn: "1. d4 Nf6 2. Bg5 Ne4 3. Bf4 d5 4. f3 Nf6" },
{ name: "Colle-Zukertort System", pgn: "1. d4 d5 2. Nf3 Nf6 3. e3 e6 4. Bd3 c5 5. b3" },
{ name: "Modern Defense: Averbakh System", pgn: "1. e4 g6 2. d4 Bg7 3. c4 d6 4. Nc3" },



// [Your existing grandmaster_library.js code here...]

// =================================================================
//         THE GRANDMASTER ENCYCLOPEDIA PACK (v8.0)
// =================================================================
// This is a massive, comprehensive expansion of over 60 lines, designed
// to elevate the engine's opening knowledge to an elite, encyclopedic level.

// --- I. DEEPENING THE RUY LOPEZ (THE SPANISH GAME) ---

{ name: "Ruy Lopez: Marshall Attack Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 O-O 8. c3 d5 9. exd5 Nxd5 10. Nxe5 Nxe5 11. Rxe5 c6 12. d4 Bd6" },
// WHY: The Marshall Attack is one of the most important and tactical gambits in all of chess. This is the absolute main line.

{ name: "Ruy Lopez: Anti-Marshall System (8.a4)", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 O-O 8. a4 Bb7 9. d3 d6" },
// WHY: The professional's choice to avoid the Marshall. A critical and deep positional system.

{ name: "Ruy Lopez: Zaitsev Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Bb7 10. d4 Re8" },
// WHY: A favorite of former World Champion Anatoly Karpov, the Zaitsev is a complex and highly respected fighting defense.

{ name: "Ruy Lopez: Arkhangelsk Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O b5 6. Bb3 Bb7 7. Re1 Bc5" },
// WHY: A sharp and tactical variation where Black develops the light-squared bishop to an active post early.

{ name: "Ruy Lopez: Open Variation Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Nxe4 6. d4 b5 7. Bb3 d5 8. dxe5 Be6 9. c3" },
// WHY: A classical and highly complex alternative to the Closed Ruy Lopez, leading to very different pawn structures.


// --- II. EXPANDING THE SICILIAN DEFENSE REPERTOIRE ---

{ name: "Sicilian Defense: Sveshnikov Variation Main Line", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5 6. Ndb5 d6 7. Bg5 a6 8. Na3 b5 9. Bxf6 gxf6 10. Nd5 f5" },
// WHY: A top-tier, aggressive, and theoretically massive variation of the Sicilian, favored by Magnus Carlsen.

{ name: "Sicilian Defense: Classical Variation, Richter-Rauzer Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 Nc6 6. Bg5 e6 7. Qd2 a6 8. O-O-O Bd7" },
// WHY: Before the Najdorf, this was the king of the Sicilians. It remains a powerful and respected system.

{ name: "Sicilian Defense: Taimanov Variation", pgn: "1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 Nc6 5. Nc3 Qc7 6. Be3 a6 7. Qd2 Nf6" },
// WHY: An extremely flexible and popular system that can transpose to many other lines, requiring precise knowledge.

{ name: "Sicilian Defense: Kan (Paulsen) Variation", pgn: "1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 a6 5. Nc3 Qc7 6. Bd3" },
// WHY: A quiet and positional cousin of the Taimanov, aiming for a solid structure.

{ name: "Sicilian Defense: Scheveningen Variation, Keres Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e6 6. g4 h6" },
// WHY: The Keres Attack (6.g4) is the most aggressive and dangerous way to play against the solid Scheveningen setup.

{ name: "Sicilian Defense: Four Knights Variation", pgn: "1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 Nc6 6. Ndb5 Bb4" },
// WHY: A sharp and tactical line that often leads to wild, unbalanced positions.


// --- III. MASTERING THE QUEEN'S GAMBIT AND RELATED OPENINGS ---

{ name: "Queen's Gambit Declined: Tartakower Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bh4 b6" },
// WHY: A hugely important and reliable system for Black, preparing to fianchetto the queen's bishop to solve its development problems.

{ name: "Queen's Gambit Declined: Lasker Defense", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bh4 Ne4" },
// WHY: A classic and rock-solid defense, aiming to simplify the position and neutralize White's initiative.

{ name: "Queen's Gambit Declined: Ragozin Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Nf3 Bb4 5. Bg5 h6" },
// WHY: A modern and highly aggressive hybrid of the QGD and Nimzo-Indian, very popular at the top level.

{ name: "Semi-Slav Defense: Botvinnik (Anti-Moscow) Variation", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. Bg5 h6 6. Bh4 dxc4 7. e4 g5 8. Bg3 b5" },
// WHY: One of the most complex, tactical, and deeply analyzed openings in all of chess. Essential for a top-tier engine.

{ name: "Semi-Slav Defense: Moscow Variation", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. Bg5 h6 6. Bxf6 Qxf6" },
// WHY: The quieter but still very challenging positional alternative to the Botvinnik system.

{ name: "Slav Defense: Chebanenko (Chameleon) Variation", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 a6 5. c5 Nbd7 6. Bf4" },
// WHY: An extremely popular modern interpretation of the Slav, creating a unique and flexible pawn structure.


// --- IV. MAJOR KING'S INDIAN AND GRÜNFELD DEFENSE SYSTEMS ---

{ name: "King's Indian Defense: Sämisch Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 e5" },
// WHY: A powerful and aggressive system against the KID, aiming for a massive pawn center.

{ name: "King's Indian Defense: Four Pawns Attack", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f4 O-O 6. Nf3 c5" },
// WHY: The most ambitious and space-gaining setup for White, leading to a sharp, tactical battle.

{ name: "King's Indian Defense: Fianchetto Variation", pgn: "1. d4 Nf6 2. c4 g6 3. g3 Bg7 4. Bg2 O-O 5. Nc3 d6 6. Nf3" },
// WHY: A quieter, positional way to play against the KID, fighting for control of the key d5-square.

{ name: "Grünfeld Defense: Russian System (Qb3)", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. Nf3 Bg7 5. Qb3 dxc4 6. Qxc4 O-O 7. e4" },
// WHY: Along with the Exchange variation, this is the other main pillar of modern Grünfeld theory.

{ name: "Grünfeld Defense: Fianchetto Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. g3 Bg7 5. Bg2 dxc4" },
// WHY: A major positional alternative for White, leading to a different kind of strategic battle.


// --- V. CRITICAL ANTI-SICILIAN SYSTEMS ---

{ name: "Sicilian Defense: Rossolimo Variation", pgn: "1. e4 c5 2. Nf3 Nc6 3. Bb5 g6 4. Bxc6 bxc6 5. O-O Bg7" },
// WHY: The most popular and respected professional weapon against 2...Nc6 Sicilians. Absolutely essential.

{ name: "Sicilian Defense: Moscow Variation (3.Bb5+)", pgn: "1. e4 c5 2. Nf3 d6 3. Bb5+ Nd7 4. d4 cxd4 5. Qxd4" },
// WHY: A critical sideline that avoids the main lines of the Najdorf/Dragon and poses unique positional problems.

{ name: "Sicilian Defense: Alapin Variation (2.c3)", pgn: "1. e4 c5 2. c3 Nf6 3. e5 Nd5 4. d4 cxd4 5. Nf3" },
// WHY: An extremely common choice at all levels, completely changing the nature of the game and avoiding open Sicilian theory.


// --- VI. EXPANDING THE 1.e4 e5 REPERTOIRE (BEYOND RUY LOPEZ) ---

{ name: "Scotch Game: Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5" },
// WHY: A classical opening that leads to a sharp, open game. A must-know for any 1.e4 e5 player.

{ name: "Four Knights Game: Spanish Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6 4. Bb5 Bb4 5. O-O O-O" },
// WHY: A solid, symmetrical, and strategically complex opening system.

{ name: "Evans Gambit Accepted", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4" },
// WHY: A romantic and still dangerous gambit that leads to a wide-open tactical fight.

{ name: "Two Knights Defense: Polerio Defense", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Na5 6. Bb5+ c6 7. dxc6 bxc6 8. Be2" },
// WHY: The main line and theoretically correct way to handle the aggressive 4.Ng5, a critical test of opening knowledge.


// --- VII. ADDING MORE MAJOR SYSTEMS & DEFENSES ---

{ name: "Modern Benoni Defense", pgn: "1. d4 Nf6 2. c4 c5 3. d5 e6 4. Nc3 exd5 5. cxd5 d6 6. e4 g6" },
// WHY: A sharp, asymmetrical, and fighting defense against 1.d4, aiming for dynamic counterplay.

{ name: "Bogo-Indian Defense", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 Bb4+ 4. Bd2 Qe7 5. g3" },
// WHY: A solid and respected system that avoids the deep theory of the Nimzo-Indian.

{ name: "Queen's Indian Defense: Petrosian System", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. a3 Ba6 5. Qc2" },
// WHY: An important and tricky system for White to create problems for the solid Queen's Indian setup.

{ name: "Dutch Defense: Stonewall Variation", pgn: "1. d4 f5 2. g3 Nf6 3. Bg2 e6 4. c4 d5 5. Nf3 c6 6. O-O Bd6" },
// WHY: The most famous and solid setup for the Dutch Defense, creating a fortress-like pawn structure.

{ name: "English Opening: Four Knights, King's Indian Fianchetto", pgn: "1. c4 Nf6 2. Nc3 e5 3. Nf3 Nc6 4. g3" },
// WHY: A major and highly flexible system in the English that can lead to a variety of different middlegame structures.

// --- VIII. ENSURING ENCYCLOPEDIC COMPLETENESS (30+ MORE CRITICAL LINES) ---

{ name: "Nimzo-Indian: Kmoch Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. f3 d5 5. a3" },
{ name: "Grünfeld: Taimanov Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. Bg5 Ne4 5. Bh4" },
{ name: "Sicilian: Najdorf, Adams Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. h3 e6 7. g4" },
{ name: "French: Alekhine-Chatard Attack", pgn: "1. e4 e6 2. d4 d5 3. Nc3 Nf6 4. Bg5 Be7 5. e5 Nfd7 6. h4" },
{ name: "QGD: Harrwitz Attack", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bf4" },
{ name: "English: Botvinnik System", pgn: "1. c4 e5 2. g3 Nc6 3. Bg2 g6 4. Nc3 Bg7 5. e4 d6 6. d3" },
{ name: "Pirc: Byrne Variation", pgn: "1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Bg5" },
{ name: "Slav: Geller Gambit", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. e4 b5 6. e5" },
{ name: "Ruy Lopez: Worrall Attack", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. Qe2" },
{ name: "Sicilian: O'Kelly Variation", pgn: "1. e4 c5 2. Nf3 a6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5" },
{ name: "Caro-Kann: Two Knights Variation", pgn: "1. e4 c6 2. Nf3 d5 3. Nc3 Bg4 4. h3" },
{ name: "Dutch: Ilyin-Zhenevsky System", pgn: "1. d4 f5 2. c4 Nf6 3. g3 e6 4. Bg2 Be7" },
{ name: "Reti: Capablanca's Variation", pgn: "1. Nf3 Nf6 2. c4 c6 3. b3 d5 4. Bb2" },
{ name: "King's Indian: Averbakh Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Be2 O-O 6. Bg5" },
{ name: "Nimzo-Indian: Three Knights Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Nf3 b6" },
{ name: "QGA: Alekhine Variation", pgn: "1. d4 d5 2. c4 dxc4 3. Nf3 a6" },
{ name: "Sicilian: Sozin Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 Nc6 6. Bc4 e6" },
{ name: "French: Rubinstein Variation", pgn: "1. e4 e6 2. d4 d5 3. Nc3 dxe4 4. Nxe4" },
{ name: "Petroff: Cochrane Gambit", pgn: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nxf7" },
{ name: "English: Mikenas-Carls Variation", pgn: "1. c4 Nf6 2. Nc3 e6 3. e4" },
{ name: "Benko Gambit: Zaitsev Variation", pgn: "1. d4 Nf6 2. c4 c5 3. d5 b5 4. cxb5 a6 5. Nc3" },
{ name: "Ruy Lopez: Schliemann Defense", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 f5 4. Nc3" },
{ name: "Sicilian: Grand Prix Attack", pgn: "1. e4 c5 2. f4 d5 3. exd5 Nf6" },
{ name: "King's Gambit Declined: Classical Variation", pgn: "1. e4 e5 2. f4 Bc5 3. Nf3 d6" },
{ name: "Four Knights: Scotch Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6 4. d4 exd4 5. Nxd4" },
{ name: "QGD: Alatortsev Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Be7 4. Nf3 Nf6 5. Bf4" },
{ name: "Vienna Game: Stanley Variation", pgn: "1. e4 e5 2. Nc3 Nf6 3. Bc4 Nxe4" },
{ name: "Trompowsky Attack: Main Line", pgn: "1. d4 Nf6 2. Bg5 Ne4 3. Bf4 d5 4. f3 Nf6" },
{ name: "Colle-Zukertort System", pgn: "1. d4 d5 2. Nf3 Nf6 3. e3 e6 4. Bd3 c5 5. b3" },
{ name: "Modern Defense: Averbakh System", pgn: "1. e4 g6 2. d4 Bg7 3. c4 d6 4. Nc3" },




{ name: "George Defense: Main Line with d5", pgn: "1. e4 a6 2. d4 b5 3. Nf3 Bb7 4. d5 Nf6 5. Bd3 e6 6. dxe6 fxe6" },
// WHY: This fixes the user's reported gap. After White plays the strong 4.d5, this line covers Black's most active reply (4...Nf6) and the main theoretical continuation, teaching the engine how to handle the central tension.

{ name: "George Defense: Alternate e6 Setup", pgn: "1. e4 a6 2. d4 b5 3. Nf3 Bb7 4. Bd3 e6 5. O-O Nf6 6. Re1" },
// WHY: Covers the other major setup for Black, where they play ...e6 before ...Nf6. This makes the engine's knowledge of this rare opening far more complete.

// =================================================================
//         THE GRANDMASTER'S INTENSE CHAPTER (v12.0 - DEFINITIVE)
// =================================================================
// This exhaustive expansion pack adds nearly 130 of the most
// critical, deep, and theoretically sound main lines in modern chess,
// expanding the engine's grandmaster-level repertoire.

// --- I. The Complete Queen's Gambit Complex ---

{ name: "Queen's Gambit Accepted: Main Line, 7.Qe2", pgn: "1. d4 d5 2. c4 dxc4 3. Nf3 Nf6 4. e3 e6 5. Bxc4 c5 6. O-O a6 7. Qe2 b5 8. Bb3 Bb7 9. Rd1 Nbd7" },
// WHY: The absolute main line of the QGA. This deep, strategic position is one of the most important in all of chess.

{ name: "Queen's Gambit Accepted: Central Variation", pgn: "1. d4 d5 2. c4 dxc4 3. e4 e5 4. Nf3 exd4 5. Bxc4 Nc6 6. O-O Be6" },
// WHY: A sharp and aggressive way to play against the QGA, leading to open, tactical positions where both sides have chances.

{ name: "Tarrasch Defense: Main Line, Rubinstein Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 c5 4. cxd5 exd5 5. Nf3 Nc6 6. g3 Nf6 7. Bg2 Be7 8. O-O O-O 9. Bg5" },
// WHY: The most critical test of the Tarrasch Defense, creating an Isolated Queen's Pawn and a deep strategic fight.

{ name: "Queen's Gambit Declined: Cambridge Springs Defense", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Nbd7 5. e3 c6 6. Nf3 Qa5 7. Nd2 dxc4 8. Bxf6 Nxf6 9. Nxc4" },
// WHY: A tricky and respected counter-attacking system for Black, leading to unique and balanced positions.

{ name: "Semi-Slav Defense: Meran Variation, Main Line", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. e3 Nbd7 6. Bd3 dxc4 7. Bxc4 b5 8. Bd3 a6 9. e4 c5 10. d5" },
// WHY: The Meran is a cornerstone of modern theory. This is the main highway, leading to incredibly rich and complex middlegames.

{ name: "Semi-Slav Defense: Anti-Meran Gambit (Reynolds Gambit)", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. e3 Nbd7 6. Bd3 dxc4 7. Bxc4 b5 8. Bd3 a6 9. e4 c5 10. e5" },
// WHY: A sharp, modern gambit line in the Meran that the engine must know how to handle as both sides.

{ name: "Slav Defense: Geller Gambit", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. e4 b5 6. e5 Nd5 7. a4 e6" },
// WHY: An aggressive gambit for White in the Slav that leads to sharp, tactical, and roughly equal chances.


// --- II. Elite Sicilian Main Lines (Deep Theory) ---

{ name: "Sicilian Defense: Accelerated Dragon, Maroczy Bind", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6 5. c4 Bg7 6. Be3 Nf6 7. Nc3 O-O 8. Be2 d6 9. O-O" },
// WHY: White's most principled and positionally sound response to the Accelerated Dragon, leading to a deep strategic struggle.

{ name: "Sicilian Defense: Kalashnikov Variation", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 e5 5. Nb5 d6 6. c4 Be7 7. N1c3 a6 8. Na3" },
// WHY: A close cousin of the Sveshnikov, this is a modern and theoretically heavy system that is vital for a complete Sicilian repertoire.

{ name: "Sicilian Defense: Najdorf, Poisoned Pawn Variation", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Qb6 8. Qd2 Qxb2 9. Rb1 Qa3 10. f5" },
// WHY: One of the most legendary, complex, and deeply analyzed variations in chess history, famously championed by Bobby Fischer.

{ name: "Sicilian Defense: Najdorf, Opocensky Variation (6.Be2)", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be2 e5 7. Nb3 Be7 8. O-O O-O 9. Kh1" },
// WHY: The classical and positional alternative to the sharp 6.Bg5 lines, favored by Karpov and other strategic players.

{ name: "Sicilian Defense: Dragon, Yugoslav Attack, 9.O-O-O Main Line", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. Be3 Bg7 7. f3 O-O 8. Qd2 Nc6 9. O-O-O d5 10. exd5 Nxd5 11. Nxc6 bxc6" },
// WHY: The most aggressive and critical continuation of the Yugoslav Attack, where Black strikes back immediately in the center.

{ name: "Sicilian Defense: Scheveningen Variation, Main Line", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e6 6. Be2 a6 7. O-O Be7 8. f4 O-O 9. Kh1" },
// WHY: A classic and resilient Sicilian setup, creating a "small center" of pawns. Essential knowledge for a complete repertoire.

{ name: "Sicilian Defense: Sveshnikov, Novosibirsk Variation", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5 6. Ndb5 d6 7. Bg5 a6 8. Na3 b5 9. Bxf6 gxf6 10. Nd5 Bg7" },
// WHY: A critical and sharp sideline in the Sveshnikov, leading to unbalanced and exciting positions.

{ name: "Sicilian Defense: Taimanov, English Attack", pgn: "1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 Nc6 5. Nc3 Qc7 6. Be3 a6 7. f3 Nf6 8. Qd2" },
// WHY: White applies the aggressive English Attack setup against the flexible Taimanov, leading to a sharp battle.


// --- III. Modern Ruy Lopez & Italian Game Theory ---

{ name: "Ruy Lopez: Anti-Berlin with 4.d3", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. d3 Bc5 5. c3 O-O 6. O-O Re8 7. Nbd2 a6 8. Ba4" },
// WHY: Due to the solidity of the Berlin Defense, this has become the modern main line for many top GMs who want to avoid the drawish endgame.

{ name: "Ruy Lopez: Chigorin Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 10. Bc2 c5 11. d4 Qc7 12. Nbd2" },
// WHY: A classical and strategically profound defense, central to the history and theory of the Ruy Lopez.

{ name: "Ruy Lopez: Smyslov (Fianchetto) Defense", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 g6 4. c3 a6 5. Ba4 d6 6. d4" },
// WHY: A solid, hypermodern approach where Black fianchettoes the king's bishop, leading to unique positional struggles.

{ name: "Ruy Lopez: Steinitz Defense Deferred (Modern Steinitz)", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 d6 5. c3 Bd7 6. d4" },
// WHY: A more flexible and modern version of the old Steinitz Defense, keeping options open for Black.

{ name: "Italian Game: Giuoco Pianissimo Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O a6 7. a4 Ba7 8. Re1 O-O 9. h3" },
// WHY: The "Quiet Italian" is the pinnacle of modern opening theory, leading to incredibly deep and subtle strategic battles.


// --- IV. Nimzo-Indian and King's Indian Main Lines ---

{ name: "Nimzo-Indian Defense: Classical Variation (4.Qc2)", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Qc2 O-O 5. a3 Bxc3+ 6. Qxc3 d5 7. Bg5 c5 8. dxc5 d4" },
// WHY: One of the two most important and popular variations of the Nimzo-Indian, leading to a deep strategic battle.

{ name: "Nimzo-Indian Defense: Rubinstein Variation Main Line", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3 O-O 5. Bd3 d5 6. cxd5 exd5 7. Ne2 Re8 8. O-O Bd6" },
// WHY: The other main pillar of the Nimzo, creating a solid pawn structure and a complex middlegame.

{ name: "Nimzo-Indian Defense: Hübner Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3 c5 5. Bd3 Nc6 6. Nf3 Bxc3+ 7. bxc3 d6 8. e4" },
// WHY: A sharp and strategically complex system where Black attacks White's doubled pawns.

{ name: "King's Indian Defense: Classical, Bayonet Attack", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. b4" },
// WHY: The Bayonet Attack (9.b4) is the modern main line and most critical test of the entire King's Indian Defense.

{ name: "King's Indian Defense: Petrosian System", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. d5 a5 8. Bg5" },
// WHY: A solid and positional system for White, aiming to restrict Black's activity. A favorite of many world champions.

{ name: "King's Indian Defense: Averbakh Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Be2 O-O 6. Bg5 c5 7. d5" },
// WHY: An aggressive system where White develops the bishop to g5 early, putting immediate pressure on Black's setup.


// --- V. Core Openings & Systems (French, Caro-Kann, Catalan) ---

{ name: "English Opening: Reversed Dragon", pgn: "1. c4 e5 2. Nc3 Nf6 3. g3 d5 4. cxd5 Nxd5 5. Bg2 Nb6 6. e3 Nc6 7. Nge2" },
// WHY: A highly theoretical and important way for Black to play against the English, creating a reversed version of the Sicilian Dragon.

{ name: "Catalan Opening: Open, Classical Main Line", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 dxc4 5. Nf3 Be7 6. O-O O-O 7. Qc2 a6 8. a4 Bd7 9. Qxc4 Bc6 10. Bg5" },
// WHY: This is the deepest and most critical main line of the entire Open Catalan complex.

{ name: "French Defense: Tarrasch Variation, Main Line", pgn: "1. e4 e6 2. d4 d5 3. Nd2 Nf6 4. e5 Nfd7 5. Bd3 c5 6. c3 Nc6 7. Ne2 cxd4 8. cxd4 f6 9. exf6 Nxf6 10. Nf3 Bd6" },
// WHY: The most important and theoretically heavy variation of the solid Tarrasch Defense.

{ name: "French Defense: Steinitz Variation", pgn: "1. e4 e6 2. d4 d5 3. Nc3 Nf6 4. e5 Nfd7 5. f4 c5 6. Nf3 Nc6 7. Be3" },
// WHY: A classical and highly important variation, leading to a locked center where both sides play on the wings.

{ name: "Caro-Kann Defense: Classical Main Line (Steinitz)", pgn: "1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5 5. Ng3 Bg6 6. h4 h6 7. Nf3 Nd7 8. h5 Bh7 9. Bd3 Bxd3 10. Qxd3 e6 11. Bf4 Qa5+" },
// WHY: The absolute main line of the Caro-Kann, leading to a deep and complex middlegame where both sides have numerous plans.

{ name: "Caro-Kann Defense: Panov-Botvinnik Attack Main Line", pgn: "1. e4 c6 2. d4 d5 3. exd5 cxd5 4. c4 Nf6 5. Nc3 e6 6. Nf3 Bb4 7. cxd5 Nxd5 8. Qc2" },
// WHY: A sharp and challenging system that leads to Isolated Queen's Pawn positions, requiring precise play.

{ name: "Dutch Defense: Classical Variation", pgn: "1. d4 f5 2. c4 Nf6 3. g3 e6 4. Bg2 Be7 5. Nf3 O-O 6. O-O d6 7. Nc3 Qe8" },
// WHY: A very solid and strategically sound way to play the Dutch, controlling the center and preparing for a kingside expansion.

// --- VI. Completing the Professional Repertoire (70+ More Lines) ---

// More Sicilian Defenses
{ name: "Sicilian Defense: Najdorf, Adams Attack (6.h3)", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. h3 e5 7. Nde2" },
{ name: "Sicilian Defense: Najdorf, Fischer-Sozin Attack (6.Bc4)", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bc4 e6 7. Bb3 b5" },
{ name: "Sicilian Defense: Dragon, Levenfish Attack", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. f4" },
{ name: "Sicilian Defense: Rossolimo, Main Line with ...g6", pgn: "1. e4 c5 2. Nf3 Nc6 3. Bb5 g6 4. O-O Bg7 5. Re1 e5 6. Bxc6 dxc6" },
{ name: "Sicilian Defense: Alapin, 2...d5 Main Line", pgn: "1. e4 c5 2. c3 d5 3. exd5 Qxd5 4. d4 Nf6 5. Nf3 Bg4 6. Be2" },
{ name: "Sicilian Defense: Moscow, 3...Nd7", pgn: "1. e4 c5 2. Nf3 d6 3. Bb5+ Nd7 4. d4 a6 5. Bxd7+ Bxd7 6. O-O" },

// More Ruy Lopez & Italian
{ name: "Ruy Lopez: Berlin Defense, l'Hermet Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. O-O Nxe4 5. d4 Nd6 6. Ba4" },
{ name: "Ruy Lopez: Exchange Variation, 5.O-O", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Bxc6 dxc6 5. O-O f6 6. d4" },
{ name: "Italian Game: Max Lange Attack", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d4 exd4 5. O-O Bc5 6. e5 d5" },

// More Queen's Gambit & Slav
{ name: "Queen's Gambit Declined: Harrwitz Attack", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bf4" },
{ name: "Queen's Gambit Declined: Alatortsev Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Be7 4. Nf3 Nf6 5. Bf4" },
{ name: "Slav Defense: Krause Attack", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. a4 Bf5 6. Ne5" },

// More Indian Defenses
{ name: "Nimzo-Indian: Leningrad Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Bg5 h6 5. Bh4 c5 6. d5" },
{ name: "Nimzo-Indian: Sämisch, Panno Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. a3 Bxc3+ 5. bxc3 c5 6. f3" },
{ name: "Queen's Indian Defense: Fianchetto Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. g3 Ba6 5. b3" },
{ name: "King's Indian Defense: Gligoric System", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. Be3" },
{ name: "Grünfeld Defense: Prins Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. Nf3 Bg7 5. Qa4+" },

// Other Major Openings
{ name: "Petroff Defense: Modern Attack", pgn: "1. e4 e5 2. Nf3 Nf6 3. d4 Nxe4 4. Bd3 d5 5. Nxe5" },
{ name: "Scotch Game: Mieses Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5 Qe7" },
{ name: "Alekhine's Defense: Four Pawns Attack", pgn: "1. e4 Nf6 2. e5 Nd5 3. d4 d6 4. c4 Nb6 5. f4" },
{ name: "Pirc Defense: Austrian Attack", pgn: "1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. f4 Bg7 5. Nf3" },
{ name: "Modern Defense: Standard System", pgn: "1. e4 g6 2. d4 Bg7 3. Nc3 d6 4. Be3" },

// --- VII. Final Set of Deep, Critical, Professional Main Lines ---

{ name: "Sicilian, Sveshnikov, Positional Line (11.c3)", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5 6. Ndb5 d6 7. Bg5 a6 8. Na3 b5 9. Bxf6 gxf6 10. Nd5 f5 11. c3 Bg7 12. exf5" },
{ name: "Ruy Lopez, Breyer Variation, Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. Nbd2 Bb7 12. Bc2" },
{ name: "Grünfeld, Exchange, Classical Main Line", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. cxd5 Nxd5 5. e4 Nxc3 6. bxc3 Bg7 7. Bc4 c5 8. Ne2 O-O 9. O-O Nc6 10. Be3 Bg4 11. f3 Na5 12. Bd3" },
{ name: "Semi-Slav, Moscow Variation (6.Bxf6)", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. Bg5 h6 6. Bxf6 Qxf6 7. e3 Nd7 8. Bd3" },
{ name: "Semi-Slav, Anti-Moscow Variation (6.Bh4)", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. Bg5 h6 6. Bh4 dxc4 7. e4 g5 8. Bg3 b5" },
{ name: "Catalan, Open, Main Line with 10.Bf4", pgn: "1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 dxc4 5. Nf3 Be7 6. O-O O-O 7. Qc2 a6 8. a4 Bd7 9. Qxc4 Bc6 10. Bf4 a5" },
{ name: "Nimzo-Indian, Fischer Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3 b6 5. Ne2 Ba6 6. a3 Be7" },
{ name: "King's Indian, Mar del Plata, Main Line", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. Be3 f5" },
{ name: "French, Winawer, Advance Variation", pgn: "1. e4 e6 2. d4 d5 3. Nc3 Bb4 4. e5 c5 5. a3 Bxc3+ 6. bxc3 Ne7 7. a4" },
{ name: "Caro-Kann, Advance, Short Variation", pgn: "1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 cxd4 7. Nxd4 Ne7" },
{ name: "Ruy Lopez, Neo-Arkhangelsk Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O b5 6. Bb3 Bc5 7. a4" },
{ name: "Sicilian, Najdorf, Polugaevsky Variation", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 b5 8. e5" },
{ name: "English, Symmetrical, Keres Variation", pgn: "1. c4 c5 2. Nc3 Nc6 3. g3 g6 4. Bg2 Bg7 5. Nf3 e6 6. d4" },
{ name: "Reti Opening, Lasker's System", pgn: "1. Nf3 d5 2. c4 e6 3. b3 Nf6 4. g3 Be7 5. Bg2" },
{ name: "Dutch, Stonewall, Modern Setup", pgn: "1. d4 f5 2. g3 Nf6 3. Bg2 e6 4. Nf3 d5 5. O-O Bd6 6. c4 c6 7. b3" },
{ name: "QGD, Rubinstein Variation", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 Nbd7 7. Qc2 c5" },
{ name: "King's Indian Attack vs. Caro-Kann", pgn: "1. e4 c6 2. d3 d5 3. Nd2 g6 4. Ngf3 Bg7 5. g3" },
{ name: "Modern Defense, Austrian Attack, Gurgenidze System", pgn: "1. e4 g6 2. d4 Bg7 3. Nc3 c6 4. f4 d5 5. e5 h5" },
{ name: "Torre Attack, Main Line with ...h6", pgn: "1. d4 Nf6 2. Nf3 e6 3. Bg5 h6 4. Bh4 c5 5. e3" },

// Even More Professional Lines for Maximum Coverage
{ name: "Ruy Lopez: Berlin, Rio de Janeiro Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. O-O Nxe4 5. d4 Be7 6. Qe2 Nd6" },
{ name: "Sicilian: Najdorf, Byrne Variation (6.Be3)", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e6 7. Be2" },
{ name: "French: Winawer, Poisoned Pawn", pgn: "1. e4 e6 2. d4 d5 3. Nc3 Bb4 4. e5 c5 5. a3 Bxc3+ 6. bxc3 Ne7 7. Qg4 Qc7 8. Qxg7" },
{ name: "Caro-Kann: Fantasy Variation", pgn: "1. e4 c6 2. d4 d5 3. f3 dxe4 4. fxe4 e5 5. Nf3" },
{ name: "King's Indian Defense: Makogonov System", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. h3" },
{ name: "Grünfeld: Hungarian Variation", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. Nf3 Bg7 5. Bg5" },
{ name: "Slav: Reynolds Variation", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Qb3" },
{ name: "Benoni Defense: Taimanov Variation", pgn: "1. d4 Nf6 2. c4 c5 3. d5 e6 4. Nc3 exd5 5. cxd5 d6 6. e4 g6 7. f4 Bg7 8. Bb5+" },
{ name: "Catalan: Bogo-Indian Variation", pgn: "1. d4 Nf6 2. c4 e6 3. g3 Bb4+ 4. Bd2" },
{ name: "Petroff: Italian Variation", pgn: "1. e4 e5 2. Nf3 Nf6 3. Bc4" },
{ name: "Scotch: Schmidt Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nc3 Bb4" },
{ name: "English: Symmetrical, Hedgehog System", pgn: "1. c4 c5 2. Nf3 Nf6 3. g3 b6 4. Bg2 Bb7 5. O-O e6" },
{ name: "King's Indian Attack: French Variation", pgn: "1. e4 e6 2. d3 d5 3. Nd2" },
{ name: "Modern Benoni: Fianchetto Variation", pgn: "1. d4 Nf6 2. c4 c5 3. d5 e6 4. Nc3 exd5 5. cxd5 d6 6. Nf3 g6 7. g3" },
{ name: "Semi-Tarrasch Defense", pgn: "1. d4 d5 2. c4 e6 3. Nf3 Nf6 4. Nc3 c5" },
{ name: "Vienna Game: Main Line", pgn: "1. e4 e5 2. Nc3 Nf6 3. g3" },
{ name: "Four Knights: Belgrade Gambit", pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6 4. d4 exd4 5. Nd5" },
{ name: "Queen's Indian Defense: Kasparov-Petrosian System", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. a3" },
{ name: "Pirc Defense: Classical (Two Knights) System", pgn: "1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Nf3 Bg7 5. Be2" },
{ name: "Scandinavian Defense: 3...Qd6 Variation", pgn: "1. e4 d5 2. exd5 Qxd5 3. Nc3 Qd6 4. d4" },
{ name: "London System: Main Line", pgn: "1. d4 d5 2. Bf4 Nf6 3. e3 e6 4. Nf3 c5 5. c3" },
{ name: "Trompowsky Attack: Classical Defense", pgn: "1. d4 Nf6 2. Bg5 d5 3. Bxf6 exf6" },
{ name: "Colle System: Main Line", pgn: "1. d4 d5 2. Nf3 Nf6 3. e3 e6 4. Bd3 c5 5. c3" },
{ name: "Veresov Attack: Main Line", pgn: "1. d4 Nf6 2. Nc3 d5 3. Bg5" },
{ name: "Blackmar-Diemer Gambit: Accepted", pgn: "1. d4 d5 2. e4 dxe4 3. Nc3 Nf6 4. f3 exf3" },
{ name: "English Opening: Reversed Sicilian", pgn: "1. c4 e5" },
{ name: "Sicilian Defense: Hyper-Accelerated Dragon", pgn: "1. e4 c5 2. Nf3 g6" },
{ name: "Queen's Gambit Declined: Orthodox Defense", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 Nbd7" },
{ name: "King's Gambit Accepted: Modern Defense", pgn: "1. e4 e5 2. f4 exf4 3. Nf3 d5" },
{ name: "Ruy Lopez: Cozio Defense", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nge7" },
{ name: "Benko Gambit Accepted: Main Line", pgn: "1. d4 Nf6 2. c4 c5 3. d5 b5 4. cxb5 a6 5. bxa6" },

//  additions to reach peak coverage
{ name: "Nimzo-Indian: Three Knights Variation", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Nf3 c5" },
{ name: "Sicilian: Closed, Main Line", pgn: "1. e4 c5 2. Nc3 Nc6 3. g3 g6 4. Bg2 Bg7 5. d3 d6 6. f4" },
{ name: "French: Exchange Variation", pgn: "1. e4 e6 2. d4 d5 3. exd5 exd5 4. Nf3" },
{ name: "Caro-Kann: Exchange Variation", pgn: "1. e4 c6 2. d4 d5 3. exd5 cxd5 4. Bd3" },
{ name: "King's Indian Attack: Main Line vs ...e6", pgn: "1. Nf3 d5 2. g3 Nf6 3. Bg2 e6 4. O-O Be7 5. d3 c5 6. Nbd2 Nc6 7. e4" },
{ name: "Slav Defense: Exchange Variation", pgn: "1. d4 d5 2. c4 c6 3. cxd5 cxd5 4. Nc3 Nf6 5. Bf4" },
{ name: "Two Knights Defense: Modern Variation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3" },
{ name: "Philidor Defense: Hanham Variation", pgn: "1. e4 e5 2. Nf3 d6 3. d4 Nd7 4. Bc4 c6 5. O-O" },
{ name: "English: Anglo-Indian Defense", pgn: "1. c4 Nf6 2. Nc3 e6 3. Nf3" },
{ name: "Alekhine's Defense: Modern Variation", pgn: "1. e4 Nf6 2. e5 Nd5 3. d4 d6 4. Nf3" },```




];



importScripts("generateFromPgn.js")

// Generate the final book that the engine worker will use.
const rawOpeningBook = generateRawBook(sourceBook);