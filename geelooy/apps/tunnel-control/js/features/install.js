
// B"H
import { h } from "../ui/dom.js";

export function install() {
  return h("section", { className: "pane", data: { pane: "install" } }, [
    h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "Install / Restart" }), h("h2", { text: "One command" })]),
    h("article", { className: "panel stack" }, [
      h("h3", { text: "PowerShell" }),
      h("pre", { text: "irm https://awtsmoos.com/api/tunnel/install/windows | iex" }),
      h("h3", { text: "CMD" }),
      h("pre", { text: "powershell -ExecutionPolicy Bypass -Command \"irm https://awtsmoos.com/api/tunnel/install/windows | iex\"" }),
      h("h3", { text: "Mac / Linux" }),
      h("pre", { text: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash" })
    ])
  ]);
}
