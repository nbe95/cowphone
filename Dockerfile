FROM node AS core-builder

RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY core/package*.json .
RUN npm ci

COPY core/ ./
RUN npm run build


FROM node:alpine
ARG VERSION
ENV COWPHONE_VERSION=${VERSION}
ENV NODE_ENV=production

RUN apk update && apk add \
    tzdata \
    fortune

WORKDIR /app
COPY core/package*.json .
RUN npm ci --omit=dev

COPY --from=core-builder /app/dist ./dist
COPY core/assets ./assets
COPY frontend/static ./static

RUN mkdir ./barn
WORKDIR /app/barn

EXPOSE 21 80 3000-3009

CMD ["npm", "run", "start"]
