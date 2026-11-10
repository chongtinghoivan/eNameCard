# eNameCard flows — summary

**Question answered:** how does the owner's form input become a saved contact on someone
else's phone?

**Reading order:** start at the top-left cluster (your browser). Everything left of the
GitHub cluster happens on-device — the only way data crosses the boundary is the
deliberate, manual `card.json` commit (dashed edge). The right side is the visitor's
phone: two QR paths (offline vCard, card link) plus the page's Save contact button, all
ending in the native Contacts app.

**Key decisions visible in the graph:**

- QR auto-mode embeds the vCard only when it is ≤600 UTF-8 bytes; otherwise it encodes
  the card URL. Photos never enter the QR.
- The published site is fully static; the only runtime fetch is `card.json` from the
  same origin.
- Wallet passes are a **target-state** node (dashed): they need a platform-held signing
  certificate and belong to the future hosted service, not this fork-and-deploy repo.

**Regenerate:** `dot -Tsvg docs/architecture/enamecard-flows.dot -o docs/architecture/enamecard-flows.svg`
(Graphviz not installed on the authoring machine; the `.dot` file is the canonical
source and previews in Qoder's DOT viewer.)

**Maintenance:** update the diagram when the routing rule, QR thresholds, or deploy
workflow change. Evidence per node: `enamecard-flows.evidence.md`.

Produced by `flow-visualizer` + `graphviz` (Architecture Visualization plugin), 2026-11-10.