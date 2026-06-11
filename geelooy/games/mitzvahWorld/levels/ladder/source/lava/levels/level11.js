// B"H
/**
 * @file level11.js
 * @description Chapter 632: Kaf sharpens the offset anvil lesson without spiking.
 * The Awtsmoos asks for crumb discipline after Yud: harder than the summit exam,
 * but still below the sharper Lamed turnback.
 */
import { island, block, crumb, moving } from '../helpers/platforms.js';
import { level } from '../helpers/level.js';
const a = island('l11_start_kaf_anvil', -28, 1.35, 0, 8.8, 5.9);
const b = block('l11_high_left_anvil_hard', -20.1, 1.62, 4.7, 4.1, 2.65);
const c = crumb('l11_tiny_center_spark_hard', -13.3, 1.86, 0.6);
const d = block('l11_low_right_anvil_hard', -6.3, 2.08, -4.7, 4, 2.6);
const m1 = moving('l11_cross_mover_south_hard', 1.3, 2.3, -0.7, 3.1, 2.15, 'z', 4.7, 0.64, 0.2);
const e = crumb('l11_tiny_north_spark_hard', 8.4, 2.5, 4.1);
const f = block('l11_final_anvil_read_hard', 15.7, 2.68, -1.9, 3.8, 2.45);
const g = island('l11_finish_kaf_seat', 24.3, 2.84, 0, 8.1, 5.6);
export default level({ level: 11, title: 'Kaf Offset Anvils', description: 'Offset anvils with crumb landings and a measured cross mover.', solid: [a,b,c,d,e,f,g], moving: [m1], coinPlacements: [[b],[c],[d],[m1],[e],[f]], boxOn: f, doorOn: g });
