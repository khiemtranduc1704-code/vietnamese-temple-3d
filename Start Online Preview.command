#!/bin/zsh
cd "${0:A:h}" || exit 1
export PATH="$PWD/.runtime/bin:$PATH"
if ! command -v node >/dev/null || ! command -v npm >/dev/null; then
  print 'Install official Node.js 22.x, then reopen this launcher.'
  read '?Press Enter to close.'
  exit 1
fi
if [[ ! -d node_modules || ! -d server/node_modules ]]; then
  print 'Run npm ci and npm ci --prefix server in this folder first.'
  read '?Press Enter to close.'
  exit 1
fi
for preview_port in 2567 5174; do
  if lsof -tiTCP:$preview_port -sTCP:LISTEN >/dev/null 2>&1; then
    print "Port $preview_port is already in use. Close the earlier online preview Terminal, or open http://127.0.0.1:5174 if it is already running."
    read '?Press Enter to close.'
    exit 1
  fi
done
[[ -f .env.local ]] || cp .env.example .env.local
[[ -f server/.env ]] || cp server/.env.example server/.env
npm run server:build || { read '?Build failed. Press Enter to close.'; exit 1; }
DOTENV_CONFIG_PATH="$PWD/server/.env" node server/dist/server/src/index.js &
online_server_pid=$!
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174 --strictPort &
online_frontend_pid=$!
trap 'kill $online_server_pid $online_frontend_pid 2>/dev/null' EXIT INT TERM
print 'Open http://127.0.0.1:5174/ in Chrome. Keep this window open. Press Control+C to stop.'
wait
