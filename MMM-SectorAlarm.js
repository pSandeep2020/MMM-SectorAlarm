Module.register("MMM-SectorAlarm", {

    defaults: {
        email: "",
        password: "",
        updateInterval: 300000
    },

    start() {

        console.log("MMM-SectorAlarm started");

        this.loaded = false;

        this.alarmStatus = "Unknown";
        this.lastUser = "";
        this.lastTime = "";
        this.temperatures = [];
        this.lockStatus = [];
        this.logs = [];

        this.sendSocketNotification("INIT", this.config);
    },

    getStyles() {
        return ["MMM-SectorAlarm.css"];
    },

    socketNotificationReceived(notification, payload) {

        console.log("MMM-SectorAlarm notification:", notification);

        if (notification === "SECTOR_DATA") {

            this.loaded = true;

            this.panelStatus = payload.panelStatus || {};

            this.alarmStatus =
                this.panelStatus.ArmedStatus ||
                this.panelStatus.armedStatus ||
                "Unknown";

            this.lastUser =
                this.panelStatus.LastInteractionBy ||
                this.panelStatus.lastInteractionBy ||
                "";

            this.lastTime =
                this.panelStatus.LastInteractionTime ||
                this.panelStatus.lastInteractionTime ||
                "";

            this.temperatures = payload.temperatures || [];
            this.lockStatus = payload.lockStatus || [];
            this.logs = payload.logs || [];

            this.updateDom(500);
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
