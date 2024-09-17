
# Steps to run

- install and add to path system dependencies
  - ffmpeg
  - redis

- Install dependencies 
```bash
  npm ci
```

- Fill in the `.env` file
```bash
  cp .env.example .env
  # fill in the .env file with your own values
```

- Run migrations
```bash
  noce ace migration:run
```
- Run seeders
```bash
  node ace db:seed
```

- Start the server
```bash
  npm run dev
```

## Access
Default admin password is `admin123` and email is `admin@example.com`

## Collection
Insomnia collection is available in the root directory of the project
