FROM node as builder

WORKDIR /cowphone

COPY package*.json ./
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*
RUN npm ci
COPY ./ ./
RUN npm run build


FROM node:alpine
ENV NODE_ENV production

RUN adduser -D coward
RUN apk update && apk add \
    graphicsmagick \
    build-base \
    g++ \
    cairo-dev \
    pango-dev \
    giflib-dev
WORKDIR /cowphone

COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /cowphone/dist ./dist
COPY ./templates ./templates

EXPOSE 21 3000-3009
USER coward
CMD npm run start
