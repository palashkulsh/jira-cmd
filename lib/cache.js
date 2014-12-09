/*global requirejs,define,fs*/
define(['fs'], function (fs) {
  var cachePath = process.env.HOME + '/.jira/' + 'cache.json',
      exists = fs.existsSync(cachePath),
      cache = exists ? JSON.parse(fs.readFileSync(cachePath, 'utf-8')) : {},
      persist = function persist() { fs.writeFileSync(cachePath, JSON.stringify(cache)); },
      set = function set(type, id, val) {
        cache[type] = cache[type] || {};
        cache[type][id] = {value: val, time: Date.now()};
        console.log(JSON.stringify(cache))
        persist();
      },
      getSync = function getSync(type, id, expire) {
        var typeCache = cache[type] || {},
            cacheData = typeCache[id] || {},
            exists = typeCache[id] !== undefined,
            cachedAt = cacheData.time || 0,
            expiresAt = cachedAt + expire,
            expired = Date.now() > expiresAt;
        console.log("exists: " + exists + " expiresat " + expiresAt + "cachedAt " + cachedAt + "expired" + expired)
        return exists && !expired ? cacheData.value : undefined;
      },
      get = function(type, id, expire, cb) {
        cb(getSync(type, id, expire));
      };

  return {getSync: getSync, get: get, set: set}
});
