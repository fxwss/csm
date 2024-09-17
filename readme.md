
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

- Make necessary paths
```bash
  mkdir -p tmp
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

## Oberservations
- The project is not fully completed, there are some features that are not implemented as it's only a POC;
- SQLite is used as the database for the project as it's easy to setup and use;
- Adonis is used as the backend framework as it's easy to use and has a lot of the necessary features out of the box;
- Redis is used as the cache store for the project as it's easy to setup, use and scale;
- [HLS](https://en.wikipedia.org/wiki/HTTP_Live_Streaming) was used as the streaming protocol as it's widely supported and easy to use;
- There's no explicity concurrency control as nodejs take care of that;

## Future Improvements
- Add signed url's for the video files;
- Move to a more robust database like Postgres;
- Write a better tool for the video processing, as the current one is just a simple fixed ffmpeg command;
- There's not suficient data in Video mode, it would be nice to have more data like views, likes, dislikes, etc; (duration and size) are not needed as they can be calculated;
- Add a better way to handle the video processing, like a queue system;
- Add a better way to handle the video streaming, like a CDN;
