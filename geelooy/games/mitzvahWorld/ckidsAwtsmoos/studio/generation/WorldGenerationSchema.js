// B"H
export const WORLD_GENERATION_SCHEMA = Object.freeze({ seed:"number", biome:"string", village:{ roads:"array", buildings:"array", doors:"array", interiors:"array" } });
export default WORLD_GENERATION_SCHEMA;
