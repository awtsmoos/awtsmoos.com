/* B"H
Visualizer defaults: routing, preset, colors, letters, and custom code begin here.
*/
export function defaultVisualizerSettings(customJs = '') {
  return { preset:'hebrewOrbit', inputMode:'all', sourceId:'', sensitivity:1.35, bars:48, glow:true,
    bgA:'#070b16', bgB:'#102a3f', wave:'#83ffe7', barsColor:'#7c5cff', letters:'#ffd166', particles:'#83ffe7',
    hebrewText:'אבגדהוזחטיכלמנסעפצקרשת', customJs:String(customJs || '') };
}
export function mergeVisualizerSettings(base = {}, patch = {}) { return { ...defaultVisualizerSettings(), ...base, ...patch }; }
