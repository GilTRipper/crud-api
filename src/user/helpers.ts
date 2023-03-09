import { readFile, writeFile } from "fs/promises";
import { usersPath } from "../utils";
import * as uuid from "uuid";

import type { User } from "./types";


export const selectUsers = async () => {
  try {
    const usersData = await readFile(usersPath, { encoding: "utf-8" });
    return JSON.parse(usersData).users as User[];
  } catch (error) {
    writeFile(usersPath, '{ "users": [] }', { flag: "w+" });
    return [];
  }
};

export const generateUniqueId = async () => {
  const id = uuid.v4();
  const users = await selectUsers();

  if (users.find(user => user.id === id)) {
    await generateUniqueId();
  }

  return id;
};

export const writeUsers = async (users: User[]) => {
  const usersData = JSON.stringify({ users });
  await writeFile(usersPath, usersData, { flag: "w+" });
};
