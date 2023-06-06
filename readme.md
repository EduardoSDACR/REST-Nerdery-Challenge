## Description

This is a API Rest project with services related to create and manage users, posts and comments resources. 

## API Documentation:
You can check the documentation of the project with the route "/api-docs", but also you can use the next url to see it (will take some minutes to charge):
- https://rest-nerdery-challenge.onrender.com/api-docs

## Installation

```bash
$ npm install
```

## Using Docker Compose to start PostgreSQL database

```bash
# start database container
$ npm run db:up

# stop and delete database container
$ npm run db:rm

# restart database container
$ npm run db:restart
```

## Environment variables
You need to define the next variables in a .env file to make the project work normally:
```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/rest-challenge-db?schema=public
PORT=8000

JWT_SECRET_KEY=secret
JWT_EXPIRATION_TIME=30m

EMAIL_SENDER=
EMAIL_PASSWORD=
JWT_EMAIL_CONFIRMATION_EXPIRATION_TIME=10m
JWT_EMAIL_CONFIRMATION_SECRET_KEY=secret
```
If you run tests then you just need to define these variables in a .env.example file:
```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/rest-challenge-db?schema=testing

JWT_SECRET_KEY=secret
JWT_EXPIRATION_TIME=30m

JWT_EMAIL_CONFIRMATION_EXPIRATION_TIME=10m
JWT_EMAIL_CONFIRMATION_SECRET_KEY=secret
```


## Don't forget to run migrations with prisma

```bash
# Run migrations
$ npm run prisma:deploy
```

## Running the app

```bash
$ npm run dev
```

## Running tests

```bash
# Run migrations on test database if is the first time
$ npm run prisma:test-deploy

# Run tests
$ npm run test
```

## Running test coverage

```bash
$ npm run test:coverage
```