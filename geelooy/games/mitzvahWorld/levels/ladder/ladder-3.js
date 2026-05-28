// B"H
import { level, terrain, player, npc, platform, move, fake, spike, mimic, coin, bonus, door, slip, blast, spikeCoin } from './helpers.js';
export default level('Hod_Library_of_Arguments', 12, 'ladder-4.js', {
  ProceduralTerrain: { libraryVoid: terrain('Hod_Library_Floor', 'safegrass') },
  Chossid: [player(0,10,0)],
  SolidBlock: [platform('library_start',0,0,0,10,10,0x7b4f2c), platform('shelf_a',10,2.5,-6,8,2.4,0x5d4037), platform('shelf_b',18,4.8,4,8,2.4,0x6d4c41), platform('shelf_c',28,7,-6,10,2.4,0x4e342e), platform('footnote_bridge',38,9,0,12,1.8,0x795548), platform('hod_gate',52,10.5,0,10,7,0x3e2723), platform('secret_commentary',25,5.8,13,6,3,0x283593)],
  MovingPlatform: [move('sliding_shelf',21,5.7,-2,5,2,'z',5,1.3), move('argument_lift',44,8.7,4,4,3,'y',2.5,1.4)],
  BetrayalPlatform: [fake('bad_footnote_1',13,3.5,5,4,3), fake('bad_footnote_2',32,8,4,4,3), fake('bad_footnote_3',43,10,-5,5,3)],
  SpikeHazard: [spike('quote_spike_1',8,0.2,4,7), spike('quote_spike_2',20,5.2,0,7), spike('quote_spike_3',35,9.5,0,8), spike('quote_spike_4',45,0.2,-5,8), spike('fake_platform_spike',13,2,5,8)],
  SlipperyPlatform: [
    slip('slick_memory_3_a', 18, 4.65, 10, 5, 3, 'z', 6.75)
  ],
  FastPusherPlatform: [
    blast('blast_plate_3_a', 24, 5.95, -8, 5, 3, 'z', 1, 31)
  ],
  SpikeCoin: [
    spikeCoin('coin_was_spike_3_a', 22, 6, 2, 30, 2, 15),
    spikeCoin('coin_was_spike_3_b', 64, 14, -6, 72, -8, 17)
  ],
  CoinMimicHazard: [mimic('cursed_footnote_coin',17,5.7,4,11), mimic('bad_source_coin',43,11.1,-5,12)],
  Coin: [coin('h1',5,1.5,0), coin('h2',10,3.7,-6), coin('h3',13,4.6,5), coin('h4',18,6,4), coin('h5',25,6.9,13), coin('h6',28,8.2,-6), coin('h7',32,9.1,4), coin('h8',36,10.1,0), coin('h9',40,10.1,0), coin('h10',43,11.1,-5), coin('h11',50,11.7,0), coin('h12',55,11.7,0), bonus('hod_bonus',25,7.2,13,6)],
  InteractiveDoor: [door('Gate to Netzach',57,13,0)]
});
