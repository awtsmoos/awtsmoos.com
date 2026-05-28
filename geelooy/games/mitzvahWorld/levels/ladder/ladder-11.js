// B"H
import { level, terrain, player, npc, platform, move, fake, spike, mimic, coin, bonus, door, vanish, push, trapdoor, slip, blast } from './helpers.js';
export default level('Market_of_Curses', 28, 'ladder-12.js', {
  ProceduralTerrain: { marketFloor: terrain('Market_of_Curses_Floor', 'safegrass') },
  Chossid: [player(0, 12, 0)],
  SolidBlock: [platform('market_start',0,0,0,10,10,0x4e342e), platform('market_gate',84,15,0,12,7,0x4e342e), platform('stall_roof_a',20,5,-12,5,3,0x795548), platform('stall_roof_b',48,10,12,5,3,0x795548)],
  MovingPlatform: [move('merchant_cart_a',14,3,-2,5,2,'x',8,1.9,0xffb300), move('merchant_cart_b',55,11,-6,5,2,'z',8,2.2,0xffb300)],
  DisappearingPlatform: [vanish('sale_floor_a',12,3,8,4,3,480), vanish('sale_floor_b',26,6,-8,4,3,430), vanish('sale_floor_c',41,9,8,4,3,390), vanish('sale_floor_d',68,13,-8,4,3,340)],
  PusherPlatform: [push('haggle_push_a',32,7,0,5,3,'z',11,420), push('haggle_push_b',72,14,5,5,3,'z',-10,360)],
  TrapdoorPlatform: [trapdoor('discount_trap_a',50,10,0,6,4,580), trapdoor('discount_trap_b',78,14,0,6,4,460)],
  SpikeHazard: [spike('market_spike_1',12,0.2,8,16), spike('market_spike_2',32,6.2,11,18), spike('market_spike_3',50,8.8,0,18), spike('market_spike_4',72,12.8,-5,20), spike('market_spike_5',78,12.8,0,20)],
  SlipperyPlatform: [
    slip('slick_memory_11_a', 34, 9.05, 10, 5, 3, 'z', 8.75)
  ],
  FastPusherPlatform: [
    blast('blast_plate_11_a', 40, 11.15, -8, 5, 3, 'z', 1, 39)
  ],
  CoinMimicHazard: [mimic('cursed_sale_1',20,6,-12,20), mimic('cursed_sale_2',50,11,0,22), mimic('cursed_sale_3',80,16,0,24)],
  Coin: [coin('market_p1', 5.0, 2.7, -7), coin('market_p2', 7.8, 3.6, 7), coin('market_p3', 10.6, 4.5, -7), coin('market_p4', 13.4, 5.4, 7), coin('market_p5', 16.2, 6.3, -7), coin('market_p6', 19.0, 7.2, 7), coin('market_p7', 21.8, 2.7, -7), coin('market_p8', 24.6, 3.6, 7), coin('market_p9', 27.4, 4.5, -7), coin('market_p10', 30.2, 5.4, 7), coin('market_p11', 33.0, 6.3, -7), coin('market_p12', 35.8, 7.2, 7), coin('market_p13', 38.6, 2.7, -7), coin('market_p14', 41.4, 3.6, 7), coin('market_p15', 44.2, 4.5, -7), coin('market_p16', 47.0, 5.4, 7), coin('market_p17', 49.8, 6.3, -7), coin('market_p18', 52.6, 7.2, 7), coin('market_p19', 55.4, 2.7, -7), coin('market_p20', 58.2, 3.6, 7), coin('market_p21', 61.0, 4.5, -7), coin('market_p22', 63.8, 5.4, 7), coin('market_p23', 66.6, 6.3, -7), coin('market_p24', 69.4, 7.2, 7), coin('market_p25', 72.2, 2.7, -7), coin('market_p26', 75.0, 3.6, 7), coin('market_p27', 77.8, 4.5, -7), coin('market_p28', 80.6, 5.4, 7), bonus('market_greed1', 16, 6, -13, 13), bonus('market_greed2', 26, 7.5, 13, 14), bonus('market_greed3', 36, 9, -13, 15), bonus('market_greed4', 46, 10.5, 13, 16), bonus('market_greed5', 56, 12, -13, 17), bonus('market_greed6', 66, 13.5, 13, 18)],
  InteractiveDoor: [door('Gate to Charity Chamber',90,17.5,0)]
});
