const NodeHelper = require("node_helper");
const sectoralarm = require("sectoralarm");

module.exports = NodeHelper.create({

    start() {

        console.log("MMM-SectorAlarm helper started");

        this.site = null;
        this.configData = null;
    },

    socketNotificationReceived(notification, payload) {

        if (notification === "INIT") {

            console.log("Received INIT from frontend");

            this.configData = payload;

            this.initialize();
        }
    },

    async initialize() {

        try {

            console.log("Connecting to Sector Alarm...");
            console.log("Site ID:", this.configData.siteId);

            this.site = await sectoralarm.connect(
                this.configData.email,
                this.configData.password,
                this.configData.siteId
            );

            console.log("Sector Alarm login successful");

            await this.updateData();

            setInterval(() => {
                this.updateData();
            }, this.configData.updateInterval);

        } catch (error) {

            console.error("Sector Alarm LOGIN ERROR:");
            console.error(error);

            this.sendSocketNotification(
                "SECTOR_ERROR",
                error.message || JSON.stringify(error)
            );
        }
    },

    async updateData() {

        if (!this.site) {
            return;
        }

        try {

            console.log("Fetching Sector Alarm status...");

            const status =
                await this.site.status();

            console.log("Status:", status);

            let temperatures = [];

            try {

                temperatures =
                    await this.site.temperatures();

                console.log(
                    "Temperature sensors:",
                    temperatures.length
                );

            } catch (tempError) {

                console.error(
                    "Temperature Error:",
                    tempError
                );
            }

            this.sendSocketNotification(
                "SECTOR_DATA",
                {
                    alarmStatus:
                        status.armedStatus,

                    lastUser:
                        status.lastInteractionBy,

                    lastTime:
                        status.lastInteractionTime,

                    temperatures
                }
            );

        } catch (error) {

            console.error("STATUS ERROR:");
            console.error(error);

            this.sendSocketNotification(
                "SECTOR_ERROR",
                error.message || JSON.stringify(error)
            );
        }
    }
});
