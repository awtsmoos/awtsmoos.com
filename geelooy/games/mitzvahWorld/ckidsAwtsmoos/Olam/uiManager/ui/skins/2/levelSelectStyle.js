
// B"H
export default /*css*/`
.level-select-container {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    display: flex; justify-content: center; align-items: center;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(15px);
    z-index: 10000;
    opacity: 0;
    animation: fadeIn 0.4s forwards;
    font-family: 'Fredoka', sans-serif;
}

.level-select-container.hidden { display: none !important; }

.ls-glass-panel {
    width: 900px;
    max-width: 95%;
    background: linear-gradient(135deg, rgba(20, 10, 40, 0.95), rgba(10, 5, 20, 0.98));
    border: 3px solid #00ffed;
    border-radius: 30px;
    box-shadow: 0 0 80px rgba(0, 255, 237, 0.3), inset 0 0 30px rgba(0, 255, 237, 0.2);
    overflow: hidden;
    animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    color: white;
}

.ls-header {
    background: linear-gradient(90deg, #1f005c, #5b0060, #870160);
    padding: 25px;
    border-bottom: 3px solid #00ffed;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.ls-title {
    font-family: 'Fredoka One', cursive;
    font-size: 40px;
    color: #00ffed;
    text-shadow: 0 0 15px #00ffed, 0 0 30px #bc13fe;
    letter-spacing: 3px;
    margin: 0;
}

.ls-close-btn {
    background: transparent;
    border: 2px solid #ff0055;
    color: #ff0055;
    width: 50px; height: 50px;
    border-radius: 50%;
    font-weight: bold;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex; justify-content: center; align-items: center;
    box-shadow: 0 0 15px rgba(255, 0, 85, 0.3);
}
.ls-close-btn:hover { background: #ff0055; color: white; transform: scale(1.1); box-shadow: 0 0 30px #ff0055; }

.ls-body {
    padding: 40px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
}

.ls-card {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 30px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    position: relative;
    overflow: hidden;
}

.ls-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
    opacity: 0; transition: opacity 0.3s;
}

.ls-card:hover {
    transform: translateY(-10px) scale(1.05);
    border-color: #00ffed;
    box-shadow: 0 15px 30px rgba(0,0,0,0.5), 0 0 30px rgba(0, 255, 237, 0.4);
}
.ls-card:hover::before { opacity: 1; }

.ls-icon {
    font-size: 60px;
    margin-bottom: 15px;
    filter: drop-shadow(0 0 15px rgba(255,255,255,0.5));
}

.ls-card-title {
    font-family: 'Fredoka One', cursive;
    font-size: 24px;
    color: #ffd700;
    margin-bottom: 10px;
    text-shadow: 0 2px 5px rgba(0,0,0,0.8);
}

.ls-card-desc {
    font-size: 16px;
    color: #ccc;
    line-height: 1.4;
}

.ls-card.garden:hover { border-color: #00ff00; box-shadow: 0 15px 30px rgba(0,0,0,0.5), 0 0 30px rgba(0, 255, 0, 0.4); }
.ls-card.garden .ls-card-title { color: #00ff00; }

.ls-card.city:hover { border-color: #0088ff; box-shadow: 0 15px 30px rgba(0,0,0,0.5), 0 0 30px rgba(0, 136, 255, 0.4); }
.ls-card.city .ls-card-title { color: #0088ff; }

.ls-card.desert:hover { border-color: #ff8800; box-shadow: 0 15px 30px rgba(0,0,0,0.5), 0 0 30px rgba(255, 136, 0, 0.4); }
.ls-card.desert .ls-card-title { color: #ff8800; }
`;
