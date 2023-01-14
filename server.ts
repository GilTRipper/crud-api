import http from "http";
import { config } from "dotenv";

config();
const createMessage = (
  code: number,
  message: string,
  result: "success" | "error"
): string => JSON.stringify({ code, message, result });

const server = http.createServer((req, res) => {
  if (!req.url?.startsWith("/api")) {
    res.statusCode = 404;
    const message = createMessage(404, "Not found", "error");
    res.write(message);
    res.end();
  }
});

server.listen(process.env.PORT, () => {
  console.log(
    `server is running on ${process.env.APP_URL}:${process.env.PORT}`
  );
});
