// B"H
export function bindAtmosphere(objects = []) { return objects.filter(o => ["sun_atmosphere","lens_flare","fog"].includes(o.type)).map(o => ({ id:o.id, type:o.type, config:o })); }
