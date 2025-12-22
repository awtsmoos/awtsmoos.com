
// B"H
// js/workers/systems/weather.js

const WEATHER_CHANGE_CHANCE = 0.001; 

export function update(state, sendToast) {
    if(Math.random() < WEATHER_CHANGE_CHANCE) {
        if(state.weather === 'clear') {
            state.weather = 'rain';
            if(sendToast) sendToast("The heavens open! Rain falls (Mashiv HaRuach).", "info");
        } else {
            state.weather = 'clear';
            if(sendToast) sendToast("The clouds part. The sun shines.", "info");
        }
    }
}
