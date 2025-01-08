./scripts/database-test/drop-database.sh

docker compose -f scripts/database-test/docker-compose.yml down --remove-orphans
