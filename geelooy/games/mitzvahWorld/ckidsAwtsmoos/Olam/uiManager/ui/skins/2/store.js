// B"H

export default /*css*/`
.store-container {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 800px; height: 600px;
    background: linear-gradient(135deg, #0d001a 0%, #240046 100%);
    border: 4px solid #00d4ff;
    box-shadow: 0 0 40px #00d4ff, inset 0 0 20px rgba(0, 212, 255, 0.3);
    border-radius: 15px;
    display: flex; flex-direction: column;
    font-family: 'Fredoka One', sans-serif;
    color: white;
    z-index: 1000;
    overflow: hidden;
}
.store-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px; background: rgba(0,0,0,0.5);
    border-bottom: 2px solid #00d4ff;
}
.store-tabs { display: flex; gap: 10px; padding: 10px 20px; background: rgba(255,255,255,0.05); }
.store-tab {
    padding: 10px 20px; cursor: pointer; border: 2px solid transparent;
    border-radius: 5px; transition: all 0.3s;
    background: rgba(0,0,0,0.3);
}
.store-tab.active {
    border-color: #ffd700; background: rgba(255, 215, 0, 0.2);
    box-shadow: 0 0 15px #ffd700; text-shadow: 0 0 5px #ffd700;
}
.store-content { flex: 1; display: flex; overflow: hidden; }
.store-grid {
    flex: 2; display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 10px; padding: 15px; overflow-y: auto;
    align-content: start;
}
.store-details {
    flex: 1; background: rgba(0,0,0,0.3); border-left: 2px solid #00d4ff;
    padding: 20px; display: flex; flex-direction: column; gap: 15px;
    align-items: center; text-align: center;
}
.store-item {
    width: 80px; height: 80px; background: rgba(255,255,255,0.1);
    border: 2px solid #555; border-radius: 8px; cursor: pointer;
    position: relative; transition: all 0.2s;
}
.store-item:hover {
    border-color: #00d4ff; box-shadow: 0 0 15px #00d4ff; transform: scale(1.05);
}
.store-item.selected {
    border-color: #ffd700; box-shadow: 0 0 20px #ffd700;
}
.store-item-icon { width: 100%; height: 100%; background-size: contain; background-repeat: no-repeat; background-position: center; }
.store-item-qty { position: absolute; bottom: 2px; right: 5px; font-size: 12px; text-shadow: 1px 1px 0 #000; }

.action-btn {
    padding: 15px 30px; font-size: 20px; background: linear-gradient(90deg, #00d4ff, #0051ff);
    border: none; color: white; font-family: inherit; cursor: pointer;
    border-radius: 50px; box-shadow: 0 0 15px #00d4ff;
    transition: all 0.2s;
}
.action-btn:hover { transform: scale(1.1); filter: brightness(1.2); }
.action-btn:disabled { filter: grayscale(1); cursor: not-allowed; }
`;