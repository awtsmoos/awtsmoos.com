// B"H
/**
 * Static URLs for the EZ Tree nature asset pack hosted on Firebase.
 * Full and half-resolution variants live in docs/base/public and are deployed to:
 * https://awtsmoos-docs-base.web.app/awtsmoos-nature/ez-tree/
 */
export const EZ_TREE_BASE_URL = "https://awtsmoos-docs-base.web.app/awtsmoos-nature/ez-tree";
export const EZ_TREE_HALF_BASE_URL = "https://awtsmoos-docs-base.web.app/awtsmoos-nature/ez-tree-half";
export const barkTextureSet = (id = "Bark001", half = false) => {
  const base = `${half ? EZ_TREE_HALF_BASE_URL : EZ_TREE_BASE_URL}/textures/bark/${id}_1K-JPG/${id}_1K-JPG`;
  return { id, color: `${base}_Color.jpg`, ao: `${base}_AmbientOcclusion.jpg`, displacement: `${base}_Displacement.jpg`, normalDx: `${base}_NormalDX.jpg`, normalGl: `${base}_NormalGL.jpg`, roughness: `${base}_Roughness.jpg` };
};
export const leafTexture = (id = "oak", half = false) => `${half ? EZ_TREE_HALF_BASE_URL : EZ_TREE_BASE_URL}/textures/leaves/${id}.png`;
export const groundTextures = (half = false) => {
  const base = half ? EZ_TREE_HALF_BASE_URL : EZ_TREE_BASE_URL;
  return { grass: `${base}/textures/ground/grass.jpg`, dirt: `${base}/textures/ground/dirt_color.jpg`, dirtNormal: `${base}/textures/ground/dirt_normal.jpg` };
};
export const ezModel = name => `${EZ_TREE_BASE_URL}/models/${name}.glb`;
export const EZ_TREE_MODELS = Object.freeze({ grass: ezModel("grass"), flowerBlue: ezModel("flower_blue"), flowerWhite: ezModel("flower_white"), flowerYellow: ezModel("flower_yellow"), rock1: ezModel("rock1"), rock2: ezModel("rock2"), rock3: ezModel("rock3") });
export const EZ_TREE_PRESETS = Object.freeze(["ash_large","ash_medium","ash_small","aspen_large","aspen_medium","aspen_small","bush_1","bush_2","bush_3","oak_large","oak_medium","oak_small","pine_large","pine_medium","pine_small","trellis"]);
export const EZ_TREE_BARK_TYPES = Object.freeze(["Bark001","Bark002","Bark003","Bark004","Bark006","Bark007","Bark008","Bark012","Bark013","Bark014","Bark015"]);
export const EZ_TREE_LEAF_TYPES = Object.freeze(["ash","aspen","oak","pine"]);
