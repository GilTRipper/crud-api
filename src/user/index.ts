import * as uuid from "uuid";
import { createMessage } from "../utils";
import type { IncomingMessage, ServerResponse } from "http";
import type { User } from "./types";
import { generateUniqueId, selectUsers, writeUsers } from "./helpers";

type GetUserByIdParams = {
  userId: string;
};

export const getUsers = async (_: IncomingMessage, res: ServerResponse) => {
  const users = await selectUsers();

  const message = createMessage(200, "success", undefined, { users });
  res.writeHead(200).end(message);
};

export const getUserById = async (_: IncomingMessage, res: ServerResponse, params: GetUserByIdParams) => {
  let message: string;

  const { userId } = params;
  const users = await selectUsers();

  const isUuid = uuid.validate(userId);

  if (!isUuid) {
    message = createMessage(400, "error", "Invalid userId. UserID must be uuid.");
    res.writeHead(400).end(message);
    return;
  }

  const user = users.find(i => i.id === userId);

  message = user ? createMessage(200, "success", undefined, { user }) : createMessage(404, "error", "User not found");
  res.writeHead(200).end(message);
};

export const addUser = async (req: IncomingMessage, res: ServerResponse) => {
  let message: string;

  req.on("data", async chunk => {
    const body = JSON.parse(chunk.toString());

    const { username, age, hobbies } = body;

    if (!username || !age || !hobbies) {
      message = createMessage(400, "error", "Not all required fields are passed");
      res.writeHead(400).end(message);
      return;
    }
    const users = await selectUsers();

    if (users.find(u => u.username === username)) {
      message = createMessage(400, "error", "User with this username is already exists");
      res.writeHead(400).end(message);
      return;
    }
    const id = await generateUniqueId();
    const newUser: User = { id, username, age, hobbies };

    users.push(newUser);

    await writeUsers(users);
    message = createMessage(200, "success", undefined, { user: newUser });
    res.writeHead(200).end(message);
  });
};

export const deleteUser = async (_: IncomingMessage, res: ServerResponse, params: GetUserByIdParams) => {
  let message: string;

  const { userId } = params;
  const isUuid = uuid.validate(userId);

  if (!isUuid) {
    message = createMessage(400, "error", "Invalid userId. UserID must be uuid.");
    res.writeHead(400).end(message);
    return;
  }

  const users = await selectUsers();
  if (!users.find(user => userId === user.id)) {
    message = createMessage(404, "error", "User not found");
    res.writeHead(404).end(message);
    return;
  }

  const newUsers = users.filter(user => user.id !== userId);
  await writeUsers(newUsers);
  message = createMessage(200, "success", "User successfully deleted");
  res.writeHead(200).end(message);
};

export const changeUser = async (_: IncomingMessage, res: ServerResponse, params: GetUserByIdParams) => {};
