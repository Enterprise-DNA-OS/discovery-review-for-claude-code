# Discovery Review for Claude Code: operating instructions

Use for a legal team's internal document review desk. Read docs/compliance.md and docs/replace-goldfynch.md before importing business evidence. Every answer starts with a CLI read. Never infer privilege, relevance or disclosure authority from a tag or filename. A lawyer supplies the decisions.

## Routing

| Request | Recipe |
|---|---|
| matters | /matters |
| add matter | /add-matter |
| matter | /matter |
| set matter | /set-matter |
| documents | /documents |
| add document | /add-document |
| document | /document |
| assign | /assign |
| review | /review |
| set document | /set-document |
| review queue | /review-queue |
| privilege log | /privilege-log |
| adverse documents | /adverse-documents |
| family gaps | /family-gaps |
| duplicates | /duplicates |
| chronology | /chronology |
| search | /search |
| attention | /attention |
| compliance | /compliance |
| disclosure readiness | /disclosure-readiness |
| weekly review | /weekly-review |
| log | /log |
| history | /history |
| imports | /imports |
| import | /import |
| export | /export |
| ingest text | /ingest-text |
| draft disclosure | /draft-disclosure |
| draft review | /draft-review |
| Change a field or rule | /customise |
| Add a read-only report | /new-view |

## Rules

Use node scripts/discovery.mjs help for arguments; append --json when checking results. Every mutation needs --actor. Read the record and history first. If a name is ambiguous, list matches and ask. Never send, serve, delete, release privileged material or make an irreversible outward change. Drafts remain local. Do not treat a candidate schedule as permission to disclose. Never overwrite originals. Legal holds prevent routine disposal; this CLI has no deletion command.

A new business installation uses a fresh database and migrations without demo seed. Authentication, permissions and case isolation are required for a shared installation. Do not open privileged records in an external agent service without the firm's authority. Change the schema through forward migrations; test them on a temporary database first. Never change a historic migration already used for business data.

Schema: supabase/migrations. Data access: scripts/lib/db.mjs. The only domain CLI is scripts/discovery.mjs. The workflow library is .claude/commands. No alternate runtime copies.
