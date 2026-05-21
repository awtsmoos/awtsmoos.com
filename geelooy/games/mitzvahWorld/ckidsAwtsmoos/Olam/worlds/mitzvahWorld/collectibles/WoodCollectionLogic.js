/**
 * B"H
 * Chapter 18: The Tree Remembered The Axe.
 *
 * A tiny idempotent collection helper. Click and tap may both arrive in the
 * same breath, but the wood spark must enter the player's inventory only once.
 */

export function collectWoodRuntime({ actor, group, amount = 1, collectibleId, olam }) {
  if (group?.userData?.collected) {
    return { collected: false, collectibleId, amount: 0, reason: 'already_collected' };
  }

  actor?.inventory?.addItem?.({ id: 'wood', className: 'Wood', name: 'Wood', icon: '🪵' }, amount);
  actor?.updateQuestProgress?.('collect', 'Wood');

  if (group) {
    group.visible = false;
    group.userData = group.userData || {};
    group.userData.collected = true;
  }

  olam?.ayshPeula?.('ui event', 'effectsOverlay', {
    text: `Collected wood ${collectibleId}`,
    color: '#8fd17f'
  });

  return { collected: true, collectibleId, amount };
}
