// B"H
/** Awtsmoos-named hosted nature assets for games and movies. */
export const CHAI_FOREST_BASE_URL = "https://awtsmoos-docs-base.web.app/awtsmoos-nature/chai-forest";
export const CHAI_FOREST_HALF_BASE_URL = "https://awtsmoos-docs-base.web.app/awtsmoos-nature/chai-forest-half";
export const FULL_TEXTURE_BASE_URL = "https://awtsmoos-docs-base.web.app/full-resolution";
export const HALF_TEXTURE_BASE_URL = "https://awtsmoos-docs-base.web.app/half-resolution";
const enc = name => encodeURIComponent(name).replace(/%2F/g, "/");
export const namedTexture = (name, half = true) => `${half ? HALF_TEXTURE_BASE_URL : FULL_TEXTURE_BASE_URL}/${enc(name)}.png`;
export const ACTUAL_TEXTURES = Object.freeze({ grass:"grass 1", grassAlt:"grass1", dirt:"dirt 1", dirt2:"dirt 2", dirtGrass1:"dirt grass 1", dirtGrass2:"dirt grass 2", dirtGrass3:"dirt grass 3", stone:"stone 1", bark:"tree bark 1", leaf:"leaf 1", oakSpring:"oak spring", oakFall:"oak leaf fall", horseFur:"horse fur 1", cowFur:"cow fur 1", deerFur:"deer fur 1", foxFur:"fox fur 1", sand:"sand 1", marble:"marble 1" });
export const FUR_GANG_TEXTURES = Object.freeze(["horseFur", "cowFur", "deerFur", "foxFur"].reduce((o, k) => ({ ...o, [k]: namedTexture(ACTUAL_TEXTURES[k], true) }), {}));
export const barkTextureSet = (id = "Bark001", half = true) => { const root = half ? CHAI_FOREST_HALF_BASE_URL : CHAI_FOREST_BASE_URL; const base = `${root}/textures/bark/${id}_1K-JPG/${id}_1K-JPG`; return { id, color:`${base}_Color.jpg`, ao:`${base}_AmbientOcclusion.jpg`, displacement:`${base}_Displacement.jpg`, normalDx:`${base}_NormalDX.jpg`, normalGl:`${base}_NormalGL.jpg`, roughness:`${base}_Roughness.jpg` }; };
export const leafTexture = (id = "oak", half = true) => `${half ? CHAI_FOREST_HALF_BASE_URL : CHAI_FOREST_BASE_URL}/textures/leaves/${id}.png`;
export const groundTextures = (half = true) => ({ grass:namedTexture(ACTUAL_TEXTURES.grass, half), dirt:namedTexture(ACTUAL_TEXTURES.dirtGrass2, half), dirtPlain:namedTexture(ACTUAL_TEXTURES.dirt, half), stone:namedTexture(ACTUAL_TEXTURES.stone, half), importedGrass:`${half ? CHAI_FOREST_HALF_BASE_URL : CHAI_FOREST_BASE_URL}/textures/ground/grass.jpg`, importedDirt:`${half ? CHAI_FOREST_HALF_BASE_URL : CHAI_FOREST_BASE_URL}/textures/ground/dirt_color.jpg`, importedDirtNormal:`${half ? CHAI_FOREST_HALF_BASE_URL : CHAI_FOREST_BASE_URL}/textures/ground/dirt_normal.jpg` });
export const forestModel = name => `${CHAI_FOREST_BASE_URL}/models/${name}.glb`;
export const CHAI_FOREST_MODELS = Object.freeze({ grass:forestModel("grass"), flowerBlue:forestModel("flower_blue"), flowerWhite:forestModel("flower_white"), flowerYellow:forestModel("flower_yellow"), rock1:forestModel("rock1"), rock2:forestModel("rock2"), rock3:forestModel("rock3") });
export const CHAI_FOREST_BARK_TYPES = Object.freeze(["Bark001","Bark002","Bark003","Bark004","Bark006","Bark007","Bark008","Bark012","Bark013","Bark014","Bark015"]);
export const CHAI_FOREST_LEAF_TYPES = Object.freeze(["ash","aspen","oak","pine"]);
