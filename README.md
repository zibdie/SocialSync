# SocialSync

A repository made to sync public social media accounts off of their respective profiles into other platforms like YouTube.

It was made with the purpose to preserve publically accessible data to other storage for safe keeping.

## Using Docker

If you wish to run this in a Docker container, simply clone the repository and ensure Docker daemon is running.

### Building Locally

```
docker build -t socialsync . && docker run -it --init socialsync
```

### Fetching The Latest Build from DockerHub

```
docker pull zibdie/socialsync:latest && docker run -it --init zibdie/socialsync
```
