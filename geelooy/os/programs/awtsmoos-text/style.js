//B"H
export default /*css*/`
    /* Refined CSS */
    .awtsmoos-editor-container {
    width: 100%;
    height: 100%;
    margin: 0 auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    }
    
    .menu-bar {
    background-color: #333;
    color: white;
    padding: 15px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: 18px;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    transition: all 0.4s ease-in-out;
    }

    .content-holder {
    overflow:scroll;
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
    
    .menu-item:focus {
    outline: none;
    box-shadow: 0 0 15px rgba(255, 204, 0, 0.7);
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
        transform: scale(1.05);
    }
    
    .content-editable {
        border: 2px solid #444;
        padding: 20px;
        
        overflow: scroll;
        min-height: 350px;
        background-color: #fff;
        box-sizing: border-box;
        font-size: 18px;
        line-height: 1.7;
        border-radius: 10px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .content-editable:focus {
        border-color: #ffcc00;
        box-shadow: 0 0 12px rgba(255, 204, 0, 0.6);
    }
    
    .file-name-header {
        font-weight: bold;
        font-size: 24px;
        padding: 10px 5px;
        background: #002d55;
        color: #f1f1f1;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @media (max-width: 768px) {
        .menu-bar {
            flex-direction: row;
            padding: 10px;
        }
        .menu-item {
            padding: 8px 18px;
            margin-right: 10px;
        }
        .awtsmoos-options {
            left: -10px;
            min-width: 120px;
        }
    }

`;