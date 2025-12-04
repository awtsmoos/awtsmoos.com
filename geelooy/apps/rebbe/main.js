//B"H
import { playTrack, togglePlay, initAudioContext } from './audio.js';

const YEARS = {
  "5739": "5739-1764805608",
  "5748": "5748-1764805608",
  "5738": "5738-1764805608",
  "5736": "5736-1764805608",
  "5737": "5737-1764805608",
  "5732": "5732-1764805608",
  "5735": "5735-1764805608",
  "5730": "5730-1764805608",
  "5733": "5733-1764805608",
  "5734": "5734-1764805608",
  "5743": "5743-1764759611",
  "5747": "5747-1764759611",
  "5742": "5742-1764759611",
  "5741": "5741-1764759611",
  "5740": "5740-1764759611"
};

// IndexedDB Setup
const DB_NAME = "AwtsmoosArchiveDB";
const STORE_NAME = "files";
let db;

function initDB() {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
  };
  request.onsuccess = (event) => {
    db = event.target.result;
  };
}

initDB();

async function saveFile(id, blob) {
  if (!db) return;
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put({ id, blob, date: new Date() });
}

async function getFile(id) {
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result ? req.result.blob : null);
    req.onerror = () => resolve(null);
  });
}

// State
let appState = {
  currentYearId: null,
  folders: {}, // cache
  currentFolder: null,
  tracks: [],
  currentTrackIndex: -1
};

// DOM Elements
const els = {
  yearList: document.getElementById('year-list'),
  folderPanel: document.getElementById('folder-panel'),
  folderList: document.getElementById('folder-list'),
  trackPanel: document.getElementById('track-panel'),
  trackList: document.getElementById('track-list'),
  trackName: document.getElementById('current-track-name'),
  dlBtn: document.getElementById('download-folder-btn'),
  status: document.getElementById('player-status'),
  layoutToggle: document.getElementById('layout-toggle')
};

// Initialization
function init() {
  renderYears();
  setupEventListeners();
}

function renderYears() {
  const sortedYears = Object.keys(YEARS).sort((a, b) => b.localeCompare(a));
  els.yearList.innerHTML = sortedYears.map(year => `
    <div class="list-item year-item" data-year="${year}" data-id="${YEARS[year]}">
      <span class="year-label">${year}</span>
      <span style="font-size:0.7em; color:var(--text-dim)">${YEARS[year]}</span>
    </div>
  `).join('');

  document.querySelectorAll('.year-item').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.year-item').forEach(i => i.classList.remove('active'));
      el.classList.add('active');
      loadYear(el.dataset.year, el.dataset.id);
    });
  });
}

async function loadYear(year, id) {
  appState.currentYearId = id;
  els.status.innerText = `LOADING ${year}...`;
  
  // Show folder panel
  els.folderPanel.classList.add('expanded');
  els.folderList.innerHTML = '<div style="padding:20px; color:var(--neon-blue)">FETCHING ARCHIVE DATA...</div>';

  try {
    const response = await fetch(`https://archive.org/metadata/${id}`);
    const data = await response.json();
    
    // Process files into folders
    const folderMap = {};
    
    data.files.forEach(file => {
      if (file.format === "VBR MP3" || file.format === "MP3" || file.name.endsWith('.mp3') || file.name.endsWith('.opus')) {
        const parts = file.name.split('/');
        if (parts.length > 1) {
          const folderName = parts[0];
          if (!folderMap[folderName]) folderMap[folderName] = [];
          folderMap[folderName].push({
            name: parts.slice(1).join('/'),
            path: file.name,
            size: file.size,
            url: `https://archive.org/download/${id}/${file.name}`
          });
        }
      }
    });

    appState.folders = folderMap;
    renderFolders(folderMap);
    els.status.innerText = `READY // ${year}`;
  } catch (e) {
    els.status.innerText = 'ERROR LOADING DATA';
    els.folderList.innerHTML = '<div style="padding:20px; color:red">CONNECTION FAILED</div>';
    console.error(e);
  }
}

function renderFolders(folderMap) {
  const folders = Object.keys(folderMap).sort();
  els.folderList.innerHTML = folders.map(f => `
    <div class="list-item folder-item" data-folder="${f}">
      <div>${f}</div>
      <div style="font-size:0.7em; color:var(--text-dim)">${folderMap[f].length} Tracks</div>
    </div>
  `).join('');

  document.querySelectorAll('.folder-item').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.folder-item').forEach(i => i.classList.remove('active'));
      el.classList.add('active');
      loadFolder(el.dataset.folder);
    });
  });
}

function loadFolder(folderName) {
  appState.currentFolder = folderName;
  appState.tracks = appState.folders[folderName].sort((a,b) => a.name.localeCompare(b.name));
  
  els.trackPanel.classList.add('expanded');
  els.dlBtn.style.display = 'block';
  
  renderTracks();
}

function renderTracks() {
  els.trackList.innerHTML = appState.tracks.map((t, i) => `
    <div class="list-item track-item ${i === appState.currentTrackIndex ? 'active' : ''}" data-index="${i}">
      <div class="track-name">${t.name}</div>
      <div class="track-actions">
        <button class="icon-btn download-single" data-idx="${i}" title="Download">⬇</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.track-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if(e.target.closest('.download-single')) return; // handled separately
      document.querySelectorAll('.track-item').forEach(i => i.classList.remove('active'));
      el.classList.add('active');
      const idx = parseInt(el.dataset.index);
      playTrackAtIndex(idx);
    });
  });

  document.querySelectorAll('.download-single').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx);
      const track = appState.tracks[idx];
      btn.innerText = '...';
      try {
        const b = await downloadTrack(track.url);
        await saveFile(track.path, b);
        btn.innerText = '✓';
        btn.parentElement.parentElement.classList.add('downloaded');
      } catch(err) {
        btn.innerText = '✖';
      }
    });
  });
}

function playTrackAtIndex(index) {
  if (index < 0 || index >= appState.tracks.length) return;
  
  initAudioContext(); // Ensure context is started on user interaction
  
  appState.currentTrackIndex = index;
  const track = appState.tracks[index];
  
  els.trackName.innerText = track.name;
  
  // Highlight active
  document.querySelectorAll('.track-item').forEach((el, i) => {
    if (i === index) el.classList.add('active');
    else el.classList.remove('active');
  });

  // Check if downloaded
  getFile(track.path).then(blob => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      playTrack(url, true); // true = isBlob
    } else {
      playTrack(track.url, false);
    }
  });
}

async function downloadTrack(url) {
  const resp = await fetch(url);
  return await resp.blob();
}

// Global Exports for audio.js to call
window.nextTrack = () => {
  if (appState.currentTrackIndex < appState.tracks.length - 1) {
    playTrackAtIndex(appState.currentTrackIndex + 1);
  }
};

window.prevTrack = () => {
  if (appState.currentTrackIndex > 0) {
    playTrackAtIndex(appState.currentTrackIndex - 1);
  }
};

function setupEventListeners() {
  document.getElementById('btn-play').onclick = () => {
    initAudioContext();
    togglePlay();
  };
  
  document.getElementById('btn-next').onclick = window.nextTrack;
  document.getElementById('btn-prev').onclick = window.prevTrack;
  
  document.querySelectorAll('.close-panel').forEach(btn => {
    btn.onclick = (e) => {
      e.target.closest('.panel').classList.remove('expanded');
    };
  });

  // Layout Toggle for Mobile
  els.layoutToggle.onclick = () => {
    // Reset view
    els.folderPanel.classList.remove('expanded');
    els.trackPanel.classList.remove('expanded');
  };

  // Bulk Download
  els.dlBtn.onclick = async () => {
    if(!appState.currentFolder) return;
    const btn = els.dlBtn;
    const originalText = btn.innerText;
    
    btn.innerText = "DOWNLOADING...";
    const tracks = appState.tracks;
    
    for(let i=0; i<tracks.length; i++) {
      btn.innerText = `DL ${i+1}/${tracks.length}`;
      try {
        const blob = await downloadTrack(tracks[i].url);
        await saveFile(tracks[i].path, blob);
        // Mark visual
        const item = document.querySelector(`.track-item[data-index="${i}"]`);
        if(item) item.classList.add('downloaded');
      } catch(e) {
        console.error(e);
      }
    }
    btn.innerText = "COMPLETE ✓";
    setTimeout(() => btn.innerText = originalText, 3000);
  };
}

init();