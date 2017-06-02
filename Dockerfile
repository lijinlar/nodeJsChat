# Use an official base image
FROM node:4-slim

WORKDIR /app
#RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys E1DD270288B4E6030699E45FA1715D88E1DF1F24
#RUN echo "deb http://ppa.launchpad.net/git-core/ppa/ubuntu trusty main deb-src http://ppa.launchpad.net/git-core/ppa/ubuntu trusty main" > /etc/apt/sources.list.d/git.list
#RUN apt-get -y update
#RUN wget https://github.com/git/git/archive/v1.9.2.zip -O git.zip && unzip git.zip && cd git-* && make prefix=/usr/local all && make prefix=/usr/local install
#RUN apt-get install git
#RUN git clone  https://github.com/lijinlar/nodeJsChat.git app
ADD . /app
RUN npm install

# Make port 80 available to the world outside this container
EXPOSE 1755

# Run app.py when the container launches
CMD ["node", "server.js"]
