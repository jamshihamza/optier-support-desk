#!/bin/sh
# Runs once on first database creation (docker-entrypoint-initdb.d).
# Creates the restricted role the running app uses. Grants are applied by migrations.
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
create role ${APP_DB_USER} login password '${APP_DB_PASSWORD}';
grant connect on database ${POSTGRES_DB} to ${APP_DB_USER};
SQL
