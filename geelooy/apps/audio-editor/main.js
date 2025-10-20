//B"H

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileInput = document.getElementById('audio-file-input');
    const trimmerSection = document.getElementById('trimmer-section');
    const uploadSection = document.getElementById('upload-section');
    const canvas = document.getElementById('waveform-canvas');
    const ctx = canvas.getContext('2d');
    const audioPlayer = document.getElementById('audio-player');
    const startHandle = document.getElementById('start-handle');
    const endHandle = document.getElementById('end-handle');
    const selectionOverlay = document.getElementById('selection-overlay');
    const exportButton = document.getElementById('export-button');
    const statusMessage = document.getElementById('status-message');
    const zoomSlider = document.getElementById('zoom-slider');

    // State
    let audioContext;
    let originalBuffer;
    let originalFileName = '';
    let startRatio = 0; // 0 to 1
    let endRatio = 1;   // 0 to 1
    let zoomLevel = 1;
    let panOffset = 0; // In pixels

    let activeDrag = null; // 'start', 'end', 'pan'
    let dragStartX = 0;

    // Worker
    const trimWorker = new Worker('trim-worker.js');

    // --- Event Listeners ---
    fileInput.addEventListener('change', handleFileSelect);
    exportButton.addEventListener('click', handleExport);
    zoomSlider.addEventListener('input', () => {
        zoomLevel = parseFloat(zoomSlider.value);
        panOffset = 0; // Reset pan on zoom change
        drawWaveform();
        updateHandlesAndOverlay();
    });

    // Dragging and Interaction Listeners for Mouse
    canvas.parentElement.addEventListener('mousedown', handlePanStart);
    startHandle.addEventListener('mousedown', (e) => handleDragStart(e, 'start'));
    endHandle.addEventListener('mousedown', (e) => handleDragStart(e, 'end'));
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);

    // Touch equivalents (FIXED)
    // We now pass the full event `e` and use `{ passive: false }` to allow preventDefault.
    canvas.parentElement.addEventListener('touchstart', handlePanStart, { passive: false });
    startHandle.addEventListener('touchstart', (e) => handleDragStart(e, 'start'), { passive: false });
    endHandle.addEventListener('touchstart', (e) => handleDragStart(e, 'end'), { passive: false });
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
    
    // Worker message handling
    trimWorker.onmessage = (e) => {
        const { type, payload } = e.data;
        if (type === 'TRIM_COMPLETE') {
            downloadBlob(payload.blob, payload.fileName);
            statusMessage.textContent = 'Download complete!';
            exportButton.disabled = false;
        } else if (type === 'ERROR') {
            statusMessage.textContent = `Error: ${payload.message}`;
            exportButton.disabled = false;
        }
    };

    // --- Core Functions ---

    async function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        originalFileName = file.name.split('.').slice(0, -1).join('.');
        statusMessage.textContent = 'Loading audio...';
        
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const arrayBuffer = await file.arrayBuffer();
            originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

            audioPlayer.src = URL.createObjectURL(file);
            trimmerSection.classList.remove('hidden');
            uploadSection.classList.add('hidden');
            exportButton.disabled = false;
            
            statusMessage.textContent = 'Audio loaded. Ready to trim.';
            drawWaveform();
            updateHandlesAndOverlay();
        } catch (error) {
            statusMessage.textContent = `Error decoding audio file: ${error.message}`;
            console.error(error);
        }
    }

    function drawWaveform() {
        if (!originalBuffer) return;

        const data = originalBuffer.getChannelData(0);
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = '#1a73e8';

        const visibleWidth = canvasWidth / zoomLevel;
        const startIndex = Math.floor(panOffset * (data.length / canvasWidth));
        const endIndex = Math.floor((panOffset + visibleWidth) * (data.length / canvasWidth));
        
        const effectiveDataLength = endIndex - startIndex;
        const step = Math.ceil(effectiveDataLength / canvasWidth);

        for (let i = 0; i < canvasWidth; i++) {
            let min = 1.0;
            let max = -1.0;
            const dataIndexStart = startIndex + (i * (effectiveDataLength / canvasWidth));

            for (let j = 0; j < step; j++) {
                const sample = data[Math.floor(dataIndexStart + j)];
                if (sample < min) min = sample;
                if (sample > max) max = sample;
            }

            const y = (1 + min) * (canvasHeight / 2);
            const height = Math.max(1, (max - min) * (canvasHeight / 2));
            ctx.fillRect(i, y, 1, height);
        }
    }

    function updateHandlesAndOverlay() {
        const containerWidth = canvas.parentElement.offsetWidth;

        const visibleStartRatio = panOffset / (containerWidth * zoomLevel);
        const visibleEndRatio = (panOffset + containerWidth) / (containerWidth * zoomLevel);

        const displayStart = ((startRatio - visibleStartRatio) / (visibleEndRatio - visibleStartRatio)) * 100;
        const displayEnd = ((endRatio - visibleStartRatio) / (visibleEndRatio - visibleStartRatio)) * 100;
        
        startHandle.style.left = `${displayStart}%`;
        endHandle.style.left = `${displayEnd}%`;
        selectionOverlay.style.left = `${displayStart}%`;
        selectionOverlay.style.width = `${displayEnd - displayStart}%`;
    }
    
    // --- Drag and Pan Logic ---

    // (FIXED) Helper function to get the correct clientX from mouse or touch events
    function getClientX(e) {
        return e.touches ? e.touches[0].clientX : e.clientX;
    }

    function handleDragStart(e, handle) {
        e.preventDefault(); // Now this will work for both touch and mouse events
        activeDrag = handle;
        dragStartX = getClientX(e); // Use helper function
    }

    function handlePanStart(e) {
        if (e.target.classList.contains('trim-handle')) return;
        e.preventDefault(); // Now this will work for both touch and mouse events
        activeDrag = 'pan';
        dragStartX = getClientX(e); // Use helper function
        canvas.parentElement.style.cursor = 'grabbing';
    }

    function handleDragMove(e) {
        if (!activeDrag) return;
        e.preventDefault(); // Now this will work for both touch and mouse events

        const currentX = getClientX(e); // Use helper function
        const dx = currentX - dragStartX;
        const containerWidth = canvas.parentElement.offsetWidth;
        const deltaRatio = dx / (containerWidth * zoomLevel);

        if (activeDrag === 'start') {
            const newStartRatio = startRatio + deltaRatio;
            // Clamp the value between 0 and the end handle's position
            startRatio = Math.max(0, Math.min(newStartRatio, endRatio - 0.0001));
        } else if (activeDrag === 'end') {
            const newEndRatio = endRatio + deltaRatio;
             // Clamp the value between the start handle's position and 1
            endRatio = Math.max(startRatio + 0.0001, Math.min(newEndRatio, 1));
        } else if (activeDrag === 'pan') {
            const maxPan = containerWidth * (zoomLevel - 1);
            panOffset = Math.max(0, Math.min(maxPan, panOffset - dx));
            drawWaveform();
        }

        dragStartX = currentX; // Update position for next movement delta
        updateHandlesAndOverlay();
        updateAudioPlayerTime();
    }

    function handleDragEnd() {
        activeDrag = null;
        canvas.parentElement.style.cursor = 'ew-resize';
    }
    
    function updateAudioPlayerTime() {
        const clipStartTime = startRatio * originalBuffer.duration;
        audioPlayer.currentTime = clipStartTime;
    }

    // --- Export Logic ---

    function handleExport() {
        const selectedFormats = [...document.querySelectorAll('input[name="format"]:checked')].map(cb => cb.value);
        if (selectedFormats.length === 0 || !originalBuffer) {
            statusMessage.textContent = 'Please select at least one format to export.';
            return;
        }

        exportButton.disabled = true;
        statusMessage.textContent = 'Preparing audio for export...';

        const startTime = startRatio * originalBuffer.duration;
        const endTime = endRatio * originalBuffer.duration;

        // Extract channel data to send to worker
        const channelData = [];
        for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
            channelData.push(originalBuffer.getChannelData(i));
        }

        trimWorker.postMessage({
            type: 'TRIM_AUDIO',
            payload: {
                channelData,
                sampleRate: originalBuffer.sampleRate,
                startTime,
                endTime,
                formats: selectedFormats,
                originalFileName,
            }
        });
    }

    function downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Initial draw on resize
    window.addEventListener('resize', () => {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        drawWaveform();
        updateHandlesAndOverlay();
    });
    
    // Set initial canvas size
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
});