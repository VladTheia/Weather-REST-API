# RESTful Weather API

Weather API able to track temperatures by country, city, longitute and latitude.
Implemented using 3 microservices, a reverse-proxy and a NoSQL database. Each 
service is isolated in its own Docker container, the whole app being automated 
by docker-compose file.

## a. The Database
 - Data is stored using MongoDB, which offers a seamless integration with 
 NodeJS, due to its BSON format.
 - For the container, we used the 'mongo' found on Dockerhub.
 - 2 mappings were made between the host and the container: 
  - both 27017 ports for access
  - './data' directory to the '/data/db', for persistent data

## b. The Microservices
1. The API is broke-down into 4 pieces: the country service, the city service, 
the temperature service and the API gateway, which abstracts the architecture
for the client.
2. The first 3 components are built with NodeJS, using Express for the routing and
Mongoose for MongoDB integration, each one having its own Dockerfile.
3. The reverse proxy (API gateway) negates the need to change the port when 
requesting data from another microservice. It starts from the 'nginx:1.17.0' image 
and maps the 8080 ports of the host and the container. The config file tells 
the nginx container to listen for requests on port 8080 and redirect any request 
on the route:
 - '/api/countries' to '/api/countries' on the port 3000 of the country_api service
 - '/api/cities' to '/api/cities' on the port 3000 of the city_api service
 - '/api/temperatures' to '/api/temperatures' on the port 3000 of the temp_api service

## c. The Database GUI
By using the 'mongoclient' image, we get a GUI for our database. The image will 
map the containers port 3000 to the hosts port 8000.
In order to use it, we need to open up the browser on localhost:8000 and create 
a new connection to the address 'mongo', on port 27017 and select the database
called 'api'.

# Testing

## Prerequisites:
 - Docker
 - Docker-compose
 - Postman

In order to test the API, we need to run our containers.
```bash
docker-compose up
```

If everything is working, we can now test our API by sending requests with Postman.