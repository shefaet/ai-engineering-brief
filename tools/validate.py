#!/usr/bin/env python3
"""Validate independently published, source-linked AI Engineering Brief stories."""
import json
import re
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "data/archive.json"
archive = json.loads(INDEX.read_text(encoding="utf-8"))
assert archive.get("schemaVersion") == 2, "Expected flat story index (v2)"
indexed = archive.get("stories")
assert isinstance(indexed, list) and indexed, "No indexed stories"
ids, stories = set(), {}
allowed_figures = {"decision-path", "study-flow", "result-bars", "toy-adherence"}

def valid_date(s):
    assert isinstance(s, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", s), f"Bad date: {s}"
    date.fromisoformat(s)

def https_url(value):
    u = urlparse(value)
    assert u.scheme == "https" and u.netloc, f"Invalid source URL: {value}"

def bullets_ok(section, context):
    bullets = section.get("bullets", [])
    if bullets:
        # Older cached readers rely on equivalent paragraph text.
        assert len(section.get("paragraphs", [])) == len(bullets), f"Missing fallback text: {context}"
    for bullet in bullets:
        assert isinstance(bullet, dict) and all(isinstance(bullet.get(k), str) and bullet[k].strip() for k in ("lead", "detail")), f"Invalid bullet: {context}"

for record in indexed:
    story_id = record["id"]
    assert re.fullmatch(r"[a-z0-9-]{1,90}", story_id), f"Invalid story ID: {story_id}"
    assert story_id not in ids, f"Duplicate story: {story_id}"
    ids.add(story_id)
    valid_date(record["date"])
    assert len(record.get("searchText", "")) >= 20, f"Missing indexed text: {story_id}"
    path = ROOT / "data/stories" / (story_id + ".json")
    assert path.exists(), f"Missing standalone post: {path}"
    story = json.loads(path.read_text(encoding="utf-8"))
    stories[story_id] = story
    assert story["id"] == story_id and story["date"] == record["date"], f"Story/date mismatch: {story_id}"
    assert story["title"] == record["title"], f"Title mismatch: {story_id}"
    assert story.get("editorialFormat") == "four-part", f"Missing required editorial format: {story_id}"
    if story.get("editorialFormat") == "four-part":
        expected = ["What's new", "Evidence & limitations"]
        titles = [section.get("title") for section in story.get("sections", [])]
        if titles and titles[0] == "Context":
            titles = titles[1:]
        assert titles[-1:] in (["Why it matters"], ["Key takeaways"]), f"Missing conclusion: {story_id}"
        titles = titles[:-1]
        assert titles == expected, f"Incorrect four-part headings or order: {story_id}"
    assert story.get("sources"), f"Missing primary source: {story_id}"
    for source in story["sources"]:
        https_url(source["url"])
        valid_date(source["published"])
    for section in story.get("sections", []):
        assert section.get("paragraphs") or section.get("bullets") or section.get("interactive") or section.get("example"), f"Empty section: {story_id}"
        bullets_ok(section, story_id)
        example = section.get("example")
        if example:
            assert example.get("type") == "code-comparison" and example.get("caption"), f"Bad code example: {story_id}"
            v = example.get("variants", [])
            assert len(v) == 2 and all(isinstance(x.get("code"), str) and 0 < len(x["code"]) <= 4000 and x.get("label") for x in v), f"Bad comparison: {story_id}"
    # No internal organization-specific recommendations in unrelated public stories.
    record_text = json.dumps(record, ensure_ascii=False)
    story_text = json.dumps(story, ensure_ascii=False)
    if "bloomberg" in (record_text + story_text).lower():
        assert "bloomberg" in story["title"].lower(), f"Unrelated Bloomberg reference in story: {story_id}"

for record in indexed:
    story = stories[record["id"]]
    for related in story.get("related", []):
        assert related["id"] in ids, f"Broken related story: {record['id']} -> {related['id']}"
    slug = story.get("paperSlug")
    assert slug == record.get("paperSlug"), f"Paper index mismatch: {record['id']}"
    if not slug:
        continue
    assert re.fullmatch(r"[a-z0-9-]{1,90}", slug), f"Invalid paper slug: {slug}"
    path = ROOT / "data/papers" / (slug + ".json")
    assert path.exists(), f"Missing paper: {slug}"
    paper = json.loads(path.read_text(encoding="utf-8"))
    assert paper["slug"] == slug and paper["storyId"] == story["id"] and paper["issue"] == story["date"], f"Paper backlink mismatch: {slug}"
    https_url(paper["source"]["url"])
    valid_date(paper["source"]["published"])
    assert len(paper["chapters"]) >= 3, f"Paper explainer too short: {slug}"
    fig_count, chapters = 0, set()
    for ch in paper["chapters"]:
        assert ch.get("title") and (ch.get("paragraphs") or ch.get("bullets")), f"Missing chapter: {slug}"
        assert ch["id"] not in chapters, f"Duplicate chapter: {slug}"
        chapters.add(ch["id"])
        bullets_ok(ch, slug)
        fig = ch.get("explainer")
        if not fig:
            continue
        fig_count += 1
        assert fig.get("type") in allowed_figures and fig.get("title") and fig.get("description"), f"Invalid figure: {slug}"
        if fig["type"] == "decision-path":
            assert fig.get("options") and all(len(v.get("alternatives", [])) == 2 for v in fig["options"]), f"Invalid decision figure: {slug}"
        elif fig["type"] == "study-flow":
            assert len(fig.get("steps", [])) >= 2, f"Invalid flow: {slug}"
        elif fig["type"] == "result-bars":
            assert fig.get("datasets") and all(v.get("max", 0) > 0 and all(0 <= i["value"] <= v["max"] for i in v.get("items", [])) for v in fig["datasets"]), f"Invalid bars: {slug}"
        elif fig["type"] == "toy-adherence":
            assert 0 <= fig["minimum"] <= fig["initial"] <= fig["maximum"] <= 100, f"Invalid slider: {slug}"
    assert fig_count >= 1, f"Paper must have a meaningful figure: {slug}"

print(f"Validated {len(stories)} standalone stories and linked explainers.")
