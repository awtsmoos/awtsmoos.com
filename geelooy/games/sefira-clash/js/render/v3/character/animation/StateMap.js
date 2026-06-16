/** B"H — expanded animation vocabulary for the living brawl. */
export const ANIMATION_STATES = Object.freeze([
 'idle','combatIdle','readyStance','walk','run','sprint','brake','turnaround',
 'jumpStart','rising','doubleJump','peak','falling','fastFall','dive',
 'landing','hardLanding','ledgeHang','ledgeClimb','ledgeDrop','ledgeAttack',
 'punchJab','punchCombo','rapidPunch','chargePunchStart','chargePunchHold',
 'chargePunchRelease','punchMissRecovery','kick','roundhouse','aerialKick',
 'meteorKick','grabStart','grabHold','grabThrow','hitLight','hitMedium',
 'hitHeavy','launch','wallBounce','groundBounce','stunned','dizzy',
 'shieldIdle','shieldHit','shieldBreak','death','respawn','victory','taunt'
]);
export function hasState(name){return ANIMATION_STATES.includes(name);}
