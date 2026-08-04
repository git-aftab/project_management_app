import redis from "../config/redis.js";

export const getCache = async (key) => {
  try {
    console.log(`Getting cache for key: ${key}`);
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting cache:", error);
    return null;
  }
};

export const setCache = async (key, value, ttl = 3600) => {
  try {
    console.log(`Setting cache for key: ${key} with TTL: ${ttl}`);
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch (error) {
    console.error("Error setting cache:", error);
  }
};

export const deleteCache = async (pattern) => {
    try{
      console.log(`Deleting cache for pattern: ${pattern}`);
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(keys);
        }
    }catch (error) {
        console.error("Error deleting cache:", error);
    }
}