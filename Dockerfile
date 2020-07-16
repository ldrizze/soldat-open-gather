FROM node:12
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
RUN npm run build
CMD [ "npm", "start" ]
