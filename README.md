# MMM-Sector-Alarm

# Install
cd ~/MagicMirror/modules
git clone <your-repo> MMM-SectorAlarm
cd MMM-SectorAlarm
npm install

# config.js
{
    module: "MMM-SectorAlarm",
    position: "top_right",
    config: {
        email: "your@email.com",
        password: "yourpassword",
        siteId: "12345678",
        updateInterval: 300000
    }
},



To find your siteId, the Sector Alarm library documentation says to log in to:
https://mypagesapi.sectoralarm.net
