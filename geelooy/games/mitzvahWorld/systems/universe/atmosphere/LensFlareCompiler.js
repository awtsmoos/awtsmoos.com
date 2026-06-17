// B"H
export function compileLensFlare(atmosphere = {}) { return { type:"lens_flare", id:"lens_flare", enabled:atmosphere.lensFlares !== false, style:atmosphere.lensFlareStyle || "hyper_real", command:"ensure_lens_flare" }; }
