const NodeHelper = require("node_helper");
const sectoralarm = require("sectoralarm");

module.exports = NodeHelper.create({

    start() {
        this.site = null;
        this.configData = null;
    },

    socketNotificationReceived(notification, payload) {

        if (notification === "INIT") {
            this.configData = payload;
            this.initialize();
        }
    },

    async initialize() {
        try {

            this.site = await sectoralarm.connect(
                this.configData.email,
                this.configData.password,
                this.configData.siteId
            );

            await this.updateData();

            setInterval(() => {
                this.updateData();
            }, this.configData.updateInterval);

        } catch (error) {

            this.sendSocketNotification(
                "SECTOR_ERROR",
                error.message
            );
        }
    },

    async updateData() {

        try {

            const status = await this.site.status();

            let temperatures = [];
            let history = [];

            try {
                temperatures = await this.site.temperatures();
            } catch (e) {}

            try {
                history = await this.site.history();
            } catch (e) {}

            this.sendSocketNotification(
                "SECTOR_DATA",
                {
                    alarmStatus: status.armedStatus,
                    lastUser: status.lastInteractionBy,
                    lastTime: status.lastInteractionTime,
                    temperatures,
                    history: history.slice(0, 3)
                }
            );

        } catch (error) {

            this.sendSocketNotification(
                "SECTOR_ERROR",
                error.message
            );
        }
    }
});
