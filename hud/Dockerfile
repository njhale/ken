FROM node:6.10.1

MAINTAINER Nick Costanzo <costanzo.nicholas.j@gmail.com>

# Switch to user root
USER root

# Create a working directory for the application to sit in
WORKDIR /app

# For OpenShift, only do this if you are building with --from-repo so the
#   .gitignore will remove unnecessary files
#   Otherwise manually copy individual files and directories
COPY . .

# install dependencies, install typings for typescript, build the angular app,
#   and give the necessary permissions for things to work correctly
RUN apt-get update && apt-get install -y rsync && \
    npm install && \
    npm run ng build - --prod && \
    npm install -g nodemon && \
    chmod 777 -R /app && mkdir /.config && chmod 777 -R /.config

# Expose the nodejs port
EXPOSE 8080

# Switch to default unelevated user for container process execution
USER 1001

# Run the start script
# ENTRYPOINT ["npm", "start"]
ENTRYPOINT ["nodemon", "server.js"]
