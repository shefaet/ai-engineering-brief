#!/usr/bin/env python3
"""Validate the static AI Engineering Brief publication before committing."""
import json
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
archive = json.loads((ROOT / "data/archive.json").read_text(encoding="utf-8"))
assert archive.get("schemaVersion") == 1, "Unsupported archive version"
dates = set()
all_ids = set()
all_references = []

for edition in archive["editions"]:
    date = edition["date"]
    assert date not in dates, f"Duplicate date: {date}"
    dates.add(date)
    path = ROOT / "data/posts" / f"{date}.json"
    assert path.exists(), f"Missing post: {path}"
    post = json.loads(path.read_text(encoding="utf-8"))
    assert post["date"] == date
    index_stories = {s["id"]: s for s in edition["stories"]}
    post_stories = {s["id"]: s for s in post["stories"]}
    assert set(index_stories) == set(post_stories), f"Story index mismatch: {date}"

    for story_id, story in post_stories.items():
        all_ids.add((date, story_id))
        search = index_stories[story_id].get("searchText", "")
        assert len(search) >= 20, f"Missing search text: {date}/{story_id}"
        assert story["title"] == index_stories[story_id]["title"], f"Title mismatch: {date}/{story_id}"
        assert story["sources"], f"Missing sources: {date}/{story_id}"
        for section in story.get("sections", []):
            assert section.get("paragraphs") or section.get("bullets") or section.get("interactive"), f"Empty article section: {date}/{story_id}"
            if section.get("bullets"):
                assert len(section.get("paragraphs", [])) == len(section["bullets"]), f"Missing legacy text fallback: {date}/{story_id}"
            example = section.get("example")
            if example:
                assert example.get("type") == "code-comparison", f"Unsupported example type: {date}/{story_id}"
                variants = example.get("variants", [])
                assert len(variants) == 2, f"Code comparison must have two variants: {date}/{story_id}"
                assert example.get("caption"), f"Missing example caption: {date}/{story_id}"
                for variant in variants:
                    assert isinstance(variant.get("label"), str) and variant["label"].strip(), f"Missing code example label: {date}/{story_id}"
                    assert isinstance(variant.get("code"), str) and 0 < len(variant["code"]) <= 4000, f"Invalid code example: {date}/{story_id}"
            for item in section.get("bullets", []):
                assert isinstance(item, dict) and isinstance(item.get("lead"), str) and item["lead"].strip() and isinstance(item.get("detail"), str) and item["detail"].strip(), f"Malformed article bullet: {date}/{story_id}"
        for source in story["sources"]:
            url = urlparse(source["url"])
            assert url.scheme == "https" and url.netloc, f"Invalid source URL: {source['url']}"
            assert source.get("published"), f"Source missing publication date: {date}/{story_id}"
        for related in story.get("related", []):
            all_references.append((date, story_id, related["date"], related["id"]))

for date, story_id, related_date, related_id in all_references:
    assert (related_date, related_id) in all_ids, (
        f"Broken related-story link: {date}/{story_id} -> {related_date}/{related_id}"
    )

# Validate optional interactive-paper references and the JSON-only figure schema.
allowed_figures = {"decision-path", "study-flow", "result-bars", "toy-adherence"}
paper_slugs = set()
for edition in archive["editions"]:
    post = json.loads((ROOT / "data/posts" / f"{edition['date']}.json").read_text(encoding="utf-8"))
    indexed = {s["id"]: s for s in edition["stories"]}
    for story in post["stories"]:
        slug = story.get("paperSlug")
        indexed_slug = indexed[story["id"]].get("paperSlug")
        assert slug == indexed_slug, f"Explainer index mismatch: {edition['date']}/{story['id']}"
        if not slug:
            continue
        assert slug.replace("-", "").isalnum(), f"Invalid paper slug: {slug}"
        paper_slugs.add(slug)
        path = ROOT / "data/papers" / f"{slug}.json"
        assert path.exists(), f"Missing paper explainer: {slug}"
        paper = json.loads(path.read_text(encoding="utf-8"))
        assert paper["slug"] == slug, f"Paper slug mismatch: {slug}"
        assert paper["issue"] == edition["date"] and paper["storyId"] == story["id"], f"Broken paper return link: {slug}"
        source = paper["source"]
        parsed = urlparse(source["url"])
        assert parsed.scheme == "https" and parsed.netloc and source.get("published"), f"Invalid paper source: {slug}"
        assert len(paper["chapters"]) >= 3, f"Paper explainer too short: {slug}"
        figures = 0
        chapter_ids = set()
        for chapter in paper["chapters"]:
            assert chapter.get("id") and chapter["id"] not in chapter_ids, f"Duplicate chapter: {slug}"
            chapter_ids.add(chapter["id"])
            assert chapter.get("title") and (chapter.get("paragraphs") or chapter.get("bullets")), f"Missing chapter text: {slug}"
            if chapter.get("bullets"):
                assert len(chapter.get("paragraphs", [])) == len(chapter["bullets"]), f"Missing legacy paper fallback: {slug}"
            for item in chapter.get("bullets", []):
                assert isinstance(item, dict) and isinstance(item.get("lead"), str) and item["lead"].strip() and isinstance(item.get("detail"), str) and item["detail"].strip(), f"Malformed paper bullet: {slug}"
            if not chapter.get("explainer"):
                continue
            figures += 1
            figure = chapter["explainer"]
            figure_type = figure.get("type")
            assert figure_type in allowed_figures, f"Unsupported figure: {slug}/{figure_type}"
            assert figure.get("title") and figure.get("description"), f"Figure missing explanation: {slug}"
            if figure_type == "decision-path":
                assert figure.get("options") and all(len(o.get("alternatives", [])) == 2 for o in figure["options"]), f"Invalid decisions: {slug}"
            elif figure_type == "study-flow":
                assert len(figure.get("steps", [])) >= 2, f"Invalid steps: {slug}"
            elif figure_type == "result-bars":
                assert figure.get("datasets") and all(d.get("max", 0) > 0 for d in figure["datasets"]), f"Invalid chart: {slug}"
                for dataset in figure["datasets"]:
                    assert all(0 <= i["value"] <= dataset["max"] for i in dataset["items"]), f"Chart out of range: {slug}"
            elif figure_type == "toy-adherence":
                assert 0 <= figure["minimum"] <= figure["initial"] <= figure["maximum"] <= 100, f"Invalid slider: {slug}"
        assert figures >= 1, f"Paper needs a meaningful interactive figure: {slug}"

print(f"Validated {len(dates)} editions, {len(all_ids)} stories, "
      f"and {len(all_references)} cross-references.")
