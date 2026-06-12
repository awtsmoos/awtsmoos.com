// B"H
/**
 * @file BiomeDirector.js
 * @description Chapter 983: zones stop being labels and become region law.
 */
export function buildBiomePlan() {
  const zones = [
    zone("villageCore", "Village Core", [0, 0], 78, 3.6, { traffic: .95, fertility: .25, vegetation: .18 }),
    zone("farmBelt", "Farm Belt", [-160, -55], 128, 2.2, { traffic: .48, fertility: .92, vegetation: .64 }),
    zone("orchardRing", "Orchard Ring", [118, -82], 122, 2.1, { traffic: .35, fertility: .78, vegetation: .76 }),
    zone("forestBelt", "Forest Belt", [165, 72], 188, 2.0, { moisture: .62, shade: .68, vegetation: .95 }),
    zone("ancientGrove", "Ancient Grove", [215, 112], 62, 3.2, { moisture: .72, shade: .92, vegetation: 1 }),
    zone("marshlands", "River Marshlands", [95, -142], 96, 2.8, { moisture: .96, fertility: .62, vegetation: .7 }),
    zone("rockyHighlands", "Rocky Highlands", [-235, 138], 178, 2.4, { altitude: .86, fertility: .22, vegetation: .28 }),
    zone("wilderness", "Outer Wilderness", [0, 30], 360, .6, { moisture: .42, fertility: .38, vegetation: .46 })
  ];
  return { version: "biome-plan-v2-zoned-region", zones, summary: summarizeZones(zones) };
}

function zone(id, label, center, radius, priority, traits) {
  return { id, label, center, radius, priority, ...traits };
}

function summarizeZones(zones) {
  return zones.reduce((out, z) => {
    out.count += 1;
    out.ids.push(z.id);
    out.totalRadius += z.radius;
    return out;
  }, { count: 0, ids: [], totalRadius: 0 });
}
