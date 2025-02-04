## Docker configuration

In docker compose yml file for both dev and prod, modify the image and container name according to the project

## Docker commands

build and run dev container:
docker-compose -f docker-compose.dev.yml up --build

build and run prod container:
docker-compose -f docker-compose.prod.yml up --build

remove everything from docker [If needed]:
docker volume prune -f
docker container prune -f
docker image prune -a -f
docker builder prune -a -f

## ENV config

Provide db credentials and JWT values in env

## API rate limiting testing:

Install wrk with homebrew. Then test with this- wrk -t1 -c20 -d20s http://localhost:3000/api/user/all
here -c20 means 20 concurrent requests, -d20s means within a span of 20 sec

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Compile and run the project

- Dev mode
  npm run dev

- Prod mode
  npm run prod

- clean dist folders and build new
  npm run clean

- To run the compodoc
  npm run doc
  \*\* then check the doc on this address- http://localhost:3001/

## Swagger Doc

- Check the api doc at http://localhost:3000/api/doc
