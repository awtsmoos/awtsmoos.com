// B"H
import { level, terrain, player, npc, platform, move, fake, spike, mimic, coin, bonus, door, slip, blast, spikeCoin } from './helpers.js';
export default level('Keter_Crown_Threshold', 24, null, {
  ProceduralTerrain: { crownFloor: terrain('Keter_Crown_Threshold_Floor', 'safegrass') },
  Chossid: [player(0,10,0)],
  SolidBlock: [platform('crown_start',0,0,0,10,10,16119285), platform('crown_ledge_a',10,2,-6,7,3,16119285), platform('crown_ledge_b',20,4,6,6,3,16119285), platform('crown_ledge_c',31,6,-5,6,2.6,16119285), platform('crown_ledge_d',43,8,5,7,2.5,16119285), platform('crown_gate',58,10,0,12,7,16119285)],
  MovingPlatform: [move('crown_swing_a',16,3,0,5,2,'z',6,1.9,16119285), move('crown_lift_b',36,7,0,4,3,'y',3,2.1,16119285), move('crown_shuttle_c',50,9,-4,5,2,'x',5,2.2,16119285)],
  BetrayalPlatform: [fake('crown_liar_a',14,3.2,6,4,3,16), fake('crown_liar_b',28,5.8,-9,5,3,17), fake('crown_liar_c',47,9.2,8,4,3,18)],
  SpikeHazard: [spike('crown_spike1', 10, 0.2, -3, 15), spike('crown_spike2', 17, 4, 3, 15), spike('crown_spike3', 24, 5, -3, 15), spike('crown_spike4', 31, 0.2, 3, 15), spike('crown_spike5', 38, 7, -3, 15), spike('crown_spike6', 45, 8, 3, 15), spike('crown_spike7', 52, 0.2, -3, 15)],
  SlipperyPlatform: [
    slip('slick_memory_9_a', 30, 7.95, 10, 5, 3, 'z', 8.25)
  ],
  FastPusherPlatform: [
    blast('blast_plate_9_a', 36, 9.850000000000001, -8, 5, 3, 'z', 1, 37)
  ],
  SpikeCoin: [
    spikeCoin('coin_was_spike_9_a', 22, 6, 2, 30, 2, 21),
    spikeCoin('coin_was_spike_9_b', 64, 14, -6, 72, -8, 23)
  ],
  CoinMimicHazard: [mimic('crown_mimic1', 18, 5, -9, 17), mimic('crown_mimic2', 26, 6, 9, 18), mimic('crown_mimic3', 34, 7, -9, 19), mimic('crown_mimic4', 42, 8, 9, 20), mimic('crown_mimic5', 50, 9, -9, 21)],
  Coin: [coin('crown_p1', 5, 2, -6), coin('crown_p2', 8, 2.75, 6), coin('crown_p3', 11, 3.5, -6), coin('crown_p4', 14, 4.25, 6), coin('crown_p5', 17, 5, -6), coin('crown_p6', 20, 5.75, 6), coin('crown_p7', 23, 6.5, -6), coin('crown_p8', 26, 7.25, 6), coin('crown_p9', 29, 8, -6), coin('crown_p10', 32, 8.75, 6), coin('crown_p11', 35, 9.5, -6), coin('crown_p12', 38, 10.25, 6), coin('crown_p13', 41, 11, -6), coin('crown_p14', 44, 11.75, 6), coin('crown_p15', 47, 12.5, -6), coin('crown_p16', 50, 13.25, 6), coin('crown_p17', 53, 14, -6), coin('crown_p18', 56, 14.75, 6), coin('crown_p19', 59, 15.5, -6), coin('crown_p20', 62, 16.25, 6), coin('crown_p21', 65, 17, -6), coin('crown_p22', 68, 17.75, 6), coin('crown_p23', 71, 18.5, -6), coin('crown_p24', 74, 19.25, 6), bonus('crown_bonus1', 14, 5, -12, 13), bonus('crown_bonus2', 23, 6.5, 12, 13), bonus('crown_bonus3', 32, 8, -12, 13), bonus('crown_bonus4', 41, 9.5, 12, 13)],
  InteractiveDoor: [door('Crown Gate - More Coming Soon',63,12.5,0)]
});
