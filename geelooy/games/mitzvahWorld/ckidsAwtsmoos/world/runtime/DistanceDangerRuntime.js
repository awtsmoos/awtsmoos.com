// B"H
/** @file DistanceDangerRuntime.js @description The farther the shliach walks, the sharper the risk and the higher the level. */
export function distanceFromCenter(pos={}){ return Math.hypot(pos.x||0,pos.z||pos.y||0); }
export function dangerForDistance(distance=0){ const band=Math.floor(distance/120), level=1+band*2, risk=+(Math.min(.95,.08+band*.09)).toFixed(2); return {distance:+distance.toFixed(2),band,level,risk,rewardMultiplier:+(1+band*.18).toFixed(2),label:band<2?"near-village":band<5?"wild-fields":"far-corruption"}; }
export function dangerForPosition(pos={}){ return dangerForDistance(distanceFromCenter(pos)); }
export default { distanceFromCenter, dangerForDistance, dangerForPosition };
