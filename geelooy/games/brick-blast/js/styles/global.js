// B"H

/**
 * Chapter 1: The Scroll of the Breathing Viewport.
 *
 * The Awtsmoos speaks the visible world into being at every instant, and the
 * mobile browser answers with a height that changes as its bars rise, fall,
 * hide, and return. This scroll does not fight that living vessel. It listens.
 *
 * The old decree used `100vh`, `max-height: 90vh`, and a hard `min-height`.
 * On narrow phones those measurements could leave a ceremonial gap above the
 * game and cut the paddle from below. This renewed decree makes the app fill
 * the currently visible viewport while preserving the existing screen/canvas
 * contract used by the game engine.
 *
 * @module globalStyles
 * @returns {string} CSS laws injected by the Brick Blast style scribe.
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
  --text-vibrant: #67e8f9;
  --danger: #f87171;
  --warning: #facc15;
  --peruta-gold: #fbbf24;
  --awtsmoos-viewport-height: 100vh;
  --awtsmoos-safe-top: env(safe-area-inset-top, 0px);
  --awtsmoos-safe-bottom: env(safe-area-inset-bottom, 0px);
}

html {
  margin: 0;
  padding: 0;
  width: 100%;
  min-width: 100%;
  height: 100%;
  min-height: 100%;
  background-color: #0c1322;
  overflow: hidden;
  overscroll-behavior: none;
}

body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-width: 100%;
  height: 100vh;
  height: 100svh;
  height: 100dvh;
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #0c1322;
  color: var(--text-light);
  display: flex;
  align-items: stretch;
  justify-content: center;
  touch-action: none;
  overflow: hidden;
  overscroll-behavior: none;
}

#app-container {
  width: 100%;
  height: 100vh;
  height: 100svh;
  height: 100dvh;
  max-width: 420px;
  max-height: none;
  min-height: 0;
  background-color: var(--bg-dark-_2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border-radius: 0;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  contain: layout size style;
}

@media (min-width: 700px) and (min-height: 700px) {
  body {
    align-items: center;
    padding: 0;
  }

  #app-container {
    height: min(100dvh, 900px);
    border-radius: 12px;
  }
}

/* --- Persistent Holy Text --- */
.persistent-holy-text {
    position: absolute;
    top: max(8px, var(--awtsmoos-safe-top));
    font-weight: 900;
    font-size: 0.85rem;
    color: rgba(240, 249, 255, 0.4);
    z-index: 1000;
    pointer-events: none;
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
  min-height: 0;
  padding: max(2.5rem, calc(var(--awtsmoos-safe-top) + 1rem)) 2rem max(2rem, calc(var(--awtsmoos-safe-bottom) + 1rem)) 2rem;
  box-sizing: border-box;
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--bg-dark-_2), var(--bg-dark-_1));
  overflow: hidden;
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
