//B"H
export default /*css*/`
    /* CSS for Awtsmoos Binary Viewer */
    .awtsmoos-viewer-container {
        width: 100%;
        height: 100%;
        margin: 0 auto;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        background-color: #2b2b2b;
    }

    .awtsmoos-viewer-container .content-holder {
        background: #3c3f41;
        flex-grow: 1;
        overflow: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
    }

    .awtsmoos-viewer-container .content-holder pre {
        color: #f1f1f1;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .menu-bar {
        background-color: #333;
        color: white;
        padding: 5px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        font-size: 15px;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        transition: all 0.4s ease-in-out;
    }
    
    .menu-item {
        position: relative;
        padding: 12px 25px;
        cursor: pointer;
        z-index: 23;
        margin-right: 25px;
        border-radius: 8px;
        background-color: #444;
        transition: all 0.3s ease-in-out;
    }
    
    .menu-item:hover {
        background-color: #555;
        color: #ffcc00;
        transform: scale(1.1);
    }
    
    .menu-item:hover .awtsmoos-options {
        display: block;
        animation: fadeIn 0.3s ease-out;
    }
    
    .awtsmoos-options {
        display: none;
        background-color: #3b3b3b;
        position: absolute;
        left: 0;
        top: 100%;
        min-width: 150px;
        border-radius: 10px;
        z-index: 10;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    }
    
    .awtsmoos-options div {
        padding: 12px;
        cursor: pointer;
        font-size: 16px;
        color: #e0e0e0;
        transition: all 0.3s ease;
    }
    
    .awtsmoos-options div:hover {
        background-color: #666;
        color: white;
    }
    
    .file-name-header {
        font-weight: bold;
        font-size: 24px;
        padding: 10px 5px;
        background: #002d55;
        color: #f1f1f1;
        text-align: center;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
