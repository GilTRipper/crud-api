import http, { IncomingMessage, ServerResponse } from "http";
import { config } from "dotenv";
import { Controller, HTTP_METHOD } from "./types";

import * as User from "./user";
import { handle404Error, handle500Error } from "./utils";

config();

type Handler = {
  method: HTTP_METHOD;
  path: string;
  controller: Controller;
};

const findMap = <T, U>(arr: T[], pred: (x: T) => U | false) => {
  for (const item of arr) {
    const result = pred(item);
    if (result) return result;
  }
  return undefined;
};

const createApp = () => {
  const handlers: Handler[] = [];
  const createMethod = (method: HTTP_METHOD) => (path: string, controller: Controller) => {
    handlers.push({ method, path, controller });
  };

  const _get = createMethod(HTTP_METHOD.GET);
  const _post = createMethod(HTTP_METHOD.POST);
  const _delete = createMethod(HTTP_METHOD.DELETE);
  const _put = createMethod(HTTP_METHOD.PUT);

  const listen = (port: string = "4000") =>
    http
      .createServer(async (req, res) => {
        const handler = findMap(handlers, handler => {
          if (handler.method !== req.method) return false;

          const handlerTokens = handler.path.split("/");
          const reqTokens = req.url?.split("/") ?? [];

          if (handlerTokens.length !== reqTokens.length) return false;

          const params: Record<string, string> = {};

          for (let i = 0; i < handlerTokens.length; i++) {
            if (handlerTokens[i].startsWith(":")) {
              params[handlerTokens[i].slice(1)] = reqTokens[i];
            } else if (handlerTokens[i] !== reqTokens[i]) {
              return false;
            }
          }
          return { params, controller: handler.controller };
        });
        if (!handler) {
          handle404Error(req, res);
          return;
        }
        try {
          await handler.controller(req, res, handler.params);
        } catch (error) {
          console.error(error);
          handle500Error(req, res);
        }
      })
      .listen(port);

  return { get: _get, post: _post, delete: _delete, put: _put, listen };
};
const app = createApp();

app.get("/api/users", User.getUsers);
app.get("/api/users/:userId", User.getUserById);

app.listen(process.env.PORT);
console.log("port : ", process.env.PORT);
