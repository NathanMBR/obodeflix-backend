# OBODEflix - Backend

A Website made to share series, movies and animes with my friends. This is the backend side of it.

## Why "OBODE" in the name?

It has the name "OBODE" because that's the way some of my friends call me. It comes from a joke with a League of Legends character called "Ornn".

## Requirements

- A PostgreSQL instance (locally or using Docker)
- Node.js version 16 or higher
- Yarn 1

## Setup

1. Make sure you have a PostgreSQL instance running
1. Create a `.env` file following the same pattern as in the ".example.env" file
1. Install the packages with `yarn install`
1. Run the project with `yarn dev`
1. Build the project with `yarn build`
1. Push the Prisma migrations to the database using `yarn prisma migrate deploy`
1. Start the project with `yarn start:dev`

## Environment variables

- `DATABASE_URL`: The PostgreSQL instance URL. It's divided into 4 parts: `db_login` (the login to access the database), `db_password` (the password to access the database), `db_host` (the address to access the database) and `db_name` (the name of the database). Substitute those parts with your environment values.
- `PORT`: The port where your application will run. The default value is `3000`.
- `SECRET`: A secret word that will be used to encode your JSON Web Tokens. Make sure you use a strong secret, with a great diversity of letters, numbers and special characters.
- `SERIES_BASE_URL`: The root folder where all your series are saved.
