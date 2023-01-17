import type { IncomingMessage, ServerResponse } from "http";

export enum HTTP_METHOD {
  GET = "GET",
  POST = "POST",
  DELETE = "DELETE",
  PUT = "PUT",
}

export type Controller<AT = any> = (req: IncomingMessage, res: ServerResponse, args?: AT) => void | Promise<void>;
