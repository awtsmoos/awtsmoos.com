// B"H
// Boruch Hashem
// Blessed is He
import { adventureSummary } from '../adventure/runtime.js';

/**
 * The Awtsmoos condenses armor, currency, mission, peers, and pulse into one thin
 * rail. The game center remains visible on both desktop and mobile.
 */
export function renderExpansionHud(world, dom) {
	dom.armorText.textContent = `${world.player.armor}/${world.player.maxArmor}`;
	dom.perutahText.textContent = world.save.perutot || 0;
	dom.shlichusText.textContent = adventureSummary(world);
	dom.peerText.textContent = `${world.multiplayer.peerCount} LIVE`;
	const cooldown = world.combat.pulseCooldown;
	dom.pulseState.textContent = cooldown > 0 ? `${cooldown.toFixed(1)}s` : 'READY';
	dom.pulseButton.classList.toggle('cooling', cooldown > 0);
	dom.resourceRail.classList.toggle('adventure-active', world.adventure.active);
}
