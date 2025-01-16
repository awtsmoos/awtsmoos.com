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
    
    .${id} .fileName {
        padding: 5px;
        font-size: 1rem;
        font-weight: bold;
        color: #4a148c;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
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