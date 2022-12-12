The files a developer must add in order to successfully connect to the two databses locally are:
- ./db/connection.js
- ./db/data/development-data/index.js
- ./db/data/test-data/index.js

To create the environment variables:
- set ENV to process.env.NODE_ENV || 'development' then append ENV
- append ENV to .env. where they are located in the repo
- add the path as an argument require('dotenv').config();