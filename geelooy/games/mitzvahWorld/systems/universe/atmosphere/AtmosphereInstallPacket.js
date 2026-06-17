// B"H
export function atmosphereInstallPackets(objects = []) { return objects.filter(o => ["sun_atmosphere","lens_flare","fog"].includes(o.type)).map(o => ({ kind:"atmosphere_install", id:o.id, type:o.type, command:o.command, config:o })); }
