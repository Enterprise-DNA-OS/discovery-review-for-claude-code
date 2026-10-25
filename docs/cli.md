# Discovery CLI

Every command accepts --json. All mutations require --actor=<name>. Put quotes around names and notes containing spaces. --matter narrows document names and source ids. Exact case-insensitive names and source ids are tried before partial names or UUID prefixes. Ambiguity lists candidates and exits 1.

- help
- matters
- add-matter <name> --owner=<name> --purpose=<purpose>
- matter <name-or-id>
- set-matter <matter> --owner= --purpose= --disclosure-due=YYYY-MM-DD --retention-review=YYYY-MM-DD --legal-hold=true|false
- documents [--matter=<matter>]
- add-document <matter> <source-id> <name> --custodian=<name>
- document <source-id-or-name> [--matter=<matter>]
- assign <document> --owner=<name> --due=YYYY-MM-DD
- review <document> --disposition=disclose|privileged|irrelevant --reason=<text> --actor=<reviewer> [--adverse=true]
- set-document <document> --custodian=<name> --date=YYYY-MM-DD --actor=<name>
- review-queue [--matter=]
- privilege-log [--matter=]
- adverse-documents [--matter=]
- family-gaps [--matter=]
- duplicates [--matter=]
- chronology [--matter=]
- search <words> [--matter=]
- attention [--matter=]
- compliance [--matter=]
- disclosure-readiness [--matter=]
- weekly-review [--matter=]
- log <document> <note> --actor=<name>
- history <document>
- imports
- import goldfynch <file.csv> --matter=<matter> --actor=<name> [--dry-run]
- export --out=<private-file.json>
- ingest-text <document> <file.txt> --actor=<name>
- draft-disclosure <matter>
- draft-review <matter>

Examples:

```bash
node scripts/discovery.mjs assign GF004 --owner=Wiremu --due=2026-12-01 --actor=Mere
node scripts/discovery.mjs review GF001 --disposition=disclose --reason="Relevant signed agreement" --actor=Mere
node scripts/discovery.mjs search "damaged delivery" --matter="Harbour Supply dispute" --json
node scripts/discovery.mjs import goldfynch examples/goldfynch-file-list.csv --matter="Harbour Supply dispute" --actor=Mere --dry-run
node scripts/discovery.mjs export --out=exports/discovery-snapshot.json
```

Dates must be YYYY-MM-DD. set-document records a confirmed custodian and date and invalidates the prior review. ingest-text accepts UTF-8 text and stores its SHA-256; it invalidates a prior review when the supplied text changes. Original evidence is retained separately by the operator. Nothing extracts text from PDF, email or office formats.

Every change is attributed in activity. Decisions, import records, notes and activity are append-only at the application schema level. Database owners remain able to alter the schema. Export includes all matters, source rows, text, decisions, notes, imports and history as JSON; it is a private working backup, not a production for another party. Back up the database itself and separately held original files too. Export refuses to overwrite an existing path. Drafts use unique filenames. No command sends or files anything.
