// B"H
export function startingZoneReport(compiled = {}) { return { zone:compiled.manifest?.id || null, objects:compiled.objects?.length || 0, colliders:compiled.colliders?.length || 0, dialogues:compiled.dialogues?.length || 0, lootTables:compiled.lootTables?.length || 0, atmosphere:compiled.objects?.filter(o => ["sun_atmosphere","lens_flare","fog"].includes(o.type)).length || 0 }; }
