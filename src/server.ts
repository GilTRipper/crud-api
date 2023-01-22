import { config } from "dotenv";
import { createApp } from "./app";
import * as User from "./user";

config();

const app = createApp();

app.get("/api/users", User.getUsers);
app.get("/api/users/:userId", User.getUserById);
app.delete("/api/users/:userId", User.deleteUser);
app.put("/api/users/:userId", User.changeUser);
app.post("/api/users", User.addUser);

app.listen(process.env.PORT);
