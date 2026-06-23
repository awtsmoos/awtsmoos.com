// B"H
/**
 * @file PingPongTexturePolicy.js
 * Small textures can carry vast worlds when the Awtsmoos teaches them to return
 * and return: mirrored repeat, mipmaps, anisotropy, and no pixelated nearest law.
 */
export const TEXTURE_DETAIL_CLASSES = Object.freeze({
  terrain:'terrain', wall:'wall', roof:'roof', wood:'wood', stone:'stone', fur:'fur', foliage:'foliage', cloth:'cloth', ui:'ui', default:'default'
});
const REPEAT_BY_CLASS = Object.freeze({
  terrain:[18, 18], wall:[5, 5], roof:[6, 3], wood:[4, 2], stone:[7, 7], fur:[3, 3], foliage:[8, 8], cloth:[3, 3], ui:[1, 1], default:[4, 4]
});
function detectClass(material = {}, slot = '') {
  const text = `${material.name || ''} ${material.userData?.kind || ''} ${slot}`.toLowerCase();
  if (/terrain|ground|soil|sand|grass/.test(text)) return TEXTURE_DETAIL_CLASSES.terrain;
  if (/roof|tile/.test(text)) return TEXTURE_DETAIL_CLASSES.roof;
  if (/wood|beam|door|shutter/.test(text)) return TEXTURE_DETAIL_CLASSES.wood;
  if (/stone|rock|foundation/.test(text)) return TEXTURE_DETAIL_CLASSES.stone;
  if (/fur|animal|hide/.test(text)) return TEXTURE_DETAIL_CLASSES.fur;
  if (/leaf|foliage|tree|branch/.test(text)) return TEXTURE_DETAIL_CLASSES.foliage;
  if (/cloth|robe|garment/.test(text)) return TEXTURE_DETAIL_CLASSES.cloth;
  if (/ui|scroll|paper|parchment/.test(text)) return TEXTURE_DETAIL_CLASSES.ui;
  if (/wall|plaster|house/.test(text)) return TEXTURE_DETAIL_CLASSES.wall;
  return TEXTURE_DETAIL_CLASSES.default;
}
export function pingPongTexturePolicy(material = {}, slot = 'map', budget = globalThis.__MITZVAH_WORLD_PERFORMANCE_BUDGET__) {
  const detailClass = detectClass(material, slot);
  const repeat = REPEAT_BY_CLASS[detailClass] || REPEAT_BY_CLASS.default;
  const tier = budget?.tier || 'high';
  return {
    detailClass,
    repeat,
    wrapping: 'MirroredRepeatWrapping',
    fallbackWrapping: 'RepeatWrapping',
    generateMipmaps: true,
    minFilter: 'LinearMipmapLinearFilter',
    magFilter: 'LinearFilter',
    anisotropy: tier === 'survival' ? 2 : tier === 'balanced' ? 4 : tier === 'high' ? 8 : 12,
    colorSpace: slot === 'map' || slot === 'emissiveMap' ? 'SRGBColorSpace' : 'NoColorSpace',
    maxSourceSize: detailClass === 'terrain' ? 512 : detailClass === 'ui' ? 1024 : 384,
    law: 'small-detailed-pingpong-repeat-no-pixelated-nearest-filter'
  };
}
export default pingPongTexturePolicy;
