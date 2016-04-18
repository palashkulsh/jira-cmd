/*global requirejs,fs*/
define([
  'fs',
  './config'
], function (fs, config) {
  var exists = fs.existsSync(config.cacheFilePath),
      cache = exists ? JSON.parse(fs.readFileSync(config.cacheFilePath, 'utf-8')) : {},
      persist = function persist() { fs.writeFileSync(config.cacheFilePath, JSON.stringify(cache)); },
      set = function set(type, id, val) {
        cache[type] = cache[type] || {};
        cache[type][id] = {value: val, time: Date.now()};
        persist();
      },
      getSync = function getSync(type, id, expire) {
        var typeCache = cache[type] || {},
            cacheData = typeCache[id] || {},
            exists = typeCache[id] !== undefined,
            cachedAt = cacheData.time || 0,
            expiresAt = cachedAt + expire,
            expired = Date.now() > expiresAt;
        return exists && !expired ? cacheData.value : undefined;
      },
      get = function(type, id, expire, cb) {
        cb(getSync(type, id, expire));
      };

  return {getSync: getSync, get: get, set: set}
});
