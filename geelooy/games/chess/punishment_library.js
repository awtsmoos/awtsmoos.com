/* B"H */

// =================================================================
//                 THE PUNISHMENT & TRAPS LIBRARY (EXPANDED v2.0)
// =================================================================
// This library is exclusively for responding to opponent mistakes.
// The engine will ONLY consult this book if a position is NOT found
// in the main 'grandmaster_library.js'. This allows the AI to
// capitalize on common blunders without ever initiating these
// unsound lines itself. This version contains a vast, deeply annotated
// collection of refuted openings and amateur traps.

const punishmentBookSource = [
    // --- I. Refuting Early Queen Attacks & Blunders ---
    { name: "Scholar's Mate: Main Refutation", pgn: "1. e4 e5 2. Qh5 Nc6 3. Bc4 g6 4. Qf3 Nf6 5. Ne2 Bg7 6. d3 O-O" },
    { name: "Scholar's Mate: Qe7 Defense", pgn: "1. e4 e5 2. Bc4 Bc5 3. Qh5 Qe7 4. Nf3 Nc6 5. Nc3 Nf6 6. Qg5 O-O" },
    { name: "Wayward Queen: Counter-Attack", pgn: "1. e4 e5 2. Qh5 Nf6 3. Qxe5+ Be7 4. Nc3 Nc6 5. Qg3 O-O 6. d3 d5" },
    { name: "Napoleon Attack: Simple Refutation", pgn: "1. e4 e5 2. Qf3 Nc6 3. Bc4 Nf6 4. Ne2 Bc5 5. O-O O-O 6. d3" },
    { name: "Parham Attack: Blunder Punishment", pgn: "1. e4 e5 2. Qh5 Nc6 3. Nf3 g6 4. Qg5 f6 5. Qg3" },

    // --- II. Refuting Unsound 1. e4 e5 Gambits (by Black) ---
    { name: "Latvian Gambit: Main Refutation", pgn: "1. e4 e5 2. Nf3 f5 3. Nxe5 Qf6 4. d4 d6 5. Nc4 fxe4 6. Nc3 Qg6 7. f3 exf3 8. Qxf3" },
    { name: "Elephant Gambit: Main Refutation", pgn: "1. e4 e5 2. Nf3 d5 3. exd5 e4 4. Qe2 Nf6 5. d3 Qxd5 6. Nbd2 Be7 7. dxe4" },
    { name: "Damiano's Defense: Crushing Refutation", pgn: "1. e4 e5 2. Nf3 f6 3. Nxe5 fxe5 4. Qh5+ Ke7 5. Qxe5+ Kf7 6. Bc4+ d5 7. Bxd5+ Kg6 8. h4 h5 9. Bxb7" },
    { name: "Greco Countergambit: White's Advantage", pgn: "1. e4 e5 2. Nf3 f5 3. Nxe5 Nf6 4. exf5 d6 5. Nf3 Bxf5 6. d4" },

    // --- III. Refuting Unsound 1. d4 Gambits (by Black) ---
    { name: "Englund Gambit: Main Line Refutation", pgn: "1. d4 e5 2. dxe5 Nc6 3. Nf3 Qe7 4. Bf4 Qb4+ 5. Bd2 Qxb2 6. Nc3 Bb4 7. Rb1 Qa3 8. Nd5" },
    { name: "Englund Gambit: Soller Gambit Trap", pgn: "1. d4 e5 2. dxe5 f6 3. exf6 Nxf6 4. Nf3 Bc5 5. Bg5 Ne4 6. Be3 Bxe3 7. fxe3" },
    { name: "Englund Gambit: Blackburne-Hartlaub Gambit Refuted", pgn: "1. d4 e5 2. dxe5 d6 3. exd6 Bxd6 4. Nf3 Nf6 5. g3 O-O 6. Bg2" },
    { name: "Albin Countergambit: Lasker Trap", pgn: "1. d4 d5 2. c4 e5 3. dxe5 d4 4. e3 Bb4+ 5. Bd2 dxe3 6. Bxb4 exf2+ 7. Ke2 fxg1=N+ 8. Rxg1 Bg4+ 9. Ke1" },
    { name: "Budapest Gambit: Fajarowicz Refuted", pgn: "1. d4 Nf6 2. c4 e5 3. dxe5 Ne4 4. a3 d6 5. exd6 Bxd6 6. Nf3 Nxf2 7. Kxf2 Bg3+ 8. hxg3 Qxd1" },

    // --- IV. Classic Named Traps & Mates ---
    { name: "Legal's Mate", pgn: "1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 h6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5#" },
    { name: "Blackburne Shilling Gambit Trap", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 4. Nxe5 Qg5 5. Nxf7 Qxg2 6. Rf1 Qxe4+ 7. Be2 Nf3#" },
    { name: "Ruy Lopez: Noah's Ark Trap", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 d6 5. d4 b5 6. Bb3 Nxd4 7. Nxd4 exd4 8. Qxd4 c5 9. Qd5 Be6 10. Qc6+ Bd7 11. Qd5 c4" },
    { name: "Italian Game: Blackburne's Trap", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 4. Bxf7+ Kxf7 5. Nxe5+ Ke6 6. Qg4+" },
    { name: "Petroff Defense: Cochrane's Trap", pgn: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nxf7 Kxf7 5. d4 c5 6. dxc5 Nc6 7. Nc3" },
    { name: "Queen's Gambit Declined: Elephant Trap", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Nbd7 5. cxd5 exd5 6. Nxd5 Nxd5 7. Bxd8 Bb4+ 8. Qd2 Bxd2+ 9. Kxd2 Kxd8" },
    { name: "Budapest Gambit: Kieninger Trap", pgn: "1. d4 Nf6 2. c4 e5 3. dxe5 Ng4 4. Bf4 Nc6 5. Nf3 Bb4+ 6. Nbd2 Qe7 7. a3 Ngxe5 8. axb4 Nd3#" },
    { name: "Ruy Lopez: Mortimer Trap", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. d3 Ne7 5. Nxe5 c6 6. Ba4 Qa5+" },
    { name: "Ruy Lopez: Fishing Pole Trap", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. O-O Ng4 5. h3 h5 6. hxg4 hxg4 7. Ne1 Qh4 8. f4 g3" },

    // --- V. Punishing Stafford & Petroff Gambits ---
    { name: "Stafford Gambit: Main Refutation", pgn: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 Nc6 4. Nxc6 dxc6 5. d3 Bc5 6. Be2 h5 7. c3 Ng4 8. d4 Qh4 9. g3" },
    { name: "Stafford Gambit: Eric Rosen's Trap Refuted", pgn: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 Nc6 4. Nxc6 dxc6 5. Nc3 Bc5 6. Be2 Ng4 7. O-O Qh4 8. Bxg4 hxg4 9. h3" },

    // --- VI. Punishing Sicilian Defense Mistakes ---
    { name: "Sicilian: Smith-Morra Gambit Siberian Trap", pgn: "1. e4 c5 2. d4 cxd4 3. c3 dxc3 4. Nxc3 Nc6 5. Nf3 e6 6. Bc4 Nf6 7. O-O Qc7 8. Qe2 Ng4 9. h3 Nd4" },
    { name: "Sicilian: Wing Gambit Refutation", pgn: "1. e4 c5 2. b4 cxb4 3. a3 d5 4. exd5 Qxd5 5. Nf3 e5 6. axb4 Bxb4 7. c3" },
    { name: "Sicilian: O'Kelly Variation e5 Mistake", pgn: "1. e4 c5 2. Nf3 a6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5 6. Nf3 Bb4 7. Bd2" },
    { name: "Sicilian: Keres Gambit Refuted", pgn: "1. e4 c5 2. Nf3 a6 3. d4 b5 4. dxc5 e6 5. Be3" },
    { name: "Sicilian: Magnus Smith Trap", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 d6 6. Bc4 g6 7. O-O Bg7 8. Nxc6 bxc6 9. e5" },
    
    // --- VII. Punishing French & Caro-Kann Mistakes ---
    { name: "French Defense: Advance Variation Poisoned Pawn", pgn: "1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3 Qb6 6. a3 Nh6 7. b4 cxd4 8. Bxh6 gxh6 9. cxd4" },
    { name: "French Defense: Alekhine-Chatard Attack h6 Mistake", pgn: "1. e4 e6 2. d4 d5 3. Nc3 Nf6 4. Bg5 Be7 5. e5 Nfd7 6. h4 h6 7. Bxe7 Qxe7 8. Qg4" },
    { name: "Caro-Kann: Hillbilly Attack Refuted", pgn: "1. e4 c6 2. Bc4 d5 3. exd5 cxd5 4. Bb3 Nf6 5. d4 Nc6 6. Nf3" },
    { name: "Caro-Kann: Fantasy Variation Blunder", pgn: "1. e4 c6 2. d4 d5 3. f3 dxe4 4. fxe4 e5 5. Nf3 Bg4 6. c3 Nd7 7. Bc4 h6 8. O-O Ngf6 9. Qb3 Qe7 10. Qxb7" },
    { name: "French Defense: Milner-Barry Gambit Refuted", pgn: "1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3 Qb6 6. Bd3 cxd4 7. cxd4 Bd7 8. O-O Nxd4 9. Nxd4 Qxd4 10. Nc3" },

    // --- VIII. Punishing Dutch Defense Mistakes ---
    { name: "Dutch Defense: Staunton Gambit Main Line", pgn: "1. d4 f5 2. e4 fxe4 3. Nc3 Nf6 4. Bg5 g6 5. f3 exf3 6. Nxf3" },
    { name: "Dutch Defense: Krejcik Gambit Refuted", pgn: "1. d4 f5 2. g4 fxg4 3. h3 g3 4. fxg3 e5 5. dxe5" },
    { name: "Dutch Stonewall: 2...c6 Inaccuracy", pgn: "1. d4 f5 2. c4 c6 3. Nc3 d5 4. Bf4" },
    
    // --- IX. Punishing Scandinavian Defense Mistakes ---
    { name: "Scandinavian Defense: Patzer's Blunder", pgn: "1. e4 d5 2. exd5 Qxd5 3. Nc3 Qd8 4. d4 Nf6 5. Nf3 Bf5 6. Bc4 e6 7. Ne5 c6 8. g4" },
    { name: "Scandinavian Defense: Mieses-Kotroc Gambit", pgn: "1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. b4 Qxb4 5. Nb5 Qa5 6. Bc4" },
    { name: "Scandinavian Defense: Icelandic Gambit Refuted", pgn: "1. e4 d5 2. exd5 Nf6 3. c4 e6 4. dxe6 Bxe6 5. d4 Bb4+ 6. Nc3" },

    // --- X. Punishing Assorted Unsound Openings ---
    { name: "Grob's Attack: Main Refutation", pgn: "1. g4 d5 2. Bg2 Bxg4 3. c4 c6 4. cxd5 cxd5 5. Qb3" },
    { name: "Barnes Opening (f3): Main Refutation", pgn: "1. f3 e5 2. e4 d5 3. exd5 Nf6" },
    { name: "King's Gambit Declined: Falkbeer Countergambit Trap", pgn: "1. e4 e5 2. f4 d5 3. exd5 e4 4. d3 Nf6 5. Qe2" },
    { name: "Vienna Game: Frankenstein-Dracula Refutation", pgn: "1. e4 e5 2. Nc3 Nf6 3. Bc4 Nxe4 4. Qh5 Nd6 5. Bb3 Nc6 6. Nb5 g6 7. Qf3 f5 8. Qd5" },
    { name: "Bird's Opening: From's Gambit Refutation", pgn: "1. f4 e5 2. fxe5 d6 3. exd6 Bxd6 4. Nf3 Nf6 5. d4" },

    // --- XI. More Fried Liver & Italian Traps ---
    { name: "Fried Liver: Polerio Defense", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Na5 6. Bb5+ c6 7. dxc6 bxc6 8. Be2 h6 9. Nf3" },
    { name: "Italian Game: Jerome Gambit Refuted", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. Bxf7+ Kxf7 5. Nxe5+ Nxe5 6. d4" },
    
    // --- XII. Advanced Traps in Major Openings ---
    { name: "Benoni Defense: Vulture Gambit Refuted", pgn: "1. d4 Nf6 2. c4 c5 3. d5 Ne4 4. Nc3 Qa5 5. Qc2" },
    { name: "King's Indian Defense: Early g4 Mistake", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. g4 Bxg4 6. f3" },
    { name: "Queen's Indian Defense: Kasparov Gambit", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. g3 Ba6 5. b3 Bb4+ 6. Bd2 Be7 7. Bg2 c6 8. Bc3 d5 9. Ne5" },
    { name: "Nimzo-Indian Defense: Kmoch Variation Trap", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. f3 d5 5. a3 Bxc3+ 6. bxc3 c5 7. cxd5 Nxd5 8. dxc5 Qa5 9. e4" },
    
    // --- XIII. Deep Refutations of Rare/Amateur Gambits ---
    { name: "King's Gambit: Muzio Gambit Refuted", pgn: "1. e4 e5 2. f4 exf4 3. Nf3 g5 4. Bc4 g4 5. O-O gxf3 6. Qxf3 Qf6 7. e5 Qxe5 8. d3 Bh6" },
    { name: "Ponziani Opening: Countergambit", pgn: "1. e4 e5 2. Nf3 Nc6 3. c3 f5 4. d4 d6 5. d5" },
    { name: "Danish Gambit: Schlechter Defense", pgn: "1. e4 e5 2. d4 exd4 3. c3 dxc3 4. Bc4 cxb2 5. Bxb2 d5 6. exd5 Nf6 7. Nf3" },
    { name: "Center Game: Halasz Gambit Refuted", pgn: "1. e4 e5 2. d4 exd4 3. f4 d5 4. exd5 Nf6 5. Nf3" },
    { name: "Philidor Defense: Lopez Countergambit", pgn: "1. e4 e5 2. Nf3 d6 3. Bc4 f5 4. d4 fxe4 5. Ng5" },
    
    
    // --- XIV. More Italian, Evans & Two Knights Traps ---
    { name: "Italian Game: Early Ng4 Blunder", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Nc3 Ng4 8. O-O Bxc3 9. bxc3 d6 10. Ng5" },
    { name: "Evans Gambit: Incorrect Decline", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bb6 5. a4 a6 6. Nc3 Nf6 7. Ba3 d6 8. Nd5" },
    { name: "Evans Gambit: Greedy Pawn Grab", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 d6 7. Qb3 Qd7 8. dxe5" },
    { name: "Two Knights: Pinsky Attack", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 b5 6. Bf1 Nxd5 7. Bxb5" },
    { name: "Giuoco Pianissimo: Early ...h6 Inaccuracy", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 Nf6 5. O-O d6 6. c3 h6 7. d4" },

    // --- XV. Advanced Sicilian Defense Traps ---
    { name: "Sicilian Najdorf: Poisoned Pawn blunder", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Qb6 8. Qd2 Qxb2 9. Rb1 Qa3 10. e5 dxe5 11. fxe5 Nfd7 12. Ne4" },
    { name: "Sicilian Dragon: Early h5 mistake", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. Be3 Bg7 7. f3 Nc6 8. Qd2 h5 9. O-O-O Bd7 10. Kb1" },
    { name: "Sicilian Canal-Sokolsky: ...Nxe4 blunder", pgn: "1. e4 c5 2. Nf3 d6 3. Bb5+ Bd7 4. Bxd7+ Qxd7 5. O-O Nc6 6. c3 Nf6 7. Re1 e6 8. d4 cxd4 9. cxd4 d5 10. e5 Ne4 11. Nbd2 Nxd2 12. Bxd2" },
    { name: "Sicilian Sveshnikov: Positional Mistake", pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5 6. Ndb5 d6 7. Bg5 a6 8. Na3 b5 9. Nd5 Be7 10. Bxf6 Bxf6 11. c4" },
    { name: "Sicilian Alapin: Passive Play", pgn: "1. e4 c5 2. c3 d5 3. exd5 Qxd5 4. d4 e6 5. Nf3 Nf6 6. Bd3 Be7 7. O-O O-O 8. Qe2" },
    { name: "Sicilian Grand Prix: b5 mistake", pgn: "1. e4 c5 2. Nc3 Nc6 3. f4 g6 4. Nf3 Bg7 5. Bb5 Nd4 6. O-O e6 7. Nxd4 cxd4 8. Ne2 b5 9. d3" },

    // --- XVI. King's Gambit Traps & Blunders (Punishing Black) ---
    { name: "King's Gambit: Kieseritzky Early ...d5", pgn: "1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4 g4 5. Ne5 Nf6 6. Bc4 d5 7. exd5 Bd6 8. d4 Nh5 9. O-O Qxh4 10. Qe1" },
    { name: "King's Gambit: Falkbeer Countergambit Passive Play", pgn: "1. e4 e5 2. f4 d5 3. exd5 e4 4. d3 Nf6 5. dxe4 Nxe4 6. Nf3 Bc5 7. Qe2 Bf5 8. Nc3 Qe7 9. Be3" },
    { name: "King's Gambit Accepted: Cunningham Defense Trap", pgn: "1. e4 e5 2. f4 exf4 3. Nf3 Be7 4. Bc4 Bh4+ 5. g3 fxg3 6. O-O gxh2+ 7. Kh1" },
    { name: "King's Gambit Declined: Classical Blunder", pgn: "1. e4 e5 2. f4 Bc5 3. Nf3 d6 4. c3 Bg4 5. d4 exd4 6. cxd4 Bb6 7. Nc3" },

    // --- XVII. Alekhine's & Pirc Defense Traps ---
    { name: "Alekhine's Four Pawns: f6 Weakness", pgn: "1. e4 Nf6 2. e5 Nd5 3. d4 d6 4. c4 Nb6 5. f4 dxe5 6. fxe5 Nc6 7. Be3 Bf5 8. Nc3 e6 9. Nf3 Qd7 10. Be2 O-O-O 11. O-O f6 12. exf6 gxf6 13. a4" },
    { name: "Alekhine's Chase Variation: Passive Play", pgn: "1. e4 Nf6 2. e5 Nd5 3. c4 Nb6 4. c5 Nd5 5. Nc3 e6 6. d4 d6 7. cxd6 cxd6 8. Nf3" },
    { name: "Pirc Defense: Austrian Attack Early ...c5", pgn: "1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. f4 Bg7 5. Nf3 c5 6. dxc5 Qa5 7. Bd3 Qxc5 8. Qe2" },
    { name: "Modern Defense: Early ...e5 Blunder", pgn: "1. e4 g6 2. d4 Bg7 3. Nc3 d6 4. Nf3 e5 5. dxe5 dxe5 6. Qxd8+ Kxd8 7. Bc4" },

    // --- XVIII. Grünfeld & King's Indian Defense Traps ---
    { name: "Grünfeld Exchange: Premature ...e5", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. cxd5 Nxd5 5. e4 Nxc3 6. bxc3 Bg7 7. Bc4 c5 8. Ne2 Nc6 9. Be3 O-O 10. O-O e5 11. d5 Na5 12. Bd3" },
    { name: "King's Indian Sämisch: ...f5 Weakness", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 Nc6 7. Nge2 a6 8. Qd2 Rb8 9. h4 h5 10. Bh6 f5 11. Bxg7 Kxg7 12. exf5 Bxf5" },
    { name: "King's Indian Four Pawns: Black Plays Passively", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f4 O-O 6. Nf3 Nbd7 7. e5" },
    { name: "Grünfeld Russian: Bg4 Inaccuracy", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. Nf3 Bg7 5. Qb3 dxc4 6. Qxc4 O-O 7. e4 Bg4 8. Be3 Nfd7 9. Be2" },

    // --- XIX. Refuting More Obscure Gambits & Openings ---
    { name: "Halloween Gambit: Correct Refutation", pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6 4. Nxe5 Nxe5 5. d4 Nc6 6. d5 Ne5 7. f4 Ng6 8. e5 Ng8" },
    { name: "Fred Defense: Crushing the King", pgn: "1. e4 f5 2. exf5 Kf7 3. Qh5+ g6 4. fxg6+ Kg7 5. gxh7 Rxh7 6. Qg5+" },
    { name: "Colorado Gambit: White's Advantage", pgn: "1. e4 Nc6 2. Nf3 f5 3. exf5 d5 4. d4 Bxf5 5. Bb5 e6 6. Ne5" },
    { name: "Ware Opening: Main Refutation", pgn: "1. a4 e5 2. e4 Nf6 3. Nc3" },
    { name: "Sodium Attack (Na3): Main Refutation", pgn: "1. Na3 e5 2. e4 d5 3. exd5" },
    { name: "Blackmar-Diemer Gambit: Teichmann Defense", pgn: "1. d4 d5 2. e4 dxe4 3. Nc3 Nf6 4. f3 exf3 5. Nxf3 Bg4 6. h3 Bxf3 7. Qxf3" },
    
    // --- XX. Positional Blunders in Main Lines ---
    { name: "Nimzo-Indian: ...b6 Inaccuracy vs Qc2", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Qc2 b6 5. e4 Bb7 6. Bd3" },
    { name: "English Opening: Wasting Time", pgn: "1. c4 e5 2. Nc3 Nf6 3. Nf3 Nc6 4. g3 d5 5. cxd5 Nxd5 6. Bg2 Ndb4 7. a3 Na6 8. b4 Nd4 9. Nxd4" },
    { name: "Queen's Gambit Accepted: Early ...b5 Mistake", pgn: "1. d4 d5 2. c4 dxc4 3. Nf3 Nf6 4. e3 b5 5. a4 c6 6. axb5 cxb5 7. b3" },
    { name: "Slav Defense: Early ...Ne4", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 Bf5 5. cxd5 cxd5 6. Qb3 Bc8 7. Bf4 a6 8. e3 Ne4 9. Nxe4" },
    { name: "London System: Passive ...c6", pgn: "1. d4 d5 2. Bf4 Nf6 3. e3 c6 4. Nf3 Bf5 5. c4" },
    
    // --- XXI. More Traps for the Collection ---
    { name: "Owen's Defense: Guimard Gambit", pgn: "1. e4 b6 2. d4 Bb7 3. Nc3 e6 4. Nf3 Bb4 5. Bd3 f5 6. exf5" },
    { name: "Scotch Game: Mieses Variation Trap", pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5 Qe7 7. Qe2 Nd5 8. c4 Ba6 9. b3" },
    { name: "Philidor Defense: Berger's Trap", pgn: "1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Nd7 5. exd6 Bxd6 6. Nc3 Ngf6 7. h3 Bxf3 8. Qxf3 Qe7 9. Bg5 O-O-O 10. O-O-O" },
    { name: "Four Knights: Rubinstein's Trap", pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6 4. Bb5 Nd4 5. Ba4" },
    { name: "Caro-Kann: Tartakower's Fantasy Trap", pgn: "1. e4 c6 2. d4 d5 3. f3 e6 4. Nc3 Nf6 5. Bg5" },
    { name: "Benko Gambit: King Walk Trap", pgn: "1. d4 Nf6 2. c4 c5 3. d5 b5 4. cxb5 a6 5. bxa6 Bxa6 6. Nc3 d6 7. e4 Bxf1 8. Kxf1 g6 9. g3 Bg7 10. Kg2" },

    // --- XXII. Deepening Existing Trap Lines ---
    { name: "Scholar's Mate Refuted: Deeper Line", pgn: "1. e4 e5 2. Qh5 Nc6 3. Bc4 g6 4. Qf3 Nf6 5. Ne2 Bg7 6. Nbc3 O-O 7. d3 d6 8. h3 Be6" },
    { name: "Fried Liver: Ke6 Main Line", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nxd5 6. Nxf7 Kxf7 7. Qf3+ Ke6 8. Nc3 Ncb4 9. Qe4 c6 10. a3 Na6 11. d4" },
    { name: "Englund Gambit Refuted: Deeper Line", pgn: "1. d4 e5 2. dxe5 Nc6 3. Nf3 Qe7 4. Bf4 Qb4+ 5. Bd2 Qxb2 6. Nc3 Bb4 7. Rb1 Qa3 8. Rb3 Qa5 9. a3" },
    { name: "Latvian Gambit Refuted: Deeper Line", pgn: "1. e4 e5 2. Nf3 f5 3. Nxe5 Qf6 4. d4 d6 5. Nc4 fxe4 6. Be2 Qg6 7. O-O Nf6 8. f3" },
    
    // --- XXIII. Even More Obscure & Unsound Openings ---
    { name: "Borg Defense (Grob backwards)", pgn: "1. e4 g5 2. d4 Bg7 3. Nc3 h6 4. h4" },
    { name: "Carr Defense (Alekhine sub-line)", pgn: "1. e4 h6 2. d4 e6" },
    { name: "Duras Gambit Refuted", pgn: "1. e4 f5 2. exf5 Nf6 3. d4" },
    { name: "Amar Opening (Ammonia Opening)", pgn: "1. Nh3 d5 2. g3 e5 3. f4" },
    { name: "Polish Opening: Tartakower Gambit", pgn: "1. b4 e5 2. Bb2 f6 3. e4" },
    { name: "Van't Kruijs Opening: Inverted Dutch", pgn: "1. e3 f5 2. d4 Nf6 3. c4" },
    
    // --- XXIV. Common Beginner Blunders ---
    { name: "Blocking c-pawn in QGD", pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Nf3 Be7 5. Bf4 O-O 6. e3 c6 7. Bd3 Nbd7 8. O-O b6 9. cxd5" },
    { name: "Moving f-pawn Unnecessarily", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O Nf6 5. d3 d6 6. c3 f6 7. d4" },
    { name: "Bringing Queen out too early (non-scholar)", pgn: "1. e4 e5 2. Nf3 Qf6 3. Nc3" },
    { name: "Ignoring Center Control", pgn: "1. e4 a6 2. d4 b5 3. c4" },
    { name: "Undeveloped Pieces Attack", pgn: "1. e4 e5 2. Nf3 Nc6 3. h4 Nf6 4. g4" },
    
    
    
    
    
    
    
];