# Operations runbook (local server PC)

## First-time setup on the Azoan server PC
1. Install Docker Engine (Linux) or Docker Desktop (Windows, needs WSL2).
2. Give the PC a fixed IP (router DHCP reservation), connect a UPS, disable sleep, enable auto-start after power loss in BIOS.
3. `git clone` the repo, then `cp .env.example .env` and set **strong, URL-safe passwords** (letters and digits only).
4. `docker compose up -d --build`
5. Open `http://<server-ip>/` from another PC. The header must not show the connection banner.
6. Optional demo data: `docker compose run --rm migrate node dist/db/seed.js`

## Updating
```
git pull
docker compose up -d --build     # migrations run automatically before the server starts
```

## Backups (daily)
- Schedule `ops/backup.sh` (cron or a systemd timer), for example at 02:00.
- Copy the `backups/` folder offsite every day (cloud drive via rclone, or a second disk kept in another room).
- **Test a restore monthly.**

## Restore (target: under 1 hour)
```
docker compose up -d db
docker compose exec -T db sh -c 'dropdb -U "$POSTGRES_USER" --if-exists "$POSTGRES_DB" && createdb -U "$POSTGRES_USER" "$POSTGRES_DB"'
docker compose exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner' < backups/db-YYYYMMDD-HHMMSS.dump
docker run --rm -v optier_uploads:/data -v "$PWD/backups":/backup alpine tar xzf /backup/uploads-YYYYMMDD-HHMMSS.tgz -C /data
docker compose up -d
```
After a restore on a brand-new volume, re-grant app-role permissions by running the migrate service: `docker compose run --rm migrate`.

## Access from the second warehouse and field technicians
Install Tailscale on the server PC and on the devices that need access, then browse to the server's Tailscale address. Do not forward router ports to the internet.

## HTTPS
- LAN-only: plain HTTP is acceptable for the pilot.
- With a real domain: point a hostname at the server and set `SITE_ADDRESS=support.example.com`. Caddy fetches certificates automatically when the server is reachable from the internet. For a private-IP-only server, use a DNS-challenge build of Caddy (documented here once the domain exists).

## Single point of failure
This is one PC. If it dies, the system is down until restored from backup. Management has been informed in writing: record the date here: ________
