// B"H

/**
 * @file api/ai/modelLoader.js
 * @chapter The Door To A Distant Model
 * @description
 * Resolves local GGUF files and Hugging Face URLs without external libraries.
 * It parses GGUF metadata when bytes are local or explicitly downloaded.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const GGUFParser = require('./utils/gguf/parser.js');

/**
 * @class ModelLoader
 * @description URL/local model manifest loader.
 */
class ModelLoader {
  /**
   * @constructor
   * @param {object} db - Database instance.
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * @method load
   * @param {string} source - Local path or URL.
   * @param {object} [options={}] - Load options.
   * @returns {Promise<object>} Manifest.
   */
  async load(source, options = {}) {
    const manifest = this.resolve(source, options);

    if (manifest.localPath && fs.existsSync(manifest.localPath)) {
      manifest.gguf = this.parseFile(manifest.localPath);
    } else if (options.download && manifest.downloadUrl) {
      manifest.localPath = await this.download(manifest.downloadUrl, options);
      manifest.gguf = this.parseFile(manifest.localPath);
    }

    this.storeManifest(options.name || manifest.name || 'default', manifest);
    return manifest;
  }

  /**
   * @method resolve
   * @param {string} source - Local path or URL.
   * @param {object} options - Options.
   * @returns {object} Manifest.
   */
  resolve(source, options = {}) {
    if (!/^https?:\/\//.test(source)) {
      return {
        source,
        kind: 'local',
        localPath: path.resolve(source),
        name: options.name || path.basename(source)
      };
    }

    const url = new URL(source);
    const parts = url.pathname.split('/').filter(Boolean);
    const hf = url.hostname === 'huggingface.co' && parts.length >= 2;
    const manifest = {
      source,
      kind: hf ? 'huggingface' : 'url',
      name: options.name || parts[1] || path.basename(url.pathname),
      downloadUrl: source
    };

    if (hf && parts[2] === 'tree') {
      const repo = `${parts[0]}/${parts[1]}`;
      const branch = parts[3] || 'main';
      const file = options.file || options.filename || 'bge-small-en-v1.5-q8_0.gguf';
      manifest.repo = repo;
      manifest.branch = branch;
      manifest.apiUrl = `https://huggingface.co/api/models/${repo}`;
      manifest.downloadUrl = `https://huggingface.co/${repo}/resolve/${branch}/${file}`;
    }

    return manifest;
  }

  /**
   * @method parseFile
   * @param {string} filePath - GGUF path.
   * @returns {object} Parsed summary.
   */
  parseFile(filePath) {
    const buffer = fs.readFileSync(filePath);
    const parsed = GGUFParser.parse(buffer);
    return {
      kv: parsed.kv,
      tensorCount: parsed.tensorMap.size,
      tensors: Array.from(parsed.tensorMap.values()).map(t => ({
        name: t.name,
        dims: t.dims,
        type: t.type,
        dataOffset: t.dataOffset
      })),
      vocabSize: parsed.vocab ? parsed.vocab.length : 0
    };
  }

  /**
   * @method download
   * @param {string} url - Download URL.
   * @param {object} options - Options.
   * @returns {Promise<string>} Local path.
   */
  download(url, options = {}) {
    const dir = options.cacheDir || path.join(path.dirname(this.db.pager.filePath), '.awtsmoos_ai_cache');
    fs.mkdirSync(dir, { recursive: true });
    const out = path.join(dir, options.file || path.basename(new URL(url).pathname));

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(out);
      https.get(url, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.rmSync(out, { force: true });
          this.download(res.headers.location, { ...options, cacheDir: dir }).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.rmSync(out, { force: true });
          reject(new Error(`B"H: model download failed with HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(out)));
      }).on('error', err => {
        file.close();
        fs.rmSync(out, { force: true });
        reject(err);
      });
    });
  }

  /**
   * @method storeManifest
   * @param {string} name - Model name.
   * @param {object} manifest - Manifest.
   * @returns {void}
   */
  storeManifest(name, manifest) {
    this.db.root.__ai_models__ = this.db.root.__ai_models__ || {};
    this.db.root.__ai_models__[name] = {
      source: manifest.source,
      kind: manifest.kind,
      localPath: manifest.localPath || null,
      downloadUrl: manifest.downloadUrl || null,
      gguf: manifest.gguf ? {
        tensorCount: manifest.gguf.tensorCount,
        vocabSize: manifest.gguf.vocabSize
      } : null
    };
  }
}

module.exports = ModelLoader;
