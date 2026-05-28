// B"H
import { level, terrain, player, npc, platform, move, fake, spike, mimic, coin, bonus, door, vanish, push, trapdoor, slip, blast, greedy } from './helpers.js';
export default level('Chamber_of_Charity', 30, 'ladder-13.js', {
  ProceduralTerrain: { charityFloor: terrain('Chamber_of_Charity_Floor', 'safegrass') },
  Chossid: [player(0, 12, 0)],
  SolidBlock: [platform('charity_start',0,0,0,10,10,0x1b5e20), platform('charity_gate',90,16,0,12,7,0x1b5e20), platform('mercy_island_a',24,6,12,5,3,0x66bb6a), platform('mercy_island_b',60,12,-12,5,3,0x66bb6a)],
  MovingPlatform: [move('mercy_breath_a',17,4,0,5,2,'y',3,1.5,0x81c784), move('mercy_breath_b',64,12,0,5,2,'x',7,2.4,0x81c784)],
  DisappearingPlatform: [vanish('charity_memory_a',10,3,-8,4,3,620), vanish('charity_memory_b',30,7,8,4,3,460), vanish('charity_memory_c',46,10,-8,4,3,380), vanish('charity_memory_d',76,14,8,4,3,320)],
  PusherPlatform: [push('charity_push_a',38,8,0,5,3,'z',12,400), push('charity_push_b',70,13,-4,5,3,'x',9,330)],
  TrapdoorPlatform: [trapdoor('hidden_bridge_lie_a',54,11,0,6,4,520), trapdoor('hidden_bridge_lie_b',84,15,-3,6,4,420)],
  BetrayalPlatform: [fake('too_easy_bridge_a',22,5,-12,4,3,18), fake('too_easy_bridge_b',58,11,12,4,3,19)],
  SpikeHazard: [spike('charity_spike_1',10,0.2,-8,18), spike('charity_spike_2',38,7,12,20), spike('charity_spike_3',54,9.6,0,20), spike('charity_spike_4',70,11.8,-4,22), spike('charity_spike_5',84,13.8,-3,22)],
  SlipperyPlatform: [
    slip('slick_memory_12_a', 36, 9.600000000000001, -10, 5, 3, 'x', 9)
  ],
  FastPusherPlatform: [
    blast('blast_plate_12_a', 42, 11.8, 8, 5, 3, 'x', -1, 40)
  ],
  GreedyCoin: [
    greedy('greed_spike_12', 24, 7, 0, 34, 0, 3),
    greedy('greed_ice_12', 58, 13, -6, 66, -8, 4),
    greedy('greed_blast_12', 84, 18, 6, 92, 8, 5)
  ],
  CoinMimicHazard: [mimic('charity_fake_1',24,7,12,22), mimic('charity_fake_2',60,13,-12,23), mimic('charity_fake_3',86,16,-3,25)],
  Coin: [coin('charity_p1', 5.0, 2.8, -7), coin('charity_p2', 7.8, 3.7, 7), coin('charity_p3', 10.6, 4.6, -7), coin('charity_p4', 13.4, 5.5, 7), coin('charity_p5', 16.2, 6.4, -7), coin('charity_p6', 19.0, 7.3, 7), coin('charity_p7', 21.8, 2.8, -7), coin('charity_p8', 24.6, 3.7, 7), coin('charity_p9', 27.4, 4.6, -7), coin('charity_p10', 30.2, 5.5, 7), coin('charity_p11', 33.0, 6.4, -7), coin('charity_p12', 35.8, 7.3, 7), coin('charity_p13', 38.6, 2.8, -7), coin('charity_p14', 41.4, 3.7, 7), coin('charity_p15', 44.2, 4.6, -7), coin('charity_p16', 47.0, 5.5, 7), coin('charity_p17', 49.8, 6.4, -7), coin('charity_p18', 52.6, 7.3, 7), coin('charity_p19', 55.4, 2.8, -7), coin('charity_p20', 58.2, 3.7, 7), coin('charity_p21', 61.0, 4.6, -7), coin('charity_p22', 63.8, 5.5, 7), coin('charity_p23', 66.6, 6.4, -7), coin('charity_p24', 69.4, 7.3, 7), coin('charity_p25', 72.2, 2.8, -7), coin('charity_p26', 75.0, 3.7, 7), coin('charity_p27', 77.8, 4.6, -7), coin('charity_p28', 80.6, 5.5, 7), coin('charity_p29', 83.4, 6.4, -7), coin('charity_p30', 86.2, 7.3, 7), bonus('charity_greed1', 16, 6, -13, 15), bonus('charity_greed2', 26, 7.5, 13, 16), bonus('charity_greed3', 36, 9, -13, 17), bonus('charity_greed4', 46, 10.5, 13, 18), bonus('charity_greed5', 56, 12, -13, 19), bonus('charity_greed6', 66, 13.5, 13, 20)],
  InteractiveDoor: [door('Gate to Broken Seraph',96,18.5,0)]
});
