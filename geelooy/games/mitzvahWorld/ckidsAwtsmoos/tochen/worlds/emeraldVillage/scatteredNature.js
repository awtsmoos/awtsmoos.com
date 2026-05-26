// B"H
/**
 * @module scatteredNature
 * @description
 * Deterministic nature/treasure manifests for the Emerald Village. No import
 * time Math.random: every rock, mazik, tree, and collectible is stable.
 */

function seeded(index, salt = 0) {
    const x = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
    return x - Math.floor(x);
}

function itemRing(cx, cz, radius, count, generator) {
    const out = [];
    for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const jx = Math.sin(i * 7.3) * 0.2 * radius;
        const jz = Math.cos(i * 11.1) * 0.2 * radius;
        out.push(generator(cx + Math.cos(a) * radius + jx, cz + Math.sin(a) * radius + jz, i));
    }
    return out;
}

function itemPatch(cx, cz, w, d, density, generator) {
    const out = [];
    const step = Math.sqrt((w * d) / density);
    for (let x = -w / 2; x < w / 2; x += step) {
        for (let z = -d / 2; z < d / 2; z += step) {
            const key = out.length;
            const jx = Math.sin((x + z) * 3.7) * step * 0.4;
            const jz = Math.cos((x - z) * 5.1) * step * 0.4;
            out.push(generator(cx + x + jx, cz + z + jz, key));
        }
    }
    return out;
}

function rockScale(i, base = 1) {
    return {
        x: base + seeded(i, 1) * 2,
        y: base,
        z: base + seeded(i, 2) * 2
    };
}

export const PRESETS_MIX = ['Oak Medium', 'Birch Small', 'Oak Large', 'Ash Medium', 'Willow'];

export const VILLAGE_TREES = [
    { preset: 'Oak Large', position: { x: 0, z: -15 }, scale: 6.0 },
    ...itemRing(0, 0, 15, 6, (x, z, i) => ({ preset: PRESETS_MIX[i % PRESETS_MIX.length], position: { x, z } })),
    ...itemRing(0, 0, 30, 12, (x, z, i) => ({ preset: PRESETS_MIX[i % PRESETS_MIX.length], position: { x, z } })),
    ...itemRing(0, 0, 50, 20, (x, z, i) => ({ preset: PRESETS_MIX[i % PRESETS_MIX.length], position: { x, z } })),
    ...itemRing(0, 0, 70, 30, (x, z, i) => ({ preset: PRESETS_MIX[i % PRESETS_MIX.length], position: { x, z } })),
    ...itemRing(0, 0, 90, 40, (x, z, i) => ({ preset: PRESETS_MIX[i % PRESETS_MIX.length], position: { x, z } })),
    ...itemPatch(200, 200, 150, 150, 60, (x, z) => ({ preset: 'Birch Small', position: { x, z } })),
    ...itemPatch(-200, -200, 150, 150, 60, (x, z) => ({ preset: 'Oak Medium', position: { x, z } }))
];

export const VILLAGE_FLOWERS = [
    ...itemRing(0, 0, 10, 5, (x, z, i) => ({ position: { x, z }, radius: 5, count: 200, flowerType: i % 2 ? 'rose' : 'daisy' })),
    ...itemRing(0, 0, 25, 10, (x, z, i) => ({ position: { x, z }, radius: 8, count: 300, flowerType: i % 2 ? 'rose' : 'daisy' })),
    ...itemRing(0, 0, 40, 15, (x, z, i) => ({ position: { x, z }, radius: 10, count: 50, flowerType: i % 2 ? 'rose' : 'daisy' })),
    { position: { x: 100, z: -100 }, radius: 30, count: 500, flowerType: 'rose' },
    { position: { x: -100, z: 100 }, radius: 30, count: 500, flowerType: 'daisy' }
];

export const VILLAGE_ROCKS = [
    ...itemRing(0, 0, 20, 8, (x, z, i) => ({ name: `Rock_Inner_${i}`, position: { x, y: 0.5, z }, scale: rockScale(i, 1), color: '#666666' })),
    ...itemRing(0, 0, 45, 12, (x, z, i) => ({ name: `Rock_Mid_${i}`, position: { x, y: 0.5, z }, scale: rockScale(i, 2), color: '#555555' })),
    ...itemPatch(0, 0, 1000, 1000, 200, (x, z, i) => ({ name: `Rock_${i}`, position: { x, y: 0.5, z }, scale: rockScale(i, 1), color: '#666666' }))
];

export const EXTRA_COLLECTABLES = [
    { itemId: 'coin_gold', itemName: 'Golden Shekel', itemType: 'currency', meshType: 'coin', color: 0xffd700, amount: 50, position: { x: 10, z: 10 } },
    { itemId: 'scroll_torah', itemName: 'Ancient Scroll', itemType: 'resource', meshType: 'box', color: 0xf5f5dc, amount: 1, position: { x: -50, z: -50 } },
    { itemId: 'book_tehillim', itemName: 'Sefer Tehillim', itemType: 'book', meshType: 'box', color: 0x0000ff, amount: 1, position: { x: 5, z: 5 }, stats: { power: 15 } },
    { itemId: 'book_tanya', itemName: 'Tanya', itemType: 'book', meshType: 'box', color: 0xffffff, amount: 1, position: { x: -15, z: 15 }, stats: { power: 25 } }
];

export const MIKVAHS = [
    { id: 'mikvah_village', position: { x: -20, z: 20 } },
    { id: 'mikvah_mountain', position: { x: 400, z: 400 } }
];

export const BOSS_SPAWNS = [
    { name: 'The Shadow of Doubt', position: { x: 500, z: -500 }, maxHp: 500, damage: 50, aggroRange: 40, xpValue: 1000, color: 0x111111 },
    { name: 'The Serpent of Pride', position: { x: -500, z: 500 }, maxHp: 400, damage: 45, aggroRange: 35, xpValue: 800, color: 0x004400 }
];

export const RANDOM_MAZIK_SPAWNS = Array.from({ length: 50 }, (_, i) => ({
    name: 'Lurking Chaos',
    pos: { x: (seeded(i, 3) - 0.5) * 2000, z: (seeded(i, 4) - 0.5) * 2000 },
    hp: 50
}));

export const RIVERS = [
    { id: 'river_life', name: 'River of Life', width: 15, points: [{ x: -1000, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 1000, y: 0, z: 0 }] }
];

export const ISLAND_PROPERTIES = [
    { id: 'island_solitude', name: 'Island of Solitude', center: { x: 800, z: 800 }, lot: { width: 60, depth: 60 }, housePreset: 'Mansion' },
    { id: 'prop_island_2', name: 'Island of Hisbodedus', center: { x: -550, z: -550 }, lot: { width: 50, depth: 50 }, housePreset: 'generateSkyscraper', housePresetArg: 4 }
];
