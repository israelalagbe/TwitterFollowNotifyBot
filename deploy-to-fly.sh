#! /bin/sh
echo "Deploying the web server"
echo "cp web-Dockerfile Dockerfile"
cp web-Dockerfile Dockerfile

echo "cp web-fly.toml fly.toml"
cp web-fly.toml fly.toml

echo "fly deploy"
fly deploy

rm Dockerfile
rm fly.toml

echo "Deploying the cron job"
echo "cp cron-Dockerfile Dockerfile"
cp cron-Dockerfile Dockerfile

echo "cp cron-fly.toml fly.toml"
cp cron-fly.toml fly.toml

echo "fly deploy"
fly deploy

rm Dockerfile
rm fly.toml