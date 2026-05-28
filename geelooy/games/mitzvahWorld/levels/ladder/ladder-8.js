// B"H
import { level, terrain, player, npc, platform, move, fake, spike, mimic, coin, bonus, door, slip, blast, greedy } from './helpers.js';
export default level('Chochmah_Flash_of_Wisdom', 22, 'ladder-9.js', {
  ProceduralTerrain: { flashFloor: terrain('Chochmah_Flash_of_Wisdom_Floor', 'safegrass') },
  Chossid: [player(0,10,0)],
  SolidBlock: [platform('flash_start',0,0,0,10,10,16361509), platform('flash_ledge_a',10,2,-6,7,3,16361509), platform('flash_ledge_b',20,4,6,6,3,16361509), platform('flash_ledge_c',31,6,-5,6,2.6,16361509), platform('flash_ledge_d',43,8,5,7,2.5,16361509), platform('flash_gate',58,10,0,12,7,16361509)],
  MovingPlatform: [move('flash_swing_a',16,3,0,5,2,'z',6,1.8,16361509), move('flash_lift_b',36,7,0,4,3,'y',3,2,16361509), move('flash_shuttle_c',50,9,-4,5,2,'x',5,2.1,16361509)],
  BetrayalPlatform: [fake('flash_liar_a',14,3.2,6,4,3,15), fake('flash_liar_b',28,5.8,-9,5,3,16), fake('flash_liar_c',47,9.2,8,4,3,17)],
  SpikeHazard: [spike('flash_spike1', 10, 0.2, -3, 14), spike('flash_spike2', 17, 4, 3, 14), spike('flash_spike3', 24, 5, -3, 14), spike('flash_spike4', 31, 0.2, 3, 14), spike('flash_spike5', 38, 7, -3, 14), spike('flash_spike6', 45, 8, 3, 14), spike('flash_spike7', 52, 0.2, -3, 14)],
  SlipperyPlatform: [
    slip('slick_memory_8_a', 28, 7.4, -10, 5, 3, 'x', 8)
  ],
  FastPusherPlatform: [
    blast('blast_plate_8_a', 34, 9.2, 8, 5, 3, 'x', -1, 36)
  ],
  GreedyCoin: [
    greedy('greed_spike_8', 24, 7, 0, 34, 0, 3),
    greedy('greed_ice_8', 58, 13, -6, 66, -8, 4),
    greedy('greed_blast_8', 84, 18, 6, 92, 8, 5)
  ],
  CoinMimicHazard: [mimic('flash_mimic1', 18, 5, -9, 16), mimic('flash_mimic2', 26, 6, 9, 17), mimic('flash_mimic3', 34, 7, -9, 18), mimic('flash_mimic4', 42, 8, 9, 19), mimic('flash_mimic5', 50, 9, -9, 20)],
  Coin: [coin('flash_p1', 5, 2, -6), coin('flash_p2', 8, 2.75, 6), coin('flash_p3', 11, 3.5, -6), coin('flash_p4', 14, 4.25, 6), coin('flash_p5', 17, 5, -6), coin('flash_p6', 20, 5.75, 6), coin('flash_p7', 23, 6.5, -6), coin('flash_p8', 26, 7.25, 6), coin('flash_p9', 29, 8, -6), coin('flash_p10', 32, 8.75, 6), coin('flash_p11', 35, 9.5, -6), coin('flash_p12', 38, 10.25, 6), coin('flash_p13', 41, 11, -6), coin('flash_p14', 44, 11.75, 6), coin('flash_p15', 47, 12.5, -6), coin('flash_p16', 50, 13.25, 6), coin('flash_p17', 53, 14, -6), coin('flash_p18', 56, 14.75, 6), coin('flash_p19', 59, 15.5, -6), coin('flash_p20', 62, 16.25, 6), coin('flash_p21', 65, 17, -6), coin('flash_p22', 68, 17.75, 6), bonus('flash_bonus1', 14, 5, -12, 12), bonus('flash_bonus2', 23, 6.5, 12, 12), bonus('flash_bonus3', 32, 8, -12, 12), bonus('flash_bonus4', 41, 9.5, 12, 12)],
  InteractiveDoor: [door('Gate to Level 9',63,12.5,0)]
});
