import { writeFile } from "fs/promises";
import { join } from "path";
import { IncomingMessage, ServerResponse } from "http";

export const usersPath = join(__dirname, "db.json");

const emptyUserJSON = '{ "users": [] }';

export const createMessage = <DT = any>(
  code: number,
  result: "success" | "error",
  message?: string,
  data?: DT,
): string =>
  JSON.stringify({
    code,
    result,
    ...(message && { message }),
    ...(data && data),
  });

export const handle404Error = (req: IncomingMessage, res: ServerResponse) => {
  const message = createMessage(404, "error", `Source not found at ${req.url}`);
  res.writeHead(404);
  res.end(message);
};

export const handle500Error = (_: IncomingMessage, res: ServerResponse) => {
  const message = createMessage(500, "error", `Internal server error`);
  res.writeHead(500);
  res.end(message);
};

export const findMap = <T, U>(arr: T[], pred: (x: T) => U | false) => {
  for (const item of arr) {
    const result = pred(item);
    if (result) return result;
  }
  return undefined;
};

export const startDB = async () => {
  await writeFile(usersPath, emptyUserJSON, { flag: "w+" });
};
