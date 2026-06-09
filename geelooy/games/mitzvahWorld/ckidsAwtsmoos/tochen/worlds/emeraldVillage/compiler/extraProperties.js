// B"H
/** @file extraProperties.js @description Chapter 354: Outer dwellings bloom from seed. */
export function addExtraProperties(allProperties, profile, rand) {
  const gridRange = profile.terrainSize * 0.42;
  for (let i = 0; i < profile.extraProperties; i += 1) {
    const x = (rand() - 0.5) * gridRange * 2, z = (rand() - 0.5) * gridRange * 2;
    if (Math.abs(x) < 230 && Math.abs(z) < 230) continue;
    const isTower = i % 9 === 0, crooked = i % 4;
    allProperties.push({ id: `extra_prop_${i}`, name: isTower ? `Emerald Light Tower ${i}` : `Soul Dwelling ${i}`, center: { x, z }, lot: { width: isTower ? 72 : 54 + crooked * 5, depth: isTower ? 72 : 50 + crooked * 6 }, housePreset: isTower ? 'generateSkyscraper' : ['TwoBedroom', 'SingleRoom', 'HouseWithPatio'][i % 3], housePresetArg: isTower ? 3 + Math.floor(rand() * 4) : null, fenceType: ['wood', 'stone', 'hedge'][i % 3], fenceHeight: 1.8 + (i % 4) * 0.25 });
  }
}
