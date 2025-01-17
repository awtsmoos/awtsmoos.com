//B"H
export default (id) => /*css*/`
    
    /* B"H */
    .${id}.desktop {
        position: relative;
        width: 100vw;
        height: calc(100vh - 40px); /* Adjusting for the start bar height */
        background: #1a237e;
        background-size: 400% 400%;
        display:flex;
        flex-direction:column;
        box-shadow: inset 0 0 150px rgba(255, 255, 255, 0.2), inset 0 0 300px rgba(0, 0, 0, 0.4);
        
        font-family: 'Trebuchet MS', sans-serif;
    }
    
    .${id} .fileHolder {
        overflow-y: scroll;
        padding: 10px;
        height:100%;
        box-shadow: inset 0 0 50px rgba(255, 255, 255, 0.1);
    }
    
    
    
    .${id} .fileName {
        padding: 5px;
        font-size: 1rem;
        font-weight: bold;
        color: #4a148c;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }

    .${id} .file {
        margin: 15px;
        background:  #e0e0e0;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        display: inline-flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
        padding: 10px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    
    .${id} .file:hover {
        transform: translateY(-10px) scale(1.05);
        background: #ffcc80;
        cursor: pointer;
        box-shadow: 0 10px 30px rgba(255, 87, 34, 0.5);
    }
    
    .${id} .file:active {
        background: #d32f2f;
        color: white;
        box-shadow: inset 0 5px 10px rgba(0, 0, 0, 0.4);
    }


    .${id} .folder {
        margin: 20px;
        padding: 15px;
        background: linear-gradient(135deg, #ff6f61, #ffcc80, #ff6f61);
        border: 3px dashed rgba(0, 0, 0, 0.3);
        border-radius: 16px 16px 0 0;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        position: relative;
        transition: transform 0.3s ease, filter 0.3s ease;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), inset 0 -10px 20px rgba(255, 235, 59, 0.3);
    }

    .${id} .folder::before {
        content: '\\1F4C1'; /* Unicode for a folder icon */
        font-size: 2.5rem;
        color: #ffab00;
        text-shadow: 0 3px 8px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 215, 0, 0.8);
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%) rotate(-5deg);
        animation: wobble 2s infinite ease-in-out;
    }

    .${id} .folder:hover {
        transform: translateY(-15px) scale(1.1) rotate(-2deg);
        background: linear-gradient(135deg, #f57c00, #ff6f61, #f57c00);
        cursor: pointer;
        filter: drop-shadow(0 15px 30px rgba(255, 87, 34, 0.8));
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.5), inset 0 -15px 25px rgba(255, 235, 59, 0.5);
    }

    .${id} .folder:active {
        transform: scale(0.95) rotate(1deg);
        background: linear-gradient(135deg, #d50000, #ff6f61, #d50000);
        box-shadow: inset 0 10px 20px rgba(0, 0, 0, 0.5), inset 0 -5px 15px rgba(255, 255, 255, 0.3);
        color: white;
    }

    .${id} .folderName {
        padding: 8px;
        font-size: 1.2rem;
        font-weight: bold;
        color: #ffffff;
        text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.7);
        background: rgba(0, 0, 0, 0.6);
        border-radius: 8px;
    }

    @keyframes wobble {
        0%, 100% {
            transform: translateX(-50%) rotate(-5deg);
        }
        50% {
            transform: translateX(-50%) rotate(5deg);
        }
    }


    .contextMenu {
        position: absolute;
        z-index: 1000;
        background: linear-gradient(45deg, #ff4081, #7c4dff);
        border: 2px solid rgba(0, 0, 0, 0.5);
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        animation: fadeIn 0.3s ease;
    }
    .contextMenu .menuItem {
        padding: 10px 20px;
        color: white;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.2s;
    }
    .contextMenu .menuItem:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
    }
    
    

`;