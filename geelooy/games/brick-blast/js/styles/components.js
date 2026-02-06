// B"H

/**
 * This scroll contains the laws of form for the individual components of the world.
 * It is a JS module that default exports a string of CSS.
 */
const componentStyles = `
/* B"H - COMPONENT STYLES */
.btn {
  font-family: 'Inter', sans-serif;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border-radius: 9999px;
  text-align: center;
}
.btn:hover:not(:disabled) {
  transform: scale(1.05);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-primary {
  background-color: var(--primary-accent);
  color: var(--text-dark);
  font-weight: 700;
  font-size: 1.5rem;
  padding: 1rem 4rem;
  box-shadow: 0 4px 15px rgba(34, 211, 238, 0.4);
}
.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-accent-hover);
}
.btn-secondary {
  background-color: rgba(255, 255, 255, 0.15); /* More vibrant than solid gray */
  color: white;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
}
.btn-secondary:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.25);
}
.btn-tertiary {
  background-color: transparent;
  border: 2px solid var(--primary-accent);
  color: var(--primary-accent);
  font-weight: 700;
  font-size: 1.5rem;
  padding: 1rem 4rem;
}
.btn-tertiary:hover:not(:disabled) {
  background-color: rgba(34, 211, 238, 0.1);
}
.btn-danger {
    background-color: transparent;
    border: 2px solid var(--danger);
    color: var(--danger);
}
.btn-danger:hover:not(:disabled) {
    background-color: rgba(248, 113, 113, 0.1);
}
.btn-back {
  position: absolute;
  left: 0;
  background: none;
  border: none;
  color: var(--text-light);
  font-size: 2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 9999px;
}
.btn-back:hover { background-color: rgba(255, 255, 255, 0.1); }
.header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}
.title-container {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
}
.logo {
    width: 80px;
    height: 80px;
    background: linear-gradient(45deg, #a855f7, #6366f1);
    border-radius: 1.25rem;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    padding: 4px;
    gap: 4px;
    margin-right: 1rem;
}
.logo-brick { border-radius: 4px; }
.logo-brick.c1 { background-color: #facc15; }
.logo-brick.c2 { background-color: #22d3ee; }
.logo-brick.c3 { background-color: #f87171; }
.logo-brick.c4 { background-color: #4ade80; }
.level-button {
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(34, 211, 238, 0.8);
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  color: var(--text-light);
  padding: 4px;
  box-sizing: border-box;
}
.level-button:hover { background-color: var(--primary-accent); transform: scale(1.05); }
.level-button-stars, .level-button-stars-placeholder {
  height: 14px;
  font-size: 12px;
  color: var(--peruta-gold);
  text-shadow: 0 0 4px var(--peruta-gold);
}
.level-button .level-id { font-size: 2.5rem; font-weight: 900; line-height: 1; }
.level-button .level-name { font-size: 0.7rem; font-weight: 400; margin-top: 2px; }
.store-item {
  background-color: rgba(0,0,0,0.2);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.store-item-icon { font-size: 2rem; }
.store-item-details { flex-grow: 1; }
.store-item-name { font-weight: 700; font-size: 1.1rem; }
.store-item-desc { font-size: 0.8rem; color: var(--text-vibrant); } /* Removed muted gray */
.store-item-owned { font-size: 0.8rem; font-weight: 700; color: var(--primary-accent); }
.store-item-action { display: flex; gap: 0.5rem; align-items: center; }
.store-item-action .btn { padding: 0.5rem 1rem; font-size: 1rem; }
.store-item-cost { text-align: right; }
.inventory-item {
  background-color: var(--bg-dark-_1);
  padding: 1rem 2rem;
  border-radius: 8px;
  border: 2px solid var(--primary-accent);
  cursor: pointer;
  text-align: center;
  min-width: 200px;
  transition: transform 0.2s;
}
.inventory-item:hover { transform: scale(1.05); }
.inventory-item-name { font-size: 1.2rem; font-weight: 700; }
.inventory-item-count { font-size: 0.9rem; color: var(--text-vibrant); } /* Removed muted gray */
.footer-text {
  position: absolute;
  bottom: 1rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.875rem;
}
`;

export default componentStyles;