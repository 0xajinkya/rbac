#!/bin/bash

NODE_ENV=${NODE_ENV:-test}
if [ $NODE_ENV == "test" ]; then
    docker exec -i sbac-postgres-test sh < ./scripts/database-test/flush-postgres.sh
fi