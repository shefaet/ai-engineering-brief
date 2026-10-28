# Interactive paper explainer publishing contract

This repository publishes **two related products**:

1. A daily edition (only genuinely material developments; usually 1-5), stored at `data/posts/YYYY-MM-DD.json`.
2. A deeper, optional interactive research explainer for selected significant technical papers, stored at `data/papers/<slug>.json` and rendered at `paper.html?slug=<slug>`.

The article JSON must reference the explainer via `paperSlug`, and the matching item in `data/archive.json` must use the same `paperSlug`. The page renderer links both entries automatically.

## Dense, bullet-first editorial schema

Use structured bullets on both the daily edition and interactive paper chapters. Preserve exact technical nuance without forcing the reader through introductory prose.

In `data/posts/YYYY-MM-DD.json`, use `sections: [{ "title": "Mechanism", "bullets": [{"lead":"Architecture","detail":"What actually changed, with constraints."}] }]`. In `data/papers/<slug>.json`, a chapter may use the same `bullets` property instead of `paragraphs`. Legacy `paragraphs` remain readable, but **new articles should be bullet-first**.

- Each bullet is one useful idea: a **short bold claim or dimension** followed by its causal/technical explanation. Use natural sentences, not slogan fragments.
- Aim for 2-4 bullets per section and 4-9 per article when justified. This is not a quota; a difficult method may require more detail and a straightforward update much less.
- Preserve architecture, actual benchmark setup (model, dataset, baseline, units), quantitative results, failure modes, major evidence caveat and an actionable engineering test. Omit dimensions without new information.
- Make the headline state **what happened** and the takeaway state **what decision changes**. The bullets should explain **why/how/evidence**; never repeat either.
- Don't use bullet labels like "Key point", "Important" or "Context". Prefer "Streaming", "Evaluation", "Failure mode", "Deployment gate", etc.
- A concise but rigorous list beats superficial bullets. Avoid the habit of mechanically converting each sentence into a separate bullet or hiding missing reasoning under a short label.
- Interactive figures replace prose when possible. Explain what cannot be inferred from a chart, not the numbers already printed on it.
- Put detailed source URLs in the existing source disclosure, and avoid repeating citation boilerplate.

## Concrete examples that replace exposition

Whenever they clarify a non-obvious mechanism, include **small, source-grounded worked examples** rather than another paragraph. Good candidates include a before/after representation, sample input and output, miniature execution trace, counterexample, toy calculation, or constrained pseudocode.

- Make the example answer a real technical question: what the system receives, produces, transforms, stores, or fails to handle.
- Prefer the smallest faithful example that exposes the essential difference; do not add examples as decoration or to meet a quota.
- If source material provides an appropriate original example, verify it. Otherwise construct a syntactically plausible illustration and label it **schematic**. Do not imply a schematic snippet is verbatim source output, production data, or benchmark evidence.
- Keep benchmark setup, quantitative measurements, and synthetic illustration conceptually separate. Never derive reported speedups from arbitrary snippet lengths.
- Remove prose that repeats exactly what the example makes evident. Use one short explanation for the *inference* a reader should draw.
- For two code or payload variants, `sections[].example` supports `{ "type":"code-comparison", "caption":"...", "variants":[{"label":"...","code":"..."},{"label":"...","code":"..."}], "takeaway":"...", "note":"Schematic example..." }`. The renderer places variants in two columns on wide screens and stacks them on mobile. Content is rendered as inert text, not executed.
- For other kinds of illustrations, use an existing validated interactive figure or a concise structured bullet with inline data. Do not inject custom executable content into article JSON.

## Selection criteria

Prioritize technical papers with a new mechanism, nontrivial architecture, measurable trade-off, or strong implications for model systems. Do not create a pseudo-interactive article for an ordinary press release, minor incremental benchmark, or unverified claim. Publish **at most one substantial explainer when there is a suitable paper**. Do not create one to satisfy a quota.

## Writing standard: intuition first, then mechanics

Use 3-5 concise, non-overlapping chapters, selecting only sections that materially improve understanding:
- Central intuition with a concrete toy example and limits of that analogy.
- The problem or failure mode addressed by the paper.
- The method, algorithm, or experimental design, including relevant equations.
- Paper measurements, baselines, and evaluation setup.
- Interactive what-if exercise or small deterministic simulation.
- Limitations, possible confounders, and implementation details.
- Enterprise AI implications and a reproducible engineering experiment.

Use 1-3 useful interactive figures per deep dive, and never repeat the same concept in prose and charts. **Every figure must teach a distinct technical idea and respond to interaction.** On mobile, it must work without hover or a mouse. Animations should have explicit play/pause controls, short durations, and reduced-motion support. Do not animate purely for decoration.

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
