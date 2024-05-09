FROM node as builder

WORKDIR /cowphone

COPY package*.json ./
RUN npm ci
COPY ./ ./
RUN npm run build


FROM node:slim
ENV NODE_ENV production

WORKDIR /cowphone

COPY package*.json ./
RUN npm ci --production
COPY --from=builder /cowphone/dist ./dist
COPY ./media ./media

EXPOSE 21 3000-3009
USER node
CMD [ "node", "dist/app.js" ]
