define(function(require, exports) {
  var buttonActionMap = {
    'joystick': {
      0: 'a',
      1: 'b',
      2: 'x',
      3: 'y',
      4: 'leftshoulder',
      5: 'rightshoulder',
      6: 'lefttrigger',
      7: 'righttrigger',
      8: 'back',
      9: 'start',
      10: 'leftstick',
      11: 'rightstick',
      12: 'up',
      13: 'down',
      14: 'left',
      15: 'right'
    }
  };
  
  var controller = {
    'gamepadIndex': 0,
    'lastButtons': [],
    'update': function(delta) {
      if(this.gamepadIndex === null) return;
      var gamepads = navigator.getGamepads();
      if(gamepads[this.gamepadIndex] === undefined) return;

      var updatedValues = navigator.getGamepads()[this.gamepadIndex];
      if(!updatedValues.connected) return;

      var self = this;


      // Handle button presses
      var buttons = updatedValues.buttons;
      if(this.lastButtons !== null) {
        buttons.forEach(function(buttonValue, buttonIndex) {
          if(self.lastButtons[buttonIndex] !== undefined
            && buttonValue.value !== self.lastButtons[buttonIndex]) {
            self.dispatchEvent({
              'type': buttonActionMap['joystick'][buttonIndex],
              'message': buttonValue.value,
              'delta': delta
            });
          }
          self.lastButtons[buttonIndex] = buttonValue.value;
        });
      }


      // Handle movement on joystick axes
      var axes = updatedValues.axes;
      this.dispatchEvent({
        'type': 'leftstickmoved',
        'message': new THREE.Vector2(axes[0], axes[1]),
        'delta': delta
      });
      this.dispatchEvent({
        'type': 'rightstickmoved',
        'message': new THREE.Vector2(axes[2], axes[3]),
        'delta': delta
      });
    }
  };

  THREE.EventDispatcher.prototype.apply(controller);

  return controller;
})