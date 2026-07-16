
const express = require("express");

const http = require("http");
     const { Server } = require("socket.io");
       const path = require("path");

        const app = express();
const server = http.createServer(app);

        const io = new Server(server, {
       maxHttpBufferSize: 1e8
});

app.use(express.static(path.join(__dirname, "../public")));


         var users = {};
var totalMessages = 0;
             var totalSOS = 0;

var totalLocations = 0;

io.on("connection", function (socket)
 {

    console.log("New device connected:", socket.id);

    var currentUser = "";

   
 socket.on("join", function (username)
 {

        currentUser = username;
        users[socket.id] = username;

    console.log(username + " joined EchoLink");
       var userList = [];

     for (var id in users) {
            userList.push(users[id]);
        }

     io.emit("updateUsers", userList);

      io.emit("networkStats", {
           
 users: userList.length,
            messages: totalMessages,
            locations: totalLocations,
            sos: totalSOS
        
});

       
 io.emit("systemMessage", "🟢 " + username + " joined the network");

    }
);


    socket.on("sendMessage", function (msg) {

        console.log(msg.user + ": " + msg.message);

        totalMessages++;

        io.emit("receiveMessage", msg);

       
 io.emit("networkStats",
 {
        
    users: Object.keys(users).length,
            messages: totalMessages,
            locations: totalLocations,
           
 sos: totalSOS
        
}
);

    }
);


    socket.on("emergency", function (info) 
{

         console.log("SOS ALERT:", info.user);

          totalSOS++;
  
        io.emit("emergencyAlert", info);

            io.emit("networkStats",
 {
            users: Object.keys(users).length,
          messages: totalMessages,
      locations: totalLocations,
            sos: totalSOS
        }
);

    
});


    socket.on("shareLocation", function (location)
 {

      
  console.log("Location received");

            totalLocations++;

      
  io.emit("receiveLocation", location);

        
io.emit("networkStats",     {
       
     
users: Object.keys(users).length,
         
   messages: totalMessages,
          
  locations: totalLocations,
            sos: totalSOS
        }
);

    }
);


    socket.on("voiceMessage", function (voice) 
{

        io.emit("voiceMessage", voice);

    });


    socket.on("sendFile", function (file) 
{

        io.emit("receiveFile", file);

    });


    socket.on("disconnect", function () 
{

          console.log(currentUser + " left");

        if (users[socket.id]) {

            delete users[socket.id];

        var list = [];

       for (var id in users) {
                    list.push(users[id]);
             }

       io.emit("updateUsers", list);

            io.emit("networkStats", {
                   users: list.length,
                    messages: totalMessages,
                     locations: totalLocations,
                   sos: totalSOS
         });

                io.emit("systemMessage", "🔴 " + currentUser + " left the network");

          }

              }
);

}
);

var PORT = 3000;

              server.listen(PORT, function () {

    console.log("EchoLink server running on port " + PORT);

} 
);