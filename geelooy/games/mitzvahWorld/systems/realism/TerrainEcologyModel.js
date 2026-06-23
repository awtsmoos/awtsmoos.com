// B"H
export function terrainEcology({height=0,slope=0,moisture=.4,rock=.2}={}){
  const fertility=Math.max(0,Math.min(1,moisture*(1-slope*.7)*(1-rock*.5)));
  return {soil:rock>.55?'rocky':moisture>.65?'loam':'dry-soil',fertility,vegetation:fertility>.65?'lush':fertility>.32?'scrub':'sparse',waterRetention:Math.max(0,moisture-slope*.25),animalFood:fertility*.8+(moisture>.5?.1:0),erosionRisk:Math.min(1,slope*(1-fertility))};
}
export default terrainEcology;
