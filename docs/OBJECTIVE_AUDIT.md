# Objective audit (SF-0006 / browser-chess)

Date: 2026-09-04. Evidence from current tree after PR publish.

| Requirement | Evidence | Status |
|---|---|---|
| Clone at `repositories/browser-chess/source` | Repo present, remote `https://github.com/cfaiette/browser-chess.git` | Met |
| ARCHITECTURE.md first | `ARCHITECTURE.md` present | Met |
| Verification loop (Chrome PNG+JSON) | `npm run verify:chrome` → `docs/verify-chrome.json` + 6 PNGs | Met |
| Module fan-out folders | Each subsystem has `index.js` with `init/showcase/update/on/off/destroy`; `test/moduleApi.test.js` green | Met |
| Critic ≥ 8.5 | `docs/STATUS.json` overall **8.5** | Met |
| Final gate / playable game | Rules+AI+UI+SFX+Staunton GLB; tests+build green | Met with nits |
| `docs/STATUS.json` | Present, updated with PR URL | Met |
| Packet lifecycle to `PR_READY` | SF-0006 `pr_ready` (packet_version 12); `evidence/pr.json` | Met |
| Review-ready PR on GitHub | https://github.com/cfaiette/browser-chess/pull/1 (`factory/SF-0006/integration` → `main`) | Met |

## Publish path used
Windows Git Credential Manager authenticated `git push`; PR created via GitHub API; factory Settings token saved; packet marked `pr_ready`.
