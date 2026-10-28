# AI Engineering Brief

A small, static research publication designed for GitHub Pages. It uses HTML, CSS, browser JavaScript and optional D3.js (loaded from a CDN with a non-D3 fallback). There is **no build step**, no server, and no exposed API key.

## Features

- Daily edition archive with permanent URLs (`post.html?date=YYYY-MM-DD#story-id`)
- Full-text search over all indexed article content
- Tag filters and cross-edition links
- Source provenance, evidence limitations, and engineering implications
- Reusable, data-driven visualizations and a staged workflow explorer
- Responsive desktop and mobile layout

The included October 27 and 28, 2026 editions are **small, source-checked examples**, not complete 5-8 story daily briefings.

## Preview locally

From this directory run:

```bash
python3 -m http.server 8000
```

Open http://localhost:8000. Directly opening the HTML from the filesystem does not support JSON fetch in most browsers.

## Publish with GitHub Pages, without a custom workflow

1. Create a **public** GitHub repository named `ai-engineering-brief`.
2. Add this directory's files to the repository root, including the empty `.nojekyll` file.
3. In **Settings > Pages**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then Save.
4. The site address should be `https://YOUR-USERNAME.github.io/ai-engineering-brief/`.

GitHub Pages manages deployment after commits. You do not need to create your own GitHub Actions YAML for this static version. GitHub may show an internal Pages deployment job.

## Add a daily edition

1. Create `data/posts/YYYY-MM-DD.json`, using the same schema as the examples.
2. Prepend the edition's metadata and searchable story entries to `data/archive.json`. Include full-text content in each `searchText` field.
3. Run `python3 tools/validate.py`. Review source links and numerical claims against original publications.
4. Commit the two JSON changes. GitHub Pages then publishes the new content.

Do not put credentials, private documents, or unpublished company information in the repository. The site is public.

## ChatGPT publishing task (after a successful write test)

The existing 8 AM ChatGPT briefing can be adapted to:

- Research and verify 5-8 major developments from the last 24 hours, with dates and original source URLs.
- Create a complete new edition JSON file and update the archive index.
- Use only supported visual components. Provide chart data in JSON; never inject generated HTML or JavaScript into public articles.
- Distinguish vendor assertions from independent evidence. Reject unsupported numeric claims. Cross-link earlier related coverage.
- Commit to the authorized repository only if the connected GitHub integration permits it; report failures rather than claiming successful publication.
- Deliver a short summary with the live URL only **after** the commit and publication can be verified.

**Important:** GitHub repository access and unattended writes by ChatGPT scheduled tasks have not yet been verified. Do not disable the existing chat briefing until this works end to end.

## Structure

- `index.html` - Archive, search, and tags
- `post.html` - Single edition reader
- `assets/site.js` - Archive reader, search, interactive explanations, visualization components
- `assets/styles.css` - Design system and responsive styles
- `data/archive.json` - Edition metadata and full-text search index
- `data/posts/*.json` - Structured daily articles
- `tools/validate.py` - Offline JSON, source URL, and cross-reference checks
- `.nojekyll` - Skip the Jekyll content build
## Mobile reading and color themes

- Every page loads `assets/reading.css` after the original CSS. The text uses a wider mobile reading measure, 17px long-form body type, and accessible touch controls.
- `assets/theme.js` automatically follows the device light/dark preference and persists manual changes in localStorage. The toggle appears in the header of the archive, edition, and paper reader.
- Both themes use shared CSS variables. Check chart labels, focus outlines, readable contrast, reduced-motion support, and no sideways scrolling before publishing.

## Interactive research explainers

Selected high-impact technical research is treated as a separate, intuition-first explainer. The first example is `paper.html?slug=agent-judgment` with a source-linked walkthrough, methodology choice explorer, animated study design, measured-results comparison, and clearly labeled hypothetical slider.

Paper data lives in `data/papers/<slug>.json`; the renderer is `assets/paper.js` and `assets/paper.css`. To link from the daily briefing, set `paperSlug` on the story in BOTH `data/posts/YYYY-MM-DD.json` and `data/archive.json`.

Before creating new visual types or publishing a paper deep dive, follow **`docs/interactive-paper-authoring.md`**. All visualizations use approved JSON schemas, not arbitrary daily generated JS. Source measurements and hypothetical model outcomes must be clearly distinguished.
