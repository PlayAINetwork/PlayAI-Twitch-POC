FROM oven/bun:canary

SHELL ["/bin/bash", "-c"]

RUN apt update

WORKDIR /app

COPY . .
COPY package.json .
COPY bun.lockb .
COPY src ./src
COPY tsconfig.json .

RUN bun install
CMD ["bun", "run", "start"]

EXPOSE 3000