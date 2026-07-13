//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the weapon trails vessel in this instant, revealing
 * its focused js particles emitters service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H � Weapon trails remember fast motion for a few frames. A sword or axe
 * does not merely appear; it leaves a fading kav of judgment and light.
 */
export function addWeaponTrails(state) {
	for (const f of state.fighters) {
		if (!f.heldWeapon || !f.attack) continue;
		const w = f.heldWeapon;
		state.particles.push({
			x: w.x + f.face * w.range * 0.55,
			y: w.y - 4,
			vx: -f.face * 1.4,
			vy: -0.25,
			life: 18,
			color: w.color
		});
	}
}
