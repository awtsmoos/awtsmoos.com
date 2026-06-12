// B"H
/**
 * @file DosDB/index.js
 * @chapter The Old Forest And The New Ark Learned The Same Mutation Prayers
 * @description
 * DosDB remains the old filesystem-backed key/value tree, but narrow heichel
 * social paths can also route into real AwtsmoosDB VirtualFs vessels. This file
 * routes reads, writes, object-key mutations, and array-at-key mutations before
 * falling back to legacy files, so migrated comments are read and written from
 * the same v3 comments DB.
 */

const fsRegular = require("fs");
const fs = fsRegular.promises;
const path = require("path");
const util = require("util");
const readdir = util.promisify(fs.readdir);
const stat = fs.stat;
const awtsmoosBinary = require("./awtsmoosBinary/awtsmoosBinaryJSON/index.js");
const writeMethods = require("./methods/write.js");
const readMethods = require("./methods/read.js");
const arrayMethods = require("./methods/array.js");
const objMethods = require("./methods/obj.js");
const pathMethods = require("./methods/path.js");
const directoryMethods = require("./methods/directory.js");
const firebaseMethods = require("./methods/firebaseMethods.js");
const awtsmoosMerge = require("./utils/awtsmoosMerge.js");
const { AwtsmoosDB, createAwtsmoosDb } = require("./awtsmoosDbBridge.js");
const { AwtsmoosDbFsRouter } = require("./awtsmoosDbFsAdapter.js");

function bindMethodBag(instance, methods) { awtsmoosMerge(instance, methods); }
function maybeResult(value) { return value !== undefined && value !== null; }

class DosDB {
  readAwtsmoosBinary = true;

  constructor(directory) {
    bindMethodBag(this, writeMethods);
    bindMethodBag(this, readMethods);
    bindMethodBag(this, pathMethods);
    bindMethodBag(this, arrayMethods);
    bindMethodBag(this, directoryMethods);
    bindMethodBag(this, objMethods);
    bindMethodBag(this, firebaseMethods);
    this.awtsmoosBinary = awtsmoosBinary;
    this.directory = this.sanitizeAwtsmoosPath(directory || "../");
    this.installAwtsmoosDbFsRouter();
  }

  installAwtsmoosDbFsRouter() {
    if (this.__awtsmoosDbFsRouterInstalled) return;
    this.__awtsmoosDbFsRouterInstalled = true;
    this.__awtsmoosDbFsRouter = new AwtsmoosDbFsRouter(this);
    const legacy = {
      get: this.get?.bind(this),
      read: this.read?.bind(this),
      write: this.write?.bind(this),
      delete: this.delete?.bind(this),
      rename: this.rename?.bind(this),
      getObjectKeys: this.getObjectKeys?.bind(this),
      syncKeyInObj: this.syncKeyInObj?.bind(this),
      syncKeyInArray: this.syncKeyInArray?.bind(this),
      appendToObj: this.appendToObj?.bind(this),
      updateEntry: this.updateEntry?.bind(this),
      appendToArrayAtKey: this.appendToArrayAtKey?.bind(this),
      setObjectKey: this.setObjectKey?.bind(this),
      getObjectKey: this.getObjectKey?.bind(this),
      deleteObjectKey: this.deleteObjectKey?.bind(this),
      deleteEntry: this.deleteEntry?.bind(this)
    };
    this.__legacyDosDbMethods = legacy;

    this.get = async (id, options = {}) => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("get", id, options);
      return maybeResult(routed) ? routed : legacy.get(id, options);
    };
    this.read = async (id, options = {}) => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("get", id, options);
      return maybeResult(routed) ? routed : legacy.read(id, options);
    };
    this.write = async (id, record, opts = {}) => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("write", id, record, opts);
      return maybeResult(routed) ? routed : legacy.write(id, record, opts);
    };
    this.delete = async (id, recursive = false) => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("delete", id, recursive);
      return maybeResult(routed) ? routed : legacy.delete(id, recursive);
    };
    this.rename = async (oldId, newId) => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("rename", oldId, newId);
      return maybeResult(routed) ? routed : legacy.rename(oldId, newId);
    };
    this.getObjectKeys = async id => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("getObjectKeys", id);
      return maybeResult(routed) ? routed : legacy.getObjectKeys(id);
    };
    this.syncKeyInObj = async (id, key, value = true) => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("syncKeyInObj", id, key, value);
      return maybeResult(routed) ? routed : legacy.syncKeyInObj(id, key, value);
    };
    this.syncKeyInArray = async (id, value) => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("syncKeyInArray", id, value);
      return maybeResult(routed) ? routed : legacy.syncKeyInArray(id, value);
    };
    this.appendToObj = async (id, payload = {}) => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("appendToObj", id, payload);
      return maybeResult(routed) ? routed : legacy.appendToObj(id, payload);
    };
    this.updateEntry = async (id, payload = {}) => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("updateEntry", id, payload);
      return maybeResult(routed) ? routed : legacy.updateEntry(id, payload);
    };
    this.appendToArrayAtKey = async (id, payload = {}) => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("appendToArrayAtKey", id, payload);
      return maybeResult(routed) ? routed : legacy.appendToArrayAtKey(id, payload);
    };
    this.setObjectKey = async (id, key, value) => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("setObjectKey", id, key, value);
      return maybeResult(routed) ? routed : legacy.setObjectKey(id, key, value);
    };
    this.getObjectKey = async (id, key) => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("getObjectKey", id, key);
      if (maybeResult(routed)) return routed;
      const value = await this.get(id, { propertyMap: { [key]: true } });
      if (value && typeof value === "object" && key in value) return value[key];
      return legacy.getObjectKey(id, key);
    };
    this.deleteObjectKey = async (id, key) => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("deleteObjectKey", id, key);
      return maybeResult(routed) ? routed : legacy.deleteObjectKey(id, key);
    };
    this.deleteEntry = async (id, key) => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("deleteObjectKey", id, key);
      return maybeResult(routed) ? routed : legacy.deleteEntry(id, key);
    };
  }

  async init() { await fs.mkdir(this.directory, { recursive: true }); }

  awtsmoosDb(filePath, options = {}) { return createAwtsmoosDb(filePath, options, this); }

  closeAwtsmoosDbFsRouter() { this.__awtsmoosDbFsRouter?.close?.(); }

  async info(pathToInspect, order = "asc") {
    const stats = await stat(pathToInspect);
    if (stats.isDirectory()) {
      let files = await readdir(pathToInspect);
      files.sort();
      if (order === "desc") files.reverse();
      return files.slice(0, 10);
    }
    if (stats.isFile()) {
      const parts = pathToInspect.split("/");
      parts.pop();
      if (order === "desc") parts.reverse();
      return parts;
    }
    return [];
  }

  async readAllFiles(dir) {
    let results = [];
    const list = await fs.readdir(dir);
    for (const file of list) {
      const filePath = path.resolve(dir, file);
      const fileStat = await fs.stat(filePath);
      if (fileStat && fileStat.isDirectory()) results = results.concat(await this.readAllFiles(filePath));
      else results.push({ path: filePath, data: await fs.readFile(filePath) });
    }
    return results;
  }

  async exportDatabase() {
    const allFiles = await this.readAllFiles(this.directory);
    const fileData = Buffer.from(JSON.stringify(allFiles));
    await fs.writeFile(path.join(this.directory, "db_export.bin"), fileData);
  }

  async importDatabase() {
    const fileData = await fs.readFile(path.join(this.directory, "db_export.bin"));
    const allFiles = JSON.parse(fileData.toString());
    for (const file of allFiles) {
      await this.ensureDir(file.path);
      await fs.writeFile(file.path, file.data);
    }
  }
}

DosDB.AwtsmoosDB = AwtsmoosDB;
DosDB.awtsmoosDb = function awtsmoosDb(filePath, options = {}) { return createAwtsmoosDb(filePath, options, null); };
DosDB.createAwtsmoosDb = DosDB.awtsmoosDb;

module.exports = DosDB;
