//B"H
document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/public'; // Change if your API is elsewhere

    // DOM Elements
    const breadcrumbContainer = document.getElementById('breadcrumb-container');
    const directoryView = document.getElementById('directory-view');
    const jsonViewerContainer = document.getElementById('json-viewer-container');
    const jsonDataDisplay = document.getElementById('json-data-display');
    const jsonEditArea = document.getElementById('json-edit-area');
    const currentPathDisplay = document.getElementById('current-path-display');
    const messageArea = document.getElementById('message-area');
    const loadingOverlay = document.getElementById('loading-overlay');

    const checkAuthBtn = document.getElementById('check-auth-btn');
    const authIndicator = document.getElementById('auth-indicator');
    
    const editJsonBtn = document.getElementById('edit-json-btn');
    const saveJsonBtn = document.getElementById('save-json-btn');
    const createJsonBtn = document.getElementById('create-json-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const deleteEntryBtn = document.getElementById('delete-entry-btn');
    
    const newEntryNameInput = document.getElementById('new-entry-name');
    const initiateCreateBtn = document.getElementById('initiate-create-btn');

    // App State
    let currentPath = '/';
    let currentData = null; // To store the JSON data for editing
    let isAuthorized = false;
    let isEditing = false;
    let isCreatingNew = false; // For distinguishing create from update

    
    
    function showLoading(message = "PROCESSING...") {
        loadingOverlay.querySelector('p').textContent = message;
        loadingOverlay.classList.remove('hidden');
    }

    function hideLoading() {
        loadingOverlay.classList.add('hidden');
    }

    function showMessage(text, type = 'info') {
        messageArea.textContent = text;
        messageArea.className = ''; // Clear previous classes
        if (type === 'error') messageArea.classList.add('error-message-style'); // Add CSS for error style
        else if (type === 'success') messageArea.classList.add('success-message-style'); // Add CSS for success
        setTimeout(() => messageArea.textContent = "Idle...", 5000);
    }

    function updateBreadcrumbs() {
        breadcrumbContainer.innerHTML = '';
        const parts = currentPath.split('/').filter(p => p);
        let pathAccumulator = '/';

        const rootEl = document.createElement('span');
        rootEl.className = 'breadcrumb-item';
        rootEl.textContent = 'ROOT';
        rootEl.onclick = () => navigateTo('/');
        breadcrumbContainer.appendChild(rootEl);

        parts.forEach((part, index) => {
            const separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.textContent = '>';
            breadcrumbContainer.appendChild(separator);

            pathAccumulator += part + '/';
            const partEl = document.createElement('span');
            partEl.className = 'breadcrumb-item';
            partEl.textContent = part.toUpperCase();
            if (index < parts.length -1 || currentPath.endsWith('/')) { // Clickable if not the last file part
                 // Only make directory parts or current directory clickable
                const navPath = pathAccumulator;
                partEl.onclick = () => navigateTo(navPath);
            } else {
                partEl.style.cursor = 'default';
                partEl.style.color = 'var(--accent-color)'; // Highlight current file
            }
            breadcrumbContainer.appendChild(partEl);
        });
        currentPathDisplay.textContent = `Path: ${currentPath}`;
    }

    function renderDirectory(items) {
        directoryView.innerHTML = '';
        jsonViewerContainer.classList.remove('active-panel');
        directoryView.classList.add('active-panel');
        
        // Parent directory navigation ("..")
        if (currentPath !== '/') {
            const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/', currentPath.length - 2) + 1) || '/';
            const parentItemEl = document.createElement('div');
            parentItemEl.className = 'dir-item';
            parentItemEl.textContent = '.. (Parent Directory)';
            parentItemEl.onclick = () => navigateTo(parentPath);
            directoryView.appendChild(parentItemEl);
        }

        items.sort().forEach(item => {
            const itemEl = document.createElement('div');
            const isDir = !item.includes('.'); // Simple check, adapt if needed
            const isAwtsmoos = item.endsWith('.awtsmoosJSON');

            itemEl.textContent = item;
            if (isDir) {
                itemEl.className = 'dir-item';
                itemEl.onclick = () => navigateTo(currentPath + item + '/');
            } else {
                itemEl.className = 'file-item';
                if (isAwtsmoos) itemEl.classList.add('awtsmoos');
                itemEl.onclick = () => navigateTo(currentPath + item);
            }
            directoryView.appendChild(itemEl);
        });
        toggleJsonEditMode(false); // Ensure edit mode is off when viewing directory
    }

    function renderJsonViewer(data) {
        currentData = data; // Store for potential editing
        jsonDataDisplay.innerHTML = '';
        directoryView.classList.remove('active-panel');
        jsonViewerContainer.classList.add('active-panel');

        const rootNode = createJsonNode(data, true);
        jsonDataDisplay.appendChild(rootNode);
        
        updateEditControls();
    }

    function createJsonNode(data, isRoot = false, keyName = null) {
        const node = document.createElement('div' );
        if (!isRoot) node.classList.add('json-node');
        if (typeof data === 'object' && data !== null) {
            node.classList.add('json-collapsible');
            if (!isRoot) node.open = true; // Auto-expand children, except root

            const summary = document.createElement(isRoot ? 'div' : 'summary');
            if (keyName) {
                const keySpan = document.createElement('span');
                keySpan.className = 'json-key';
                keySpan.textContent = `"${keyName}": `;
                summary.appendChild(keySpan);
            }

            const braceOpen = document.createElement('span');
            braceOpen.className = 'json-brace';
            braceOpen.textContent = Array.isArray(data) ? '[' : '{';
            summary.appendChild(braceOpen);

            if (!isRoot) { // Add preview for collapsed non-root objects/arrays
                const preview = document.createElement('span');
                preview.className = 'json-value-preview';
                preview.textContent = Array.isArray(data) ? ` Array(${Object.keys(data).length})` : ` Object(${Object.keys(data).length})`;
                summary.appendChild(preview);
                node.appendChild(summary);
            } else {
                node.appendChild(summary); // For root, summary is just the opening brace
            }


            for (const key in data) {
                const childNode = createJsonNode(data[key], false, Array.isArray(data) ? null : key);
                node.appendChild(childNode);
            }

            const braceClose = document.createElement('span');
            braceClose.className = 'json-brace';
            braceClose.textContent = Array.isArray(data) ? ']' : '}';
            if (isRoot) summary.appendChild(braceClose); // If root, close on same line if no children
            else node.appendChild(braceClose); // If not root, close after children

        } else { // Primitive value
            node.classList.remove('json-collapsible'); // Not a details element
            node.style.marginLeft = '20px'; // Indent primitives
            if (keyName) {
                const keySpan = document.createElement('span');
                keySpan.className = 'json-key';
                keySpan.textContent = `"${keyName}": `;
                node.appendChild(keySpan);
            }
            const valueSpan = document.createElement('span');
            const type = typeof data;
            valueSpan.className = `json-${type}`;
            if (type === 'string') valueSpan.textContent = `"${data}"`;
            else if (data === null) { valueSpan.textContent = 'null'; valueSpan.className = 'json-null';}
            else valueSpan.textContent = data;
            node.appendChild(valueSpan);
        }
        return node;
    }
    
    function toggleJsonEditMode(editMode, isNewCreation = false) {
        isEditing = editMode;
        isCreatingNew = isNewCreation;

        if (isEditing) {
            jsonDataDisplay.style.display = 'none';
            jsonEditArea.style.display = 'block';
            if (isNewCreation) {
                jsonEditArea.value = JSON.stringify({ "new_entry": "B\"H Starting fresh!" }, null, 4);
            } else {
                jsonEditArea.value = JSON.stringify(currentData, null, 4);
            }
            jsonEditArea.focus();

            editJsonBtn.style.display = 'none';
            deleteEntryBtn.style.display = 'none';
            saveJsonBtn.style.display = isNewCreation ? 'none' : 'inline-block';
            createJsonBtn.style.display = isNewCreation ? 'inline-block' : 'none';
            cancelEditBtn.style.display = 'inline-block';
        } else {
            jsonDataDisplay.style.display = 'block';
            jsonEditArea.style.display = 'none';
            
            editJsonBtn.style.display = 'inline-block';
            deleteEntryBtn.style.display = 'inline-block';
            saveJsonBtn.style.display = 'none';
            createJsonBtn.style.display = 'none';
            cancelEditBtn.style.display = 'none';
            updateEditControls(); // Re-evaluate button states based on auth
        }
    }

    function updateEditControls() {
        const canEdit = isAuthorized && currentData !== null && !currentPath.endsWith('/');
        editJsonBtn.disabled = !canEdit;
        deleteEntryBtn.disabled = !canEdit;
        initiateCreateBtn.disabled = !isAuthorized; // Can create if authorized, even if no file selected
    }

    async function navigateTo(path) {
        showLoading(`NAVIGATING TO ${path.toUpperCase()}`);
        try {
             const response = await fetch(`${API_BASE}?path=${encodeURIComponent(path)}`);
             const data = await response.json();
          
            if (data.error) {
                throw new Error(`Path not found: ${path} (${data.error})`);
            }

            currentPath = path;
            updateBreadcrumbs();

            if (data.directory) {
                currentData = null; // No specific JSON data when viewing a directory
                renderDirectory(data.directory);
                showMessage(`Directory listing for ${path} loaded.`, 'success');
            } else if (data.dynamicEntry) {
                renderJsonViewer(data.dynamicEntry);
                showMessage(`Entry ${path} loaded.`, 'success');
            } else {
                throw new Error('Unknown API response structure.');
            }
        } catch (error) {
            console.error('Navigation Error:', error);
            showMessage(`Error: ${error.message}`, 'error');
            // Optionally, navigate to a "safe" path like root if current path fails badly
            // if (path !== '/') navigateTo('/'); 
        } finally {
            hideLoading();
            updateEditControls();
        }
    }

    async function performApiPost(params) {
        showLoading("TRANSMITTING DATA...");
        try {
            const postPath = currentPath.endsWith('/') ? currentPath + newEntryNameInput.value : currentPath;
            const response = await fetch(`${API_BASE}?path=${encodeURIComponent(postPath)}`, { // Path in GET for POST actions
                method: 'POST',
                 headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                 body: params.toString()
             });
             const result = await response.json();
          


            if (result.status === 'success') {
                showMessage(`${params.get('endpoint')} operation successful!`, 'success');
                return true;
            } else {
                throw new Error(result.message || 'API operation failed.');
            }
        } catch (error) {
            console.error('API POST Error:', error);
            showMessage(`Error: ${error.message}`, 'error');
            return false;
        } finally {
            hideLoading();
        }
    }

    // --- Event Listeners ---
    checkAuthBtn.onclick = async () => {
        showLoading("CHECKING AUTHORIZATION...");
        try {
            const params = new URLSearchParams();
            params.append('authorized', 'true'); // This param name is arbitrary for the check
            
             const response = await fetch(API_BASE, { // No path for auth check
                 method: 'POST',
                 headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                 body: params.toString()
             });
             const result = await response.json();
           

            if (result.status === 'success') {
                isAuthorized = true;
                authIndicator.className = 'authorized';
                showMessage('Authorization successful! Editing enabled.', 'success');
            } else {
                isAuthorized = false;
                authIndicator.className = 'unauthorized';
                showMessage('Authorization failed. Editing disabled.', 'error');
            }
        } catch (error) {
            isAuthorized = false;
            authIndicator.className = 'unauthorized';
            console.error('Auth Check Error:', error);
            showMessage('Error checking authorization.', 'error');
        } finally {
            hideLoading();
            updateEditControls(); // Update buttons based on new auth status
        }
    };

    editJsonBtn.onclick = () => {
        if (isAuthorized && currentData) {
            toggleJsonEditMode(true);
        }
    };

    cancelEditBtn.onclick = () => {
        toggleJsonEditMode(false);
        if (isCreatingNew) { // If cancelling a new creation, go back to directory view
             const parentDir = currentPath.substring(0, currentPath.lastIndexOf('/')+1) || '/';
             navigateTo(parentDir);
        }
    };

    saveJsonBtn.onclick = async () => { // For UPDATE
        if (!isAuthorized) return;
        try {
            const updatedJson = JSON.parse(jsonEditArea.value);
            const params = new URLSearchParams();
            params.append('endpoint', 'update');
            params.append('record', JSON.stringify(updatedJson));

            if (await performApiPost(params)) {
                currentData = updatedJson; // Update local cache
                toggleJsonEditMode(false); // Exit edit mode
                renderJsonViewer(currentData); // Re-render with updated data
            }
        } catch (e) {
            showMessage('Invalid JSON format. Cannot save.', 'error');
        }
    };
    
    createJsonBtn.onclick = async () => { // For CREATE
        if (!isAuthorized) return;
        try {
            const newJson = JSON.parse(jsonEditArea.value);
            const params = new URLSearchParams();
            params.append('endpoint', 'create');
            params.append('record', JSON.stringify(newJson));
            
            const entryName = newEntryNameInput.value.trim();
            if (!entryName || !entryName.endsWith('.awtsmoosJSON')) {
                 showMessage('Invalid new entry name. Must end with .awtsmoosJSON and not be empty.', 'error');
                 return;
            }
            const createPath = (currentPath.endsWith('/') ? currentPath : (currentPath.substring(0, currentPath.lastIndexOf('/')+1) || '/')) + entryName;

            // Use performApiPost with correct path for create
            showLoading("CREATING NEW ENTRY...");
            try {
                 const response = await fetch(`${API_BASE}?path=${encodeURIComponent(createPath)}`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                     body: params.toString()
                 });
                 const result = await response.json();
               

                if (result.status === 'success') {
                    showMessage(`Create operation for ${entryName} successful!`, 'success');
                    toggleJsonEditMode(false);
                    navigateTo(createPath); // Navigate to the new file
                    newEntryNameInput.value = ''; // Clear input
                } else {
                    throw new Error(result.message || 'API create operation failed.');
                }
            } catch (error) {
                console.error('API Create Error:', error);
                showMessage(`Error: ${error.message}`, 'error');
            } finally {
                hideLoading();
            }

        } catch (e) {
            showMessage('Invalid JSON format for new entry. Cannot save.', 'error');
        }
    };


    deleteEntryBtn.onclick = async () => {
        if (!isAuthorized || !currentData || currentPath.endsWith('/')) return;
        if (!confirm(`Are you sure you want to PERMANENTLY DELETE ${currentPath}? This is irreversible!`)) return;

        const params = new URLSearchParams();
        params.append('endpoint', 'delete');
        if (await performApiPost(params)) {
            const parentDir = currentPath.substring(0, currentPath.lastIndexOf('/')+1) || '/';
            navigateTo(parentDir); // Navigate to parent directory after deletion
        }
    };
    
    initiateCreateBtn.onclick = () => {
        if (!isAuthorized) return;
        const entryName = newEntryNameInput.value.trim();
        if (!entryName) {
            showMessage('Please enter a name for the new entry in the field below.', 'error');
            newEntryNameInput.focus();
            return;
        }
        if (!entryName.endsWith('.awtsmoosJSON')) {
            showMessage('New entry name must end with ".awtsmoosJSON"', 'error');
            newEntryNameInput.focus();
            return;
        }
        
        // Switch to JSON view for creation
        directoryView.classList.remove('active-panel');
        jsonViewerContainer.classList.add('active-panel');
        toggleJsonEditMode(true, true); // true for editMode, true for isNewCreation
        showMessage(`Enter JSON data for new entry: ${entryName}`, 'info');
    };


    // --- Initial Load ---
    async function initializeApp() {
        showLoading("INITIALIZING HYPERDRIVE INTERFACE...");
        await checkAuthBtn.onclick(); // Check auth status first
        await navigateTo('/'); // Then load root path
        hideLoading();
    }

    initializeApp();
});