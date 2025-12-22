
// B"H
// js/workers/systems/time.js

const GAME_MINUTES_PER_REAL_SEC = 5; 
const DAY_LENGTH = 1440; 
const MOON_CYCLE = 30;

export function initTime() {
    return { totalMinutes: 720, accumulated: 0, day: 1 };
}

export function update(state, deltaTime, callbacks) {
    state.time.accumulated += deltaTime;
    if(state.time.accumulated >= 1000) {
        state.time.totalMinutes += GAME_MINUTES_PER_REAL_SEC;
        state.time.accumulated -= 1000;
        
        // Day Rollover
        if(state.time.totalMinutes >= DAY_LENGTH) {
            state.time.totalMinutes = 0;
            state.time.day++;
            
            // Shabbat Check
            if (state.time.day % 7 === 0) {
                state.stats.shabbatsObserved = (state.stats.shabbatsObserved || 0) + 1;
            }
            
            // Rosh Chodesh Check
            const dayInMonth = state.time.day % MOON_CYCLE;
            if(dayInMonth === 0) {
                state.stats.roshChodeshWitnessed = (state.stats.roshChodeshWitnessed || 0) + 1;
            }

            // RESET DAILY FLAGS
            if(state.player.flags) {
                state.player.flags['studied_today'] = false;
            }
            
            if(callbacks.onNewDay) callbacks.onNewDay();
        }

        const dayInMonth = state.time.day % MOON_CYCLE;
        const isShabbat = (state.time.day % 7 === 6); // Day 7 (0-indexed 6 if start day 1 is Sunday? Assuming Day 1 = Sunday)
        
        state.isShabbat = isShabbat;
        
        if(callbacks.onTick) {
            callbacks.onTick({
                timeOfDay: state.time.totalMinutes,
                day: state.time.day,
                moonPhase: calculateMoonPhase(dayInMonth),
                isShabbat
            });
        }
    }
}

function calculateMoonPhase(day) {
    const phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
    const illum = 1 - Math.abs((day - 15) / 15); 
    const iconIndex = Math.floor((day / 30) * 8);
    return { icon: phases[iconIndex] || '🌑', illumination: illum };
}
