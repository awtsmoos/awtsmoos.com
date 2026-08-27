// B"H

/**
 * Legacy drag/drop workspace kept class-driven so it cannot fight the shell.
 */
export class Workspace {
  constructor(app) {
    this.app = app;
    this.state = app.state;
    this.scripts = [];
    this.isExecuting = false;
  }

  render() {
    return `
      <div class="legacy-workspace-container">
        <div class="legacy-workspace-toolbar">
          <button id="run-script-btn" class="btn btn-sm btn-primary">RUN_SEQUENCE</button>
          <button id="clear-script-btn" class="btn btn-sm">CLEAR</button>
          <div class="legacy-workspace-spacer"></div>
          <span class="time-display legacy-workspace-count">SHARDS: <span id="shard-count">0</span></span>
        </div>
        <div id="workspace" class="workspace-dropzone legacy-workspace-dropzone">
          <div id="dropped-blocks" class="legacy-dropped-blocks"></div>
        </div>
      </div>
    `;
  }

  attach(container) {
    const ws = container.querySelector('#workspace');
    const dropped = container.querySelector('#dropped-blocks');
    const runBtn = container.querySelector('#run-script-btn');
    const clearBtn = container.querySelector('#clear-script-btn');
    const shardCount = container.querySelector('#shard-count');
    if (!ws || !dropped || !runBtn || !clearBtn || !shardCount) return;

    ws.addEventListener('dragover', e => {
      e.preventDefault();
      ws.classList.add('drag-over');
    });
    ws.addEventListener('dragleave', () => ws.classList.remove('drag-over'));
    ws.addEventListener('drop', e => this.handleDrop(e, ws, dropped, shardCount));
    runBtn.addEventListener('click', () => this.executeScript());
    clearBtn.addEventListener('click', () => this.clear(dropped, shardCount));
  }

  handleDrop(event, workspace, dropped, shardCount) {
    event.preventDefault();
    workspace.classList.remove('drag-over');
    const rawData = event.dataTransfer.getData('block-data');
    if (!rawData || rawData === 'undefined') return;

    try {
      this.addShard(JSON.parse(rawData), dropped, shardCount);
    } catch (err) {
      console.error('Failed to parse shard data:', err);
    }
  }

  clear(dropped, shardCount) {
    this.scripts = [];
    dropped.innerHTML = '';
    shardCount.innerText = '0';
  }

  addShard(data, container, countEl) {
    this.scripts.push(data);
    const block = document.createElement('div');
    block.className = 'block-item legacy-shard-item';
    block.innerHTML = `
      <div class="block-icon legacy-shard-icon"></div>
      <span class="block-label legacy-shard-label">${data.key.toUpperCase()}</span>
      <span class="legacy-shard-arrow">➔</span>
      <span class="legacy-shard-value">${data.value}</span>
    `;
    container.appendChild(block);
    countEl.innerText = this.scripts.length;
  }

  async executeScript() {
    if (this.isExecuting) return;
    this.isExecuting = true;

    for (const shard of this.scripts) {
      await this.executeShard(shard);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.isExecuting = false;
  }

  async executeShard(shard) {
    if (shard.type === 'director') return this.app.director.play(shard.sequence);
    if (shard.isGlobal) return this.state.set(shard.key, shard.value);

    const rawChar = this.state.get('character');
    if (!rawChar) return;
    const charData = JSON.parse(JSON.stringify(rawChar));

    if (shard.isArrayPush) {
      if (!Array.isArray(charData[shard.key])) charData[shard.key] = [];
      charData[shard.key].push(shard.value);
    } else if (shard.key === 'skin') {
      charData.colors.skin = shard.value;
    } else {
      charData[shard.key] = shard.value;
    }

    this.state.set('character', charData);
  }
}
