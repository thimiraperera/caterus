#!/bin/bash
cd /home/compcfcd/caterus
git pull origin feature/nodejs-backend
source /home/compcfcd/nodevenv/caterus/24/bin/activate
npm install --omit=dev
pkill -f "lsnode:/home/compcfcd/caterus"
echo "Deployed and restarted!"
