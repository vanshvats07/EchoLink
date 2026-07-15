/*
=========================================
EchoLink Client Script
=========================================
*/

const socket = io();

// --------------------
// HTML Elements
// --------------------

const statsUsers=document.getElementById("statsUsers");
const statsMessages=document.getElementById("statsMessages");
const statsLocations=document.getElementById("statsLocations");
const statsSOS=document.getElementById("statsSOS");
const locationButton = document.getElementById("locationButton");
const joinButton = document.getElementById("joinButton");
const landingPage = document.getElementById("landingPage");
const dashboard = document.getElementById("dashboard");

const joinModal = document.getElementById("joinModal");
const usernameInput = document.getElementById("usernameInput");
const connectButton = document.getElementById("connectButton");

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const userList = document.getElementById("userList");
const userCount = document.getElementById("userCount");

const connectionStatus = document.getElementById("connectionStatus");
const networkStatus = document.getElementById("networkStatus");

const sosButton = document.getElementById("sosButton");

const recordButton = document.getElementById("recordButton");

const alertBox = document.getElementById("alertBox");
const alertMessage = document.getElementById("alertMessage");
const closeAlert = document.getElementById("closeAlert");

let username = "";

let mediaRecorder = null;
let audioChunks = [];
// Store my latest location
let myLatitude = null;
let myLongitude = null;

// =========================================
// JOIN NETWORK
// =========================================

// Open Join Modal
joinButton.addEventListener("click", () => {
    joinModal.classList.remove("hidden");
});

// Connect to Network
connectButton.addEventListener("click", () => {

    username = usernameInput.value.trim();

    if (username === "") {
        username = "Anonymous";
    }

    joinModal.classList.add("hidden");

    landingPage.classList.add("hidden");

    dashboard.classList.remove("hidden");

    socket.emit("join", username);

});
// =========================================
// SOCKET CONNECTION
// =========================================

// Connected
socket.on("connect", () => {

    connectionStatus.innerHTML = "🟢 Connected";
    networkStatus.innerHTML = "🟢 Online";

});

// Disconnected
socket.on("disconnect", () => {

    connectionStatus.innerHTML = "🔴 Disconnected";
    networkStatus.innerHTML = "🔴 Offline";

});

// Update Connected Users
socket.on("updateUsers", (users) => {

    userList.innerHTML = "";

    users.forEach((user) => {

        const div = document.createElement("div");

        div.className = "user";

        div.innerHTML = "🟢 " + user;

        userList.appendChild(div);

    });

    userCount.innerHTML = users.length;

});
// =========================================
// CHAT FUNCTIONS
// =========================================

// Send button
sendButton.addEventListener("click", sendMessage);

// Press Enter to send
messageInput.addEventListener("keypress", (event) => {

    if (event.key === "Enter") {
        sendMessage();
    }

});

// Send Message Function
function sendMessage() {

    const message = messageInput.value.trim();

    if (message === "") return;

    socket.emit("sendMessage", {
        user: username,
        message: message
    });

    messageInput.value = "";

}

// Display Message
function addMessage(user, message) {

    const div = document.createElement("div");

    const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    if (user === username) {
        div.className = "message my-message";
    } else {
        div.className = "message other-message";
    }

    div.innerHTML = `
        <b>${user}</b><br>
        ${message}
        <br>
        <small>${time}</small>
    `;

    chatBox.appendChild(div);

    chatBox.scrollTop = chatBox.scrollHeight;
}

// Receive Message
socket.on("receiveMessage", (data) => {

    addMessage(data.user, data.message);

});

// Join / Leave Notifications
socket.on("systemMessage", (message) => {

    const div = document.createElement("div");

    div.className = "message system-message";

    div.innerHTML = message;

    chatBox.appendChild(div);

    chatBox.scrollTop = chatBox.scrollHeight;

});
// =========================================
// SOS EMERGENCY
// =========================================

// Send SOS
sosButton.addEventListener("click", () => {

    socket.emit("emergency", {

    user: username,

    message: "🚨 NEED IMMEDIATE ASSISTANCE!",

    latitude: myLatitude,

    longitude: myLongitude

});

});

// Receive SOS
socket.on("emergencyAlert", (data) => {

    alertMessage.innerHTML = `
        <h3>🚨 Emergency Alert</h3>
        <br>
        <b>${data.user}</b>
        <br><br>
        ${data.message}
    `;

    alertBox.classList.remove("hidden");
    if(data.latitude && data.longitude){

    L.marker(
        [data.latitude,data.longitude],
        {icon:redIcon}
    )
    .addTo(map)
    .bindPopup(`
        <b>🚨 Emergency</b><br>
        ${data.user}<br>
        Needs Immediate Assistance
    `)
    .openPopup();

    map.setView(
        [data.latitude,data.longitude],
        15
    );

}

});

// Close Alert
closeAlert.addEventListener("click", () => {

    alertBox.classList.add("hidden");

});// =========================================
// LOCATION SHARING
// =========================================

// Share location
locationButton.addEventListener("click", () => {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported.");

        return;

    }

   navigator.geolocation.getCurrentPosition((position) => {

    myLatitude = position.coords.latitude;
    myLongitude = position.coords.longitude;

    socket.emit("shareLocation", {

        user: username,

        latitude: myLatitude,

        longitude: myLongitude

    });

});

});

// Receive location
socket.on("receiveLocation", (data) => {

    addMessage(
        "📍 " + data.user,
        `Shared Location`
    );

    L.marker([data.latitude, data.longitude])
        .addTo(map)
        .bindPopup(`<b>${data.user}</b><br>Emergency Node`)
        .openPopup();

    map.setView([data.latitude, data.longitude], 15);

});
// =========================================
// LEAFLET MAP
// =========================================

const map = L.map("map").setView([28.6139, 77.2090], 12);

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap"
    }
).addTo(map);

// =========================================
// RED SOS ICON
// =========================================

const redIcon = new L.Icon({

    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",

    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

    iconSize: [25,41],

    iconAnchor: [12,41],

    popupAnchor: [1,-34],

    shadowSize: [41,41]

});


socket.on("networkStats",(stats)=>{

    statsUsers.innerHTML=stats.users;

    statsMessages.innerHTML=stats.messages;

    statsLocations.innerHTML=stats.locations;

    statsSOS.innerHTML=stats.sos;

});