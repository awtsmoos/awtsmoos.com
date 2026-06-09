// B"H
/** @file mazikim.js @description Chapter 359: Elemental opposition is seeded around the living district. */
const TYPES = [{ id: 'dust', color: 0xc2b280, name: 'Dust' }, { id: 'water', color: 0x00ffff, name: 'Water' }, { id: 'fire', color: 0xff4500, name: 'Fire' }, { id: 'air', color: 0xffffff, name: 'Air' }];
export function addMazikim(n, profile, rand) {
  for (let i = 0; i < profile.mazikim; i += 1) {
    const angle = rand() * Math.PI * 2, dist = 420 + rand() * (profile.terrainSize * 0.22), t = TYPES[i % TYPES.length];
    n.Mazik[`klipa_${i}`] = { name: `${t.name} Kelipa`, position: { x: Math.cos(angle) * dist, y: 1.5, z: Math.sin(angle) * dist }, color: t.color, elementalType: t.id, maxHp: 100, xpValue: 150, damage: 25, aggroRange: 20 };
  }
}
