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

@media (max-width: 820px) {
    .store-container {
        width: 95%;
        height: 90%;
    }
    .store-grid {
        grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)) !important;
    }
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
    text-transform: uppercase;
    font-weight: bold;
}
.store-tab:hover { background: rgba(255,255,255,0.1); }
.store-tab.active {
    border-color: #ffd700; background: rgba(255, 215, 0, 0.2);
    box-shadow: 0 0 15px #ffd700; text-shadow: 0 0 5px #ffd700;
}

.store-content { flex: 1; display: flex; overflow: hidden; }

.store-grid {
    flex: 2; display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 15px; padding: 20px; overflow-y: auto;
    align-content: start;
    /* Fancy scrollbar */
    scrollbar-width: thin;
    scrollbar-color: #00d4ff rgba(0,0,0,0.3);
}

.store-grid::-webkit-scrollbar { width: 8px; }
.store-grid::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
.store-grid::-webkit-scrollbar-thumb { background-color: #00d4ff; border-radius: 4px; }

.store-details {
    flex: 1; background: rgba(0,0,0,0.3); border-left: 2px solid #00d4ff;
    padding: 20px; display: flex; flex-direction: column; gap: 15px;
    align-items: center; text-align: center;
    min-width: 250px;
}

.store-item {
    width: 90px; height: 90px; background: rgba(255,255,255,0.1);
    border: 2px solid #555; border-radius: 12px; cursor: pointer;
    position: relative; transition: all 0.2s;
    overflow: hidden;
}
.store-item:hover {
    border-color: #00d4ff; box-shadow: 0 0 15px #00d4ff; transform: scale(1.05);
    z-index: 10;
}
.store-item:active { transform: scale(0.95); }

.store-item-icon { 
    width: 100%; height: 100%; 
    background-size: 80%; 
    background-repeat: no-repeat; 
    background-position: center; 
}

.store-item-qty { 
    position: absolute; bottom: 4px; right: 6px; 
    font-size: 14px; font-weight: bold; 
    text-shadow: 1px 1px 0 #000; 
    background: rgba(0,0,0,0.5); padding: 1px 4px; border-radius: 4px;
}

.action-btn {
    padding: 15px 40px; font-size: 22px; 
    background: linear-gradient(90deg, #00d4ff, #0051ff);
    border: none; color: white; font-family: inherit; cursor: pointer;
    border-radius: 50px; box-shadow: 0 0 15px #00d4ff;
    transition: all 0.2s;
    text-transform: uppercase;
    font-weight: bold;
}
.action-btn:hover { transform: scale(1.1); filter: brightness(1.2); box-shadow: 0 0 25px #00d4ff; }
.action-btn:disabled { filter: grayscale(1); cursor: not-allowed; transform: none; box-shadow: none; }

@media (max-width: 600px) {
    .store-content { flex-direction: column; }
    .store-details { 
        flex: none; height: 250px; border-left: none; border-top: 2px solid #00d4ff; 
        overflow-y: auto;
    }
}
`;