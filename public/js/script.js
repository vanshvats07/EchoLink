

const socket = io();

const recordButton = document.getElementById("recordButton");

const fileInput = document.getElementById("fileInput");
const fileButton = document.getElementById("fileButton");

const statsUsers = document.getElementById("statsUsers");
const statsMessages = document.getElementById("statsMessages");
const statsLocations = document.getElementById("statsLocations");
const statsSOS = document.getElementById("statsSOS");

const timeline = document.getElementById("timeline");

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

const connectionStatus =
document.getElementById("connectionStatus");

const networkStatus =
document.getElementById("networkStatus");

const sosButton =
document.getElementById("sosButton");

const alertBox =
document.getElementById("alertBox");

const alertMessage =
document.getElementById("alertMessage");

const closeAlert =
document.getElementById("closeAlert");

const analyzeButton =
document.getElementById("analyzeButton");

const emergencyInput =
document.getElementById("emergencyInput");

const analysisOutput =
document.getElementById("analysisOutput");

let username = "";

let userLocations = {};

let mediaRecorder = null;

let audioChunks = [];

let myLatitude = null;

let myLongitude = null;function addTimelineEvent(text) {

    const time = new Date().toLocaleTimeString();

    const item = document.createElement("div");

    item.textContent =
    "[" + time + "] " + text;

    timeline.prepend(item);

}joinButton.addEventListener("click", function () {

    joinModal.classList.remove("hidden");

});connectButton.addEventListener("click", function () {

    username = usernameInput.value.trim();

    if (username == "") {

        username = "Anonymous";

    }

    joinModal.classList.add("hidden");

    landingPage.classList.add("hidden");

    dashboard.classList.remove("hidden");

    socket.emit("join", username);

    addTimelineEvent(
        username + " joined network"
    );

});socket.on("connect", function () {

    connectionStatus.textContent =
    "🟢 Connected";

    networkStatus.textContent =
    "🟢 Online";

});socket.on("disconnect", function () {

    connectionStatus.textContent =
    "🔴 Disconnected";

    networkStatus.textContent =
    "🔴 Offline";

});socket.on("updateUsers", function (users) {

    userList.innerHTML = "";

    for (let i = 0; i < users.length; i++) {

        const item = document.createElement("div");

        item.classList.add("user");

        item.textContent = "🟢 " + users[i];

        userList.appendChild(item);

    }

    userCount.textContent = users.length;

});sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", function (event) {

    if (event.key == "Enter") {

        sendMessage();

    }

});


function sendMessage() {

    let message = messageInput.value.trim();

    if (message == "") {

        return;

    }

    socket.emit("sendMessage", {

        user: username,

        message: message

    });

    messageInput.value = "";

}function addMessage(user, message) {

    const box = document.createElement("div");

    if (user == username) {

        box.classList.add("message");
        box.classList.add("my-message");

    }
    else {

        box.classList.add("message");
        box.classList.add("other-message");

    }

    const name = document.createElement("b");
    name.textContent = user;

    const br1 = document.createElement("br");

    const text = document.createTextNode(message);

    const br2 = document.createElement("br");

    const time = document.createElement("small");

    time.textContent =
    new Date().toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit"

    });

    box.appendChild(name);

    box.appendChild(br1);

    box.appendChild(text);

    box.appendChild(br2);

    box.appendChild(time);

    chatBox.appendChild(box);

    chatBox.scrollTop =
    chatBox.scrollHeight;

}socket.on("receiveMessage", function (data) {

    addMessage(

        data.user,

        data.message

    );

});socket.on("systemMessage", function (message) {

    const box = document.createElement("div");

    box.classList.add("message");

    box.classList.add("system-message");

    box.textContent = message;

    chatBox.appendChild(box);

    chatBox.scrollTop =
    chatBox.scrollHeight;

});sosButton.addEventListener("click", function () {

    socket.emit("emergency", {

        user: username,

        message: "🚨 NEED IMMEDIATE ASSISTANCE!",

        latitude: myLatitude,

        longitude: myLongitude

    });

});socket.on("emergencyAlert", function (data) {

    addTimelineEvent(
        "🚨 SOS from " + data.user
    );

    alertMessage.textContent =
        "🚨 Emergency Alert\n\n" +
        data.user +
        "\n\n" +
        data.message;

    alertBox.classList.remove("hidden");

    if (data.latitude && data.longitude) {

        L.marker(
            [data.latitude, data.longitude],
            { icon: redIcon }
        )
        .addTo(map)
        .bindPopup("Emergency : " + data.user)
        .openPopup();

        map.setView(
            [data.latitude, data.longitude],
            15
        );

    }

    var location = userLocations[data.user];

    console.log("SOS received from:", data.user);

    if (location) {

        L.circleMarker(
            [location.latitude, location.longitude],
            {

                radius: 12,

                color: "red",

                fillColor: "red",

                fillOpacity: 0.8

            }

        )
        .addTo(map)
        .bindPopup("SOS : " + data.user);

    }

});closeAlert.addEventListener("click", function () {

    alertBox.classList.add("hidden");

});locationButton.addEventListener("click", function () {

    if (!navigator.geolocation) {

        alert("Geolocation not supported");

        return;

    }

    navigator.geolocation.getCurrentPosition(function (position) {

        myLatitude = position.coords.latitude;

        myLongitude = position.coords.longitude;

        socket.emit("shareLocation", {

            user: username,

            latitude: myLatitude,

            longitude: myLongitude

        });

    });

});socket.on("receiveLocation", function (data) {

    addTimelineEvent(
        data.user + " shared location"
    );

    addMessage(
        "📍 " + data.user,
        "Shared Location"
    );

    userLocations[data.user] = {

        latitude: data.latitude,

        longitude: data.longitude

    };

    L.marker([

        data.latitude,

        data.longitude

    ])

    .addTo(map)

    .bindPopup(data.user)

    .openPopup();

    map.setView(

        [data.latitude, data.longitude],

        15

    );

});const map = L.map("map").setView(

    [28.6139, 77.2090],

    12

);

L.tileLayer(

    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

    {

        attribution: "&copy; OpenStreetMap"

    }

).addTo(map);const redIcon = new L.Icon({

    iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",

    shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

    iconSize: [25, 41],

    iconAnchor: [12, 41],

    popupAnchor: [1, -34],

    shadowSize: [41, 41]

});socket.on("networkStats", function (stats) {

    statsUsers.textContent = stats.users;

    statsMessages.textContent = stats.messages;

    statsLocations.textContent = stats.locations;

    statsSOS.textContent = stats.sos;

});analyzeButton.addEventListener("click", function () {

    const text = emergencyInput.value.toLowerCase();

    const report = analyzeIncident(text);

    analysisOutput.innerHTML = makeReport(report);

    addTimelineEvent("AI Analysis Completed");

});function analyzeIncident(text) {

    let people = 0;

    const numbers = text.match(/\d+/g);

    if (numbers) {

        people = parseInt(numbers[0]);

    }

    let category = [];

    let action = [];

    let priority = 5;

    let ambulances = 0;

    let medical = 0;

    let rescue = 0;    if (
        text.includes("fire") ||
        text.includes("smoke") ||
        text.includes("burn")
    ) {

        category.push("FIRE");

        priority += 2;

        action.push("Evacuate Area");

        action.push("Contact Fire Team");

    }    if (
        text.includes("flood") ||
        text.includes("water")
    ) {

        category.push("FLOOD");

        priority += 2;

        action.push("Move To Higher Ground");

        action.push("Begin Evacuation");

    }    if (
        text.includes("injured") ||
        text.includes("ambulance") ||
        text.includes("medical")
    ) {

        category.push("MEDICAL");

        priority += 3;

        action.push("Dispatch Ambulance");

        action.push("Provide First Aid");

        ambulances = Math.max(
            1,
            Math.ceil(people / 5)
        );

        medical = Math.max(
            1,
            Math.ceil(people / 10)
        );

    }    if (
        text.includes("collapse") ||
        text.includes("earthquake")
    ) {

        category.push("COLLAPSE");

        priority += 4;

        action.push("Search For Survivors");

        action.push("Deploy Rescue Team");

        rescue = Math.max(
            1,
            Math.ceil(people / 8)
        );

    }    return {

        people: people,

        category: category,

        action: action,

        priority: priority,

        ambulances: ambulances,

        medical: medical,

        rescue: rescue

    };

}function makeReport(data) {

    let priority = data.priority;

    if (data.people >= 50) {

        priority = 10;

    }
    else if (data.people >= 20) {

        priority += 2;

    }
    else if (data.people >= 10) {

        priority += 1;

    }

    let level = "LOW";

    if (priority >= 9) {

        level = "HIGH";

    }
    else if (priority >= 7) {

        level = "MEDIUM";

    }

    if (data.category.length == 0) {

        data.category.push("GENERAL");

    }

    let uniqueActions = [];

    for (let i = 0; i < data.action.length; i++) {

        if (!uniqueActions.includes(data.action[i])) {

            uniqueActions.push(data.action[i]);

        }

    }

    let assessment = "";

    if (level == "HIGH") {

        assessment =
        "Immediate multi-agency response recommended.";

    }
    else if (level == "MEDIUM") {

        assessment =
        "Rapid response advised. Situation may escalate.";

    }
    else {

        assessment =
        "Monitor situation and maintain communication.";

    }

    let report = "";

    report += "🚨 ECHOLINK AI INCIDENT REPORT\n\n";

    report += "👥 PEOPLE AFFECTED\n";

    report += (data.people || "Unknown") + "\n\n";

    report += "🚨 INCIDENT TYPE\n";

    report += data.category.join(", ");

    report += "\n\n";

    report += "⚠️ THREAT LEVEL\n";

    report += level + "\n\n";

    report += "⭐ PRIORITY SCORE\n";

    report += Math.min(priority,10) + "/10\n\n";

    if (data.people >= 50) {

        report +=
        "🚨 CRITICAL MASS CASUALTY EVENT DETECTED\n\n";

    }

    report += "📋 RECOMMENDED ACTIONS\n\n";

    for (let i = 0; i < uniqueActions.length; i++) {

        report += uniqueActions[i] + "\n";

    }

    report += "\n";

    report += "🚑 RESOURCE DEPLOYMENT\n\n";

    report += "🚑 Ambulances Required : ";

    report += data.ambulances + "\n";

    report += "👨‍⚕️ Medical Teams Required : ";

    report += data.medical + "\n";

    report += "🚒 Rescue Teams Required : ";

    report += data.rescue + "\n\n";

    report += "🧠 AI ASSESSMENT\n\n";

    report += assessment;

    report += "\n\n";

    report += "📡 Generated by EchoLink Offline AI";

    return report.replace(/\n/g,"<br>");

}fileButton.addEventListener("click", function () {

    fileInput.click();

});fileInput.addEventListener("change", function () {

    const file = fileInput.files[0];

    if (!file) {

        return;

    }

    uploadFile(file);

});function uploadFile(file) {

    const reader = new FileReader();

    reader.onload = function () {

        socket.emit("sendFile", {

            user: username,

            fileName: file.name,

            fileType: file.type,

            fileData: reader.result

        });

    };

    reader.readAsDataURL(file);

}socket.on("receiveFile", function (data) {

    const box = document.createElement("div");

    box.classList.add("message");

    const name = document.createElement("b");

    name.textContent = data.user;

    box.appendChild(name);

    box.appendChild(document.createElement("br"));

    if (data.fileType.indexOf("image") == 0) {

        const img = document.createElement("img");

        img.src = data.fileData;

        img.style.width = "220px";

        img.style.borderRadius = "10px";

        box.appendChild(img);

    }
    else {

        const link = document.createElement("a");

        link.href = data.fileData;

        link.download = data.fileName;

        link.textContent = "📄 " + data.fileName;

        box.appendChild(link);

    }

    chatBox.appendChild(box);

    chatBox.scrollTop = chatBox.scrollHeight;

});recordButton.addEventListener("click", startRecording);async function startRecording() {

    if (
        mediaRecorder == null ||
        mediaRecorder.state == "inactive"
    ) {

        const stream =
        await navigator.mediaDevices.getUserMedia({

            audio: true

        });

        audioChunks = [];

        mediaRecorder =
        new MediaRecorder(stream);

        mediaRecorder.start();

        recordButton.textContent =
        "⏹ Stop";

        mediaRecorder.ondataavailable =
        function (event) {

            audioChunks.push(event.data);

        };

        mediaRecorder.onstop =
        sendVoice;

    }
    else {

        mediaRecorder.stop();

        recordButton.textContent =
        "🎙️ Record";

    }

}function sendVoice() {

    const audio =
    new Blob(audioChunks, {

        type: "audio/webm"

    });

    const reader =
    new FileReader();

    reader.onloadend =
    function () {

        socket.emit("voiceMessage", {

            user: username,

            audio: reader.result

        });

    };

    reader.readAsDataURL(audio);

}socket.on("voiceMessage", function (data) {

    const box =
    document.createElement("div");

    box.classList.add("message");

    const name =
    document.createElement("b");

    name.textContent =
    data.user;

    const line =
    document.createElement("br");

    const player =
    document.createElement("audio");

    player.controls = true;

    player.src = data.audio;

    box.appendChild(name);

    box.appendChild(line);

    box.appendChild(player);

    chatBox.appendChild(box);

    chatBox.scrollTop =
    chatBox.scrollHeight;

});