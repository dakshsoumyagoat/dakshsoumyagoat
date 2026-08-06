---
name: Removed views and persisted data
description: Data-retention rule for removing screens from the JEE Command Center.
---

When a screen is removed from navigation, retain its persisted data model and actions unless the user explicitly asks for deletion. This preserves existing user data and avoids breaking other features that may still depend on the records.

**Why:** Removing the Formula Vault and Syllabus Tracker should change the available UI, not silently erase saved formula notes or chapter-related state.

**How to apply:** Remove imports, routes, and navigation entries for the view, but keep backward-compatible store fields when they are harmless and still used by persisted state or other screens.