// B"H
/**
 * @module ProfileTemplates
 * @description
 * Chapter 51: Five garments of profile light descend from the Awtsmoos, each
 * one pure data so the browser paints without guessing.
 */

const profileTemplates = [
    { id: "royal-dark", name: "Royal Dark", className: "profile-template-royal-dark", density: "spacious", defaultTab: "posts", tokens: { accent: "#b9853f", shell: "#080c1a" } },
    { id: "reader-light", name: "Reader Light", className: "profile-template-reader-light", density: "calm", defaultTab: "comments", tokens: { accent: "#7c4a19", shell: "#f8efe0" } },
    { id: "compact-social", name: "Compact Social", className: "profile-template-compact-social", density: "compact", defaultTab: "posts", tokens: { accent: "#7c3aed", shell: "#111827" } },
    { id: "heichel-builder", name: "Heichel Builder", className: "profile-template-heichel-builder", density: "builder", defaultTab: "tree", tokens: { accent: "#0f766e", shell: "#071b1a" } },
    { id: "minimal-clean", name: "Minimal Clean", className: "profile-template-minimal-clean", density: "clean", defaultTab: "posts", tokens: { accent: "#d69d42", shell: "#060a14" } }
];

function listTemplates() {
    return profileTemplates.map(template => ({ ...template, tokens: { ...template.tokens } }));
}

function getTemplate(id) {
    return listTemplates().find(template => template.id === id) || listTemplates()[0];
}

function normalizeTemplateId(id) {
    return getTemplate(id).id;
}

module.exports = { listTemplates, getTemplate, normalizeTemplateId };
