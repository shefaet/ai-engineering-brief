# Interactive paper explainer publishing contract

This repository publishes **two related products**:

1. Independently published story posts (only genuinely material developments), stored at `data/stories/SLUG.json`.
2. A deeper, optional interactive research explainer for selected significant technical papers, stored at `data/papers/<slug>.json` and rendered at `paper.html?slug=<slug>`.

A story post at `story.html?id=SLUG` references its optional explainer via `paperSlug`; the matching flat record in `data/archive.json` must carry the same `paperSlug`. The page renderer links both entries automatically.

## Four-part editorial format (default for new stories)

Every **new standalone story** should use this scan-friendly section sequence, allowing Context to be omitted if the headline and gist already make the prior situation obvious:

1. **Context** — the minimum background necessary to understand why the development matters. Prefer one brief bullet; omit if self-evident.
2. **What's new** — the actual new mechanism, product, architecture, workflow or change. Use concrete examples rather than abstract descriptions; this is usually the main factual section.
3. **Evidence & limitations** — the strongest measurements with model, dataset, comparator, units and evaluation setup where reported, plus the most material boundary on the claim. If no relevant measurements were disclosed, say so plainly. Distinguish vendor-reported performance from independent validation.
4. **Key takeaways** — one to three memorable technical insights. Explain a general principle, challenged assumption or technical tradeoff. Avoid managerial action items and do not repeat earlier sections.

Use short bold lead-ins followed by substantive details. Depth is determined by complexity, not by a word quota. One explanatory diagram, code comparison, or interactive example can replace multiple sentences. Never add filler to populate a heading. Keep 'Evidence & limitations' even when evidence is qualitative. Mark new story JSON with `editorialFormat: "four-part"`, with those exact section titles in order (Context is optional). For backwards compatibility, retain legacy `paragraphs` for each `bullets` array. Historical stories without this marker remain valid pending editorial revision. A separate deep paper explainer can follow a research-specific structure.

## Default story format

Use these section headings, in order, for new standalone stories:

1. Context (optional): minimum background required to understand the update.
2. What's new: the specific architecture, method, product or workflow change, with a compact worked example when useful.
3. Evidence & limitations: measurements, baselines, test conditions, original sources and the most important qualification.
4. Key takeaways: one to three durable technical insights, not recommendations or checklists; never repeat the headline or preceding sections.

Use substantial bullet points with short lead-ins. Keep important technical depth and skip filler. If the headline explains the context, omit that section. Mark new story JSON with editorialFormat set to four-part. Older unmarked stories remain valid; interactive paper explainers may retain their own chapter structure. Provide equivalent paragraph fallbacks to bullet fields for browser compatibility.

## Dense, bullet-first editorial schema

Use structured bullets on both the daily edition and interactive paper chapters. Preserve exact technical nuance without forcing the reader through introductory prose.

In `data/stories/SLUG.json`, use `sections: [{ "title": "Mechanism", "bullets": [{"lead":"Architecture","detail":"What actually changed, with constraints."}] }]`. In `data/papers/<slug>.json`, a chapter may use the same `bullets` property instead of `paragraphs`. Legacy `paragraphs` remain readable, but **new articles should be bullet-first**.

- Each bullet is one useful idea: a **short bold claim or dimension** followed by its causal/technical explanation. Use natural sentences, not slogan fragments.
- Aim for 2-4 bullets per section and 4-9 per article when justified. This is not a quota; a difficult method may require more detail and a straightforward update much less.
- Preserve architecture, actual benchmark setup (model, dataset, baseline, units), quantitative results, failure modes, major evidence caveat and a non-obvious engineering insight. Omit dimensions without new information.
- Make the headline state **what happened** and the takeaway state **the main durable insight**. The bullets should explain **why/how/evidence**; never repeat either.
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
3. Verify the `paperSlug` points to a real `data/papers/<slug>.json` file and that the flat archive record and standalone story reference the same slug.
4. Test controls and animations at 375px mobile and desktop sizes; inspect both light and dark themes and keyboard navigation.
5. Check figures for overflowing labels, clipped bars, stale text, and invalid interactions.
6. Ensure `prefers-reduced-motion` is honored; avoid auto-play by default.
7. Commit and read back the optional paper JSON, standalone story JSON, and flat archive-index record.
8. Publish a short daily notification with article URL only after confirming GitHub writes. A GitHub commit does not by itself establish that Pages has deployed.

## Editorial rule for automation

**Do not fabricate interactive depth.** If there is no validated paper worthy of a deep dive, publish the standalone story without one. Do not add a placeholder note. Incomplete or unverified charts must not be published.

## Independent publication and organization neutrality

- Each development is a separate self-contained post with a globally unique slug and a date in `data/stories/SLUG.json`. The v2 flat `data/archive.json` records one indexed story per post, sorted by publication date. Do not create new multi-story daily edition files.
- Related-story links and paper backlinks use `story.html?id=SLUG` (not daily-edition anchors). Retain old URLs only for backwards compatibility.
- Do not refer to a reader's employer, internal department, employer-specific rollout plans, or named enterprise affiliation. A company, including Bloomberg, can be discussed when it is substantively the subject of verified public AI news; otherwise keep examples and implications organization-neutral.
- The narrative should stand alone for any technical reader; avoid second-person references to the owner's organization.
