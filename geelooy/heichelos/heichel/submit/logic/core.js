//B"H
/** @module SubmitCore
 * The launch button finds the alias, resolves a home-Heichel, and lets existing
 * community gates decide direct publish versus review.
 */
import { makePost, AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { getEditorContent } from "./editor.js";
import { getAllSectionsData } from "./sections.js";
import { setSubmitStatus } from "./status.js";
import { explicitHeichelFromUrl, renderTargetSummary, resolveAlias, resolveTarget } from "./target.js";

export function initializeSubmitCore() {
  const url = new URL(location.href);
  const parentSeriesId = url.searchParams.get("parentSeriesId") || "root";
  const editPostId = url.searchParams.get("editPostId") || "";
  const context = { url, parentSeriesId, editPostId, heichelId: explicitHeichelFromUrl(url) };
  hydrateAlias();
  setupBack(context);
  document.getElementById("postId")?.setAttribute("value", editPostId);
  document.getElementById("submitPost")?.addEventListener("click", () => handleSubmit(context));
  document.getElementById("targetSeriesId")?.setAttribute("placeholder", parentSeriesId || "root");
  previewTarget(context);
  return context;
}

function hydrateAlias() {
  const input = document.getElementById("aliasId");
  window.curAlias = window.curAlias || localStorage.getItem("lastAliasUsed") || localStorage.getItem("awtsmoos-alias") || "";
  if (input) input.value = window.curAlias;
  resolveAlias(input).then(alias => { window.curAlias = alias; });
  addEventListener("awtsmoosAliasChange", event => {
    window.curAlias = event?.detail?.id || "";
    if (input) input.value = window.curAlias;
  });
}

function setupBack(context) {
  const backBtn = document.getElementById("backBtn");
  const heichel = context.heichelId || "ikar";
  const qs = new URLSearchParams({ view: "posts", series: context.parentSeriesId });
  if (backBtn) backBtn.href = context.url.searchParams.get("returnURL") || `/heichelos/${heichel}?${qs}`;
}

function getValue(id) { return document.getElementById(id)?.value?.trim() || ""; }
function postId(editPostId) { return getValue("postId") || editPostId || `BH_post_${Date.now()}`; }

function buildPayload(target, context) {
  const sections = getAllSectionsData();
  const main = getEditorContent(document.getElementById("mainContentEditor"));
  return { aliasId: target.aliasId, heichelId: target.heichelId, parentSeriesId: target.seriesId || "root", seriesId: target.seriesId || "root", postId: postId(context.editPostId), title: getValue("title"), contentType: getValue("contentType") || "post", content: main.text, mainContent: { html: main.html, images: main.images }, sections, dayuh: { sections, verseMap: Object.fromEntries(sections.map(s => [s.verseSection, s.id])) } };
}

async function submitThroughContentApi(payload) {
  const kind = payload.contentType === "question" ? "questions" : "posts";
  const response = await fetch(`/api/social/content/heichelos/${encodeURIComponent(payload.heichelId)}/${kind}`, { method: "POST", body: new URLSearchParams({ aliasId: payload.aliasId, postId: payload.postId, title: payload.title, content: payload.content, seriesId: payload.seriesId, parentSeriesId: payload.parentSeriesId, sections: JSON.stringify(payload.sections) }) });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.error) throw new Error(data?.error?.message || data?.message || "Content API failed.");
  return data;
}

async function previewTarget(context) {
  try { renderTargetSummary(await resolveTarget(context, { createDefault: false })); }
  catch (error) { setSubmitStatus(error.message, "error"); }
}

async function handleSubmit(context) {
  if (!getValue("title")) return setSubmitStatus("Title is required.", "error");
  try {
    setSubmitStatus("Resolving alias and default heichel...", "info");
    const target = await resolveTarget(context, { createDefault: true });
    renderTargetSummary(target);
    const payload = buildPayload(target, context);
    setSubmitStatus("Posting through community rules...", "info");
    const response = await submitThroughContentApi(payload).catch(() => makePost(payload));
    if (!response.success) throw new Error(response.error?.message || response.error || "Unknown server error");
    setSubmitStatus(target.usedDefault ? "Posted to your default heichel." : "Post launched.", "success");
    await AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Posted", bodyTxt: "Your post was sent. If approval is required, it is now pending review." });
    location.href = document.getElementById("backBtn")?.href || `/heichelos/${target.heichelId}`;
  } catch (error) {
    setSubmitStatus(error.message || "Submission failed.", "error");
    AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Submission Failed", bodyTxt: error.message });
  }
}
