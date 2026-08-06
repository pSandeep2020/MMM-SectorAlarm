const NodeHelper = require("node_helper");
const sectoralarm = require("sectoralarm");

module.exports = NodeHelper.create({

    start() {
        this.site = null;
        this.configData = null;
    },

    socketNotificationReceived(notification, payload) {

        if (notification === "SECTORALARM_INIT") {

            this.configData = payload;

            this.login();
        }

        if (notification === "SECTORALARM_UPDATE") {

            this.fetchData();
        }
    },

    async login() {

        try {

            this.site = await sectoralarm.connect(
                this.configData.email,
                this.configData.password,
                this.configData.siteId
            );

            await this.fetchData();

        } catch (err) {

            this.sendSocketNotification(
                "SECTORALARM_ERROR",
                err.message
            );
        }
    },

    async fetchData() {

        if (!this.site) {
            return;
        }

        try {

            const statusData =
                await this.site.status();

            const temperatures =
                await this.site.temperatures();

            this.sendSocketNotification(
                "SECTORALARM_DATA",
                {
                    status: statusData.armedStatus,
                    temperatures: temperatures
                }
            );

        } catch (err) {

            this.sendSocketNotification(
                "SECTORALARM_ERROR",
                err.message
            );
        }
    }
});
