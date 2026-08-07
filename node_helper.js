const NodeHelper = require("node_helper");
const axios = require("axios");

const API_URL = "https://mypagesapi.sectoralarm.net/api";

module.exports = NodeHelper.create({

    start() {

        console.log("MMM-SectorAlarm helper started");

        this.authToken = null;
        this.panelId = null;
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

            await this.login();

            await this.updateData();

            setInterval(() => {
                this.updateData();
            }, this.configData.updateInterval);

        } catch (error) {

            console.error("Sector Alarm initialization failed:");
            console.error(error);

            this.sendSocketNotification(
                "SECTOR_ERROR",
                error.message || JSON.stringify(error)
            );
        }
    },

    async login() {

        console.log("Logging into Sector Alarm API...");

        const headers = {
            "API-Version": "6",
            "Platform": "iOS",
            "User-Agent": "SectorAlarm/387 CFNetwork/1206 Darwin/20.1.0",
            "Version": "2.0.27",
            "Connection": "keep-alive",
            "Content-Type": "application/json"
        };

        const response = await axios.post(
            `${API_URL}/Login/Login`,
            {
                UserId: this.configData.email,
                Password: this.configData.password
            },
            {
                headers
            }
        );

        this.authToken =
            response.data.AuthorizationToken;

        console.log("Sector Alarm login successful");

        const fullSystem = await axios.get(
            `${API_URL}/Panel/getFullSystem`,
            {
                headers: this.getHeaders()
            }
        );

        this.panelId =
            fullSystem.data.Panel.PanelId;

        console.log(
            "Panel ID:",
            this.panelId
        );
    },

    getHeaders() {

        return {
            "Authorization": this.authToken,
            "API-Version": "6",
            "Platform": "iOS",
            "User-Agent": "SectorAlarm/356 CFNetwork/1152.2 Darwin/19.4.0",
            "Version": "2.0.20",
            "Connection": "keep-alive",
            "Content-Type": "application/json"
        };
    },

    async updateData() {

        if (!this.authToken || !this.panelId) {
            return;
        }

        try {

            console.log(
                "Fetching Sector Alarm data..."
            );

            const headers = this.getHeaders();

            const [
                panelStatus,
                temperatures,
                lockStatus,
                logs
            ] = await Promise.all([

                axios.get(
                    `${API_URL}/Panel/GetPanelStatus?panelId=${this.panelId}`,
                    { headers }
                ),

                axios.get(
                    `${API_URL}/Panel/GetTemperatures?panelId=${this.panelId}`,
                    { headers }
                ),

                axios.get(
                    `${API_URL}/Panel/GetLockStatus?panelId=${this.panelId}`,
                    { headers }
                ),

                axios.get(
                    `${API_URL}/Panel/GetLogs?panelId=${this.panelId}`,
                    { headers }
                )
            ]);

            console.log(
                "Alarm Status:",
                JSON.stringify(
                    panelStatus.data,
                    null,
                    2
                )
            );

            this.sendSocketNotification(
                "SECTOR_DATA",
                {
                    panelStatus:
                        panelStatus.data,

                    temperatures:
                        temperatures.data,

                    lockStatus:
                        lockStatus.data,

                    logs:
                        logs.data
                }
            );

        } catch (error) {

            console.error(
                "Sector Alarm update failed:"
            );

            if (error.response) {

                console.error(
                    "Status:",
                    error.response.status
                );

                console.error(
                    error.response.data
                );

            } else {

                console.error(error);
            }

            this.sendSocketNotification(
                "SECTOR_ERROR",
                error.message || JSON.stringify(error)
            );
        }
    }
});
