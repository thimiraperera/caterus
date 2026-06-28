#!/bin/bash
# Caterus deploy script for cPanel (Passenger / LiteSpeed).
# Usage: bash ~/repositories/caterus/deploy.sh
#
# Pulls the latest code, installs deps, kills the running node
# process and triggers a fresh start. Adjust the three settings
# below if your paths differ.

set -e

# ---- settings ----
APP_REL="repositories/caterus"      # app folder, relative to home dir
BRANCH="feature/nodejs-backend"
NODE_VER="24"
# ------------------

APP_DIR="$HOME/$APP_REL"
VENV="$HOME/nodevenv/$APP_REL/$NODE_VER/bin/activate"

cd "$APP_DIR"

echo "==> Pulling latest from origin/$BRANCH"
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "==> Activating Node $NODE_VER"
source "$VENV"

echo "==> Installing dependencies"
npm install --omit=dev

echo "==> Stopping running app process"
pkill -f "lsnode:$APP_DIR" 2>/dev/null && echo "    killed" || echo "    none running"

echo "==> Triggering restart"
mkdir -p tmp
touch tmp/restart.txt

echo "==> Done. App restarts on the next request."
