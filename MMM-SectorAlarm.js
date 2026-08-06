Module.register("MMM-SectorAlarm", {

    defaults: {
        email: "",
        password: "",
        siteId: "",
        updateInterval: 300000
    },

    start() {
        console.log("MMM-SectorAlarm started");

        this.loaded = false;
        this.alarmStatus = "Loading...";
        this.temperatures = [];

        this.sendSocketNotification("INIT", this.config);
    },

    getStyles() {
        return ["MMM-SectorAlarm.css"];
    },

    socketNotificationReceived(notification, payload) {

        console.log("MMM-SectorAlarm notification:", notification);

        if (notification === "SECTOR_DATA") {

            this.loaded = true;

            this.alarmStatus = payload.alarmStatus;
            this.lastUser = payload.lastUser;
            this.lastTime = payload.lastTime;
            this.temperatures = payload.temperatures || [];

            this.updateDom();
        }

        if (notification === "SECTOR_ERROR") {

            console.error("Sector Alarm Error:", payload);

            this.loaded = true;
            this.alarmStatus = payload;

            this.updateDom();
        }
    },

    getDom() {

        const wrapper = document.createElement("div");

        if (!this.loaded) {
            wrapper.innerHTML = "Loading Sector Alarm...";
            return wrapper;
        }

        const title = document.createElement("div");
        title.className = "sector-title";
        title.innerHTML = "🏠 Sector Alarm";

        wrapper.appendChild(title);

        const status = document.createElement("div");
        status.className = "sector-status";
        status.innerHTML = `${this.getStatusIcon()} ${this.alarmStatus}`;

        wrapper.appendChild(status);

        if (this.lastUser) {

            const last = document.createElement("div");
            last.className = "sector-last";
            last.innerHTML = `
                ${this.lastUser}<br>
                ${this.lastTime}
            `;

            wrapper.appendChild(last);
        }

        this.temperatures.forEach(sensor => {

            const row = document.createElement("div");

            row.className = "sector-temperature";
            row.innerHTML =
                `🌡 ${sensor.name}: ${sensor.temperature}°C`;

            wrapper.appendChild(row);
        });

        return wrapper;
    },

    getStatusIcon() {

        switch (this.alarmStatus) {

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
