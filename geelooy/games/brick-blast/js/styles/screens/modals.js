// B"H

const modalStyles = `
/* B"H - MODAL STYLES */

.modal-backdrop {
    position: absolute;
    inset: 0;
    background-color: rgba(0,0,0,0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000; /* Increased to be above persistent text if needed, or slightly below */
}
.modal-content {
    background-color: var(--bg-dark-_2);
    border: 2px solid var(--primary-accent);
    border-radius: 12px;
    padding: 2.5rem 2rem;
    width: 90%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem; 
    box-shadow: 0 0 40px rgba(34, 211, 238, 0.2);
}
.modal-content h3 { margin: 0; text-align: center; font-weight: 900; font-size: 1.75rem; }
.modal-content p {
    text-align: center;
    color: white; /* Removed gray */
    font-size: 1rem;
    margin: -0.5rem 0 0 0;
    font-weight: 500;
}
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.9rem; color: var(--text-vibrant); font-weight: 700; }
.form-group input, .form-group textarea, .form-group select {
    background-color: rgba(0,0,0,0.3);
    border: 1px solid var(--primary-accent);
    color: var(--text-light);
    border-radius: 8px;
    padding: 0.85rem; 
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
}
#ai-generate-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
.api-key-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(34, 211, 238, 0.1);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    color: var(--text-vibrant);
}
.helper-link, .btn-link {
    font-size: 0.85rem;
    color: var(--peruta-gold);
    font-weight: 700;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
}
.helper-link { align-self: flex-end; margin-top: 4px; }
.btn-link:hover, .helper-link:hover { text-decoration: underline; color: white; }
.ai-status { color: var(--warning); min-height: 1.2em; text-align: center; font-size: 0.9rem; font-weight: 700; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
.btn-icon {
    font-size: 1.5rem;
    background: rgba(255,255,255,0.1);
    border: none;
    color: var(--text-light);
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
}
.btn-icon:hover { background-color: var(--primary-accent); color: var(--text-dark); }
.select-wrapper { position: relative; display: flex; align-items: center; }
.select-wrapper select { width: 100%; -webkit-appearance: none; -moz-appearance: none; appearance: none; }
.select-wrapper::after { 
    content: '▼';
    position: absolute;
    right: 1rem;
    pointer-events: none;
    color: var(--primary-accent);
}
.loader {
    border: 3px solid rgba(255,255,255,0.1);
    border-top: 3px solid var(--primary-accent);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
    position: absolute;
    right: 2.5rem;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* --- Forfeit Modal --- */
.forfeit-content {
    border-color: var(--warning);
    box-shadow: 0 0 50px rgba(250, 204, 21, 0.3);
}
.forfeit-penalty-display {
    font-size: 3rem;
    font-weight: 900;
    color: var(--danger);
    text-align: center;
    margin: 1rem 0;
    text-shadow: 0 0 10px rgba(248, 113, 113, 0.3);
}

/* --- Debt Collector Styles --- */
.debt-content {
    border-color: var(--danger);
    box-shadow: 0 0 30px rgba(248, 113, 113, 0.4);
}
.debt-assets-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 250px;
    overflow-y: auto;
    background: rgba(0,0,0,0.4);
    padding: 0.75rem;
    border-radius: 8px;
}
.debt-asset-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255,255,255,0.05);
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
}
.debt-asset-info { font-size: 0.95rem; color: white; }
.debt-asset-name { font-weight: 900; }
.debt-asset-val { font-size: 0.85rem; color: var(--peruta-gold); }

/* Custom Slider Styles */
input[type=range]::-webkit-slider-runnable-track {
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.1);
}
`;

export default modalStyles;