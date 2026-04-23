
// B"H
/**
 * @file visualizer.js
 * @brief The Organic History Tree Visualizer.
 */

export const TimelineVisualizer = {
    /**
     * @function buildTreeSVG
     * @description Generates an organic SVG tree from timeline records.
     */
    buildTreeSVG(records, onNodeClick) {
        if (!records || records.length === 0) return "";

        const width = 400;
        const height = 300;
        const startX = width / 2;
        const startY = height - 20;

        let paths = [];
        let nodes = [];

        // Recursive organic branching logic
        const growBranch = (x, y, angle, length, depth, recordIdx) => {
            if (depth <= 0 || recordIdx < 0) return;

            const rec = records[recordIdx];
            const endX = x + Math.cos(angle) * length;
            const endY = y + Math.sin(angle) * length;

            // The Branch (The Path of History)
            paths.push(`<path d="M ${x} ${y} Q ${x + (endX-x)*0.2} ${y + (endY-y)*0.8} ${endX} ${endY}" 
                stroke="url(#branchGradient)" stroke-width="${depth * 1.5}" fill="none" style="opacity: 0.8;" />`);

            // The Node (The Moment of Manifestation)
            const color = rec.changes?.length > 5 ? 'var(--neon-magenta)' : 'var(--neon-cyan)';
            nodes.push(`<circle cx="${endX}" cy="${endY}" r="${4 + depth}" 
                fill="${color}" class="tl-node-btn" data-id="${rec.id}" 
                style="cursor: pointer; filter: drop-shadow(0 0 5px ${color});" />`);

            // Branching out: 1-2 new directions per turn
            const childCount = 1 + (recordIdx % 2);
            for (let i = 0; i < childCount; i++) {
                const nextAngle = angle + (i === 0 ? -0.3 : 0.4) + (Math.random() * 0.1);
                growBranch(endX, endY, nextAngle, length * 0.8, depth - 1, recordIdx - 1);
            }
        };

        // Start from the latest record (the crown of the tree)
        growBranch(startX, startY, -Math.PI / 2, 60, Math.min(records.length, 5), records.length - 1);

        return `
            <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:100%; filter: drop-shadow(0 0 10px rgba(0,246,255,0.2));">
                <defs>
                    <linearGradient id="branchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:rgba(255,255,255,0.1)" />
                        <stop offset="100%" style="stop-color:var(--neon-cyan)" />
                    </linearGradient>
                </defs>
                ${paths.join('')}
                ${nodes.join('')}
                <text x="10" y="20" fill="var(--neon-lime)" style="font-size: 10px; font-family: var(--font-code); font-weight: bold;">B"H - TIMESTREAM MAP</text>
            </svg>
        `;
    }
};
