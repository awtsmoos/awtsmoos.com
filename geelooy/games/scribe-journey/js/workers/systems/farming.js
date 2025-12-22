
// B"H
// js/workers/systems/farming.js

export function update(state) {
    // Only check every hour game-time roughly, or just check on tick
    const map = state.maps[state.currentMapId];
    if(!map) return;
    
    // Scan interactables for soil
    for(const key in map.interactables) {
        const entity = map.interactables[key];
        if(entity.type === 'farm_soil' && entity.state === 'planted') {
            let growthRate = 5;
            // Rain boosts growth (Gevurot Geshamim)
            if(state.weather === 'rain') growthRate = 20;
            
            entity.growth = (entity.growth || 0) + growthRate;
            
            if(entity.growth >= 100) {
                entity.state = 'ready';
                entity.emoji = '🌾';
            } else if (entity.growth >= 50) {
                entity.emoji = '🌱';
            }
        }
    }
}
