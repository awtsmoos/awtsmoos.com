
// B"H
export default /*css*/`
.level-select-container {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    display: flex; justify-content: center; align-items: center;
    background: rgba(0, 0, 0, 0.9); /* B"H: Darker for focus */
    backdrop-filter: blur(15px);
    z-index: 15000; /* Higher than HUD */
    opacity: 0;
    animation: fadeIn 0.4s forwards;
    font-family: 'Fredoka', sans-serif;
    padding-top: 50px; /* Leave space for potential system notifications */
    box-sizing: border-box;
}

.level-select-container.hidden { display: none !important; }

.ls-glass-panel {
    width: 900px;
    max-height: 85vh; /* Prevents overflow */
    overflow-y: auto;
    background: linear-gradient(135deg, rgba(20, 10, 40, 0.95), rgba(10, 5, 20, 0.98));
    border: 3px solid #00ffed;
    border-radius: 30px;
    box-shadow: 0 0 80px rgba(0, 255, 237, 0.3), inset 0 0 30px rgba(0, 255, 237, 0.2);
    animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    color: white;
    scrollbar-width: thin;
    scrollbar-color: #00ffed transparent;
}

.ls-header {
    background: linear-gradient(90deg, #1f005c, #5b0060, #870160);
    padding: 25px;
    border-bottom: 3px solid #00ffed;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky; top: 0; z-index: 10;
}

.ls-title {
    font-family: 'Fredoka One', cursive;
    font-size: 32px;
    color: #00ffed;
    text-shadow: 0 0 15px #00ffed;
    letter-spacing: 2px;
    margin: 0;
}

.ls-body {
    padding: 30px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
}

.ls-card {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.ls-card:hover {
    transform: translateY(-5px);
    background: rgba(0, 255, 237, 0.1);
    border-color: #00ffed;
}

.ls-icon { font-size: 40px; margin-bottom: 10px; }
.ls-card-title { color: #ffd700; font-size: 20px; margin-bottom: 8px; font-family: 'Fredoka One'; }
.ls-card-desc { font-size: 14px; color: #bbb; line-height: 1.4; }

@keyframes fadeIn { to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(30px); } to { transform: translateY(0); } }
`;
