const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 8000;

app.use(express.json()); // middleware
app.use(express.urlencoded({ extended: false }));

// Load users from file
let users = require("./MOCK_DATA.json");

// function to save users to file
function saveUsersToFile() {
    fs.writeFileSync('./MOCK_DATA.json', JSON.stringify(users, null, 2));
}

// Routes
app.get("/users", (req, res) => {
    const html = `
    <ul>
        ${users.map((user) => `<li>${user.first_name}</li>`).join("")}
    </ul>
    `;
    res.send(html);
});

app.get("/api/users", (req, res) => {
    return res.json(users);
});

app
    .route("/api/users/:id")
    .get((req, res) => {
        const id = Number(req.params.id);
        const user = users.find((user) => user.id === id);
        return user ? res.json(user) : res.status(404).json({ message: "User not found" });
    })
    .patch((req, res) => {
        const id = Number(req.params.id);
        const user = users.find((user) => user.id === id);

        if (user) {
            Object.assign(user, req.body);
            saveUsersToFile();
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    })
    .delete((req, res) => {
        const id = Number(req.params.id);
        const userIndex = users.findIndex((user) => user.id === id);

        if (userIndex !== -1) {
            users.splice(userIndex, 1); // Delete user from array
            saveUsersToFile();
            res.status(200).json({ message: `Successfully deleted user with ID: ${id}` });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    });

app.post("/api/users", (req, res) => {
    const body = req.body;
    const newUser = { ...body, id: users.length + 1 };
    users.push(newUser);
    saveUsersToFile();
    res.status(201).json({ status: "Success", id: newUser.id });
});

// Start the server
app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
