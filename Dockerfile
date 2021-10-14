FROM node:14

RUN apt update

RUN apt install -y libgconf-2-4 libatk1.0-0 libatk-bridge2.0-0 libgdk-pixbuf2.0-0 libgtk-3-0 libgbm-dev libnss3-dev libxss-dev lib32z1 lib32ncurses5

# WORKDIR /app

COPY /app/package*.json ./

RUN npm install

COPY /app/. .

EXPOSE 3000

CMD [ "npm", "run", "start" ]

