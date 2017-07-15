# BGAdminLite
BG Rust server admin

Telepítés Debian vagy Ubuntu alapú linuxon / Installation on Debian or Ubuntu based Linux distributions

1,
Nodejs telepítése / Install nodejs from repository

curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -

sudo apt-get install -y nodejs


2,
Nodejs modulok telepítése / Install modules for nodejs 

sudo npm install total.js -g

sudo npm install ws -g

sudo npm install random-js -g



3,
BGAdminLite letöltése / Clone or download BGAdminLite from github

git clone https://github.com/gyurasitszoltan/BGAdminLite.git BGAdminLite

VAGY / OR

wget https://github.com/gyurasitszoltan/BGAdminLite/archive/master.zip


4,
Konfigurálás / Configuration

config-example file átnevezése config -ra / rename config-example file to config

config file szerkesztése a megfelelő paraméterekkel / edit your config file 

5,
BGAdminLite futtatása / run BGAdminLite

node index.js


6,
Ajánlott a PM2 használata / Use PM2 manager

sudo npm install pm2 -g

pm2 start index.js


