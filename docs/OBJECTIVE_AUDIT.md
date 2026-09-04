# Objective audit (SF-0006 / browser-chess)

Date: 2026-09-04. Evidence from current tree — not claimed complete.

| Requirement | Evidence | Status |
|---|---|---|
| Clone at `repositories/browser-chess/source` | Repo present, remote `https://github.com/cfaiette/browser-chess.git` | Met |
| ARCHITECTURE.md first | `ARCHITECTURE.md` present | Met |
| Verification loop (Chrome PNG+JSON) | `npm run verify:chrome` → `docs/verify-chrome.json` + 6 PNGs | Met |
| Module fan-out folders | Each subsystem has `index.js` with `init/showcase/update/on/off/destroy`; `test/moduleApi.test.js` green | Met |
| Critic ≥ 8.5 | `docs/STATUS.json` overall **8.5** | Met (honest scores) |
| Final gate / playable game | Rules+AI+UI+SFX+Staunton GLB; tests+build green | Met with nits |
| `docs/STATUS.json` | Present, updated | Met |
| Packet lifecycle to `PR_READY` | SF-0006 status **blocked** (`BLK-AUTH-001`); product on integration branch; resume after auth | Incomplete (documented blocker + retry) |
| Review-ready PR on GitHub | **Blocked**: `github_token_set: false`; remote only `main`, 0 open PRs | Incomplete |

## Hard blocker
Publish requires operator auth:
1. https://github.com/login/device (device code in `tmp/sf-0003-status.txt` / `AUTH_REQUIRED.md`)
2. or PAT at http://127.0.0.1:4173/settings → GitHub token → Save
3. or `gh auth login`

Watchers: `bin/poll-device-auth-and-publish.sh`, `bin/watch-pat-and-publish.sh` auto-push + mark `PR_READY`.

## Ready to publish
Branch: `factory/SF-0006/integration` @ tip with PR draft `docs/PR_DRAFT.md`.
Evidence: `packets/SF-0006/evidence/blocker-github-auth.md`.
