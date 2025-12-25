//B"H
export default /*css*/`
.bezalel-workshop {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    height: 90vh;
    background: linear-gradient(135deg, #0b0f19 0%, #16213e 100%);
    border: 2px solid #ffd700;
    box-shadow: 0 0 50px rgba(255, 215, 0, 0.2);
    display: flex;
    flex-direction: column;
    font-family: 'Fredoka', sans-serif;
    color: #e0e0e0;
    z-index: 5000;
    border-radius: 15px;
    overflow: hidden;
}

.bezalel-header {
    background: rgba(0,0,0,0.5);
    padding: 15px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ffd700;
}

.bezalel-title {
    font-family: 'Fredoka One', cursive;
    font-size: 28px;
    color: #ffd700;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.bezalel-body {
    flex: 1;
    display: flex;
    overflow: hidden;
}

.bz-panel {
    padding: 20px;
    overflow-y: auto;
    background: rgba(255,255,255,0.02);
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.bz-panel.left { width: 250px; border-right: 1px solid #444; }
.bz-panel.center { flex: 1; border-right: 1px solid #444; }
.bz-panel.right { width: 300px; }

.bz-label { font-size: 14px; color: #4cc9f0; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
.bz-input { background: rgba(0,0,0,0.3); border: 1px solid #555; padding: 10px; color: white; border-radius: 5px; width: 100%; box-sizing: border-box; }

.bz-btn {
    background: linear-gradient(90deg, #4435B2, #2B2175);
    border: 1px solid #4cc9f0;
    color: white;
    padding: 12px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    text-transform: uppercase;
    transition: all 0.2s;
}

.bz-btn:hover { background: #4cc9f0; color: black; box-shadow: 0 0 15px #4cc9f0; }

.bz-btn.spawn { background: linear-gradient(90deg, #ffd700, #ffaa00); border-color: #ffd700; color: black; font-size: 18px; margin-top: auto; }

.bz-modifier-card {
    background: rgba(0,0,0,0.4);
    border: 1px solid #444;
    border-left: 4px solid #4cc9f0;
    padding: 15px;
    border-radius: 5px;
    position: relative;
}

.bz-modifier-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; color: #fff; }
.bz-row { display: flex; gap: 10px; align-items: center; margin-bottom: 5px; }
.bz-json-view { width: 100%; height: 200px; background: #000; color: #0f0; font-family: monospace; padding: 10px; border: 1px solid #333; font-size: 12px; resize: none; }
`;