# Chùa An Lạc 3D — online deployment candidate

Three.js + TypeScript + Vite frontend and a Colyseus multiplayer server. All temple architecture, avatar geometry, worship animation curves, camera, collisions and personal practice features from Milestone 1 are retained. This branch adds invite-only rooms for up to 20 players. Nothing has been deployed or pushed.

**Beginner guide:** [DEPLOYMENT.md](DEPLOYMENT.md), in Vietnamese, lists accounts, exact dashboard fields, click order, costs/limitations and the final Zalo invitation flow. [MILESTONE_3_REPORT.md](MILESTONE_3_REPORT.md) explains implementation and test coverage.

## Stable version and this candidate

The stable game remains in `/Users/khiem/Downloads/ChatGPT/Vietnamese-Temple-3D`, on `main`, tagged `milestone-1-stable` (`0c24b39`). This candidate is a separate Git worktree in `/Users/khiem/Downloads/ChatGPT/Vietnamese-Temple-3D-online`, branch `codex/online-deployment`. Do not delete the stable folder: it owns the shared Git metadata. Use `git archive` for a standalone source copy, or clone the future GitHub repository. The ignored local `.runtime` symlink points to the stable Mac's Node installation; it is not shipped.

## Run locally

Requires Node **22.12+ in the 22.x series** and npm. On this Mac, use `PATH="$PWD/.runtime/bin:$PATH"` before commands. On a fresh computer install official Node 22.x first.

```sh
npm ci
npm ci --prefix server
```

Copy `.env.example` to `.env.local`, and `server/.env.example` to `server/.env` once. Do not overwrite an existing configuration. The examples use local WebSockets at `ws://127.0.0.1:2567`.

Terminal 1, from the candidate folder:

```sh
npm run server:dev
```

Terminal 2, from the candidate folder:

```sh
npm run dev -- --port 5174 --strictPort
```

Open **http://127.0.0.1:5174/**. Click **Chơi cùng bạn bè**, enter a display name, then **Tạo phòng riêng**. Open the invitation in a second tab, enter another name, click **Vào phòng**. The same code means the same room. Keep both terminals open; Control+C stops each server. `Start Online Preview.command` performs this local startup on this Mac after dependencies are installed. The original `Start Temple.command` is retained for the stable game; use the new launcher for online testing.

Without `VITE_MULTIPLAYER_URL`, normal `npm run build` still builds the single-player game. The deployment command `npm run build:online` intentionally requires a `wss://` endpoint. Never publish a local `127.0.0.1` endpoint.

## Controls

- WASD: walk relative to camera; drag left mouse: orbit; wheel: zoom.
- E: interact / request a free cushion or reading seat; R: stand and release the seat.
- 1: palms; 2: kneel; 3: one prostration; 4: meditation; 5: bow; 6: three prostrations.
- H / hall button: return to hall; courtyard button: return outside.
- T: beads; M: wooden fish; K: page-turning scripture book; N: rituals and virtual donations.
- Online room button: invite / leave. Expand chat to write to this room.

Desktop keyboard and mouse are required. Sending a link through Zalo works, but full phone/touch controls and Zalo's embedded browser are not yet supported.

## Checks

```sh
npm test
npm run test:online
npm run build
npm run server:build
VITE_MULTIPLAYER_URL=wss://YOUR-SERVICE.onrender.com npm run build:online
```

The online tests launch disposable local backend processes on ports 2568/2569, use 20 actual SDK WebSocket clients, then stop their processes. They do not contact Render or Vercel. Production output: `dist/` (frontend), `server/dist/` (backend). Do not commit output, dependencies, `.runtime`, or real `.env` files.

## Layout

- `src/main.ts`, `details.ts`: original temple and local controls.
- `src/avatar.ts`: original articulated rig, reused for remote visitors.
- `src/animation.ts`: original procedural worship controller.
- `src/multiplayer.ts`: room UI, invitations, remote avatars, chat, reconnect and shared effects.
- `shared/protocol.ts`, `world-layout.json`: versioned protocol, 20 seats, exact collision layout.
- `server/src/`: authoritative room state, validation, seat claims, reconnection and origin restrictions.
- `vercel.json`, `render.yaml`, `.env.example`, `server/.env.example`: deployment configuration.

If scenery/colliders change later, regenerate `shared/world-layout.json` from the rendered DOM metadata element `#world-collision-layout`, review it, rebuild both sides and bump `PROTOCOL_VERSION`. A runtime hash mismatch disables online play instead of using different collision maps.

Rooms, seats, chat and shared effects live only in one server's memory. Keep exactly one backend instance. A restart or new deployment destroys rooms; create a new room/link afterwards. This is a small private-room prototype, with no durable accounts, moderation service, payments, database or multi-instance scaling.
