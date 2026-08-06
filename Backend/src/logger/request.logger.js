import pinoHttp from "pino-http";
import logger from "./logger.js";

const reqLogger = pinoHttp({
  logger,

  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} → ${res.statusCode}`;
  },

  customProps(req, res) {
    return {
      requestId: req.reqId,
      userId: req.user?._id,
      responseTime: res.responseTime,
    };
  },

  serializers: {
    req: () => undefined,
    res: () => undefined,
  },
});

export default reqLogger;