FROM node as builder

WORKDIR /cowphone

COPY package*.json ./
RUN npm ci
COPY ./ ./
RUN npm run build


FROM node:alpine
ENV NODE_ENV production

RUN adduser -D coward
RUN apk add graphicsmagick

WORKDIR /cowphone

COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /cowphone/dist ./dist
COPY ./templates ./templates

EXPOSE 21 3000-3009
USER coward
CMD [ "node", "dist/app.js" ]
