
/* B”H */

/**
 * @constant DEFAULT_SCENE
 * @description
 * THE DIVINE BLUEPRINT (Tochnit HaBriya).
 * The previous universe was plunged into darkness because the 'scene' event was missing, 
 * leaving the timeOfDay undefined. The Awtsmoos declares, "Let there be light!" 
 * 
 * We now summon a highly realistic, cinematic 45-second sequence showcasing 
 * extreme nested tracks, speech, zoom dynamics, and a fully JSON-driven city.
 */
export const DEFAULT_SCENE = {
  duration: 45000,
  loop: true,
  events: [
    // THE LIGHT (Scene Settings)
    { type: 'scene', start: 0, end: 45000, timeOfDay: { from: 0.1, to: 0.3 } },

    // THE DESCENT (Tzimtzum)
    { type: 'camera', start: 0, end: 5000, from: {x: 0, y: -1500, zoom: 0.1}, to: {x: 0, y: -100, zoom: 0.8} },
    
    // EMANATION OF ENTITIES (Entering from the void)
    { type: 'character', id: 'c1', start: 1000, end: 5000, pos: {from:{x:-1500, y:0}, to:{x:-200, y:0}} },
    { type: 'character', id: 'c2', start: 1500, end: 5500, pos: {from:{x:1500, y:0}, to:{x:200, y:0}}, actions: [{at:0, key:'flipX', value:true}] },
    { type: 'character', id: 'c3', start: 2000, end: 6000, pos: {from:{x:0, y:-1000}, to:{x:0, y:0}} },
    
    // THE SPEECH (Malchut)
    { type: 'speech', id: 'c1', start: 7000, end: 11000, speech: "B\"H! The void has been banished!" },
    { type: 'camera', start: 6500, end: 11500, from: {x:0, y:-100, zoom:0.8}, to: {x:-100, y:-150, zoom:1.3} },
    
    { type: 'speech', id: 'c2', start: 12000, end: 16000, speech: "Look at the extreme modularity of the timeline!" },
    { type: 'camera', start: 11500, end: 16500, from: {x:-100, y:-150, zoom:1.3}, to: {x:100, y:-150, zoom:1.3} },

    { type: 'speech', id: 'c3', start: 17000, end: 20000, speech: "Every shape is pure geometry. Supreme velocity!" },
    { type: 'camera', start: 16500, end: 20500, from: {x:100, y:-150, zoom:1.3}, to: {x:0, y:-100, zoom:1.0} },

    // THE ACTION (Prop Interaction)
    { type: 'prop', id: 'holy_book', propType: 'book', start: 0, end: 21000, x: 0, y: 80 },
    { type: 'character', id: 'c1', start: 21000, end: 23000, pos: {from:{x:-200, y:0}, to:{x:-80, y:0}} },
    { type: 'prop', id: 'holy_book', start: 23000, end: 45000, action: 'attach', target: {charId: 'c1', offsetX: 40, offsetY: 20} },
    
    // THE SIMCHA (Joy & Expansion)
    { type: 'speech', id: 'c1', start: 24000, end: 28000, speech: "We have acquired the sparks!" },
    { type: 'camera', start: 23000, end: 30000, from: {x:0, y:-100, zoom:1.0}, to: {x:0, y:-200, zoom:0.5} },
    
    { type: 'character', id: 'c1', start: 30000, end: 45000, actions:[{at:0, key:'isDancing', value:true}] },
    { type: 'character', id: 'c2', start: 30000, end: 45000, actions:[{at:0, key:'isDancing', value:true}] },
    { type: 'character', id: 'c3', start: 30000, end: 45000, actions:[{at:0, key:'isDancing', value:true}] },
    { type: 'speech', id: 'c3', start: 31000, end: 45000, speech: "Moshiach Now!" }
  ]
};
