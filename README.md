# AI Engineering Brief

A minimal, mobile-first, source-linked AI engineering publication on GitHub Pages. **One story per post**, rather than one long daily edition. Stories appear in reverse publication-date order; every story has its own permalink.

Live: https://shefaet.github.io/ai-engineering-brief/

## Structure

- `index.html` — chronological searchable story feed, with optional topic filter.
- `story.html?id=SLUG` — standalone technical article (preferred, stable permalink).
- `data/stories/SLUG.json` — each complete, independently publishable article.
- `data/archive.json` — **schemaVersion 2** flat, searchable index of stories, each with `id`, `date`, `title`, `summary`, `category`, `tags`, `evidence`, `searchText`, optional `paperSlug`.
- `paper.html?slug=SLUG` — optional deep interactive research explainer, backed by `data/papers/SLUG.json`.
- `assets/site.js`, `assets/paper.js`, CSS, and `assets/theme.js` — safe front-end reading, example, search, and light/dark mode logic.
- `tools/validate.py` — consistency, source, and paper-schema validator.
- `docs/interactive-paper-authoring.md` — source and interactive-explainer editorial rules.
- `post.html?date=YYYY-MM-DD#SLUG` — legacy daily-edition URLs: redirect to the standalone story when the hash identifies a story, otherwise list matching story links.
- `data/posts/YYYY-MM-DD.json` — archived legacy edition data for historical reference, **not** for future publishing.

## Editorial policy

Publish only consequential, source-verified AI stories. Keep each post self-contained, technical, concise, and rich in context. Favor structured `sections[].bullets` entries of `{lead,detail}`, one useful mechanism, piece of evidence, limitation or durable technical insight each. Use the section heading `Key takeaways` rather than `Why it matters`. Explain general principles, challenged assumptions or technical tradeoffs, not managerial action items or reader-directed checklists. Keep equivalent `paragraphs` fallback text for cached browsers. Optional `sections[].example` supports a labeled, inert `code-comparison` with two code or payload variants. Do not add decorative diagrams, unverified data, or repetitive text.

**Institution-neutral publication:** Never refer to the publication owner's employer or customize recommendations to any specific organization. A company's name—including Bloomberg—may appear when that company is substantively the news subject, not merely because of the reader's affiliation. Generic financial/enterprise use cases are acceptable when technically relevant.

## Publishing a new story

1. Research a significant development; verify original publication date, URL, all metrics, and limitations.
2. Choose a globally unique, short lowercase hyphenated story ID. Create `data/stories/SLUG.json` with `id`, `date` (site publication date in America/New_York, YYYY-MM-DD), `published` (source date), `category`, `priority`, `title`, `dek`, `tags`, `evidence`, `takeaway`, `sections`, `sources`, optional `related`, optional `paperSlug`. Each story is one page, even if multiple stories are published on the same date.
3. If justified by a significant research paper, create its validated `data/papers/SLUG.json` before the story and link its `paperSlug`.
4. Append exactly one matching searchable record to `data/archive.json` `stories`, then sort by `date` newest-first (retain existing order within a date). Don't edit legacy `data/posts` or create dated multi-story bundles.
5. Run `python3 tools/validate.py` locally where possible. At minimum verify the two new JSON files, existing story count, links, and rendered schema. Commit and read back the new post and updated index.
6. Verify GitHub Pages deployment when possible. A successful GitHub commit is not by itself confirmation of live deployment.

## Local preview

Run `python3 -m http.server 8000` from the repository root and open http://localhost:8000.

No build step, custom GitHub Actions YAML, or API key is needed. GitHub Pages serves the static files directly. The theme control follows device settings and remembers manual changes.

## Scheduled publication

The existing ChatGPT 8 AM America/New_York automation publishes each selected development as a separate JSON post and indexes each independently. It sends a short notification with direct links. It should report failed GitHub commits or incomplete indexing rather than claim publication.
