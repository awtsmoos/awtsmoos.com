// B"H
import { level, terrain, player, npc, platform, move, fake, spike, mimic, coin, bonus, door, slip, blast, greedy } from './helpers.js';
export default level('Gevurah_Court_of_Verdicts', 16, 'ladder-6.js', {
  ProceduralTerrain: { courtFloor: terrain('Gevurah_Court_of_Verdicts_Floor', 'safegrass') },
  Chossid: [player(0,10,0)],
  SolidBlock: [platform('court_start',0,0,0,10,10,9315364), platform('court_ledge_a',10,2,-6,7,3,9315364), platform('court_ledge_b',20,4,6,6,3,9315364), platform('court_ledge_c',31,6,-5,6,2.6,9315364), platform('court_ledge_d',43,8,5,7,2.5,9315364), platform('court_gate',58,10,0,12,7,9315364)],
  MovingPlatform: [move('court_swing_a',16,3,0,5,2,'z',6,1.5,9315364), move('court_lift_b',36,7,0,4,3,'y',3,1.7,9315364), move('court_shuttle_c',50,9,-4,5,2,'x',5,1.8,9315364)],
  BetrayalPlatform: [fake('court_liar_a',14,3.2,6,4,3,12), fake('court_liar_b',28,5.8,-9,5,3,13), fake('court_liar_c',47,9.2,8,4,3,14)],
  SpikeHazard: [spike('court_spike1', 10, 0.2, -3, 11), spike('court_spike2', 17, 4, 3, 11), spike('court_spike3', 24, 5, -3, 11), spike('court_spike4', 31, 0.2, 3, 11), spike('court_spike5', 38, 7, -3, 11), spike('court_spike6', 45, 8, 3, 11), spike('court_spike7', 52, 0.2, -3, 11)],
  SlipperyPlatform: [
    slip('slick_memory_5_a', 22, 5.75, 10, 5, 3, 'z', 7.25)
  ],
  FastPusherPlatform: [
    blast('blast_plate_5_a', 28, 7.25, -8, 5, 3, 'z', 1, 33)
  ],
  GreedyCoin: [
    greedy('greed_spike_5', 24, 7, 0, 34, 0, 3),
    greedy('greed_ice_5', 58, 13, -6, 66, -8, 4),
    greedy('greed_blast_5', 84, 18, 6, 92, 8, 5)
  ],
  CoinMimicHazard: [mimic('court_mimic1', 18, 5, -9, 13), mimic('court_mimic2', 26, 6, 9, 14), mimic('court_mimic3', 34, 7, -9, 15)],
  Coin: [coin('court_p1', 5, 2, -6), coin('court_p2', 8, 2.75, 6), coin('court_p3', 11, 3.5, -6), coin('court_p4', 14, 4.25, 6), coin('court_p5', 17, 5, -6), coin('court_p6', 20, 5.75, 6), coin('court_p7', 23, 6.5, -6), coin('court_p8', 26, 7.25, 6), coin('court_p9', 29, 8, -6), coin('court_p10', 32, 8.75, 6), coin('court_p11', 35, 9.5, -6), coin('court_p12', 38, 10.25, 6), coin('court_p13', 41, 11, -6), coin('court_p14', 44, 11.75, 6), coin('court_p15', 47, 12.5, -6), coin('court_p16', 50, 13.25, 6), bonus('court_bonus1', 14, 5, -12, 9), bonus('court_bonus2', 23, 6.5, 12, 9), bonus('court_bonus3', 32, 8, -12, 9), bonus('court_bonus4', 41, 9.5, 12, 9)],
  InteractiveDoor: [door('Gate to Level 6',63,12.5,0)]
});
