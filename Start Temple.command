#!/bin/zsh
cd "${0:A:h}"
if [[ -x "$PWD/.runtime/bin/node" ]]; then
  export PATH="$PWD/.runtime/bin:$PATH"
fi
if ! command -v node >/dev/null || ! command -v npm >/dev/null; then
  echo 'Please install Node.js 22 LTS from https://nodejs.org, then double-click this file again.'
  read '?Press Return to close.'
  exit 1
fi
if [[ ! -d node_modules ]]; then
  npm install || exit 1
fi
npm run dev -- --open
