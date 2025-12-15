
// B"H
export default /*css*/`
.save-game-container {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    display: flex; justify-content: center; align-items: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: 10000;
    opacity: 0;
    animation: fadeIn 0.3s forwards;
}

.save-game-container.hidden {
    display: none !important;
}

@keyframes fadeIn { to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes neonPulse { 
    0% { box-shadow: 0 0 20px #00d4ff, inset 0 0 10px #00d4ff; border-color: #00d4ff; }
    50% { box-shadow: 0 0 40px #00d4ff, inset 0 0 20px #00d4ff; border-color: #fff; }
    100% { box-shadow: 0 0 20px #00d4ff, inset 0 0 10px #00d4ff; border-color: #00d4ff; }
}

.sg-glass-panel {
    width: 600px;
    background: linear-gradient(145deg, rgba(20, 20, 35, 0.95), rgba(10, 10, 20, 0.98));
    border: 2px solid #00d4ff;
    border-radius: 20px;
    box-shadow: 0 0 50px rgba(0, 212, 255, 0.2);
    overflow: hidden;
    animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-family: 'Fredoka', sans-serif;
    color: white;
}

.sg-header {
    background: linear-gradient(90deg, #0f0c29, #302b63, #24243e);
    padding: 20px;
    border-bottom: 2px solid #e94560;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.sg-title {
    font-family: 'Fredoka One', cursive;
    font-size: 32px;
    color: #e94560;
    text-shadow: 0 0 10px #e94560;
    letter-spacing: 2px;
}

.sg-close-btn {
    background: transparent;
    border: 2px solid #e94560;
    color: #e94560;
    width: 40px; height: 40px;
    border-radius: 50%;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    display: flex; justify-content: center; align-items: center;
}
.sg-close-btn:hover { background: #e94560; color: white; box-shadow: 0 0 15px #e94560; }

.sg-body {
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.sg-status {
    background: rgba(255, 255, 255, 0.05);
    padding: 15px;
    border-radius: 10px;
    text-align: center;
    color: #ffd700;
    border: 1px dashed rgba(255, 215, 0, 0.3);
    font-size: 16px;
    line-height: 1.5;
}

.sg-form {
    display: flex; flex-direction: column; gap: 10px;
}

.sg-label {
    color: #00d4ff;
    font-weight: bold;
    font-size: 14px;
    letter-spacing: 1px;
}

.sg-input {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid #444;
    padding: 15px;
    border-radius: 8px;
    color: white;
    font-size: 18px;
    outline: none;
    transition: all 0.3s;
    font-family: inherit;
}

.sg-input:focus {
    border-color: #00d4ff;
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
}

.sg-input.textarea {
    min-height: 100px;
    resize: vertical;
}

.sg-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 10px;
}

.sg-btn {
    padding: 15px;
    font-family: 'Fredoka One', cursive;
    font-size: 18px;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s;
    text-transform: uppercase;
}

.sg-btn.primary {
    background: #00d4ff;
    color: #000;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
}
.sg-btn.primary:hover:not(.disabled) {
    background: #fff;
    box-shadow: 0 0 40px #00d4ff;
    transform: translateY(-2px);
}

.sg-btn.secondary {
    background: transparent;
    border: 2px solid #ffd700;
    color: #ffd700;
}
.sg-btn.secondary:hover {
    background: rgba(255, 215, 0, 0.1);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
    transform: translateY(-2px);
}

.sg-btn.disabled {
    background: #333;
    color: #666;
    box-shadow: none;
    cursor: not-allowed;
    border: 1px solid #444;
}
`;
