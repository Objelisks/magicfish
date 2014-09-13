define(function(require, exports) {
  var actions = {};
  var id = 1;

  var newAction = function(callback) {
    var actionId = id;
    actions[id] = callback;
    id += 1;
    return actionId;
  }

  var update = function(delta) {
    Object.keys(actions).forEach(function(i) { actions[i](delta, i); });
  }

  var remove = function(id) {
    delete actions[id];
  }

  var tween = function(obj, attr, start, end, duration) {
    var value = start;
    return newAction(function(delta) {
      value += (end - start) * delta / duration;
      obj[attr] = value;
    });
  }

  return {
    'do': newAction,
    'update': update,
    'remove': remove
  };
});