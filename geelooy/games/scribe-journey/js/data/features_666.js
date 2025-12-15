
// B"H
// js/data/features_666.js

export const featureList = [];

const adjectives = ["Divine", "Broken", "Infinite", "Lazy", "Hyper", "Golden", "Dark", "Neon", "Pixelated", "Holy", "Cursed", "Glitched"];
const nouns = ["Physics", "Light", "Speed", "Luck", "Drop Rate", "Color", "Time", "Sound", "Gravity", "Text", "Texture", "Polygon"];

// Generate 666 Features
for (let i = 1; i <= 666; i++) {
    const adj = adjectives[i % adjectives.length];
    const noun = nouns[(i * 3) % nouns.length];
    
    let type = 'flavor';
    let effect = null;

    if (i % 10 === 0) { type = 'stat'; effect = { stat: 'max_hp', amount: 1 }; }
    if (i % 33 === 0) { type = 'visual'; effect = { filter: `hue-rotate(${i}deg)` }; }
    if (i % 66 === 0) { type = 'mechanic'; effect = { speedMult: 1.01 }; }
    if (i === 666) { type = 'chaos'; effect = { chaosMode: true }; }

    featureList.push({
        id: `feature_${i}`,
        name: `Feature #${i}: ${adj} ${noun}`,
        desc: `This feature enhances the ${noun.toLowerCase()} by factor ${i}.`,
        type: type,
        effect: effect,
        active: true
    });
}

export function apply666Features(state) {
    if (!state.active666) state.active666 = 0;
    
    // We don't want to loop 666 times every frame. 
    // Instead, we aggregate the effects into a summary object attached to state.
    
    const summary = {
        hpBonus: 0,
        speedMult: 1,
        filters: [],
        chaos: false
    };

    featureList.forEach(f => {
        if (!f.active) return;
        if (f.type === 'stat') summary.hpBonus += f.effect.amount;
        if (f.type === 'mechanic') summary.speedMult *= f.effect.speedMult;
        if (f.type === 'visual') summary.filters.push(f.effect.filter);
        if (f.type === 'chaos') summary.chaos = true;
    });

    state.features666 = summary;
}
