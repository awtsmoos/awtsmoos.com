// B"H
const { eventBus } = require("./events.js");

function createBrowserContext(page) {
  const context = { _pages: [page], _cookies: [], _permissions: [] };
  Object.assign(context, eventBus());
  context.newPage = async () => page;
  context.pages = () => context._pages;
  context.close = async () => context.emit("close");
  context.cookies = async () => context._cookies;
  context.addCookies = async cookies => context._cookies.push(...(cookies || []));
  context.clearCookies = async () => { context._cookies = []; };
  context.grantPermissions = async perms => context._permissions.push(...(perms || []));
  context.clearPermissions = async () => { context._permissions = []; };
  context.storageState = async () => ({ cookies: context._cookies, origins: [] });
  return context;
}
module.exports = { createBrowserContext };
