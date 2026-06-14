import { createAttackState, tickChargeState } from '../js/combat/attackState.js';
import { ATTACKS } from '../js/data/attacks.js';

const f = { charge: { prev: {} } };
for (let i = 0; i < 40; i++) {
  tickChargeState(f, { punch: i % 2 === 0, rapidPunch: true }, { rapidPunch: true });
}
if ((f.charge.punch || 0) !== 0) throw new Error(`rapid built charge ${f.charge.punch}`);
for (let i = 0; i < 20; i++) tickChargeState(f, { punch: true }, { rapidPunch: false });
if ((f.charge.punch || 0) < 20) throw new Error('hold did not build charge');
const rapid = createAttackState(ATTACKS.jab1, { rapid: true, charge: 1 });
if (rapid.charge !== 0 || rapid.fullCharge) throw new Error('rapid inherited charge');
const charged = createAttackState(ATTACKS.chargePunch, { charge: 1 });
if (!charged.fullCharge || charged.knock <= ATTACKS.chargePunch.knock) throw new Error('held charge failed');
console.log(JSON.stringify({ ok: true, rapidCharge: rapid.charge, heldFrames: f.charge.punch, chargedKnock: charged.knock }, null, 2));
