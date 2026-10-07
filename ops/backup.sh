#!/usr/bin/env bash
# Daily backup: database dump + uploaded files. Run from cron/systemd timer on the server PC.
# Keeps 14 days locally. Copy $BACKUP_DIR offsite afterwards (rclone, rsync, or a USB disk).
set -euo pipefail
cd "$(dirname "$0")/.."
BACKUP_DIR="${BACKUP_DIR:-./backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB"' > "$BACKUP_DIR/db-$STAMP.dump"
docker run --rm -v optier_uploads:/data:ro -v "$(cd "$BACKUP_DIR" && pwd)":/backup alpine \
  tar czf "/backup/uploads-$STAMP.tgz" -C /data .

find "$BACKUP_DIR" -type f \( -name 'db-*.dump' -o -name 'uploads-*.tgz' \) -mtime +"$KEEP_DAYS" -delete
echo "Backup written: $BACKUP_DIR/db-$STAMP.dump and uploads-$STAMP.tgz"
