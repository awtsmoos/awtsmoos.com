/**
 * B"H
 * Attack trait ledger: punches and kicks finally stop sharing one blurry soul.
 *
 * A punch is a quick spark that chains and interrupts. A kick is a wider decree
 * that moves the body and launches harder. Meteor and sweep are platformer verbs:
 * drop, trip, bounce, and open the road. The Awtsmoos speaks the difference into
 * one tiny table so every combat module can agree.
 */
const TRAITS = {
  jab1: trait('punch', 1.04, 0.92, 6, 1, 0, 'jab'),
  jab2: trait('punch', 1.08, 0.98, 7, 1, 0, 'jab'),
  jab3: trait('punch', 1.18, 1.12, 9, 2, 1, 'finisher'),
  dashPunch: trait('punch', 1.2, 1.16, 16, 1, 1, 'dash'),
  chargePunch: trait('punch', 1.42, 1.32, 20, 2, 2, 'charge'),
  uppercut: trait('punch', 1.28, 1.22, 13, 2, 1, 'launcher'),
  roundhouse: trait('kick', 1.16, 1.35, 28, 3, 2, 'launcher'),
  sweep: trait('kick', 0.98, 1.05, 30, 3, 0, 'trip'),
  aerialKick: trait('kick', 1.12, 1.24, 22, 3, 1, 'air'),
  meteorKick: trait('kick', 1.3, 1.45, 18, 2, 2, 'meteor'),
  grab: trait('grab', 1, 1, 0, 0, 0, 'grab'),
  special: trait('special', 1.2, 1.24, 18, 2, 1, 'special')
};

export function attackTrait(id) {
  return TRAITS[id] || trait('punch', 1, 1, 0, 0, 0, 'plain');
}

export function isKickAttack(id) {
  return attackTrait(id).family === 'kick';
}

function trait(family, damage, knock, reach, active, recovery, feel) {
  return { family, damage, knock, reach, active, recovery, feel };
}
