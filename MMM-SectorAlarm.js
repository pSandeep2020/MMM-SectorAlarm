Module.register("MMM-SectorAlarm", {

    defaults: {
        email: "",
        password: "",
        siteId: "",
        updateInterval: 300000
    },

    start() {

        this.loaded = false;

        this.alarmStatus = "";
        this.lastUser = "";
        this.lastTime = "";
        this.temperatures = [];

        this.sendSocketNotification("INIT", this.config);
    },

    getStyles() {
        return ["MMM-SectorAlarm.css"];
    },

    socketNotificationReceived(notification, payload) {

        if (notification === "SECTOR_DATA") {

            this.loaded = true;

            this.alarmStatus = payload.alarmStatus;
            this.lastUser = payload.lastUser;
            this.lastTime = payload.lastTime;
            this.temperatures = payload.temperatures;

            this.updateDom();
        }
    },

    getDom() {

        const wrapper = document.createElement("div");

        if (!this.loaded) {
            wrapper.innerHTML = "Loading Sector Alarm...";
            return wrapper;
        }

        const header = document.createElement("div");
        header.className = "sector-title";
        header.innerHTML = "🏠 Sector Alarm";
        wrapper.appendChild(header);

        const status = document.createElement("div");
        status.className = "sector-status";
        status.innerHTML =
            `${this.getIcon()} ${this.alarmStatus}`;
        wrapper.appendChild(status);

        const last = document.createElement("div");
        last.className = "sector-last";
        last.innerHTML =
            `${this.lastUser}<br>${this.lastTime}`;
        wrapper.appendChild(last);

        this.temperatures.forEach(temp => {

            const row = document.createElement("div");

            row.className = "sector-temp";

            row.innerHTML =
                `🌡 ${temp.name}: ${temp.temperature}°C`;

            wrapper.appendChild(row);
        });

        return wrapper;
    },

    getIcon() {

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
