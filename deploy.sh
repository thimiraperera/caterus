#!/bin/bash
# Deploy script for cPanel. Adjust APP_DIR, NODE_VER and BRANCH if needed.
APP_DIR="$HOME/caterus"
NODE_VER="24"
BRANCH="feature/nodejs-backend"

cd "$APP_DIR" || exit 1
git pull origin "$BRANCH"
source "$HOME/nodevenv/$(basename "$APP_DIR")/$NODE_VER/bin/activate"
npm install --omit=dev
touch tmp/restart.txt
echo "Deployed and restarted!"
