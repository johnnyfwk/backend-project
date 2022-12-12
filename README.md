To create the environment variables:
- at repo root level, create two .env files, one named '.env.test', the other named '.env.development';
- In the '.env.test' file, enter 'PGDATABASE=' and the name of the test database, in this case 'nc_games_test', so the file reads 'PGDATABASE=nc_games_test';
- In the '.env.development' file, enter 'PGDATABASE=' and the name of the dev database, in this case 'nc_games', so the file reads 'PGDATABASE=nc_games';