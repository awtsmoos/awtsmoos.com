// B"H

/**
 * Chapter 2: The Header Learns to Breathe.
 *
 * The Awtsmoos renews every pixel from nothing, and the game header must not
 * crush its own letters while the narrow phone-vessel trembles beneath browser
 * chrome. This scroll makes the upper altar fluid: stats may wrap, side icons
 * shrink, and the timer receives its own guarded space instead of colliding
 * with coins and the backpack.
 *
 * @module gameScreenStyles
 * @returns {string} CSS for the Brick Blast gameplay screen.
 */
const gameScreenStyles = `
/* B"H - GAME SCREEN STYLES */

#game-screen {
    padding: 0;
    justify-content: flex-start;
}

#game-header {
    width: 100%;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: clamp(0.25rem, 1.8vw, 0.75rem);
    padding: max(1.35rem, calc(var(--awtsmoos-safe-top) + 1rem)) clamp(0.35rem, 2vw, 0.75rem) 0.45rem;
    background-color: rgba(0,0,0,0.3);
    box-sizing: border-box;
    flex-shrink: 0;
    min-width: 0;
}

#game-back-button {
    font-size: clamp(1.35rem, 6vw, 1.75rem);
    line-height: 1;
    position: static;
    padding: clamp(0.25rem, 2vw, 0.55rem);
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
    gap: 0.22rem;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
}

.main-stats,
.sub-stats-container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    min-width: 0;
}

.main-stats {
    gap: clamp(0.35rem, 2.2vw, 0.75rem);
}

.sub-stats-container {
    gap: clamp(0.55rem, 4vw, 1.2rem);
}

.stat {
    font-weight: 700;
    font-size: clamp(0.86rem, 4.35vw, 1.08rem);
    line-height: 1.05;
    white-space: nowrap;
    color: white;
}

.sub-stat {
    font-size: clamp(0.78rem, 3.75vw, 0.9rem);
    line-height: 1;
    color: var(--text-vibrant);
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 0.2rem;
    white-space: nowrap;
}

.game-header-right {
    display: grid;
    grid-template-columns: auto auto;
    align-items: center;
    justify-items: end;
    gap: 0.18rem 0.35rem;
    justify-self: end;
    min-width: 0;
}

.game-header-right .peruta-display {
    font-size: clamp(0.72rem, 3vw, 0.95rem);
    line-height: 1;
    white-space: nowrap;
}

#inventory-button {
    grid-row: 1 / span 2;
    grid-column: 2;
    font-size: clamp(1.35rem, 6vw, 1.75rem);
    background: none;
    border: none;
    color: var(--text-light);
    cursor: pointer;
    padding: 2px;
    transition: opacity 0.2s, transform 0.2s;
}

#inventory-button:hover { transform: scale(1.1); filter: brightness(1.2); }

#peruta-doubler-icon {
    display: none;
    font-weight: 900;
    font-size: clamp(0.8rem, 3.4vw, 1rem);
    line-height: 1;
    color: var(--peruta-gold);
    text-shadow: 0 0 5px var(--peruta-gold);
}

#game-timer {
    display: inline-block;
    min-width: 4.15ch;
    font-family: monospace;
    font-size: clamp(1rem, 5.2vw, 1.2rem);
    line-height: 1;
    color: var(--warning);
    font-variant-numeric: tabular-nums;
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

@media (max-width: 380px) {
    #game-header {
        grid-template-columns: auto minmax(0, 1fr) auto;
        gap: 0.2rem;
        padding-left: 0.25rem;
        padding-right: 0.25rem;
    }

    .main-stats {
        gap: 0.32rem;
    }

    .stat {
        font-size: 0.82rem;
    }

    #game-timer {
        min-width: 3.9ch;
        font-size: 0.98rem;
    }

    .game-header-right .peruta-display {
        display: none;
    }
}
`;

export default gameScreenStyles;
