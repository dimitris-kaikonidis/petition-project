#!/bin/bash

psql_status=$(sudo service postgresql status)
psql_online="12/main (port 5432): online"
# redis_status=$(redis-cli ping)
# redis_online=$(PONG)
#  && ["$redis_status" = "$redis_online"]
if [ "$psql_status" = "$psql_online" ]
then 
    node server.js
else 
    sudo service postgresql start
    redis-server --daemonize yes
    node server.js
fi

