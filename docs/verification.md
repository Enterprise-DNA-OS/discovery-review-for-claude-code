# Verification

25 October 2026, Linux, Node 22.23.4.

- npm install: PASS, no reported dependency vulnerabilities.
- npm test with embedded PGlite: PASS, 45 assertions and all 30 CLI commands exercised.
- npm test with an isolated PostgreSQL 16.2 database: PASS, the same 45 assertions and 30 commands.
- npm run demo: PASS, both migrations and idempotent seed.
- npm run view: PASS, two read-only reports.
- npm run docs: PASS, three document types and six fictional demo documents.
- Brand lint: PASS for README and user guides; no em dashes, banned phrases or author placeholders in authored prose.
- Landing page check: PASS, sourced pricing and attributed booking links.
- Headless page inspection: noindex,nofollow; six attributed booking links; all three demo tabs work; no horizontal page overflow at 1440px and 390px. Review desk and draft schedule inspected.

Tests cover dry runs, duplicate and corrected imports, rollback after a later invalid row, source revision changes, append-only decisions, record attribution, ambiguity, matter scoping, full-text search, missing family members, privileged family holds, escaped HTML and exports that refuse overwrite. The register importer uses a synthetic fixture following vendor-documented headers. No authenticated customer export was tested.

CI defines Linux, Windows and Postgres checks. Windows execution is not claimed by these local results. No document was sent or served, and no public release was performed.
