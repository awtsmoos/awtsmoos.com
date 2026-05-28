// B"H
import { level, terrain, player, platform, move, fake, spike, mimic, coin, bonus, door, vanish, push, trapdoor, slip, blast, greedy, resetPit, spikeCoin } from './helpers.js';

export default level('Ice_Prophecy', 48, 'ladder-20.js', {
 ProceduralTerrain:{ sandFloor: terrain('Ice_Prophecy_sand','sand') },
 Chossid:[player(-8,9,0)],
 SolidBlock:[
  platform('start',-4,0,0,12,8,0xb68a44),
  platform('safe_lie_1',18,5,-10,4,3,0x5ecbff),
  platform('safe_lie_2',42,10,10,4,3,0x5ecbff),
  platform('safe_lie_3',76,16,-10,4,3,0x5ecbff),
  platform('gate',124,28,0,12,8,0xffd166)
 ],
 MovingPlatform:[
  move('swing_a',12,4,0,5,2,'z',8,2.4,0x2196f3),
  move('swing_b',54,13,0,5,2,'x',10,2.9,0x2196f3)
 ],
 SlipperyPlatform:[
  slip('ice_1',24,7,8,8,2,'x',11),
  slip('ice_2',64,15,-8,8,2,'z',12),
  slip('ice_3',96,22,8,8,2,'x',13)
 ],
 FastPusherPlatform:[
  blast('blast_1',30,8,-8,5,3,'z',1,52),
  blast('blast_2',72,17,8,5,3,'z',-1,56),
  blast('blast_3',108,24,-6,5,3,'x',1,60)
 ],
 DisappearingPlatform:[
  vanish('vanish_1',20,6,0,4,3,260),
  vanish('vanish_2',48,12,-10,4,3,220),
  vanish('vanish_3',88,20,0,4,3,180)
 ],
 TrapdoorPlatform:[
  trapdoor('mouth_1',58,14,0,6,4,320),
  trapdoor('mouth_2',100,23,8,6,4,240)
 ],
 BetrayalPlatform:[
  fake('liar_1',38,10,14,4,3,25),
  fake('liar_2',82,18,-14,4,3,28)
 ],
 SpikeCoin:[
  spikeCoin('secret_spike_coin_19_a',34,9,4,42,4,39),
  spikeCoin('secret_spike_coin_19_b',90,22,-6,100,-6,43)
 ],
 GreedyCoin:[
  greedy('run_spike',16,5,0,28,0,3),
  greedy('run_ice',60,14,-4,68,-8,4),
  greedy('run_blast',94,21,6,108,-6,5)
 ],
 SpikeHazard:[
  spike('spike_1',16,2,0,30),
  spike('spike_2',30,6,-8,32),
  spike('spike_3',48,10,-10,34),
  spike('spike_4',60,13,-4,36),
  spike('spike_5',72,16,8,38),
  spike('spike_6',94,20,6,40),
  spike('spike_7',108,23,-6,42)
 ],
 CoinMimicHazard:[
  mimic('fake_1',26,8,0,30),
  mimic('fake_2',76,18,8,34)
 ],
 Coin:[coin('p0',8,4,-8),coin('p1',10.7,5.2,8),coin('p2',13.4,6.4,-8),coin('p3',16.1,7.6,8),coin('p4',18.8,8.8,-8),coin('p5',21.5,10,8),coin('p6',24.200000000000003,11.2,-8),coin('p7',26.900000000000002,12.4,8),coin('p8',29.6,4,-8),coin('p9',32.3,5.2,8),coin('p10',35,6.4,-8),coin('p11',37.7,7.6,8),coin('p12',40.400000000000006,8.8,-8),coin('p13',43.1,10,8),coin('p14',45.800000000000004,11.2,-8),coin('p15',48.5,12.4,8),coin('p16',51.2,4,-8),coin('p17',53.900000000000006,5.2,8),coin('p18',56.6,6.4,-8),coin('p19',59.300000000000004,7.6,8),coin('p20',62,8.8,-8),coin('p21',64.7,10,8),coin('p22',67.4,11.2,-8),coin('p23',70.1,12.4,8),coin('p24',72.80000000000001,4,-8),coin('p25',75.5,5.2,8),coin('p26',78.2,6.4,-8),coin('p27',80.9,7.6,8),coin('p28',83.60000000000001,8.8,-8),coin('p29',86.30000000000001,10,8),coin('p30',89,11.2,-8),coin('p31',91.7,12.4,8),coin('p32',94.4,4,-8),coin('p33',97.10000000000001,5.2,8),coin('p34',99.80000000000001,6.4,-8),coin('p35',102.5,7.6,8),coin('p36',105.2,8.8,-8),coin('p37',107.9,10,8),coin('p38',110.60000000000001,11.2,-8),coin('p39',113.30000000000001,12.4,8),coin('p40',116,4,-8),coin('p41',118.7,5.2,8),coin('p42',121.4,6.4,-8),coin('p43',124.10000000000001,7.6,8),coin('p44',126.80000000000001,8.8,-8),coin('p45',129.5,10,8),coin('p46',132.2,11.2,-8),coin('p47',134.9,12.4,8)],
 InteractiveDoor:[door('Gate 20',132,31,0)],
 FallResetTrigger:[resetPit('pit',60,-18,0,220,180)]
});