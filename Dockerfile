FROM node:latest
ARG PORT=8080
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE ${PORT}
CMD ["npm","start"]
