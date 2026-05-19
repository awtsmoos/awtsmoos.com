// B"H

function currentTunnelName() {
  return new URL(location.href).searchParams.get("tunnelName") || "";
}

function handoffUrl(name) {
  return `https://awtsmoos.com/api/tunnel/control/handoff/${encodeURIComponent(name)}`;
}

async function copyText(value) {
  await navigator.clipboard.writeText(value);
}

/**
 * B"H
 * Reveals the stable ChatGPT handoff URL after tunnel login.
 * Paste it once into ChatGPT; later actions refresh the same page underneath.
 *
 * @returns {void}
 */
export function mountHandoff() {
  const wrap = document.getElementById("handoffPanel");
  const text = document.getElementById("handoffUrl");
  const copy = document.getElementById("copyHandoffUrl");
  const name = currentTunnelName();

  if (!wrap || !text || !copy) return;
  if (!name) {
    text.textContent = "Tunnel name appears here after login.";
    return;
  }

  const url = handoffUrl(name);
  wrap.hidden = false;
  text.textContent = url;
  copy.addEventListener("click", async () => {
    await copyText(url);
    const old = copy.textContent;
    copy.textContent = "Copied";
    setTimeout(() => copy.textContent = old, 900);
  });
}
