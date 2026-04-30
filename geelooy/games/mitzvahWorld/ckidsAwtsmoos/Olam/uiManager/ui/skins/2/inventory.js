
//B"H
import contextMenuCSS from "./inventory/contextMenuCSS.js";
import slotsCSS from "./inventory/slotsCSS.js";
import walletCSS from "./inventory/walletCSS.js";

export default /*css*/`
	.awtsmoosInventoryViewer {
		position: absolute; 
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		padding: 20px;
		background: linear-gradient(135deg, rgba(15,20,40,0.98) 0%, rgba(5,10,25,0.95) 100%); 
		border: 4px solid #00ffed;
        box-shadow: 0 0 50px rgba(0,255,237,0.6), inset 0 0 30px rgba(0,255,237,0.3);
		border-radius: 25px;
		display: flex;
		flex-direction: column; 
		gap: 15px; 
		width: 90vw;
		height: 90vh; 
        max-width: 900px;
        max-height: 800px;
        font-family: 'Fredoka', sans-serif;
        color: white;
        z-index: 5000;
        backdrop-filter: blur(15px);
        box-sizing: border-box;
	}

    .awtsmoosInventoryViewer .header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center; 
		font-family: 'Fredoka One', cursive;
		font-size: 26px;
		padding-bottom: 10px;
		border-bottom: 3px solid #00ffed;
        text-shadow: 0 0 15px #00ffed;
        flex-shrink: 0; 
	}

    .awtsmoosBtn.small {
        border: 2px solid #00ffed;
        background: rgba(0,255,237,0.1);
        color: #00ffed;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        font-weight: bold;
        padding: 5px 15px;
    }
    .awtsmoosBtn.small:hover { background: #00ffed; color: #000; box-shadow: 0 0 15px #00ffed; }

    .awtsmoosInventoryViewer .header .close {
		display: flex; width: 40px; height: 40px; background: #ff4757;
		justify-content: center; align-items: center; border: 3px solid white;
		border-radius: 50%; font-weight: bold; color: white; font-size: 20px;
        cursor: pointer; box-shadow: 0 0 15px #ff4757; transition: transform 0.2s;
	}
    .awtsmoosInventoryViewer .header .close:hover { transform: scale(1.15) rotate(90deg); }

    .inventory-body { display: flex; flex-direction: row; gap: 20px; height: 100%; overflow: hidden; box-sizing: border-box; }

    .equip-slots-holder {
        width: 100px; display: flex; flex-direction: column; align-items: center;
        background: rgba(0,0,0,0.5); border-radius: 15px; padding: 15px 0;
        border: 2px solid rgba(0,255,237,0.3); box-shadow: inset 0 0 20px #000;
        overflow-y: auto; flex-shrink: 0;
    }
    .equip-slots-holder::-webkit-scrollbar { display:none; }
    
    .equipment-slots { display: flex; flex-direction: column; gap: 15px; align-items: center; width: 100%; }

    .equip-slot {
		width: 70px; height: 70px; background: radial-gradient(circle, #2a2a4e 0%, #0a0a1e 100%);
		border: 2px solid #555; box-shadow: inset 0 0 15px black;
		position: relative; border-radius: 12px; display: flex;
		justify-content: center; align-items: center; transition: all 0.3s;
	}
    .equip-slot:hover { border-color: #00ffed; box-shadow: inset 0 0 20px rgba(0,255,237,0.4); transform: scale(1.05); cursor: pointer; }
    .equip-slot .locked-icon { font-size: 28px; }

    @media (max-width: 600px) {
        .awtsmoosInventoryViewer {
            width: 95vw; height: 95vh; padding: 10px; gap: 10px;
        }
        .awtsmoosInventoryViewer .header { font-size: 20px; }
        .inventory-body { flex-direction: column; }
        .equip-slots-holder { 
            width: 100%; height: 90px; flex-direction: row; padding: 0 10px; overflow-x: auto; overflow-y: hidden; align-items: center;
        }
        .equipment-slots { flex-direction: row; justify-content: flex-start; gap: 10px; }
        .equip-slot { width: 60px; height: 60px; flex-shrink: 0; }
        .wallet-amount { font-size: 20px !important; }
        .wallet-title { font-size: 16px !important; }
    }

    ${slotsCSS}
    ${contextMenuCSS}
    ${walletCSS}
`;
