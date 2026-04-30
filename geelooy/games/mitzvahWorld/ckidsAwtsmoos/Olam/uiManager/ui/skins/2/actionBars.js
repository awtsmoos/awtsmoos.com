
//B"H
var rightAmount = 7;
export default /*css*/`
        
        .awtsmoosAction {
            right: ${rightAmount}px;
            top: 50%;
            transform: translate(0, -50%);
            transition: transform 0.4s ease-in-out;
            position: absolute;
            /* Allow the overall container to let clicks through where it is empty */
            pointer-events: none; 
            z-index: 10000;
        }

        .awtsmoosAction .slots .slotBtn {
        	width: 100%;
        	height: 100%;
            background-position: center;
        	background-size: contain;
        	background-repeat: no-repeat;
            transition:transform 1s ease;
            transform: scale(1);
        }
        
        .awtsmoosAction .slots {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .awtsmoosAction.minimized {
            transform: translate(calc(100% + ${rightAmount}px), -50%);
        }

        
        .slots .actionSlot.occupied:hover {
        	background: #00ffed;
        	cursor: pointer;
        }

        
        .slots .actionSlot.occupied:hover .innerSlot {
        	background: #79fff6;
        }

        .slots .actionSlot.occupied:hover .innerSlot .slotBtn {
            transform:scale(1.3) rotate(25deg);
        }


        .slots .actionSlot {
            width: 60px; /* Slot width */
            height: 60px; /* Slot height */
            background-color: #444; /* Slot background */
            border: 2px solid #888; /* Slot border */
            border-radius: 8px; /* Rounded corners */
            display: flex;
            justify-content: center;
            align-items: center;
            
            /* B"H: ABSOLUTELY ESSENTIAL! Bring slots to life, piercing the UI transparency veil! */
            pointer-events: auto !important; 
            box-shadow: 0 4px 10px rgba(0,0,0,0.8);
            transition: border-color 0.2s;
        }

        .slots .innerSlot {
            width: 90%;
        	height: 90%;
            background-color: #777; /* Inner design background */
            border-radius: 4px; /* Inner design rounded corners */
        }

        .awtsmoosAction .minimize {
            width: 25px;
            height: 25px;
            background-color: #0d0434;
            border: 2px solid #00f3ff;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            position: absolute;
            left: -40px;
            top: 50%;
            transform: translateY(-50%);
            box-shadow: 0 0 10px rgba(0, 243, 255, 0.6);
            
            /* B"H: THE TIKKUN! Allowing this specific div (which acts as a button) to accept touches and clicks natively */
            pointer-events: auto !important;
            opacity: 1 !important; 
            transition: all 0.2s ease-out;
        }

        .awtsmoosAction .minimize:hover {
            transform: translateY(-50%) scale(1.2);
            box-shadow: 0 0 15px rgba(0, 243, 255, 1);
            background-color: #23144F;
        }

        .minimize.opened::after {
            content: '\\25B6'; /* Right-pointing arrow */
            font-size: 14px;
            color: #00f3ff;
            text-shadow: 0 0 5px #fff;
        }

        .minimize.closed::after {
            content: '\\25C0'; /* Left-pointing arrow */
            font-size: 14px;
            color: #00f3ff;
            text-shadow: 0 0 5px #fff;
        }

    .awtsmoos.tooltip {
        background: black;
        color: #00ff00;
        border: 1px solid white;
        border-radius: 5px;
        padding:10px;
        pointer-events: none;
        position: fixed; 
        z-index: 9999; 
        white-space: nowrap; 
        transform-origin: top left;
        box-shadow: 0 0 10px rgba(0,0,0,0.8);
    }

    .awtsmoos.tooltip .header {
        font-weight: bold;
    }
`;
