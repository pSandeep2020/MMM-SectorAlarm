Module.register("MMM-SectorAlarm", {

    defaults: {
        updateInterval: 300000 // 5 minutes
    },

    start: function () {
        this.status = "Loading...";
        this.temperature = [];
        this.lastUpdate = null;

        this.sendSocketNotification("SECTORALARM_INIT", this.config);

        setInterval(() => {
            this.sendSocketNotification("SECTORALARM_UPDATE");
        }, this.config.updateInterval);
    },

    socketNotificationReceived: function (notification, payload) {

        if (notification === "SECTORALARM_DATA") {
            this.status = payload.status;
            this.temperature = payload.temperatures;
            this.lastUpdate = new Date();

            this.updateDom(1000);
        }

        if (notification === "SECTORALARM_ERROR") {
            this.status = "ERROR";
            console.error(payload);
            this.updateDom();
        }
    },

    getStyles: function () {
        return ["MMM-SectorAlarm.css"];
    },

    getDom: function () {

        const wrapper = document.createElement("div");

        wrapper.innerHTML = `
            <div class="sector-header">
                Sector Alarm
            </div>
            <div class="sector-status">
                ${this.getAlarmIcon()} ${this.status}
            </div>
        `;

        if (this.temperature.length > 0) {
            this.temperature.forEach(sensor => {

                const row = document.createElement("div");
                row.className = "sector-temp";

                row.innerHTML =
                    `🌡 ${sensor.name}: ${sensor.temperature}°C`;

                wrapper.appendChild(row);
            });
        }

        return wrapper;
    },

    getAlarmIcon: function () {

        switch (this.status) {

            case "armed":
                return "🔒";

            case "partialArmed":
                return "🏠";

            case "disarmed":
                return "🔓";

            default:
                return "⚠️";
        }
    }
});
