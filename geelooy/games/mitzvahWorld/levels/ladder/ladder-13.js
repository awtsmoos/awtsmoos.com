// B"H
import { level, terrain, player, npc, platform, move, fake, spike, mimic, coin, bonus, door, vanish, push, trapdoor, slip, blast, spikeCoin } from './helpers.js';
export default level('Broken_Seraph', 32, 'ladder-14.js', {
  ProceduralTerrain: { seraphFloor: terrain('Broken_Seraph_Floor', 'safegrass') },
  Chossid: [player(0, 14, 0)],
  SolidBlock: [platform('seraph_start',0,0,0,10,10,0x263238), platform('seraph_gate',98,18,0,14,8,0x263238), platform('wing_left',28,7,-14,5,3,0xb0bec5), platform('wing_right',56,13,14,5,3,0xb0bec5), platform('halo_rest',76,16,0,6,3,0xfff59d)],
  MovingPlatform: [move('wingbeat_a',16,4,0,5,2,'z',9,2.1,0xb0bec5), move('wingbeat_b',44,10,0,5,2,'x',8,2.5,0xb0bec5), move('wingbeat_c',82,16,-6,5,2,'y',4,2.0,0xb0bec5)],
  DisappearingPlatform: [vanish('seraph_memory_a',12,3,-8,4,3,520), vanish('seraph_memory_b',24,6,8,4,3,430), vanish('seraph_memory_c',39,9,-8,4,3,360), vanish('seraph_memory_d',64,14,8,4,3,300), vanish('seraph_memory_e',88,17,-8,4,3,260)],
  PusherPlatform: [push('seraph_shove_a',34,8,0,5,3,'z',13,360), push('seraph_shove_b',70,15,-5,5,3,'x',10,300), push('seraph_shove_c',92,17,5,5,3,'z',-12,260)],
  TrapdoorPlatform: [trapdoor('halo_trap_a',50,12,0,6,4,470), trapdoor('halo_trap_b',78,16,0,6,4,350)],
  BetrayalPlatform: [fake('angel_lie_a',22,5,-13,4,3,22), fake('angel_lie_b',62,13,13,4,3,23)],
  SpikeHazard: [spike('seraph_spike_1',12,0.2,-8,22), spike('seraph_spike_2',34,7,13,24), spike('seraph_spike_3',50,10.7,0,24), spike('seraph_spike_4',70,13.6,-5,26), spike('seraph_spike_5',78,14.6,0,26), spike('seraph_spike_6',92,15.8,5,28)],
  SlipperyPlatform: [
    slip('slick_memory_13_a', 38, 10.15, 10, 5, 3, 'z', 9.25)
  ],
  FastPusherPlatform: [
    blast('blast_plate_13_a', 44, 12.450000000000001, -8, 5, 3, 'z', 1, 41)
  ],
  SpikeCoin: [
    spikeCoin('coin_was_spike_13_a', 22, 6, 2, 30, 2, 25),
    spikeCoin('coin_was_spike_13_b', 64, 14, -6, 72, -8, 27)
  ],
  CoinMimicHazard: [mimic('holy_fake_1',28,8,-14,26), mimic('holy_fake_2',56,14,14,28), mimic('holy_fake_3',76,17,0,30), mimic('holy_fake_4',96,19,0,32)],
  Coin: [coin('seraph_p1', 5.0, 3.0, -7), coin('seraph_p2', 7.8, 3.9, 7), coin('seraph_p3', 10.6, 4.8, -7), coin('seraph_p4', 13.4, 5.7, 7), coin('seraph_p5', 16.2, 6.6, -7), coin('seraph_p6', 19.0, 7.5, 7), coin('seraph_p7', 21.8, 3.0, -7), coin('seraph_p8', 24.6, 3.9, 7), coin('seraph_p9', 27.4, 4.8, -7), coin('seraph_p10', 30.2, 5.7, 7), coin('seraph_p11', 33.0, 6.6, -7), coin('seraph_p12', 35.8, 7.5, 7), coin('seraph_p13', 38.6, 3.0, -7), coin('seraph_p14', 41.4, 3.9, 7), coin('seraph_p15', 44.2, 4.8, -7), coin('seraph_p16', 47.0, 5.7, 7), coin('seraph_p17', 49.8, 6.6, -7), coin('seraph_p18', 52.6, 7.5, 7), coin('seraph_p19', 55.4, 3.0, -7), coin('seraph_p20', 58.2, 3.9, 7), coin('seraph_p21', 61.0, 4.8, -7), coin('seraph_p22', 63.8, 5.7, 7), coin('seraph_p23', 66.6, 6.6, -7), coin('seraph_p24', 69.4, 7.5, 7), coin('seraph_p25', 72.2, 3.0, -7), coin('seraph_p26', 75.0, 3.9, 7), coin('seraph_p27', 77.8, 4.8, -7), coin('seraph_p28', 80.6, 5.7, 7), coin('seraph_p29', 83.4, 6.6, -7), coin('seraph_p30', 86.2, 7.5, 7), coin('seraph_p31', 89.0, 3.0, -7), coin('seraph_p32', 91.8, 3.9, 7), bonus('seraph_greed1', 16, 6, -13, 18), bonus('seraph_greed2', 26, 7.5, 13, 19), bonus('seraph_greed3', 36, 9, -13, 20), bonus('seraph_greed4', 46, 10.5, 13, 21), bonus('seraph_greed5', 56, 12, -13, 22), bonus('seraph_greed6', 66, 13.5, 13, 23), bonus('seraph_greed7', 76, 15, -13, 24)],
  InteractiveDoor: [door('Crown-Sealed Exit',106,20.5,0)]
});
