// B"H
export function uvDensityForSize(width=1,depth=1,targetMetersPerTile=4){return{repeatX:Math.max(1,width/targetMetersPerTile),repeatY:Math.max(1,depth/targetMetersPerTile),targetMetersPerTile}}
export function auditUvDensity({width=1,depth=1,repeatX=1,repeatY=1}={}){const mx=width/Math.max(.001,repeatX),my=depth/Math.max(.001,repeatY);return{metersPerTileX:mx,metersPerTileY:my,ok:mx<=6&&my<=6,warning:mx>6||my>6?"texels-too-stretched":"ok"}}
export default {uvDensityForSize,auditUvDensity};
