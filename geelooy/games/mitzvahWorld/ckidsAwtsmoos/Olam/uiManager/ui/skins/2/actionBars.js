


//B"H
var rightAmount = 7;
export default /*css*/`
        
        .awtsmoosAction {
            right: ${rightAmount}px;
            top: 50%;
            transform: translate(0, -50%);
            transition: transform 0.4s ease-in-out;
            position: absolute;
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
            display: flex
        ;
            flex-direction: column;
            gap: 15px;
        }

        .awtsmoosAction.minimized {
            transform: translate(calc(100% + ${
                rightAmount
            }px), -50%);
        }

        
        .slots 
        .actionSlot.occupied:hover {
        	background: #00ffed;
        	cursor: pointer;
        }

        
        .slots 
        .actionSlot.occupied:hover 
        .innerSlot {
        	background: #79fff6;
        }

        .slots
        .actionSlot.occupied:hover 
       
        
        .innerSlot .slotBtn{
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
        }

        .slots .innerSlot {
            width: 90%;
        	height: 90%;
            background-color: #777; /* Inner design background */
            border-radius: 4px; /* Inner design rounded corners */
        }

        .awtsmoosAction .minimize {
            width: 20px;
            height: 20px;
            background-color: #222;
            border: 2px solid #555;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            position: absolute;
            left: -30px;
            opacity: 0.5;
        }

        .minimize.closed {
            opacity: 0.1;
        }
        .minimize.opened::after {
            content: '\\25B6'; /* Right-pointing arrow */
            font-size: 12px;
            color: #fff;
        }

        .minimize.closed::after {
            content: '\\25C0'; /* Left-pointing arrow */
            font-size: 12px;
            color: #fff;
        }

    .awtsmoos.tooltip {
        background: black;
        color: #00ff00;
        border: 1px solid white;
        border-radius: 5px;
        padding:10px;
        pointer-events: none;
        position: fixed; /* B"H: Changed to fixed to avoid offsets from parent transforms */
        z-index: 9999; 
        white-space: nowrap; 
        transform-origin: top left;
        box-shadow: 0 0 10px rgba(0,0,0,0.8);
    }

    .awtsmoos.tooltip .header {
        font-weight: bold;
    }
    }
    
`;
