//B"H

export default /*css*/`
	.awtsmoosInventoryViewer {
		/* Positioning and basic appearance */
		position: absolute; /* Changed from fixed to absolute for better centering within game UI */
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		padding: 10px;
		background: rgba(30, 30, 80, 0.8); /* A darker, semi-transparent blue */
		border: 5px solid black;
		border-radius: 10px;
		
		/* --- NEW: Flexbox layout for the main window --- */
		display: flex;
		flex-direction: column; /* Stack header and slots vertically */
		gap: 10px; /* Space between header and slots */
		width: 420px; /* Set a fixed width for the window */
		max-height: 80vh; /* Limit the max height */
	}

	.awtsmoosInventoryViewer .header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center; /* Vertically center header items */
		color: white;
		font-family: Fredoka One, sans-serif;
		font-size: 20px;
		padding-bottom: 5px;
		border-bottom: 2px solid #4435B2;
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

	.awtsmoosInventoryViewer .header 
	.close:hover {
		background: orange;
		cursor: pointer;
	}

	.awtsmoosInventoryViewer .slots {
		/* --- NEW: Grid layout for the slots --- */
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); /* Creates a responsive grid of columns */
		gap: 8px; /* Space between each slot */
		
		/* Scrolling and size */
		overflow-y: auto; /* Allow vertical scrolling if slots overflow */
		padding: 10px;
        background-color: rgba(0,0,0,0.3);
        border-radius: 5px;
	}

	/* Individual Slot Styling (from your action bar CSS) */
	.slots .actionSlot {
		width: 60px;
		height: 60px;
		background-color: #444;
		border: 2px solid #888;
		border-radius: 8px;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative; /* Needed for positioning the quantity text */
	}

	.slots .innerSlot {
		width: 90%;
		height: 90%;
		background-color: #777;
		border-radius: 4px;
		position: relative; /* Also needed for quantity text */
	}

	.slots .actionSlot.occupied:hover {
		background: #00ffed;
		cursor: pointer;
	}

	.slots .actionSlot.occupied:hover .innerSlot {
		background: #79fff6;
	}
	
	.innerSlot.selected {
		outline: 3px solid #FFD700; /* Gold outline for selected item */
    	box-shadow: 0 0 10px #FFD700;
	}

    /* Style for the item icon */
    .slotBtn {
        width: 100%;
        height: 100%;
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
    }

    /* Style for the quantity text */
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
`;