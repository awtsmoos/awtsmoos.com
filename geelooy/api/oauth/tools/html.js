
// B"H

const LT = String.fromCharCode(60);
const GT = String.fromCharCode(62);

/**
 * B"H
 * Escapes HTML text.
 *
 * @param {*} value Value to escape.
 * @returns {string} Escaped HTML text.
 */
function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(new RegExp(LT, "g"), "<")
    .replace(new RegExp(GT, "g"), ">")
    .replace(/"/g, "&quot;");
}

/**
 * B"H
 * Creates an HTML tag without writing raw HTML tags in source content.
 *
 * @param {string} name Tag name.
 * @param {object} attrs Attributes.
 * @param {string} body Inner HTML.
 * @returns {string} HTML string.
 */
function tag(name, attrs = {}, body = "") {
  const pairs = Object.entries(attrs)
    .filter(pair => pair[1] !== undefined && pair[1] !== null && pair[1] !== false)
    .map(pair => " " + pair[0] + "=\"" + esc(pair[1]) + "\"")
    .join("");

  return LT + name + pairs + GT + body + LT + "/" + name + GT;
}

/**
 * B"H
 * Creates a full HTML document.
 *
 * @param {object} opts Document options.
 * @param {string} opts.title Page title.
 * @param {string} opts.body Body HTML.
 * @returns {string} Full HTML document.
 */
function doc(opts) {
  return [
    "<!doctype html>",
    tag("html", {}, [
      tag("head", {}, [
        tag("meta", { charset: "utf-8" }, ""),
        tag("title", {}, esc(opts.title || "Awtsmoos OAuth")),
        tag("style", {}, "body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:24px;line-height:1.5}.box{border:1px solid #ddd;border-radius:16px;padding:24px}a.button{color:white;background:#111;padding:12px 16px;border-radius:10px;text-decoration:none;display:inline-block}code{background:#f4f4f4;border-radius:6px;padding:2px 5px}.small{font-size:13px;color:#555;word-break:break-all;margin-top:16px}")
      ].join("")),
      tag("body", {}, opts.body || "")
    ].join(""))
  ].join("");
}

module.exports = { esc, tag, doc };
