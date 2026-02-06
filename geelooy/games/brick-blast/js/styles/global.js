// B"H

/**
 * This scroll contains the foundational laws of the world's form.
 * It is a JS module that default exports a string of CSS.
 */
const globalStyles = `
/* B"H - GLOBAL STYLES */
:root {
  --bg-dark-_1: #1e2a4a;
  --bg-dark-_2: #3a4a72;
  --primary-accent: #22d3ee;
  --primary-accent-hover: #67e8f9;
  --text-light: #f0f9ff;
  --text-dark: #082f49;
  --text-vibrant: #67e8f9; /* Replaced gray text-muted with vibrant cyan */
  --danger: #f87171;
  --warning: #facc15;
  --peruta-gold: #fbbf24;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #0c1322;
  color: var(--text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  touch-action: none;
  overflow: hidden;
}

#app-container {
  width: 100%;
  height: 100%;
  max-width: 420px;
  max-height: 90vh;
  min-height: 600px;
  background-color: var(--bg-dark-_2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* --- Persistent Holy Text --- */
.persistent-holy-text {
    position: absolute;
    top: 8px;
    font-weight: 900;
    font-size: 0.85rem;
    color: rgba(240, 249, 255, 0.4); /* Subtle but vibrant white */
    z-index: 1000; /* Above all screens and UI */
    pointer-events: none; /* Never interfere with buttons */
    text-shadow: 0 0 5px rgba(34, 211, 238, 0.3);
}
.persistent-holy-text.left { left: 12px; }
.persistent-holy-text.right { right: 12px; }

/* --- The restored Law of Manifestation --- */
.screen {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  padding: 2.5rem 2rem 2rem 2rem; /* Added top padding to account for persistent text */
  box-sizing: border-box;
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--bg-dark-_2), var(--bg-dark-_1));
}

.screen.active {
  display: flex;
}
/* --- End of restored Law --- */


.peruta-display {
  color: var(--peruta-gold);
  font-weight: 700;
  text-shadow: 0 0 5px rgba(251, 191, 36, 0.5);
}

h1 {
  font-size: 3rem;
  font-weight: 900;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

h2 { font-size: 2.25rem; font-weight: 700; }
`;

export default globalStyles;