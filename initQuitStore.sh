#!/bin/bash

docker system prune -f

docker run -it --name containername -p 8080:8080 -v quitrepo:/data aksw/quitstore

curl -d "insert data { graph <http://example.org/> { <urn:shacleditor> <http://shacleditor#id> 0 } }" -H "Content-Type: application/sparql-update"  http://localhost:8080/sparql
