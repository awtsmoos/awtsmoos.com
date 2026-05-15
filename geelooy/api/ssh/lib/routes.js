// B"H

"use strict";

const { withClient } = require("./client.js");
const { execCommand, removePath } = require("./commands.js");
const { bodyOf, connectionConfig, requiredBody } = require("./request.js");
const { ok, fail } = require("./responses.js");
const { call } = require("./callbacks.js");
const {
  listFolder,
  readFile,
  withSftp,
  writeFile,
} = require("./sftpFiles.js");

/**
 * Wraps a route handler with normalized success/failure response handling.
 *
 * @param {Function} handler - Raw route handler.
 * @returns {Function} Awtsmoos route handler.
 */
function route(handler) {
  return async (vars) => {
    try {
      return ok(await handler(vars || {}));
    } catch (error) {
      return fail(error);
    }
  };
}

/**
 * Builds all SSH API routes for the Awtsmoos dynamic route system.
 *
 * @param {object} $i - The Awtsmoos template object.
 * @returns {object} Route map.
 */
function buildRoutes($i) {
  const usingClient = (vars, task) => withClient(connectionConfig($i, vars), task);
  const usingSftp = (vars, task) => usingClient(vars, (client) => withSftp(client, task));

  return {
    "/connect/:username/:host": route(async (vars) => {
      await usingClient(vars, async () => null);
      return { message: "Connection successful!" };
    }),

    "/execute/:username/:host": route(async (vars) => {
      const command = requiredBody($i, "command");
      const body = bodyOf($i);
      const result = await usingClient(vars, (client) => execCommand(client, command, {
        input: body.input,
        pty: body.pty,
        env: body.env || {},
      }));
      return { result };
    }),

    "/getFolderList/:username/:host": route(async (vars) => {
      const body = bodyOf($i);
      const files = await usingSftp(vars, (sftp) => listFolder(sftp, body.folderPath || "."));
      return { files };
    }),

    "/getFileContent/:username/:host": route(async (vars) => {
      const filePath = requiredBody($i, "filePath");
      const content = await usingSftp(vars, (sftp) => readFile(sftp, filePath));
      return { content };
    }),

    "/writeFile/:username/:host": route(async (vars) => {
      const filePath = requiredBody($i, "filePath");
      const content = bodyOf($i).content || "";
      const result = await usingSftp(vars, (sftp) => writeFile(sftp, filePath, content));
      return { ...result, message: "File written." };
    }),

    "/makeFolder/:username/:host": route(async (vars) => {
      const folderPath = requiredBody($i, "folderPath");
      await usingSftp(vars, (sftp) => call((cb) => sftp.mkdir(folderPath, cb)));
      return { message: `Folder created at ${folderPath}` };
    }),

    "/deleteAtPath/:username/:host": route(async (vars) => {
      const deletePath = requiredBody($i, "deletePath");
      await usingClient(vars, (client) => removePath(client, deletePath));
      return { message: `Deleted path ${deletePath}` };
    }),

    "/stat/:username/:host": route(async (vars) => {
      const path = requiredBody($i, "path");
      const attrs = await usingSftp(vars, (sftp) => call((cb) => sftp.stat(path, cb)));
      return { attrs };
    }),

    "/rename/:username/:host": route(async (vars) => {
      const oldPath = requiredBody($i, "oldPath");
      const newPath = requiredBody($i, "newPath");
      await usingSftp(vars, (sftp) => call((cb) => sftp.rename(oldPath, newPath, cb)));
      return { message: "Path renamed." };
    }),

    "/chmod/:username/:host": route(async (vars) => {
      const path = requiredBody($i, "path");
      const mode = Number(requiredBody($i, "mode"));
      await usingSftp(vars, (sftp) => call((cb) => sftp.chmod(path, mode, cb)));
      return { message: "Mode changed." };
    }),

    "/realpath/:username/:host": route(async (vars) => {
      const path = requiredBody($i, "path");
      const resolved = await usingSftp(vars, (sftp) => call((cb) => sftp.realpath(path, cb)));
      return { path: resolved };
    }),
  };
}

module.exports = { buildRoutes };
