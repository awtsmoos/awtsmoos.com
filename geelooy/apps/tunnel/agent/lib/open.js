
// B"H
const childProcess = require("child_process");

function openUrl(url) {
  try {
    if (process.platform === "win32") {
      childProcess.spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
    } else if (process.platform === "darwin") {
      childProcess.spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
    } else {
      childProcess.spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
    }

    return true;
  } catch (e) {
    return false;
  }
}

function openHostedControl(config) {
  return openUrl(
    "https://awtsmoos.com/apps/tunnel-control" +
    "?tunnelName=" + encodeURIComponent(config.tunnelName)
  );
}

function openSystemExplorer(target) {
  if (process.platform === "win32") {
    childProcess.spawn("explorer.exe", [target], { detached: true, stdio: "ignore" }).unref();
    return true;
  }

  if (process.platform === "darwin") {
    childProcess.spawn("open", [target], { detached: true, stdio: "ignore" }).unref();
    return true;
  }

  childProcess.spawn("xdg-open", [target], { detached: true, stdio: "ignore" }).unref();
  return true;
}

module.exports = {
  openUrl,
  openHostedControl,
  openSystemExplorer
};
