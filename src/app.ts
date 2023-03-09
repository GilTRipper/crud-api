import http from "http";

import { findMap, handle404Error, handle500Error } from "./utils";

import { Controller, HTTP_METHOD } from "./types";

type Handler = {
  method: HTTP_METHOD;
  path: string;
  controller: Controller;
};

export const createApp = () => {
  const handlers: Handler[] = [];
  const createMethod = (method: HTTP_METHOD) => (path: string, controller: Controller) => {
    handlers.push({ method, path, controller });
  };

  const _get = createMethod(HTTP_METHOD.GET);
  const _post = createMethod(HTTP_METHOD.POST);
  const _delete = createMethod(HTTP_METHOD.DELETE);
  const _put = createMethod(HTTP_METHOD.PUT);

  const server = http.createServer(async (req, res) => {
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
  });

  const listen = (port: string = "4000") => server.listen(port);

  const close = () => server.emit("close");

  console.log(server.close);

  return { get: _get, post: _post, delete: _delete, put: _put, listen, close };
};

export type ServerApp = ReturnType<typeof createApp>;