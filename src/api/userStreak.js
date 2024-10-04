import { Zeeguu_API } from ".classDef";

Zeeguu_API.prototype.getStreak = function (callback) {
  this._getJSON("get_streak", callback);
};
