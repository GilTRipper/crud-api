import { IncomingMessage, ServerResponse } from "http";

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
