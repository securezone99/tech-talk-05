# Stage 1: Compile and Build angular codebase
FROM node:19.2.0-buster-slim as build

# Set the working directory
WORKDIR /usr/local/app

# Install all the dependencies
COPY ai-chat-frontend/package.json /usr/local/app/
COPY ai-chat-frontend/yarn.lock /usr/local/app/
COPY ai-chat-frontend/.npmrc /usr/local/app/

ARG JFROG_NPM_AUTH

RUN yarn install

# Add the source code to app
COPY ai-chat-frontend/ /usr/local/app/

# Generate the build of the application
RUN yarn run build:prod

# Stage 2: Serve app with nginx server
FROM nginx:mainline-alpine 

# Copy the build output to replace the default nginx contents.
COPY --from=build /usr/local/app/dist/ai-chat-frontend /usr/share/nginx/html
COPY ai-chat-frontend/entrypoint.sh /usr/share/nginx/html/entrypoint.sh

# Copy the nginx config file to allow proxy
COPY ai-chat-frontend/nginx/proxy.conf /etc/nginx/conf.d/

# Expose port 80
EXPOSE 80

# Define variables again even if defined in baseimage to shut up Dockerlint
ENV PATH_TO_ENVIRONMENT_VARIABLES="/usr/share/nginx/html/"

CMD ["/usr/share/nginx/html/entrypoint.sh"]