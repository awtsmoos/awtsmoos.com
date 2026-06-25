// B"H
/** WeatherRuntime: rainwater, wind, candles, acoustics. */
export function rainwaterState(rain=0, terrain='village'){ return { terrain, puddles:Math.round(rain*8), streams:rain>0.7?1:0, at:Date.now() }; }
export function windState(speed=0.2, direction='east'){ return { speed, direction, affects:['trees','clothing','smoke','sound'].filter((_,i)=>speed>(i*.2)) }; }
export function candleLighting(candles=[]){ return { count:candles.length, warmth:Math.min(1,candles.length/12), shadows:candles.length>0 }; }
export function interiorAcoustics(room={material:'wood',size:1}){ return { reverb:room.material==='stone'?0.7:0.35, muffling:room.size>2?0.15:0.35 }; }
export default { rainwaterState, windState, candleLighting, interiorAcoustics };
