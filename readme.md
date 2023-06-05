## Description

This is a API Rest project with services related to create and manage users, posts and comments resources. 

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

## Don't forget to run migrations with prisma

```bash
# Running migrations
$ npm run prisma:deploy
```

## Running the app

```bash
$ npm run dev
```

## Running tests

```bash
$ npm run test
```

## Running test coverage

```bash
$ npm run test:coverage
```