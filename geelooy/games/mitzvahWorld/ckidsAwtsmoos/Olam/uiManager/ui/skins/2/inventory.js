//B"H

export default /*css*/`
	.awtsmoosInventoryViewer {
		position: absolute; 
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		padding: 10px;
		background: rgba(30, 30, 80, 0.9); 
		border: 5px solid black;
		border-radius: 10px;
		
		display: flex;
		flex-direction: column; 
		gap: 10px; 
		width: 80vw;
		height: 80vh; /* Fixed height relative to screen */
        max-height: 600px;
	}

	.awtsmoosInventoryViewer .ctx-btn {
		background: none;
                border: none;
                color: white;
                textAlign: left;
                cursor: pointer;
                padding: 8px;
                border-bottom: 1px solid #444;
                font-size: 14px
	}
	.awtsmoosInventoryViewer .ctx-btn.close {
		border-bottom: none;
	}
	
	.innerSlot.equipped-indicator {
	        outline: 3px solid gold;
	        box-shadow: 0 0 12px gold;
	    }
	.awtsmoosInventoryViewer .header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center; 
		color: white;
		font-family: Fredoka One, sans-serif;
		font-size: 20px;
		padding-bottom: 5px;
		border-bottom: 2px solid #4435B2;
        flex-shrink: 0; /* Prevent header from shrinking */
	}
	
	.awtsmoosContextMenu {
		background: rgba(20, 20, 40, 0.95);
                border: 2px solid #FFD700;
                borderRadius: 8px;
                zIndex: 2000;
                display: flex;
                flexDirection: column;
                padding: 5px;
                gap: 5px;
                minWidth: 140px;
                boxShadow: 0 4px 8px rgba(0,0,0,0.5);
	}
	
	
	.awtsmoosInventoryViewer .header .close {
		display: flex;
		width: 25px;
		height: 25px;
		user-select: none;
		background: red;
		justify-content: center;
		align-items: center;
		border: 1px solid black;
		border-radius: 50%;
		font-weight: bold;
		color: white;
	}

	.awtsmoosInventoryViewer .header .close:hover {
		background: orange;
		cursor: pointer;
	}

    /* --- NEW LAYOUT STRUCTURE --- */

    .inventory-body {
        display: flex;
        gap: 10px;
        height: 100%;
        overflow: hidden; /* Prevents body from expanding */
    }

    .equip-slots-holder {
        width: 70px;
        display: flex;
        flex-direction: column;
        border-right: 1px solid #555;
        padding-right: 5px;
        overflow-y: auto;
        flex-shrink: 0;
    }

    .main-slots-holder {
        flex-grow: 1;
        background-color: rgba(0,0,0,0.3);
        border-radius: 5px;
        padding: 5px;
        overflow-y: auto; /* The Scrollbar happens HERE */
        height: 100%;
    }

	.awtsmoosInventoryViewer .slots {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); 
		gap: 8px; 
        width: 100%;
        /* No overflow here, let the holder handle it */
	}

	/* Individual Slot Styling */
	.slots .actionSlot, .equipment-slots .equip-slot {
		width: 60px;
		height: 60px;
		background-color: #444;
		border: 2px solid #888;
		border-radius: 8px;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative; 
	}

	.slots .innerSlot {
		width: 90%;
		height: 90%;
		background-color: #777;
		border-radius: 4px;
		position: relative; 
	}

	.slots .actionSlot.occupied:hover {
		background: #00ffed;
		cursor: pointer;
	}

	.slots .actionSlot.occupied:hover .innerSlot {
		background: #79fff6;
	}
	
	.innerSlot.selected {
		outline: 3px solid #FFD700; 
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
        right: 4px;
        color: white;
        font-weight: bold;
        font-size: 14px;
        text-shadow: 1px 1px 2px black;
        pointer-events: none;
    }
    
    .equipment-slots {
        display: flex;
        flex-direction: column;
        gap: 5px;
        align-items: center;
    }
`;