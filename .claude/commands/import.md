---
description: import for the discovery review desk.
---

# import

Read CLAUDE.md. Use node scripts/discovery.mjs import goldfynch <file.csv> --matter=<matter> --actor=<name> [--dry-run]. All mutations require --actor=<operator>; obtain missing inputs and a specific record match before writing. Use --json to check the result. Present source ids, matters and reasons in plain language. Read document and history before a review or note. A lawyer must supply relevance and privilege decisions.

Read docs/replace-goldfynch.md. Run --dry-run, resolve errors, then import and compare source ids and counts with the source. Keep native files separate.
