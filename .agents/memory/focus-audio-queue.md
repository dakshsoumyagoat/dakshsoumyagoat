---
name: Focus audio queue
description: Browser-local MP3 queue behavior and persistence boundary.
---

The Focus Mode MP3 queue uses browser object URLs for local files and intentionally does not persist audio bytes across reloads.

**Why:** Object URLs are valid for the current browser session but cannot restore playable file data after reload. Persisting the queue across reloads would require IndexedDB or another binary storage layer.

**How to apply:** Keep audio queue state separate from timer recovery and app store data. If reload persistence becomes a requirement, migrate the file blobs to IndexedDB rather than localStorage.