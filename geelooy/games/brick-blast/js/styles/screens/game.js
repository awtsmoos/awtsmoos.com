// B"H

const gameScreenStyles = `
/* B"H - GAME SCREEN STYLES */

#game-screen { 
    padding: 0;
    justify-content: flex-start;
}
#game-header { 
    width: 100%; 
    display: grid;
    /* Absolute centering of middle column by making side columns equal fractional units */
    grid-template-columns: 1fr auto 1fr; 
    align-items: center; 
    padding: 1.25rem 1rem 0.5rem 1rem; /* More top padding for persistent B"H */
    background-color: rgba(0,0,0,0.3); 
    box-sizing: border-box; 
    flex-shrink: 0;
}
#game-back-button { 
    font-size: 1.75rem; 
    line-height: 1; 
    position: static; 
    padding: 0.75rem; 
    background: none;
    border: none;
    color: var(--text-light);
    cursor: pointer;
    justify-self: start; 
    border-radius: 50%;
    transition: background-color 0.2s, transform 0.2s;
}
#game-back-button:hover { 
    background-color: rgba(255, 255, 255, 0.1); 
    transform: scale(1.1);
}

.stats { 
    text-align: center; 
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0 1rem;
    min-width: 180px;
}
.main-stats {
    display: flex;
    gap: 1rem;
    align-items: baseline;
}
.stat { font-weight: 700; font-size: 1.1rem; white-space: nowrap; color: white; }
.sub-stats-container {
    display: flex;
    gap: 1.25rem;
    align-items: center;
}
.sub-stat { 
    font-size: 0.9rem; 
    color: var(--text-vibrant); /* Removed muted gray */
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}
.game-header-right { 
    display: flex; 
    align-items: center; 
    gap: 0.75rem; 
    justify-self: end; 
}
.game-header-right .peruta-display { font-size: 1rem; }
#inventory-button { 
    font-size: 1.75rem; 
    background: none; 
    border: none; 
    color: var(--text-light); 
    cursor: pointer; 
    padding: 4px; 
    transition: opacity 0.2s, transform 0.2s;
}
#inventory-button:hover { transform: scale(1.1); filter: brightness(1.2); }

#peruta-doubler-icon {
    display: none;
    font-weight: 900;
    font-size: 1rem;
    color: var(--peruta-gold);
    text-shadow: 0 0 5px var(--peruta-gold);
}

#game-timer {
    font-family: monospace;
    font-size: 1.2rem;
    color: var(--warning);
}

#canvas-wrapper { 
    width: 100%; 
    flex-grow: 1; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    overflow: hidden; 
    min-height: 0;
}
#game-canvas { 
    display: block; 
    background-color: var(--bg-dark-_1); 
}
#inventory-panel { 
    position: absolute; 
    inset: 0; 
    background-color: rgba(0,0,0,0.85); 
    backdrop-filter: blur(10px); 
    display: none; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    gap: 1.5rem; 
    z-index: 1100; 
}
#inventory-panel.active { display: flex; }
`;

export default gameScreenStyles;