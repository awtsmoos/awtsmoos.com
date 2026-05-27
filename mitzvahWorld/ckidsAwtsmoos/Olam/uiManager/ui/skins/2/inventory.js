//B"H

export default /*css*/`
	.awtsmoosInventoryViewer {
		position: absolute; 
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		padding: 10px;
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
		border: 5px solid #4435B2;
        box-shadow: 0 0 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(68, 53, 178, 0.5);
		border-radius: 20px;
		display: flex;
		flex-direction: column; 
		gap: 15px; 
		width: 85vw;
		height: 85vh; 
        max-height: 700px;
        font-family: 'Fredoka', sans-serif;
        color: white;
	}

    .awtsmoosInventoryViewer .header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center; 
		font-family: 'Fredoka One', cursive;
		font-size: 28px;
		padding-bottom: 10px;
		border-bottom: 2px solid #FFD700;
        text-shadow: 0 0 5px #FFD700;
        flex-shrink: 0; 
	}

    .awtsmoosBtn.small {
        border: 1px solid #FFD700;
        background: transparent;
        color: #FFD700;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.2s;
    }
    .awtsmoosBtn.small:hover {
        background: #FFD700;
        color: #000;
    }

    .awtsmoosInventoryViewer .header .close {
		display: flex;
		width: 35px;
		height: 35px;
		background: #ff4757;
		justify-content: center;
		align-items: center;
		border: 2px solid white;
		border-radius: 50%;
		font-weight: bold;
		color: white;
        font-size: 18px;
        cursor: pointer;
        box-shadow: 0 0 10px #ff4757;
        transition: transform 0.2s;
	}
    .awtsmoosInventoryViewer .header .close:hover { transform: scale(1.1); }

    /* --- BODY --- */
    .inventory-body {
        display: flex;
        gap: 15px;
        height: 100%;
        overflow: hidden; 
    }

    /* --- LEFT: EQUIPMENT --- */
    .equip-slots-holder {
        width: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: rgba(0,0,0,0.3);
        border-radius: 10px;
        padding: 10px 0;
        border: 1px solid rgba(255,255,255,0.1);
    }
    
    .equipment-slots {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .equip-slot {
		width: 60px;
		height: 60px;
		background: radial-gradient(circle, #3a3a5e 0%, #1a1a2e 100%);
		border: 2px solid #555;
        box-shadow: inset 0 0 10px black;
		position: relative;
		border-radius: 8px;
		display: flex;
		justify-content: center;
		align-items: center;
        transition: border-color 0.2s;
	}
    .equip-slot:hover { border-color: #FFD700; }

    /* --- RIGHT: MAIN SLOTS --- */
    .main-slots-holder {
        flex-grow: 1;
        background-color: rgba(0,0,0,0.2);
        border-radius: 10px;
        padding: 10px;
        overflow-y: auto;
        border: 1px solid rgba(255,255,255,0.1);
    }

	.slots {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); 
		gap: 10px; 
        width: 100%;
	}

	.slots .actionSlot {
		width: 70px;
		height: 70px;
		background: #2e2e4e;
		border: 2px solid #555;
		border-radius: 10px;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
	}
    
    /* B"H: VIVID ANIMATION FOR DROP TARGET */
    .actionSlot.drag-hover-active {
        border-color: #00ffed;
        box-shadow: 0 0 20px #00ffed, inset 0 0 25px #00ffed;
        transform: scale(1.15);
        z-index: 10;
        background: #3e3e8e;
        animation: slotPulse 0.5s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes slotPulse {
        from { 
            box-shadow: 0 0 15px #00ffed, inset 0 0 15px #00ffed; 
            border-color: #00ffed;
        }
        to { 
            box-shadow: 0 0 30px #bc13fe, inset 0 0 40px #bc13fe; 
            border-color: #bc13fe;
            transform: scale(1.2);
        }
    }

	.slots .innerSlot {
		width: 90%;
		height: 90%;
		background: #3e3e5e;
		border-radius: 6px;
		position: relative; 
        transition: all 0.2s;
	}

	.slots .actionSlot.occupied:hover .innerSlot {
		background: #5e5e8e;
        box-shadow: 0 0 15px #00ffed;
	}
	
    .equipped-indicator {
        border: 2px solid #FFD700;
        box-shadow: 0 0 10px #FFD700;
    }

    .slotBtn {
        width: 100%;
        height: 100%;
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
    }

    .slotQuantity {
        position: absolute;
        bottom: 2px;
        right: 5px;
        color: #fff;
        font-weight: bold;
        font-size: 14px;
        text-shadow: 2px 2px 0 #000;
    }

    /* --- WALLET SECTION --- */
    .wallet-display {
        background: linear-gradient(90deg, #2a1b0a 0%, #5c4013 100%);
        border: 2px solid #FFD700;
        border-radius: 10px;
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        margin-top: 5px;
        flex-shrink: 0;
    }

    .wallet-title {
        font-family: 'Fredoka One', cursive;
        color: #FFD700;
        font-size: 20px;
        text-transform: uppercase;
        text-shadow: 0 0 5px #b8860b;
    }

    .wallet-amount {
        font-size: 24px;
        font-weight: bold;
        color: #fff;
        text-shadow: 1px 1px 0 #000;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .wallet-coin-icon {
        width: 30px;
        height: 30px;
        background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImNvcHBlckdyYWQiIGN4PSI1MCUiIGN5PSI1MCUiIHI9IjUwJSIgZng9IjMwJSIgZnk9IjMwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmYmY4MCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2I4NzMzMyIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBmaWxsPSJ1cmwoI2NvcHBlckdyYWQpIiBzdHJva2U9IiM4MDQwMDAiIHN0cm9rZS13aWR0aD0iMyIvPjwvc3ZnPg==");
        background-size: contain;
        background-repeat: no-repeat;
    }

    .conversion-table {
        font-size: 12px;
        color: #ccc;
        position: absolute;
        bottom: 60px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.9);
        padding: 10px;
        border: 1px solid #FFD700;
        border-radius: 5px;
        display: none;
        z-index: 100;
        text-align: left;
    }
    
    .wallet-display:hover .conversion-table {
        display: block;
    }

	.awtsmoosContextMenu {
		background: rgba(20, 20, 40, 0.95);
        border: 2px solid #FFD700;
        border-radius: 8px;
        z-index: 2000;
        display: flex;
        flex-direction: column;
        padding: 5px;
        gap: 5px;
        min-width: 160px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.8);
	}

    .ctx-btn {
        background: transparent;
        border: none;
        color: white;
        text-align: left;
        padding: 10px;
        cursor: pointer;
        font-size: 14px;
        border-bottom: 1px solid #444;
        transition: background 0.2s;
    }
    .ctx-btn:hover { background: #4435B2; }
    .ctx-btn:last-child { border-bottom: none; }
    
    .awtsmoos-tooltip {
        position: absolute;
        background: rgba(0,0,0,0.9);
        border: 1px solid #FFD700;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 14px;
        pointer-events: none;
        z-index: 3000;
    }
    
    .locked::after {
        content: "";
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6);
        border-radius: 12px;
    }
    .locked-icon {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        z-index: 2;
    }
`;