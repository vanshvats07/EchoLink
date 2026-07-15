/*
    EchoLink Server

    Handles:
    - User connections
    - Live user list
    - Real-time chat
    - Emergency broadcasts

*/


// Import required packages

const express = require("express");

const http = require("http");

const { Server } = require("socket.io");

const path = require("path");




// Create Express app

const app = express();




// Create HTTP server

const server = http.createServer(app);




// Create Socket.IO server

const io = new Server(server, {

    maxHttpBufferSize: 1e8

});






// Store connected users

let users = {};







// Serve frontend files

app.use(
    express.static(
        path.join(__dirname, "../public")
    )
);







// ================================
// SOCKET CONNECTION
// ================================


io.on(
    "connection",
    function(socket){


        console.log(
            "New device connected:",
            socket.id
        );



        let currentUser = "";







        // ================================
        // USER JOIN NETWORK
        // ================================


        socket.on(
            "join",
            function(username){



                currentUser = username;



                users[socket.id] = username;



                console.log(
                    username,
                    "joined EchoLink"
                );




                // Send updated users
io.emit(
    "updateUsers",
    Object.values(users)
);





                // Notify everyone

                io.emit(
                    "systemMessage",
                    `
                    🟢 ${username}
                    joined the network
                    `
                );



            }
        );










        // ================================
        // CHAT MESSAGE
        // ================================


        socket.on(
            "sendMessage",
            function(data){



                console.log(
                    data.user,
                    ":",
                    data.message
                );



                io.emit(
                    "receiveMessage",
                    data
                );



            }
        );









        // ================================
        // EMERGENCY ALERT
        // ================================


        socket.on(
            "emergency",
            function(data){



                console.log(
                    "SOS ALERT:",
                    data.user
                );



                io.emit(
                    "emergencyAlert",
                    data
                );



            }
        );




// ================================
// LOCATION SHARING
// ================================


socket.on(
"shareLocation",
function(data){



    console.log(
        "Location received:",
        data
    );



    io.emit(
        "receiveLocation",
        data
    );


});
// ================================
// VOICE MESSAGE
// ================================


socket.on(
"voiceMessage",
function(data){



    io.emit(
        "voiceMessage",
        data
    );


});
// =========================================
// SOS EMERGENCY
// =========================================



// =========================================
// LOCATION SHARING
// =========================================



        // ================================
        // USER DISCONNECT
        // ================================


        socket.on(
            "disconnect",
            function(){



                console.log(
                    currentUser,
                    "left"
                );



                if(currentUser){


                    if (users[socket.id]) {

    delete users[socket.id];

    io.emit(
        "updateUsers",
        Object.values(users)
    );

    io.emit(
        "systemMessage",
        `🔴 ${currentUser} left the network`
    );

};



                    io.emit(
                        "updateUsers",
                        users
                    );



                    io.emit(
                        "systemMessage",
                        `
                        🔴 ${currentUser}
                        left the network
                        `
                    );


                }



            }
        );





    }
);









// ================================
// START SERVER
// ================================


const PORT = 3000;


server.listen(
    PORT,
    function(){


        console.log(
            `EchoLink server running on port ${PORT}`
        );


    }
);