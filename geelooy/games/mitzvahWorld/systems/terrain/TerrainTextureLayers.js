// B"H
export function terrainLayerAt({height=0,slope=0,moisture=.5,path=.0}={}){if(path>.35)return"path-dirt";if(slope>.62)return height>20?"dry-stone":"stone-grass";if(moisture>.7)return"rich-grass";if(height>35)return"highland-scrub";return"meadow-grass"}
export function terrainLayerStack(params={}){const base=terrainLayerAt(params);return{base,macro:["altitude-color","sun-baked-patches"],medium:[base,"soil-noise","grazing-wear"],micro:["pebble-normal","blade-normal","roughness-grain"],blend:"height-slope-noise"}}
export default {terrainLayerAt,terrainLayerStack};
