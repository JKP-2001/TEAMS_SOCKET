const io = require("socket.io")(9000, {
    cors: {
        origin: "http://localhost:3000"
    }
})

let onlineUsers = [];

const addUser = ({ userId, socketId }) => {
    let flag = false;
    for (let i = 0; i < onlineUsers.length; i++) {
        if (onlineUsers[i].userId === userId) {
            flag = true;
            onlineUsers[i].socketId = socketId;
            break;
        }
    }
    if (!flag) {
        onlineUsers.push({ userId, socketId });
    }

}

const getUser = (userId) => {
    return onlineUsers.find(user => user.userId === userId);
}


const removeUser = (socketId) => {
    for (let i = 0; i < onlineUsers.length; i++) {
        if (onlineUsers[i].socketId === socketId) {
            onlineUsers.splice(i, 1);
            break;
        }
    }
}

io.on("connection", (socket) => {
    console.log("connected");

    socket.on("addUser", (userId) => {
        addUser({ userId, socketId: socket.id });
        io.emit("getUsers", onlineUsers);
    })


    socket.on("sendMessage", ({ recieverId, message }) => {
        let reciever = getUser(recieverId);
        console.log(reciever);
        if (reciever !== undefined) {
            io.to(reciever.socketId).emit("getMessage", message);
        }
    })

    socket.on("disconnect", () => {
        console.log("disconnected");
        removeUser(socket.id);
        console.log(onlineUsers.length);
        io.emit("getUsers", onlineUsers);
    })

})