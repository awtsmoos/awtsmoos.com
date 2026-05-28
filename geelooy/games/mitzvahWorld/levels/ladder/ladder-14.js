// B"H
import { level, terrain, player, platform, move, fake, spike, mimic, coin, bonus, door, vanish, push, trapdoor, slip, blast, resetPit } from './helpers.js';

export default level('Collapse_Serpent', 34, 'ladder-15.js', {
  ProceduralTerrain: { sandFloor: terrain('Collapse_Serpent_Sand', 'sand') },
  Chossid: [player(-6, 8, 0)],
  SolidBlock: [
    platform('serpent_start', -4, 0, 0, 10, 9, 9255711),
    platform('serpent_mercy_1', 14, 4, -10, 5, 3, 9255711),
    platform('serpent_mercy_2', 36, 9, 10, 5, 3, 9255711),
    platform('serpent_gate', 96, 20, 0, 12, 7, 9255711)
  ],
  MovingPlatform: [
    move('serpent_blue_swing_a', 10, 3, 0, 5, 2, 'z', 8, 2.2, 0x2196f3),
    move('serpent_blue_swing_b', 52, 12, -4, 5, 2, 'x', 9, 2.6, 0x2196f3)
  ],
  SlipperyPlatform: [
    slip('serpent_ice_lane_1', 20, 5, 8, 7, 2.4, 'x', 12.666666666666668),
    slip('serpent_ice_lane_2', 62, 14, -8, 7, 2.4, 'z', 13.666666666666668),
    slip('serpent_ice_lane_3', 82, 18, 6, 6, 2.4, 'x', 14.666666666666668)
  ],
  FastPusherPlatform: [
    blast('serpent_orange_shove_1', 28, 7, -8, 5, 3, 'z', 1, 56),
    blast('serpent_orange_shove_2', 70, 16, 8, 5, 3, 'z', -1, 60),
    blast('serpent_orange_shove_3', 90, 19, -5, 5, 3, 'x', 1, 62)
  ],
  DisappearingPlatform: [
    vanish('serpent_yellow_vanish_1', 24, 6.2, 0, 4, 3, 420),
    vanish('serpent_yellow_vanish_2', 44, 10.5, -8, 4, 3, 330),
    vanish('serpent_yellow_vanish_3', 76, 17, 0, 4, 3, 270)
  ],
  TrapdoorPlatform: [
    trapdoor('serpent_brown_mouth_1', 58, 13.5, 0, 6, 4, 430),
    trapdoor('serpent_brown_mouth_2', 88, 18.5, 8, 6, 4, 330)
  ],
  BetrayalPlatform: [
    fake('serpent_purple_liar_1', 32, 8.4, 12, 4, 3, 25),
    fake('serpent_purple_liar_2', 66, 15.4, -12, 4, 3, 26)
  ],
  SpikeHazard: [
    spike('serpent_spike_floor_1', 16, 1.8, 8, 24),
    spike('serpent_spike_floor_2', 28, 5.1, 4, 25),
    spike('serpent_spike_floor_3', 44, 8.8, -8, 26),
    spike('serpent_spike_floor_4', 58, 11.3, 0, 28),
    spike('serpent_spike_floor_5', 70, 14, -8, 29),
    spike('serpent_spike_floor_6', 88, 16.2, 8, 30),
    spike('serpent_spike_floor_7', 96, 18.5, -5, 32)
  ],
  CoinMimicHazard: [
    mimic('serpent_fake_gold_1', 24, 7.2, 0, 32),
    mimic('serpent_fake_gold_2', 70, 17.2, 8, 34),
    mimic('serpent_fake_gold_3', 92, 21, -5, 36)
  ],
  Coin: [coin('serpent_p1', 6, 3.0, -9), coin('serpent_p2', 8.6, 4.0, 0), coin('serpent_p3', 11.2, 4.9, 9), coin('serpent_p4', 13.8, 5.8, -9), coin('serpent_p5', 16.4, 6.8, 0), coin('serpent_p6', 19, 7.8, 9), coin('serpent_p7', 21.6, 8.7, -9), coin('serpent_p8', 24.2, 3.0, 0), coin('serpent_p9', 26.8, 4.0, 9), coin('serpent_p10', 29.400000000000002, 4.9, -9), coin('serpent_p11', 32, 5.8, 0), coin('serpent_p12', 34.6, 6.8, 9), coin('serpent_p13', 37.2, 7.8, -9), coin('serpent_p14', 39.800000000000004, 8.7, 0), coin('serpent_p15', 42.4, 3.0, 9), coin('serpent_p16', 45, 4.0, -9), coin('serpent_p17', 47.6, 4.9, 0), coin('serpent_p18', 50.2, 5.8, 9), coin('serpent_p19', 52.800000000000004, 6.8, -9), coin('serpent_p20', 55.4, 7.8, 0), coin('serpent_p21', 58, 8.7, 9), coin('serpent_p22', 60.6, 3.0, -9), coin('serpent_p23', 63.2, 4.0, 0), coin('serpent_p24', 65.80000000000001, 4.9, 9), coin('serpent_p25', 68.4, 5.8, -9), coin('serpent_p26', 71, 6.8, 0), coin('serpent_p27', 73.60000000000001, 7.8, 9), coin('serpent_p28', 76.2, 8.7, -9), coin('serpent_p29', 78.8, 3.0, 0), coin('serpent_p30', 81.4, 4.0, 9), coin('serpent_p31', 84, 4.9, -9), coin('serpent_p32', 86.60000000000001, 5.8, 0), coin('serpent_p33', 89.2, 6.8, 9), coin('serpent_p34', 91.8, 7.8, -9), bonus('serpent_greed_1', 18, 8, -13, 20), bonus('serpent_greed_2', 27, 9.2, 13, 21), bonus('serpent_greed_3', 36, 10.4, -13, 22), bonus('serpent_greed_4', 45, 11.6, 13, 23), bonus('serpent_greed_5', 54, 12.8, -13, 24), bonus('serpent_greed_6', 63, 14, 13, 25), bonus('serpent_greed_7', 72, 15.2, -13, 26)],
  InteractiveDoor: [door('Gate to Level 15', 102, 22.5, 0)],
  FallResetTrigger: [resetPit('serpent_fall_reset', 46, -16, 0, 180, 150)]
});
