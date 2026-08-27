// B"H

"use strict";

/**
 * Reads the request body object exposed by the Awtsmoos dynamic server.
 *
 * @param {object} $i - The Awtsmoos template object.
 * @returns {object} The body object, or an empty object.
 */
function bodyOf($i) {
  return $i.$_POST || $i.$_PUT || $i.$_DELETE || $i.$_GET || {};
}

/**
 * Builds SSH connection config from route variables and request body.
 *
 * @param {object} $i - The Awtsmoos template object.
 * @param {object} vars - Dynamic route variables.
 * @returns {object} KeterClient connection config.
 */
function connectionConfig($i, vars) {
  const body = bodyOf($i);
  const username = vars.username || body.username;
  const host = vars.host || body.host;
  const password = body.password;
  const port = Number(body.port || vars.port || 22);

  if (!username) throw new Error("username is required.");
  if (!host) throw new Error("host is required.");
  if (!password && !body.privateKey) {
    throw new Error("password or privateKey is required.");
  }

  const privateKey = body.privateKey
    ? (body.passphrase ? { key: body.privateKey, passphrase: body.passphrase } : body.privateKey)
    : null;

  return {
    username,
    host,
    port,
    password,
    privateKey,
  };
}

/**
 * Pulls a required body field.
 *
 * @param {object} $i - The Awtsmoos template object.
 * @param {string} name - The field name.
 * @returns {*} The body value.
 */
function requiredBody($i, name) {
  const body = bodyOf($i);
  const value = body[name];
  if (value === undefined || value === null || value === "") {
    throw new Error(`${name} is required.`);
  }
  return value;
}

module.exports = {
  bodyOf,
  connectionConfig,
  requiredBody,
};
