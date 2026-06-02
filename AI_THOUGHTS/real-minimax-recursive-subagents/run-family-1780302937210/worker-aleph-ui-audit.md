# Worker Aleph UI audit

# UI Audit: Tunnel-Control AI Agent Panel
**Worker Aleph | Awtsmoos Delegation**

---

## Panel Overview
A command interface for managing autonomous tunnel systems (excavation, structural monitoring, navigation). Target users: field supervisors and AI coordination officers operating in high-stakes, low-latency environments.

---

## 5 Concrete UI Requirements

| # | Requirement | Rationale |
|---|-------------|-----------|
| **1** | **Real-time 3D tunnel topology viewer** — Isometric wireframe rendering of all active tunnels with live depth/diameter overlays. Update latency ≤ 200ms. | Operators must instantly grasp spatial state during emergencies. |
| **2** | **AI confidence triage panel** — Color-coded sidebar (green/amber/red) showing each agent's current confidence score for active decisions. Click expands reasoning trace. | Trust calibration without hunting through logs. |
| **3** | **One-click override rail** — Prominent physical switch metaphor (not buried menu) that instantly halts all AI-driven actions with audio confirmation. | Safety-criticalstop requires zero navigation friction. |
| **4** | **Predictive hazard alerts** — Persistent top banner with forecast of structural anomalies (cave-in risk, flooding, gas) arriving within the next 15 minutes. Must be dismissible but logged. | Proactive awareness, not reactive panic. |
| **5** | **Voice-command haptic feedback** — When a spoken command is processed, the interface pulses the active tunnel segment visually + a subtle haptic cue on the control device. | Confirms receipt in noisy, high-distraction environments. |

---

## Design Constraints
- **Contrast ratio ≥ 7:1** for all text (low-light tunnel conditions).
- **No more than 3 clicks** to reach any critical function from the default view.
- **Dark mode default** with optional high-visibility mode for emergency personnel.

---

*End of audit. Ready for refinement or implementation scoping.*
