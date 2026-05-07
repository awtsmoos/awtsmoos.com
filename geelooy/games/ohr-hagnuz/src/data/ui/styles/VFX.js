
/**
 * B"H
 * @module VFX
 * @chapter The Visual Language of Miracles
 * @description
 * Different types of wisdom manifest as different physical elements.
 * Mishnah (Pshat) is stone, Kabbalah (Sod) is pure light.
 */
export const VFX = `
    /* VFX: Pshat - Heavy Stone Impact */
    .vfx-stone {
        background: radial-gradient(circle, #7d7d7d 20%, transparent 80%);
        box-shadow: 0 0 40px #555;
        border-radius: 50%;
    }
    .anim-stone-strike {
        animation: stoneImpact 0.4s ease-in forwards;
    }
    @keyframes stoneImpact {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(3); opacity: 1; filter: blur(2px); }
        100% { transform: scale(4); opacity: 0; filter: blur(10px); }
    }

    /* VFX: Drush - Intellectual Fire */
    .vfx-fire {
        background: linear-gradient(to top, #ff5722, #ffeb3b);
        filter: blur(15px);
    }
    .anim-fire-burn {
        animation: fireBloom 0.5s ease-out forwards;
    }
    @keyframes fireBloom {
        0% { opacity: 0; transform: translateY(0) scale(1); }
        50% { opacity: 1; transform: translateY(-100px) scale(2); filter: hue-rotate(45deg); }
        100% { opacity: 0; transform: translateY(-200px) scale(0.5); }
    }

    /* VFX: Sod - Infinite White Light */
    .vfx-light {
        background: #fff;
        box-shadow: 0 0 100px 50px #fff;
    }
    .anim-holy-blast {
        animation: holyFlash 0.6s ease-in-out forwards;
    }
    @keyframes holyFlash {
        0% { opacity: 0; transform: scale(0.1); }
        20% { opacity: 1; transform: scale(10); }
        100% { opacity: 0; transform: scale(20); }
    }
`;
