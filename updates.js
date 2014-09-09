define(function(require, exports) {

  var updater = {
    'update': function(delta) {
      this.dispatchEvent({
        'type': 'update',
        'message': delta
      });
    }
  };

  THREE.EventDispatcher.prototype.apply(updater);

  return updater;
});