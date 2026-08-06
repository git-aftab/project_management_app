import { getCache, setCache } from "../utils/cache.js";
import { ApiResponse } from "../utils/api-response.js";
import logger from "../logger/logger.js";

export const cacheMiddleware = (keyGenerator, ttl = 3600) => {
  return async (req, res, next) => {
    try {
      // logger.info("Cache middleware invoked");
      const key = keyGenerator(req);

      if (!key) {
        return next();
      }

      const cachedData = await getCache(key);
      // logger.info(`Cache middleware: key=${key}, cachedData=${cachedData ? "found" : "not found"}`);

      if (cachedData) {
        logger.info(`Cache hit for key: ${key}`);
        return res
          .status(200)
          .json(new ApiResponse(200, cachedData, "Data retrieved from cache"));
      }
      logger.info(`Cache miss for key: ${key}`);

      const originalJson = res.json.bind(res);

      res.json = (body) => {
        if (body.success) {
          setCache(key, body.data, ttl);
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error("Error in cache middleware:", error);
      return next();
    }
  };
};
