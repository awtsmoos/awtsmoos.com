// B"H
import { level, terrain, player, platform, move, fake, spike, mimic, coin, bonus, door, vanish, push, trapdoor, slip, blast, greedy, resetPit } from './helpers.js';

export default level('Glass_Dune_Engine', 38, 'ladder-17.js', {
  ProceduralTerrain: { sandFloor: terrain('Glass_Dune_Engine_Sand', 'sand') },
  Chossid: [player(-6, 8, 0)],
  SolidBlock: [
    platform('glass_start', -4, 0, 0, 10, 9, 8249343),
    platform('glass_mercy_1', 14, 4, -10, 5, 3, 8249343),
    platform('glass_mercy_2', 36, 9, 10, 5, 3, 8249343),
    platform('glass_gate', 96, 20, 0, 12, 7, 8249343)
  ],
  MovingPlatform: [
    move('glass_blue_swing_a', 10, 3, 0, 5, 2, 'z', 8, 2.2, 0x2196f3),
    move('glass_blue_swing_b', 52, 12, -4, 5, 2, 'x', 9, 2.6, 0x2196f3)
  ],
  SlipperyPlatform: [
    slip('glass_ice_lane_1', 20, 5, 8, 7, 2.4, 'x', 13.333333333333332),
    slip('glass_ice_lane_2', 62, 14, -8, 7, 2.4, 'z', 14.333333333333332),
    slip('glass_ice_lane_3', 82, 18, 6, 6, 2.4, 'x', 15.333333333333332)
  ],
  FastPusherPlatform: [
    blast('glass_orange_shove_1', 28, 7, -8, 5, 3, 'z', 1, 58),
    blast('glass_orange_shove_2', 70, 16, 8, 5, 3, 'z', -1, 62),
    blast('glass_orange_shove_3', 90, 19, -5, 5, 3, 'x', 1, 64)
  ],
  DisappearingPlatform: [
    vanish('glass_yellow_vanish_1', 24, 6.2, 0, 4, 3, 420),
    vanish('glass_yellow_vanish_2', 44, 10.5, -8, 4, 3, 330),
    vanish('glass_yellow_vanish_3', 76, 17, 0, 4, 3, 270)
  ],
  TrapdoorPlatform: [
    trapdoor('glass_brown_mouth_1', 58, 13.5, 0, 6, 4, 430),
    trapdoor('glass_brown_mouth_2', 88, 18.5, 8, 6, 4, 330)
  ],
  BetrayalPlatform: [
    fake('glass_purple_liar_1', 32, 8.4, 12, 4, 3, 27),
    fake('glass_purple_liar_2', 66, 15.4, -12, 4, 3, 28)
  ],
  SpikeHazard: [
    spike('glass_spike_floor_1', 16, 1.8, 8, 26),
    spike('glass_spike_floor_2', 28, 5.1, 4, 27),
    spike('glass_spike_floor_3', 44, 8.8, -8, 28),
    spike('glass_spike_floor_4', 58, 11.3, 0, 30),
    spike('glass_spike_floor_5', 70, 14, -8, 31),
    spike('glass_spike_floor_6', 88, 16.2, 8, 32),
    spike('glass_spike_floor_7', 96, 18.5, -5, 34)
  ],
  GreedyCoin: [
    greedy('greed_spike_16', 24, 7, 0, 34, 0, 3),
    greedy('greed_ice_16', 58, 13, -6, 66, -8, 4),
    greedy('greed_blast_16', 84, 18, 6, 92, 8, 5)
  ],
  CoinMimicHazard: [
    mimic('glass_fake_gold_1', 24, 7.2, 0, 34),
    mimic('glass_fake_gold_2', 70, 17.2, 8, 36),
    mimic('glass_fake_gold_3', 92, 21, -5, 38)
  ],
  Coin: [coin('glass_p1', 6, 3.0, -9), coin('glass_p2', 8.6, 4.0, 0), coin('glass_p3', 11.2, 4.9, 9), coin('glass_p4', 13.8, 5.8, -9), coin('glass_p5', 16.4, 6.8, 0), coin('glass_p6', 19, 7.8, 9), coin('glass_p7', 21.6, 8.7, -9), coin('glass_p8', 24.2, 3.0, 0), coin('glass_p9', 26.8, 4.0, 9), coin('glass_p10', 29.400000000000002, 4.9, -9), coin('glass_p11', 32, 5.8, 0), coin('glass_p12', 34.6, 6.8, 9), coin('glass_p13', 37.2, 7.8, -9), coin('glass_p14', 39.800000000000004, 8.7, 0), coin('glass_p15', 42.4, 3.0, 9), coin('glass_p16', 45, 4.0, -9), coin('glass_p17', 47.6, 4.9, 0), coin('glass_p18', 50.2, 5.8, 9), coin('glass_p19', 52.800000000000004, 6.8, -9), coin('glass_p20', 55.4, 7.8, 0), coin('glass_p21', 58, 8.7, 9), coin('glass_p22', 60.6, 3.0, -9), coin('glass_p23', 63.2, 4.0, 0), coin('glass_p24', 65.80000000000001, 4.9, 9), coin('glass_p25', 68.4, 5.8, -9), coin('glass_p26', 71, 6.8, 0), coin('glass_p27', 73.60000000000001, 7.8, 9), coin('glass_p28', 76.2, 8.7, -9), coin('glass_p29', 78.8, 3.0, 0), coin('glass_p30', 81.4, 4.0, 9), coin('glass_p31', 84, 4.9, -9), coin('glass_p32', 86.60000000000001, 5.8, 0), coin('glass_p33', 89.2, 6.8, 9), coin('glass_p34', 91.8, 7.8, -9), coin('glass_p35', 94.4, 8.7, 0), coin('glass_p36', 97, 3.0, 9), coin('glass_p37', 99.60000000000001, 4.0, -9), coin('glass_p38', 102.2, 4.9, 0), bonus('glass_greed_1', 18, 8, -13, 22), bonus('glass_greed_2', 27, 9.2, 13, 23), bonus('glass_greed_3', 36, 10.4, -13, 24), bonus('glass_greed_4', 45, 11.6, 13, 25), bonus('glass_greed_5', 54, 12.8, -13, 26), bonus('glass_greed_6', 63, 14, 13, 27), bonus('glass_greed_7', 72, 15.2, -13, 28)],
  InteractiveDoor: [door('Gate to Level 17', 102, 22.5, 0)],
  FallResetTrigger: [resetPit('glass_fall_reset', 46, -16, 0, 180, 150)]
});
