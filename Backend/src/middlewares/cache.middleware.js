import { getCache, setCache } from "../utils/cache.js";
import { ApiResponse } from "../utils/api-response.js";

export const cacheMiddleware = (keyGenerator, ttl = 3600) => {
  return async (req, res, next) => {
    try {
      console.log("Cache middleware invoked");
      const key = keyGenerator(req);

      if (!key) {
        return next();
      }

      const cachedData = await getCache(key);
      console.log(`Cache middleware: key=${key}, cachedData=${cachedData ? "found" : "not found"}`);

      if (cachedData) {
        console.log(`Cache hit for key: ${key}`);
        return res
          .status(200)
          .json(new ApiResponse(200, cachedData, "Data retrieved from cache"));
      }
      console.log(`Cache miss for key: ${key}`);

      const originalJson = res.json.bind(res);

      res.json = (body) => {
        if (body.success) {
          setCache(key, body.data, ttl);
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error("Error in cache middleware:", error);
      return next();
    }
  };
};
