
// B"H
const childProcess = require("child_process");

function openUrl(url) {
  try {
    let child;
    if (process.platform === "win32") {
      child = childProcess.spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" });
    } else if (process.platform === "darwin") {
      child = childProcess.spawn("open", [url], { detached: true, stdio: "ignore" });
    } else {
      child = childProcess.spawn("xdg-open", [url], { detached: true, stdio: "ignore" });
    }
    // B"H: headless servers have no browser opener; a missing binary must not
    // crash the process — the pairing URL is already printed for manual approval.
    child.on("error", () => {});
    child.unref();
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
  // B"H: same headless grace as openUrl — a missing opener must never crash.
  const launch = (command, args) => {
    try {
      const child = childProcess.spawn(command, args, { detached: true, stdio: "ignore" });
      child.on("error", () => {});
      child.unref();
    } catch {}
  };
  if (process.platform === "win32") {
    launch("explorer.exe", [target]);
    return true;
  }

  if (process.platform === "darwin") {
    launch("open", [target]);
    return true;
  }

  launch("xdg-open", [target]);
  return true;
}

module.exports = {
  openUrl,
  openHostedControl,
  openSystemExplorer
};
