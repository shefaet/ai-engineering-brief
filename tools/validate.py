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

print(f"Validated {len(dates)} editions, {len(all_ids)} stories, "
      f"and {len(all_references)} cross-references.")
