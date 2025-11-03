//B"H

import { flap as flapDove } from './dove.js';

let flapCallback = null;

export function init(onFlap) {
    flapCallback = onFlap;
    document.addEventListener('keydown', handleKey);
    document.getElementById('gameCanvas').addEventListener('click', handleInput);
    document.getElementById('gameCanvas').addEventListener('touchstart', handleInput);
}

function handleKey(e) {
    if (e.code === 'Space') {
        if (flapCallback) flapCallback();
    }
}

function handleInput(e) {
    e.preventDefault();
    if (flapCallback) flapCallback();
}