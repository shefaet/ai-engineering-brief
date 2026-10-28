# Interactive paper explainer publishing contract

This repository publishes **two related products**:

1. A daily edition (5-8 source-linked news developments), stored at `data/posts/YYYY-MM-DD.json`.
2. A deeper, optional interactive research explainer for selected significant technical papers, stored at `data/papers/<slug>.json` and rendered at `paper.html?slug=<slug>`.

The article JSON must reference the explainer via `paperSlug`, and the matching item in `data/archive.json` must use the same `paperSlug`. The page renderer links both entries automatically.

## Selection criteria

Prioritize technical papers with a new mechanism, nontrivial architecture, measurable trade-off, or strong implications for model systems. Do not create a pseudo-interactive article for an ordinary press release, minor incremental benchmark, or unverified claim. Aim for **one substantial paper explainer per edition when there is a suitable paper**, not eight shallow ones. More can be added when a result merits it.

## Writing standard: intuition first, then mechanics

Use 5-7 short chapters:
- Central intuition with a concrete toy example and limits of that analogy.
- The problem or failure mode addressed by the paper.
- The method, algorithm, or experimental design, including relevant equations.
- Paper measurements, baselines, and evaluation setup.
- Interactive what-if exercise or small deterministic simulation.
- Limitations, possible confounders, and implementation details.
- Enterprise AI implications and a reproducible engineering experiment.

Use 2-4 explanatory figures per deep dive. **Every figure must teach a distinct technical idea and respond to interaction.** On mobile, it must work without hover or a mouse. Animations should have explicit play/pause controls, short durations, and reduced-motion support. Do not animate purely for decoration.

## Allowed data-driven figure types (no generated JavaScript)

The renderer in `assets/paper.js` recognizes:
- `decision-path`: alternative methodological or architectural choices with implications.
- `study-flow`: ordered states with next/previous and play/pause (repeatable progression).
- `result-bars`: named datasets of measured percentages, toggled by the reader.
- `toy-adherence`: an explicitly hypothetical sensitivity model with a probability slider.

Only use the allowed types with valid JSON. Never insert model-generated JS, HTML, SVG source, markdown HTML, iframe, or raw external widgets into article JSON. For a genuinely new algorithm, add a **reviewed, tested reusable visualization component** in a separate code change before referencing it in content.

## Provenance and numerical safety

- Primary source URL in `source.url` and its verified publication date are required.
- Never invent numbers, equations, benchmarks, experimental conditions, ablations, or dataset sizes.
- Paper figures must correspond to the exact metric, unit, denominator, cohort, model, and sample size. Avoid comparing unmatched conditions.
- Label data as `Measured in paper`, `Vendor-reported`, `Independent replication`, or `Hypothetical illustration` where applicable.
- Toy sliders describe a model with declared assumptions, not a replication of empirical observations. State the assumptions and difference directly next to the control.
- Explain where an analogy fails and distinguish formal evidence from author interpretation.
- If a source is paywalled or the relevant method cannot be verified, do not manufacture a deep dive. Leave the daily article as ordinary text with a citation.

## Release checks

1. Read source paper, appendix and code if available. Confirm every numeric claim against the source.
2. Verify paper JSON parses and all chapters/figure types have the fields the renderer expects.
3. Verify the `paperSlug` points to a real `data/papers/<slug>.json` file, and that archive and post reference the same slug.
4. Test controls and animations at 375px mobile and desktop sizes; inspect both light and dark themes and keyboard navigation.
5. Check figures for overflowing labels, clipped bars, stale text, and invalid interactions.
6. Ensure `prefers-reduced-motion` is honored; avoid auto-play by default.
7. Commit and read back both the paper JSON and the article/index files.
8. Publish a short daily notification with article URL only after confirming GitHub writes. A GitHub commit does not by itself establish that Pages has deployed.

## Editorial rule for automation

**Do not fabricate interactive depth.** If there is no validated paper worthy of a deep dive, publish a concise daily edition and mark that no paper explainer was added that day. Incomplete or unverified charts must not be published.
