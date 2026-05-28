// B"H
import { level, terrain, player, npc, platform, move, fake, spike, mimic, coin, bonus, door, slip, blast } from './helpers.js';
export default level('Binah_Womb_of_Understanding', 20, 'ladder-8.js', {
  ProceduralTerrain: { wombFloor: terrain('Binah_Womb_of_Understanding_Floor', 'safegrass') },
  Chossid: [player(0,10,0)],
  SolidBlock: [platform('womb_start',0,0,0,10,10,3754411), platform('womb_ledge_a',10,2,-6,7,3,3754411), platform('womb_ledge_b',20,4,6,6,3,3754411), platform('womb_ledge_c',31,6,-5,6,2.6,3754411), platform('womb_ledge_d',43,8,5,7,2.5,3754411), platform('womb_gate',58,10,0,12,7,3754411)],
  MovingPlatform: [move('womb_swing_a',16,3,0,5,2,'z',6,1.7,3754411), move('womb_lift_b',36,7,0,4,3,'y',3,1.9,3754411), move('womb_shuttle_c',50,9,-4,5,2,'x',5,2,3754411)],
  BetrayalPlatform: [fake('womb_liar_a',14,3.2,6,4,3,14), fake('womb_liar_b',28,5.8,-9,5,3,15), fake('womb_liar_c',47,9.2,8,4,3,16)],
  SpikeHazard: [spike('womb_spike1', 10, 0.2, -3, 13), spike('womb_spike2', 17, 4, 3, 13), spike('womb_spike3', 24, 5, -3, 13), spike('womb_spike4', 31, 0.2, 3, 13), spike('womb_spike5', 38, 7, -3, 13), spike('womb_spike6', 45, 8, 3, 13), spike('womb_spike7', 52, 0.2, -3, 13)],
  SlipperyPlatform: [
    slip('slick_memory_7_a', 26, 6.8500000000000005, 10, 5, 3, 'z', 7.75)
  ],
  FastPusherPlatform: [
    blast('blast_plate_7_a', 32, 8.55, -8, 5, 3, 'z', 1, 35)
  ],
  CoinMimicHazard: [mimic('womb_mimic1', 18, 5, -9, 15), mimic('womb_mimic2', 26, 6, 9, 16), mimic('womb_mimic3', 34, 7, -9, 17), mimic('womb_mimic4', 42, 8, 9, 18), mimic('womb_mimic5', 50, 9, -9, 19)],
  Coin: [coin('womb_p1', 5, 2, -6), coin('womb_p2', 8, 2.75, 6), coin('womb_p3', 11, 3.5, -6), coin('womb_p4', 14, 4.25, 6), coin('womb_p5', 17, 5, -6), coin('womb_p6', 20, 5.75, 6), coin('womb_p7', 23, 6.5, -6), coin('womb_p8', 26, 7.25, 6), coin('womb_p9', 29, 8, -6), coin('womb_p10', 32, 8.75, 6), coin('womb_p11', 35, 9.5, -6), coin('womb_p12', 38, 10.25, 6), coin('womb_p13', 41, 11, -6), coin('womb_p14', 44, 11.75, 6), coin('womb_p15', 47, 12.5, -6), coin('womb_p16', 50, 13.25, 6), coin('womb_p17', 53, 14, -6), coin('womb_p18', 56, 14.75, 6), coin('womb_p19', 59, 15.5, -6), coin('womb_p20', 62, 16.25, 6), bonus('womb_bonus1', 14, 5, -12, 11), bonus('womb_bonus2', 23, 6.5, 12, 11), bonus('womb_bonus3', 32, 8, -12, 11), bonus('womb_bonus4', 41, 9.5, 12, 11)],
  InteractiveDoor: [door('Gate to Level 8',63,12.5,0)]
});
