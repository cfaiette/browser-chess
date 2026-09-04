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
| Packet lifecycle to `PR_READY` | SF-0006 stuck `implementing` after repair fail; work continued on integration branch | Incomplete |
| Review-ready PR on GitHub | **Blocked**: no `gh` login, SSH publickey denied, `github_token_set: false` | Incomplete |

## Hard blocker
Publish requires operator auth: Settings → GitHub token (PAT), or `gh auth login`, or authorize SSH key.

## Ready to publish
Branch: `factory/SF-0006/integration` @ tip with PR draft `docs/PR_DRAFT.md`.
