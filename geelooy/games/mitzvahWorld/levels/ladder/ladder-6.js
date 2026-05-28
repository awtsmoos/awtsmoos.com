// B"H
import { level, terrain, player, npc, platform, move, fake, spike, mimic, coin, bonus, door, slip, blast, spikeCoin } from './helpers.js';
export default level('Tiferes_Palace_of_Balance', 18, 'ladder-7.js', {
  ProceduralTerrain: { palaceFloor: terrain('Tiferes_Palace_of_Balance_Floor', 'safegrass') },
  Chossid: [player(0,10,0)],
  SolidBlock: [platform('palace_start',0,0,0,10,10,9323693), platform('palace_ledge_a',10,2,-6,7,3,9323693), platform('palace_ledge_b',20,4,6,6,3,9323693), platform('palace_ledge_c',31,6,-5,6,2.6,9323693), platform('palace_ledge_d',43,8,5,7,2.5,9323693), platform('palace_gate',58,10,0,12,7,9323693)],
  MovingPlatform: [move('palace_swing_a',16,3,0,5,2,'z',6,1.6,9323693), move('palace_lift_b',36,7,0,4,3,'y',3,1.7999999999999998,9323693), move('palace_shuttle_c',50,9,-4,5,2,'x',5,1.9,9323693)],
  BetrayalPlatform: [fake('palace_liar_a',14,3.2,6,4,3,13), fake('palace_liar_b',28,5.8,-9,5,3,14), fake('palace_liar_c',47,9.2,8,4,3,15)],
  SpikeHazard: [spike('palace_spike1', 10, 0.2, -3, 12), spike('palace_spike2', 17, 4, 3, 12), spike('palace_spike3', 24, 5, -3, 12), spike('palace_spike4', 31, 0.2, 3, 12), spike('palace_spike5', 38, 7, -3, 12), spike('palace_spike6', 45, 8, 3, 12), spike('palace_spike7', 52, 0.2, -3, 12)],
  SlipperyPlatform: [
    slip('slick_memory_6_a', 24, 6.300000000000001, -10, 5, 3, 'x', 7.5)
  ],
  FastPusherPlatform: [
    blast('blast_plate_6_a', 30, 7.9, 8, 5, 3, 'x', -1, 34)
  ],
  SpikeCoin: [
    spikeCoin('coin_was_spike_6_a', 22, 6, 2, 30, 2, 18),
    spikeCoin('coin_was_spike_6_b', 64, 14, -6, 72, -8, 20)
  ],
  CoinMimicHazard: [mimic('palace_mimic1', 18, 5, -9, 14), mimic('palace_mimic2', 26, 6, 9, 15), mimic('palace_mimic3', 34, 7, -9, 16), mimic('palace_mimic4', 42, 8, 9, 17)],
  Coin: [coin('palace_p1', 5, 2, -6), coin('palace_p2', 8, 2.75, 6), coin('palace_p3', 11, 3.5, -6), coin('palace_p4', 14, 4.25, 6), coin('palace_p5', 17, 5, -6), coin('palace_p6', 20, 5.75, 6), coin('palace_p7', 23, 6.5, -6), coin('palace_p8', 26, 7.25, 6), coin('palace_p9', 29, 8, -6), coin('palace_p10', 32, 8.75, 6), coin('palace_p11', 35, 9.5, -6), coin('palace_p12', 38, 10.25, 6), coin('palace_p13', 41, 11, -6), coin('palace_p14', 44, 11.75, 6), coin('palace_p15', 47, 12.5, -6), coin('palace_p16', 50, 13.25, 6), coin('palace_p17', 53, 14, -6), coin('palace_p18', 56, 14.75, 6), bonus('palace_bonus1', 14, 5, -12, 10), bonus('palace_bonus2', 23, 6.5, 12, 10), bonus('palace_bonus3', 32, 8, -12, 10), bonus('palace_bonus4', 41, 9.5, 12, 10)],
  InteractiveDoor: [door('Gate to Level 7',63,12.5,0)]
});
