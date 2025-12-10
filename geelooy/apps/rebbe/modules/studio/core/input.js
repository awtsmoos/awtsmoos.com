//B"H
// modules/studio/core/input.js
import * as Actions from '../actions.js';
import state from '../../state.js';

export function handleStudioKeys(e) {
    if (document.getElementById('modal-studio').classList.contains('hidden')) return;
    
    // Ignore if typing in an input
    if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Undo/Redo
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        Actions.undo();
        return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        Actions.redo();
        return;
    }

    if (e.code === 'Space') {
        e.preventDefault();
        Actions.togglePlay();
    } else if (e.code === 'Delete' || e.code === 'Backspace') {
        Actions.deleteSelected();
    } else if (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'c') {
        // Razor / Split
        Actions.splitClip();
    } else if (e.code === 'ArrowLeft') {
        Actions.seek(state.currentTime - 0.1);
    } else if (e.code === 'ArrowRight') {
        Actions.seek(state.currentTime + 0.1);
    }
}