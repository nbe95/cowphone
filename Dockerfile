FROM node AS builder

RUN apt-get update && apt-get install -y \
    build-essential \
    # libcairo2-dev \
    # libpango1.0-dev \
    # libjpeg-dev \
    # libgif-dev \
    # librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY ./ ./
RUN npm run build


FROM node:alpine
ARG VERSION
ENV COWPHONE_VERSION=${VERSION}
ENV NODE_ENV=production

RUN adduser -D coward
RUN apk update && apk add \
    tzdata \
    fortune

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY ./static ./static

EXPOSE 21 80 3000-3009
RUN mkdir ./barn

CMD ["npm", "run", "start"]
