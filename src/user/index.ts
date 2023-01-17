import * as uuid from "uuid";
import { readFile } from "fs/promises";
import path from "path";

import { createMessage, handle500Error } from "../utils";

import type { IncomingMessage, ServerResponse } from "http";
import type { User } from "./types";

type GetUserByIdParams = {
  userId: string;
};

const usersPath = path.join(__dirname, "users.json");

const selectUsers = async () => {
  const usersData = await readFile(usersPath, { encoding: "utf-8", flag: "w+" });
  if (!usersData) return [];
  const users = JSON.parse(usersData).users as User[];
  return users;
};

export const getUsers = async (_: IncomingMessage, res: ServerResponse) => {
  const users = await selectUsers();

  const message = createMessage(200, "success", undefined, { users });
  res.writeHead(200).end(message);
};

export const getUserById = async (_: IncomingMessage, res: ServerResponse, params: GetUserByIdParams) => {
  const { userId } = params;
  const users = await selectUsers();

  let message: string;
  const isUuid = uuid.validate(userId);

  if (!isUuid) {
    message = createMessage(400, "error", "Invalid userId. UserID must be uuid.");
    res.writeHead(400);
    res.end(message);
    return;
  }

  const user = users.find(i => i.id === userId);

  message = user ? createMessage(200, "success", undefined, user) : createMessage(404, "error", "User not found");

  res.writeHead(200).end(message);
};

export const addUser = async (_: IncomingMessage, res: ServerResponse, params: GetUserByIdParams) => {};
