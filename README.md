# parental-control

This project aims to provide a tool to apply a filter on TP-LINK router (300Mbs) that prevents specific MAC addresses from connecting to wireless network (for parental control for example).

The basic idea is that there's 2 jobs that launch to activate and deactivate the filter at specific times. 

## How to install

Use the following to install required libraries
```
$ npm install
```

## How to run

Create an dotenv environment file using the following tempalte:

```
WIFI_ADMIN_USERNAME="xxxxxx"
WIFI_ADMIN_PASSWORD="xxxxxx"
BLACK_LIST="MAC_ADDRESS1,MAC_ADDRESS2,..."
ROOT_FOLDER="/your/project/full/path"
APP_NAME="parental_control"
LOG_LEVEL_CONSOLE="error"
LOG_LEVEL_FILE="info"
```

> **N.B:** By default, the program expects a `.env` in the root folder. but if you wish to use another file provide the environemnt paramter `DOTENV_FILE_PATH`.

Use the following command to launch
```
$ node main.js 
```

## Run as a daemon

Here's an example of systemd service:

```
[Unit]
Description=wifi control parental app
Documentation=https://github.com/soufi/wifi-parental-control
After=ulti-user.target

[Service]
Environment=DOTENV_FILE_PATH=/home/pi/Documents/parentalcontrol/.env
Type=simple
User=pi
ExecStart=/home/pi/.nvm/versions/node/v16.13.1/bin/node /home/pi/Documents/parentalcontrol/main.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

