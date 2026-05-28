// B"H
import { level, terrain, player, npc, platform, move, fake, spike, mimic, coin, bonus, door, vanish, push, trapdoor, slip, blast } from './helpers.js';
export default level('Ein_Sof_Collapse', 26, 'ladder-11.js', {
  ProceduralTerrain: { collapseFloor: terrain('Ein_Sof_Collapse_Floor', 'safegrass') },
  Chossid: [player(0, 12, 0)],
  SolidBlock: [platform('collapse_start',0,0,0,10,10,0x263238), platform('collapse_gate',76,14,0,12,7,0x263238), platform('safe_mercy_1',18,4,-10,4,3,0x455a64), platform('safe_mercy_2',42,9,10,4,3,0x455a64)],
  MovingPlatform: [move('collapse_sine_a',12,3,0,5,2,'z',7,1.7,0x42a5f5), move('collapse_sine_b',52,10,-3,5,2,'x',6,2.1,0x42a5f5)],
  DisappearingPlatform: [vanish('memory_01',9,2,-7,4,3,650), vanish('memory_02',22,5,7,4,3,500), vanish('memory_03',34,7,-7,4,3,420), vanish('memory_04',58,11,7,4,3,360)],
  PusherPlatform: [push('push_into_pit_a',28,6,0,5,3,'z',10,500), push('push_into_pit_b',64,12,-4,5,3,'x',8,380)],
  TrapdoorPlatform: [trapdoor('trap_over_teeth_a',46,9,0,6,4,720), trapdoor('trap_over_teeth_b',70,13,4,5,4,520)],
  BetrayalPlatform: [fake('collapse_liar_a',15,3.4,9,4,3,14), fake('collapse_liar_b',39,8,-11,4,3,15)],
  SpikeHazard: [spike('collapse_spike_1',10,0.2,-7,14), spike('collapse_spike_2',28,5.6,10,16), spike('collapse_spike_3',46,7.8,0,18), spike('collapse_spike_4',70,11.8,4,18), spike('collapse_spike_5',65,0.2,-4,20)],
  SlipperyPlatform: [
    slip('slick_memory_10_a', 32, 8.5, -10, 5, 3, 'x', 8.5)
  ],
  FastPusherPlatform: [
    blast('blast_plate_10_a', 38, 10.5, 8, 5, 3, 'x', -1, 38)
  ],
  CoinMimicHazard: [mimic('collapse_mimic_1',22,6,7,18), mimic('collapse_mimic_2',58,12,7,20), mimic('collapse_mimic_3',72,14,0,24)],
  Coin: [coin('collapse_p1', 5.0, 2.5, -7), coin('collapse_p2', 7.8, 3.4, 7), coin('collapse_p3', 10.6, 4.3, -7), coin('collapse_p4', 13.4, 5.2, 7), coin('collapse_p5', 16.2, 6.1, -7), coin('collapse_p6', 19.0, 7.0, 7), coin('collapse_p7', 21.8, 2.5, -7), coin('collapse_p8', 24.6, 3.4, 7), coin('collapse_p9', 27.4, 4.3, -7), coin('collapse_p10', 30.2, 5.2, 7), coin('collapse_p11', 33.0, 6.1, -7), coin('collapse_p12', 35.8, 7.0, 7), coin('collapse_p13', 38.6, 2.5, -7), coin('collapse_p14', 41.4, 3.4, 7), coin('collapse_p15', 44.2, 4.3, -7), coin('collapse_p16', 47.0, 5.2, 7), coin('collapse_p17', 49.8, 6.1, -7), coin('collapse_p18', 52.6, 7.0, 7), coin('collapse_p19', 55.4, 2.5, -7), coin('collapse_p20', 58.2, 3.4, 7), coin('collapse_p21', 61.0, 4.3, -7), coin('collapse_p22', 63.8, 5.2, 7), coin('collapse_p23', 66.6, 6.1, -7), coin('collapse_p24', 69.4, 7.0, 7), coin('collapse_p25', 72.2, 2.5, -7), coin('collapse_p26', 75.0, 3.4, 7), bonus('collapse_greed1', 16, 6, -13, 12), bonus('collapse_greed2', 26, 7.5, 13, 13), bonus('collapse_greed3', 36, 9, -13, 14), bonus('collapse_greed4', 46, 10.5, 13, 15), bonus('collapse_greed5', 56, 12, -13, 16)],
  InteractiveDoor: [door('Gate to Market of Curses',82,16.5,0)]
});
