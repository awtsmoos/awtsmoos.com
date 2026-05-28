// B"H
import { level, terrain, player, npc, platform, move, fake, spike, mimic, coin, bonus, door, slip, blast } from './helpers.js';
export default level('Netzach_Garden_of_Teeth', 14, 'ladder-5.js', {
  ProceduralTerrain: { gardenFloor: terrain('Netzach_Garden_of_Teeth_Floor', 'safegrass') },
  Chossid: [player(0,10,0)],
  SolidBlock: [platform('garden_start',0,0,0,10,10,3046706), platform('garden_ledge_a',10,2,-6,7,3,3046706), platform('garden_ledge_b',20,4,6,6,3,3046706), platform('garden_ledge_c',31,6,-5,6,2.6,3046706), platform('garden_ledge_d',43,8,5,7,2.5,3046706), platform('garden_gate',58,10,0,12,7,3046706)],
  MovingPlatform: [move('garden_swing_a',16,3,0,5,2,'z',6,1.4,3046706), move('garden_lift_b',36,7,0,4,3,'y',3,1.6,3046706), move('garden_shuttle_c',50,9,-4,5,2,'x',5,1.7000000000000002,3046706)],
  BetrayalPlatform: [fake('garden_liar_a',14,3.2,6,4,3,11), fake('garden_liar_b',28,5.8,-9,5,3,12), fake('garden_liar_c',47,9.2,8,4,3,13)],
  SpikeHazard: [spike('garden_spike1', 10, 0.2, -3, 10), spike('garden_spike2', 17, 4, 3, 10), spike('garden_spike3', 24, 5, -3, 10), spike('garden_spike4', 31, 0.2, 3, 10), spike('garden_spike5', 38, 7, -3, 10), spike('garden_spike6', 45, 8, 3, 10), spike('garden_spike7', 52, 0.2, -3, 10)],
  SlipperyPlatform: [
    slip('slick_memory_4_a', 20, 5.2, -10, 5, 3, 'x', 7)
  ],
  FastPusherPlatform: [
    blast('blast_plate_4_a', 26, 6.6, 8, 5, 3, 'x', -1, 32)
  ],
  CoinMimicHazard: [mimic('garden_mimic1', 18, 5, -9, 12), mimic('garden_mimic2', 26, 6, 9, 13)],
  Coin: [coin('garden_p1', 5, 2, -6), coin('garden_p2', 8, 2.75, 6), coin('garden_p3', 11, 3.5, -6), coin('garden_p4', 14, 4.25, 6), coin('garden_p5', 17, 5, -6), coin('garden_p6', 20, 5.75, 6), coin('garden_p7', 23, 6.5, -6), coin('garden_p8', 26, 7.25, 6), coin('garden_p9', 29, 8, -6), coin('garden_p10', 32, 8.75, 6), coin('garden_p11', 35, 9.5, -6), coin('garden_p12', 38, 10.25, 6), coin('garden_p13', 41, 11, -6), coin('garden_p14', 44, 11.75, 6), bonus('garden_bonus1', 14, 5, -12, 8), bonus('garden_bonus2', 23, 6.5, 12, 8), bonus('garden_bonus3', 32, 8, -12, 8), bonus('garden_bonus4', 41, 9.5, 12, 8)],
  InteractiveDoor: [door('Gate to Level 5',63,12.5,0)]
});
