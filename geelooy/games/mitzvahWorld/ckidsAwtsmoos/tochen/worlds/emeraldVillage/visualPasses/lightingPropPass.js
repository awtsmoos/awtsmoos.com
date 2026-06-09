// B"H
/**
 * @file lightingPropPass.js
 * @description Chapter 347: Visible lamp props are composed from entry lamps
 * and the plaza lamp ring.
 */
import { ENTRY_LAMPS, PLAZA_LAMP_RING } from './lightingConfig.js';
import { addLampGeometry } from './lampGeometry.js';
import { addPlazaLampRing } from './plazaLampRing.js';
export function addLightingProps(n) {
  ENTRY_LAMPS.forEach(lamp => addLampGeometry(n, lamp));
  addPlazaLampRing(n, PLAZA_LAMP_RING);
}
