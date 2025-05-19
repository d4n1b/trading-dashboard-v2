#!/bin/sh

# Start cron daemon
/usr/sbin/crond -f -l 8 &

# Start the Next.js server as nextjs user
su -s /bin/sh nextjs -c "cd /app && npm start"
