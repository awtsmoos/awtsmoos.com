//B"H
/**
 * @module roleSettingsPanel
 * @description
 * A small living panel for heichel social governance: editors, moderators,
 * contributors, followers, and submission gates. It keeps state in the API
 * and renders only the current truth.
 */

import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import {
    HEICHEL_ROLES,
    addRoleMember,
    getRoleMembers,
    getSubmissionSettings,
    removeRoleMember,
    saveSubmissionSettings
} from '../api/roles.js';

const ROLE_LABELS = {
    editors: "Editors",
    moderators: "Moderators",
    contributors: "Contributors",
    followers: "Followers"
};

const SETTING_LABELS = {
    allowPostSubmissions: "Allow post submissions",
    allowCommentSubmissions: "Allow comment submissions",
    requirePostApproval: "Require post approval",
    requireCommentApproval: "Require comment approval"
};

export function mountRoleSettingsPanel({ root, heichelId, aliasId }) {
    if (!root || !heichelId || !aliasId) return null;

    const panel = document.createElement("section");
    panel.className = "heichel-role-settings-panel";
    panel.appendChild(titleBlock());

    const roleGrid = document.createElement("div");
    roleGrid.className = "heichel-role-grid";
    panel.appendChild(roleGrid);

    const settingsPanel = document.createElement("div");
    settingsPanel.className = "heichel-submission-settings";
    panel.appendChild(settingsPanel);

    const status = document.createElement("div");
    status.className = "heichel-role-status";
    panel.appendChild(status);

    root.appendChild(panel);

    const ctx = { heichelId, aliasId, roleGrid, settingsPanel, status };
    refreshRoles(ctx);
    refreshSettings(ctx);
    return panel;
}

function titleBlock() {
    const wrap = document.createElement("div");
    wrap.className = "heichel-role-settings-title";

    const title = document.createElement("h3");
    title.textContent = "Heichel Governance";
    wrap.appendChild(title);

    const copy = document.createElement("p");
    copy.textContent = "Invite helpers, shape submissions, and keep authority clear.";
    wrap.appendChild(copy);
    return wrap;
}

async function refreshRoles(ctx) {
    ctx.roleGrid.replaceChildren();
    for (const role of HEICHEL_ROLES) {
        const card = document.createElement("article");
        card.className = "heichel-role-card";
        card.dataset.role = role;
        card.appendChild(roleHeader(role, ctx));
        const list = document.createElement("div");
        list.className = "heichel-role-list";
        card.appendChild(list);
        ctx.roleGrid.appendChild(card);

        const response = await getRoleMembers({ heichelId: ctx.heichelId, role });
        renderRoleMembers({ ...ctx, role, list }, response?.success || []);
    }
}

function roleHeader(role, ctx) {
    const header = document.createElement("div");
    header.className = "heichel-role-card-header";

    const title = document.createElement("h4");
    title.textContent = ROLE_LABELS[role] || role;
    header.appendChild(title);

    const add = document.createElement("button");
    add.type = "button";
    add.textContent = "Add";
    add.onclick = async () => {
        const memberAliasId = await AwtsmoosPrompt.go({ headerTxt: `Add ${ROLE_LABELS[role] || role} alias` });
        if (!memberAliasId) return;
        ctx.status.textContent = `Adding @${memberAliasId} to ${ROLE_LABELS[role]}...`;
        const result = await addRoleMember({ heichelId: ctx.heichelId, aliasId: ctx.aliasId, role, memberAliasId });
        if (result?.success) {
            ctx.status.textContent = `Added @${memberAliasId}`;
            refreshRoles(ctx);
        } else {
            ctx.status.textContent = result?.error?.message || "Could not add member.";
        }
    };
    header.appendChild(add);
    return header;
}

function renderRoleMembers(ctx, members) {
    ctx.list.replaceChildren();
    const cleanMembers = Array.isArray(members) ? members : [];
    if (!cleanMembers.length) {
        const empty = document.createElement("div");
        empty.className = "heichel-role-empty";
        empty.textContent = "No aliases yet.";
        ctx.list.appendChild(empty);
        return;
    }

    cleanMembers.forEach(memberAliasId => {
        const row = document.createElement("div");
        row.className = "heichel-role-member";

        const identity = document.createElement("div");
        identity.className = "heichel-role-member-identity";

        const link = document.createElement("a");
        link.href = `/@${encodeURIComponent(memberAliasId)}`;
        link.textContent = `@${memberAliasId}`;
        identity.appendChild(link);

        const chat = document.createElement("a");
        chat.className = "heichel-role-member-chat";
        chat.href = `/email/?to=${encodeURIComponent(memberAliasId)}`;
        chat.textContent = "Message";
        chat.setAttribute("aria-label", `Open chat with ${memberAliasId}`);
        identity.appendChild(chat);

        row.appendChild(identity);

        if (memberAliasId !== ctx.aliasId) {
            const remove = document.createElement("button");
            remove.type = "button";
            remove.textContent = "Remove";
            remove.onclick = async () => {
                ctx.status.textContent = `Removing @${memberAliasId}...`;
                const result = await removeRoleMember({
                    heichelId: ctx.heichelId,
                    aliasId: ctx.aliasId,
                    role: ctx.role,
                    memberAliasId
                });
                if (result?.success) {
                    ctx.status.textContent = `Removed @${memberAliasId}`;
                    refreshRoles(ctx);
                } else {
                    ctx.status.textContent = result?.error?.message || "Could not remove member.";
                }
            };
            row.appendChild(remove);
        }
        ctx.list.appendChild(row);
    });
}

async function refreshSettings(ctx) {
    ctx.settingsPanel.replaceChildren();
    const title = document.createElement("h4");
    title.textContent = "Submission Settings";
    ctx.settingsPanel.appendChild(title);

    const response = await getSubmissionSettings({ heichelId: ctx.heichelId });
    const settings = response?.success || {};
    const form = document.createElement("form");
    form.className = "heichel-submission-form";

    Object.entries(SETTING_LABELS).forEach(([key, label]) => {
        const row = document.createElement("label");
        row.className = "heichel-setting-toggle";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = key;
        input.checked = settings[key] !== false;
        row.appendChild(input);
        row.appendChild(document.createTextNode(label));
        form.appendChild(row);
    });

    const save = document.createElement("button");
    save.type = "submit";
    save.textContent = "Save settings";
    form.appendChild(save);

    form.onsubmit = async event => {
        event.preventDefault();
        const payload = Object.fromEntries([...form.elements]
            .filter(item => item.name)
            .map(item => [item.name, item.checked ? "yes" : "no"]));
        ctx.status.textContent = "Saving submission settings...";
        const result = await saveSubmissionSettings({ heichelId: ctx.heichelId, aliasId: ctx.aliasId, settings: payload });
        ctx.status.textContent = result?.success ? "Submission settings saved." : (result?.error?.message || "Could not save settings.");
    };

    ctx.settingsPanel.appendChild(form);
}
