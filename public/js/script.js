/*

EchoLink Client Script

*/

const socket = io();


// HTML Elements
// 
const recordButton = document.getElementById("recordButton");

const fileInput=document.getElementById("fileInput");
const fileButton=document.getElementById("fileButton");
const statsUsers=document.getElementById("statsUsers");
const timeline =
document.getElementById("timeline");
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


const alertBox = document.getElementById("alertBox");
const alertMessage = document.getElementById("alertMessage");
const closeAlert = document.getElementById("closeAlert");

const analyzeButton =
document.getElementById(
"analyzeButton"
);

const emergencyInput =
document.getElementById(
"emergencyInput"
);

const analysisOutput =
document.getElementById(
"analysisOutput"
);


let username = "";
let userLocations = {};



let mediaRecorder = null;
let audioChunks = [];
// Store my latest location
let myLatitude = null;
let myLongitude = null;


function addTimelineEvent(event){

    const time =
    new Date().toLocaleTimeString();

    timeline.innerHTML =

    "[" + time + "] " +

    event +

    "<br>" +

    timeline.innerHTML;

}


// JOIN NETWORK


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

    addTimelineEvent(

    username + " joined network"
);

});

// SOCKET CONNECTION


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

// CHAT FUNCTIONS

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

// SOS EMERGENCY

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
    addTimelineEvent(
    "🚨 SOS from " + data.user
);
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

    const location = userLocations[data.user];
console.log("SOS received from:", data.user);
console.log(userLocations);
if(location){
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
    .bindPopup(
        `🚨 SOS ALERT<br><b>${data.user}</b>`
    );

}
});
// Close Alert
closeAlert.addEventListener("click", () => {

    alertBox.classList.add("hidden");


});




// LOCATION SHARING

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

    addTimelineEvent(
    data.user + " shared location"
);
    addMessage(
        "📍 " + data.user,
        `Shared Location`
    );
    userLocations[data.user] = {
    latitude: data.latitude,
    longitude: data.longitude
};

    L.marker([data.latitude, data.longitude])
        .addTo(map)
        .bindPopup(`<b>${data.user}</b><br>Emergency Node`)
        .openPopup();

    map.setView([data.latitude, data.longitude], 15);

});

// LEAFLET MAP
const map = L.map("map").setView([28.6139, 77.2090], 12);

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap"
    }
).addTo(map);



// RED SOS ICON
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
analyzeButton.addEventListener("click", function () {

    const text = emergencyInput.value.toLowerCase();
    const numbers = text.match(/\d+/g);

    let affectedPeople = 0;

    if(numbers){

    affectedPeople = parseInt(numbers[0]);

    }
    let categories = [];
    let severity = "LOW";
    let priority = 5;
    let actions = [];
    let ambulances = 0;
    let medicalTeams = 0;
    let rescueTeams = 0;

    if (
        text.includes("fire") ||


        text.includes("smoke") ||
        text.includes("burn")
    ) {

        categories.push("FIRE");

        priority += 2;

        actions.push(
            "Evacuate Area",
            "Contact Fire Team"
        );
    }
    if (
        text.includes("flood") ||
        text.includes("water")
    ) {
        categories.push("FLOOD");

        priority += 2;
        actions.push(
            "Move To Higher Ground",
            "Begin Evacuation"
        );
    }
    if (
        text.includes("injured") ||
        text.includes("ambulance") ||
        text.includes("medical")
    ) {

        categories.push("MEDICAL");
        priority += 3;

        actions.push(
            "Dispatch Ambulance",
            "Provide First Aid"
        );
    
        ambulances = Math.max(
    1,
    Math.ceil(affectedPeople / 5)
);

medicalTeams = Math.max(
    1,
    Math.ceil(affectedPeople / 10)
);

    }

    if (
        text.includes("collapse") ||
        text.includes("earthquake")
    ) {

        categories.push("COLLAPSE");
        priority += 4;

        actions.push(
            "Search For Survivors",
            "Deploy Rescue Team"
        );

rescueTeams = Math.max(
    1,

    Math.ceil(affectedPeople / 8)
);

    }

    if(affectedPeople >= 50){

    priority = 10;

}
else if(affectedPeople >= 20){

    priority += 2;

}
else if(affectedPeople >= 10){
    priority += 1;

}
    if (priority >= 9) {

        severity = "HIGH";

    }
    else if (priority >= 7) {

        severity = "MEDIUM";

    }

    if (categories.length === 0) {




        categories.push("GENERAL");
    }

    addTimelineEvent(
    "AI Analysis Completed"
);
   analysisOutput.innerHTML = `

═══════════════════════
🚨 ECHOLINK AI INCIDENT REPORT
═══════════════════════

👥 PEOPLE AFFECTED
${affectedPeople || "Unknown"}


🚨 INCIDENT TYPE
${categories.join(", ")}



⚠️ THREAT LEVEL
${severity}

⭐ PRIORITY SCORE
${Math.min(priority,10)}/10

${affectedPeople >= 50 ? "🚨 CRITICAL MASS CASUALTY EVENT DETECTED" : ""}

═══════════════════════
📋 RECOMMENDED ACTIONS
═══════════════════════


${[...new Set(actions)].join("\n")}
═══════════════════════
🚑 RESOURCE DEPLOYMENT
═══════════════════════

🚑 Ambulances Required:
${ambulances}

👨‍⚕️ Medical Teams Required:
${medicalTeams}


🚒 Rescue Teams Required:
${rescueTeams}



═══════════════════════
🧠 AI ASSESSMENT
═══════════════════════

${severity === "HIGH"
? "Immediate multi-agency response recommended."
: severity === "MEDIUM"
? "Rapid response advised. Situation may escalate."
: "Monitor situation and maintain communication."}
═══════════════════════
📡 Generated by EchoLink Offline AI
═══════════════════════

`;
});
fileButton.addEventListener("click", () => {

    fileInput.click();

});
fileInput.addEventListener("change", () => {



    const file = fileInput.files[0];
    if (!file) return;

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

});

// =========================================
// FILE SHARING
// =========================================

socket.on("receiveFile", (data) => {
    const div = document.createElement("div");

    div.className = "message";



    if (data.fileType.startsWith("image")) {
        div.innerHTML = `
            <b>${data.user}</b><br>
            <img src="${data.fileData}" style="width:220px;border-radius:10px;">
        `;

    } else {

        div.innerHTML = `
            <b>${data.user}</b><br>
            <a href="${data.fileData}" download="${data.fileName}">
                📄 ${data.fileName}
            </a>
        `;

    }




    chatBox.appendChild(div);

    chatBox.scrollTop = chatBox.scrollHeight;

});

// VOICE MESSAGE



recordButton.addEventListener("click", async () => {

    // Start Recording
    if (mediaRecorder === null || mediaRecorder.state === "inactive") {

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        audioChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.start();



        recordButton.innerHTML = "⏹ Stop";
        mediaRecorder.ondataavailable = (event) => {

            audioChunks.push(event.data);


        };

        mediaRecorder.onstop = () => {

            const audioBlob = new Blob(audioChunks, {
                type: "audio/webm"
            });

            const reader = new FileReader();

            reader.onloadend = () => {

                socket.emit("voiceMessage", {

                    user: username,

                    audio: reader.result
                });

            };
            reader.readAsDataURL(audioBlob);



        };

    }
    // Stop Recording
    else {
        mediaRecorder.stop();

        recordButton.innerHTML = "🎙️ Record";
    }

});


socket.on("voiceMessage", (data) => {

    const div = document.createElement("div");
    div.className = "message";



    div.innerHTML = `
        <b>${data.user}</b><br>
        <audio controls src="${data.audio}"></audio>
    `;

    chatBox.appendChild(div);



    chatBox.scrollTop = chatBox.scrollHeight;
});


