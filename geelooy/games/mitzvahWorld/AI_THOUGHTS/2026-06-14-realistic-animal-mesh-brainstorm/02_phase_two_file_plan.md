B'H
# Phase Two File Plan
Likely files to create/touch:
- ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/wildlife/render/AnimalBodyForge.js: merged body geometry, species dimensions, material creation.
- ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/wildlife/render/AnimalSpeciesProfiles.js: fox/rabbit/deer/goat/bird proportions/colors/marking rules.
- ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/wildlife/render/AnimalAnimator.js: gait, idle, head turn, tail flick.
- ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/wildlife/render/FurTextureFactory.js or use TextureForge/Fur.js.
- ckidsAwtsmoos/utils/TextureForge/Generators/Fur.js: real fur canvas textures.
- ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/render/RegionWildlifeRenderer.js: delegate to builders, keep ticker/selection userData.
- ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/render/RegionMaterials.js: add fur map support if async not possible use CanvasTexture in builder.
- maybe geelooy/libs helper import if found.

Need inspect libs before final.
