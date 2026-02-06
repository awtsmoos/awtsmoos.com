// B"H

/**
 * This scroll contains the sacred laws of form for the glorious Level Complete screen.
 * It is a JS module that default exports a string of CSS.
 */
const levelCompleteStyles = `
/* B"H - LEVEL COMPLETE SCREEN STYLES */

@keyframes star-enter {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; filter: brightness(2); }
  70% { transform: scale(1.4) rotate(15deg); opacity: 1; }
  100% { transform: scale(1.2) rotate(0deg); opacity: 1; filter: brightness(1); }
}

@keyframes star-pulse {
  0% { transform: scale(1.2); }
  50% { transform: scale(1.3); filter: brightness(1.2); }
  100% { transform: scale(1.2); }
}

@keyframes sparkle-rise {
  0% { transform: translateY(0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
}

#level-complete-screen {
  background: radial-gradient(circle, var(--bg-dark-_2), var(--bg-dark-_1) 90%);
  overflow: hidden;
}

#level-complete-screen .result-screen-content {
  z-index: 1; /* Ensure content is above sparkles */
}

#level-complete-screen .level-complete-title {
  color: #fff;
  font-size: 3.5rem;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(34, 211, 238, 0.6);
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 2rem 0;
  height: 60px; 
  align-items: center;
}

.star-rating .star {
  font-size: 3rem;
  color: transparent;
  -webkit-text-stroke: 2px rgba(255, 255, 255, 0.1);
  opacity: 0.3;
  transition: all 0.3s ease;
  transform: scale(1);
}

.star-rating .star.filled {
  color: var(--peruta-gold);
  -webkit-text-stroke: 0;
  text-shadow: 0 0 10px var(--peruta-gold), 0 0 30px rgba(251, 191, 36, 0.5);
  opacity: 1;
  transform-origin: center center;
  animation: 
    star-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
    star-pulse 2s ease-in-out infinite 0.5s; /* Pulse starts after entry */
}

.turn-report {
    font-size: 1.25rem;
    color: white; /* Removed muted gray */
    font-weight: 900;
    margin: -1rem 0 1rem 0;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.interest-bonus {
    font-size: 1.1rem;
    color: var(--primary-accent);
    font-weight: 700;
}

.sparkle-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  bottom: -10px;
  width: 3px;
  height: 3px;
  background-color: var(--peruta-gold);
  border-radius: 50%;
  box-shadow: 0 0 5px var(--peruta-gold), 0 0 10px var(--peruta-gold);
  animation: sparkle-rise linear infinite;
  opacity: 0;
}
`;

export default levelCompleteStyles;