// B"H
/**
 * @module GeelooyForgeMenu
 * @description
 * Chapter 8: The Awtsmoos teaches the forge to say yes in the old tongue.
 *
 * The Heichel API marks public palaces with `isPublic=yes`, not boolean text.
 * This forge speaks that legacy dialect while keeping the modern profile flow:
 * detect alias, generate id, create the palace, and open it for editing.
 */

import ModalBuilder from "/scripts/awtsmoos/modalBuilder.js";
import ExtremeDropdown from "/scripts/awtsmoos/ExtremeDropdown.js";

const openModales = {};

function activeAlias() {
    const params = new URLSearchParams(window.location.search);
    return params.get("alias") || window.curAlias || window.curAliasId || window.awtsmoosAlias || "";
}

function localHeichelId(value) {
    return String(value || "").trim().replace(/[^a-zA-Z0-9_.-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72);
}

async function generateHeichelId(heichelName) {
    const fallback = localHeichelId(heichelName);
    if (!heichelName?.trim()) return fallback;
    try {
        const response = await fetch(`/api/social/heichelActions/generateHeichelId`, {
            method: "POST",
            body: new URLSearchParams({ heichelName })
        });
        const data = await response.json();
        return data?.heichelId || fallback;
    } catch {
        return fallback;
    }
}

async function submitHeichel(data, aliasId) {
    if (!aliasId) return { success: false, message: "Choose or create an alias before forging a Heichel.", closeModal: false };
    const name = data.heichelName?.trim();
    const heichelId = localHeichelId(data.heichelId || name);
    if (!name || name.length < 3) return { success: false, message: "Heichel Name must be at least 3 characters long.", closeModal: false };
    if (!heichelId) return { success: false, message: "The Heichel id could not be formed.", closeModal: false };
    const response = await fetch(`/api/social/alias/${encodeURIComponent(aliasId)}/heichelos`, {
        method: "POST",
        body: new URLSearchParams({
            name,
            heichelName: name,
            description: data.heichelDescription || "",
            heichelId,
            inputId: heichelId,
            aliasId,
            isPublic: data.activateHeichel ? "yes" : "no"
        })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.error) return { success: false, message: payload?.error?.message || payload?.message || "Heichel creation failed.", closeModal: false };
    const createdId = payload?.success?.details?.heichelId || payload?.heichelId || payload?.id || heichelId;
    if (data.activateHeichel) window.location.href = `/heichelos/${encodeURIComponent(createdId)}/?editingAlias=${encodeURIComponent(aliasId)}`;
    return { success: true, message: `Heichel ${name} has been manifested.`, closeModal: true };
}

function makeHeichel() {
    const aliasId = activeAlias();
    if (openModales.makeHeichel) return openModales.makeHeichel.open();
    const heichelCreationModal = new ModalBuilder({
        id: "heichel-creation-modal",
        title: "Forge a New Heichel",
        fields: [
            { type: "text", name: "heichelName", label: "Heichel Name", id: "heichel-name-input", placeholder: "Enter a unique name for your Heichel", validation: value => value.trim().length >= 3, errorMessage: "Heichel Name must be at least 3 characters long.", async oninput(event, fields) { fields["heichel-id-input"].value = await generateHeichelId(event.target.value); } },
            { type: "textarea", name: "heichelDescription", label: "Heichel Description", id: "heichel-description-input", placeholder: "Describe your Heichel in detail..." },
            { type: "text", name: "heichelId", label: "Heichel Unique ID", id: "heichel-id-input", placeholder: "e.g., written-torah", validation: value => /^[a-zA-Z0-9_.-]+$/.test(value), errorMessage: "ID can only contain letters, numbers, underscores, dots, and hyphens." },
            { type: "checkbox", name: "activateHeichel", label: "Open Heichel after creation", id: "activate-heichel-checkbox", checked: true }
        ],
        submitButtonText: "Manifest Heichel",
        showCloseButton: true,
        onSubmit: data => submitHeichel(data, aliasId),
        successMessage: "Your new Heichel is alive.",
        errorMessage: "Manifestation failed. Please try again."
    });
    openModales.makeHeichel = heichelCreationModal;
    heichelCreationModal.open();
}

function start() {
    const btn = document.querySelector(".forge.icon");
    if (!btn) return null;
    const drop = new ExtremeDropdown({
        parentElement: btn,
        options: [
            { text: "Create new Heichel (space)", onclick: makeHeichel },
            { text: "Create new Post", onclick: () => { window.location.href = "/heichelos/submit"; } }
        ]
    });
    btn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        if (drop.isVisible()) drop.hide();
        else drop.show();
    });
    window.drop = drop;
    return drop;
}

export default { start, makeHeichel, activeAlias, generateHeichelId };
