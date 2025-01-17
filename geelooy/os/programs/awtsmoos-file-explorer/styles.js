//B"H
export default /*css*/`
.file-explorer {
    display: flex;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #1e3c72, #2a5298);
    font-family: Arial, sans-serif;
    color: #fff;
}

.file-explorer-header {
    display: flex;
    gap: 10px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.8);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}

.file-explorer-header button {
    background: #4caf50;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 10px 15px;
    cursor: pointer;
    font-weight: bold;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.file-explorer-header button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.file-explorer-sidebar {
    width: 200px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.6);
    overflow-y: auto;
}

.folder-item {
    margin: 5px 0;
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
    transition: background 0.2s;
}

.folder-item:hover {
    background: rgba(255, 255, 255, 0.2);
}

.file-explorer-body {
    padding: 10px;
    overflow-y: auto;
    display: flex
;
    gap: 10px;
    flex-direction: column;
}

.file-explorer-body.list-view {
    flex-direction: column;
}

.file-item {
    background: #3e64ff;
    padding: 10px;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    transition: transform 0.2s, background 0.3s;
}

.file-item:hover {
    background: #567bff;
    transform: translateY(-3px);
}
`;