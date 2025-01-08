#!/bin/bash

docker compose -f scripts/database-test/docker-compose.yml up -d --remove-orphans

docker exec -i sbac-postgres-test sh < scripts/database-test/create-database.sh

SQL_URL="postgresql://postgres:password@localhost:5432/sbac_test" prisma migrate deploy