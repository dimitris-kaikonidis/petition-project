#!/bin/bash

status=$(sudo service postgresql  status)
online="12/main (port 5432): online"

if [ "$status" = "$online" ]
then 
    node server.js
else 
    sudo service postgresql start
    node server.js
fi