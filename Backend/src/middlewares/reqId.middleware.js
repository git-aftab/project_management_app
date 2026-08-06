import { v4 as uuid } from "uuid";

export const reqId = (req, res, next) => {
  const id = req.headers["x-request-id"] || uuid();

  req.requestId = id;

  res.setHeader("X-Request-ID", id);

  next();
};
