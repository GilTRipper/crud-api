import { config } from "dotenv";
import cluster from "cluster";
import { cpus } from "os";
import http from "http";

import { createApp } from "./app";
import * as User from "./user";
import { startDB } from "./utils";

config();
startDB();

const numCpus = cpus().length;

function startMulti() {
  if (cluster.isPrimary) {
    console.info(`[INFO]: Load balancer is running. PID - ${process.pid} `);

    for (let i = 0; i < numCpus; i++) {
      const ENV = { PORT: 4000 + i };
      cluster.fork(ENV);
    }
  } else {
    let port = "4000";
    const worker = cluster.worker;

    if ("env" in worker?.process! && worker?.process.env instanceof Object && "PORT" in worker.process.env!) {
      port = process.env.PORT as string;
    }

    const app = createApp();

    app.get("/api/users", User.getUsers);
    app.get("/api/users/:userId", User.getUserById);
    app.delete("/api/users/:userId", User.deleteUser);
    app.put("/api/users/:userId", User.changeUser);
    app.post("/api/users", User.addUser);

    app.listen(port);

    console.info(`[INFO]: App is running on port ${port}. PID - ${process.pid}`);
  }
}

function runServer() {
  if (process.env.SCALING === "horizontal") {
    startMulti();
  } else {
    const app = createApp();

    app.get("/api/users", User.getUsers);
    app.get("/api/users/:userId", User.getUserById);
    app.delete("/api/users/:userId", User.deleteUser);
    app.put("/api/users/:userId", User.changeUser);
    app.post("/api/users", User.addUser);

    app.listen(process.env.PORT);
  }
}

runServer();

