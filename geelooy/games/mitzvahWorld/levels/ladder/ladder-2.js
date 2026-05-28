// B"H
import { level, terrain, player, npc, platform, move, fake, spike, mimic, coin, bonus, door, slip, blast } from './helpers.js';
export default level('Yesod_Mirror_Causeway', 10, 'ladder-3.js', {
  ProceduralTerrain: { mirrorFloor: terrain('Yesod_Mirror_Floor', 'moon') },
  Chossid: [player(0, 9, 0)],
  SolidBlock: [platform('mirror_start',0,0,0,9,9,0x34495e), platform('mirror_left_a',9,2.2,-8,6,3,0x5dade2), platform('mirror_right_a',9,2.2,8,6,3,0x154360), platform('thin_center',20,4.5,0,12,2,0x85929e), platform('judgment_turn',32,6.2,-7,7,4,0x2e86c1), platform('moon_gate',45,8.2,-7,10,7,0x1b4f72)],
  MovingPlatform: [move('mirror_shuttle',27,5.6,0,5,3,'x',5,1.1), move('mirror_lift',38,6.8,-2,4,4,'y',2,1.2)],
  BetrayalPlatform: [fake('mirror_lie_left',17,3.4,-8,4,3), fake('mirror_lie_right',25,5.3,8,4,3), fake('mirror_lie_gate',38,7.2,1,5,3)],
  SpikeHazard: [spike('mirror_spike_1',13,0.2,0,6), spike('mirror_spike_2',22,4.8,2,6), spike('mirror_spike_3',32,6.8,-4,7), spike('mirror_spike_4',40,0.2,1,7)],
  SlipperyPlatform: [
    slip('slick_memory_2_a', 16, 4.1, -10, 5, 3, 'x', 6.5)
  ],
  FastPusherPlatform: [
    blast('blast_plate_2_a', 22, 5.3, 8, 5, 3, 'x', -1, 30)
  ],
  CoinMimicHazard: [mimic('mirror_false_silver',28,6.8,0,9), mimic('mirror_false_gold',42,9.4,-7,10)],
  Coin: [coin('y1',5,1.5,0), coin('y2',9,3.4,-8), coin('y3',9,3.4,8), coin('y4',18,5.6,0), coin('y5',23,5.6,0), coin('y6',32,7.4,-7), coin('y7',25,6.5,8), coin('y8',38,8.3,1), coin('y9',42,9.4,-7), coin('y10',47,9.4,-7), bonus('yesod_bonus',30,7.4,3,5)],
  InteractiveDoor: [door('Gate to Hod',50,10.7,-7)]
});
