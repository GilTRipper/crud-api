import * as uuid from "uuid";
import type { IncomingMessage, ServerResponse } from "http";

import { generateUniqueId, selectUsers, writeUsers } from "./helpers";

import type { User, UserRequestBody } from "./types";

type GetUserByIdParams = {
  userId: string;
};

export const getUsers = async (_: IncomingMessage, res: ServerResponse) => {
  const users = await selectUsers();

  res.setHeader("Content-Type", "application/json");
  res.writeHead(200);
  res.end(JSON.stringify({ users }));
};

export const getUserById = async (_: IncomingMessage, res: ServerResponse, params: GetUserByIdParams) => {
  const { userId } = params;
  const users = await selectUsers();

  res.setHeader("Content-Type", "application/json");

  const isUuid = uuid.validate(userId);

  if (!isUuid) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "Invalid userId. UserID must be uuid." }));
    return;
  }

  const user = users.find(i => i.id === userId);

  if (!user) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "User not found" }));
    return;
  }

  res.writeHead(200);
  res.end(JSON.stringify({ user }));
};

export const addUser = async (req: IncomingMessage, res: ServerResponse) => {
  req.on("data", async chunk => {
    const body = JSON.parse(chunk.toString());

    const { username, age, hobbies } = body;

    res.setHeader("Content-Type", "application/json");

    if (!username || !age || !hobbies) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Not all required fields are passed" }));
      return;
    }
    const users = await selectUsers();

    if (users.find(u => u.username === username)) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "User with this username is already exists" }));
      return;
    }

    const id = await generateUniqueId();
    const newUser: User = { id, username, age, hobbies };

    users.push(newUser);

    await writeUsers(users);

    res.writeHead(201);
    res.end(JSON.stringify({ user: newUser }));
  });
};

export const deleteUser = async (_: IncomingMessage, res: ServerResponse, params: GetUserByIdParams) => {
  const { userId } = params;
  const isUuid = uuid.validate(userId);

  res.setHeader("Content-Type", "application/json");

  if (!isUuid) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "Invalid userId. UserID must be uuid." }));
    return;
  }

  const users = await selectUsers();

  if (!users.find(user => userId === user.id)) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "User not found" }));
    return;
  }

  const newUsers = users.filter(user => user.id !== userId);

  await writeUsers(newUsers);

  res.writeHead(204);
  res.end();
};

export const changeUser = async (req: IncomingMessage, res: ServerResponse, params: GetUserByIdParams) => {
  req.on("data", async chunk => {
    const { userId } = params;
    const body: UserRequestBody = JSON.parse(chunk.toString());
    const { username, hobbies, age } = body;

    const isUuid = uuid.validate(userId);

    res.setHeader("Content-Type", "application/json");

    if (!isUuid) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Invalid userId. UserID must be uuid." }));
      return;
    }

    if (!username || !age || !hobbies) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Not all required fields are passed" }));
      return;
    }

    const users = await selectUsers();
    const user = users.find(user => user.id === userId);

    if (!user) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "User not found" }));
      return;
    }

    user.age = age;
    user.username = username;
    user.hobbies = hobbies;

    await writeUsers(users);

    res.writeHead(200);
    res.end(JSON.stringify({ user }));
  });
};
