# Milestone 3 — deployment preparation report

Historical preparation snapshot. The project has since been deployed; see [ONLINE_DEPLOYMENT_REPORT.md](ONLINE_DEPLOYMENT_REPORT.md) for the live verification results.

Prepared locally on 2026-10-30. No repository, hosting service, account, paid plan or public deployment was created. No push was performed.

## Initial inspection

The stable checkpoint (`milestone-1-stable`, `0c24b39`) contained a working single-player Three.js game. It had no multiplayer SDK/server, synchronized player state, room creation/join, seat ownership, chat, reconnection or production network configuration. Merely deploying that version would give each friend an independent temple. Those gaps were identified before preparing the online candidate.

All source/configuration files in the existing project were inspected. The scene, architecture, avatars, practice/ritual modules, animation controller, navigation and camera were retained. The articulated avatar and pose application were extracted without changing their geometry/animation curves so the same rig can render remote visitors.

## Candidate implementation

Separate worktree: `/Users/khiem/Downloads/ChatGPT/Vietnamese-Temple-3D-online`, branch `codex/online-deployment`. Original stable directory and its `main` branch remain at `0c24b39`.

- Colyseus 0.18 server and matching browser SDK; room capacity 20, including the creator.
- Private, unlisted rooms with cryptographically random 18-character hex invitation codes. Matching room code joins the same server room. Codes are access capabilities, not authenticated identities.
- Player names, position, heading, walking state and all six worship actions synchronized. Remote avatars interpolate movement and reuse the original procedural worship controller.
- Server validates finite inputs, movement speed, swept collision checks against the same 57 scene colliders, worship clearance, bounds and standing requirements. Local walking remains responsive; server corrections resolve invalid movement. This prototype does not provide sophisticated lag compensation or collision avoidance between every pair of walking avatars.
- Exclusive claims for 18 meditation cushions and 2 scripture reading seats. Standing/leaving releases the seat; temporary disconnection retains the reservation for up to 20 seconds. SDK automatic reconnection was tested.
- Room-isolated, length-limited plain-text chat; shared bell/wooden-fish sounds and incense/star-lamp state. Personal beads, scripture pages, donation totals and fortune results remain personal browser data. Virtual money is unchanged; no payment service exists.
- Exact production HTTPS origin allowlist for matchmaking and WebSocket upgrades, payload limits, message/join rate limits, room count cap and protocol/world-layout compatibility checks. No public room directory, monitoring dashboard or secrets are exposed in the frontend. Public `/health` intentionally reports basic readiness only.
- Vercel frontend configuration, Render single-instance Free blueprint, environment examples, ignored local configs, beginner deployment guide and a separate local online launcher.
- Online deployment build requires a WSS endpoint. Offline build remains available. Actual provider URLs must be supplied later; the build verification uses a clearly fictitious endpoint.

## Reproducible issues resolved during verification

- A different invitation opened in an already-loaded page previously left the old room code in the input. Hash changes now refresh the invitation field.
- The online counter initially updated a hidden intro button instead of the visible HUD. It now updates the correct HUD.
- Nearby remote characters could shorten the scenery camera ray and push the camera into the local character. Remote avatar hierarchies are now excluded; scenery still blocks the camera. A regression assertion covers this case.
- Nearby player name labels could cover a large part of the view. Labels now keep a small screen size, follow the head and respect depth.
- Replacing planted incense visuals now disposes the removed geometry, avoiding repeated GPU allocations during shared updates.
- Production dependency installation explicitly includes build-time dev dependencies on Render, ensuring TypeScript is available even with `NODE_ENV=production`.

## Verification

- Five original regression suites passed: worship transitions/movement lock/three cycles, beads/books, virtual rituals, navigation and camera. Camera coverage extended for remote avatars.
- Backend production TypeScript compilation passed.
- Frontend TypeScript + Vite production online build passed with a WSS placeholder; normal local build also passed.
- Clean source copy without local env files, runtime, existing dependencies or build outputs successfully ran `npm ci` and the online frontend build. Its backend successfully ran `NODE_ENV=production npm ci --include=dev --prefix server` and compiled.
- Real SDK integration test joined 20 concurrent WebSocket clients into one room; synchronized counts, rejected a 21st player, rejected invalid/version-mismatched rooms, tested separate rooms and sanitized chat.
- Integration tests verified valid movement, seat contention/release, blocked walking while meditating, reconnect preserving session/seat, excessive/non-finite movement rejection, shared bow completion and room-isolated incense.
- Production-mode tests verified an authorized SDK WebSocket join, health, exact allowed HTTPS origin, rejection of missing/wrong HTTP origins, wrong WebSocket origin and oversized HTTP bodies.
- Production dependency audit reported zero known vulnerabilities for both packages at verification time. This is a point-in-time registry result, not a security guarantee.
- Browser test: two actual WebGL tabs joined via invitation, showed 2/20, rendered the existing temple and remote worship poses, and exchanged chat. No browser console warnings/errors were observed in that final verification session.
- Build guards also rejected a missing endpoint, insecure public WS and local WS in online deployment mode.
- Git whitespace checks and launcher shell syntax passed. The launcher compiled and started both local services; frontend returned HTTP 200 and backend health reported maxPlayers 20. Control+C stopped both candidate processes; the existing stable server at 5173 remained running. Local config, runtime, dependencies and output are ignored.

## Remaining limits and manual tests

No live provider environment has been created, so real Render/Vercel DNS, TLS/WSS routing, account settings, dashboard configuration and cold starts remain untested. The 20-client test runs local networking/state synchronization, not 20 separate graphical devices or a capacity benchmark for Render Free.

Before inviting friends, perform the cross-network checklist in `DEPLOYMENT.md`: two independent computers/networks, all worship motions, walking/collision/camera, seat races, audio after user gesture, room isolation, short/long network interruptions, provider restart and then gradual 5/10/20-player load. Visual appearance of remote late-join/reconnect animations under high latency needs human review.

Render Free can sleep and has resource/usage limits. It is suitable for a trial, not a continuous production availability promise. All rooms/chat/seats/shared effects are in one server's RAM; restart, redeploy or sleep loses them. Multiple backend instances, durable room restoration, accounts/moderation and touch/mobile controls remain outside this milestone.

Non-fatal build warning: the main frontend bundle is approximately 749 kB (about 210 kB gzip); it contains Three.js and the multiplayer SDK. Initial download/performance on weaker devices needs manual testing. Colyseus emits a deprecation warning for its supported `defineTypes` API; compilation and schema synchronization pass with pinned dependencies.

## Review and local checkpoint

Check `git log -1` and `git show milestone-3-deployment-prepared --stat` in the candidate folder for the checkpoint. No force operations, merges into stable `main`, remote creation or pushes are part of this preparation.
