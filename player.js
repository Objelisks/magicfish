define(function(require, exports) {
  var controller = require('controller');
  var actions = require('actions');

  var selectedItem = 0;
  var inventoryObj = new THREE.Object3D();

  var fishingPole = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshLambertMaterial({color: 0xaa0000}));
  fishingPole.name = 'Fishing Pole Mk. II';
  inventoryObj.add(fishingPole);
  var wateringBucket = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshLambertMaterial({color: 0x0000aa}));
  wateringBucket.name = 'Watering Bucket Lvl 8';
  inventoryObj.add(wateringBucket);
  var otherThing = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshLambertMaterial({color: 0x00aa00}));
  otherThing.name = 'Useful Item of Thundering +1';
  inventoryObj.add(otherThing);

  var inventory = [
    fishingPole,
    wateringBucket,
    otherThing
  ];

  var inventoryPositions = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 0, -1),
    new THREE.Vector3(2, 0, -2)
  ];

  var setInvPositions = function(selected) {
    inventory.forEach(function(item, index) {
      var positionIndex = (index - selected + inventory.length) % inventory.length;
      item.position.copy(inventoryPositions[positionIndex]);
    });
  };
  setInvPositions(selectedItem);

  var currentFade = null;
  var currentOpacity = 0.0;
  var setOpacity = function(obj, opacity) {
    obj.traverse(function(child) {
      if(child.material) {
        child.material.opacity = opacity;
      }
    });
  };

  setOpacity(inventoryObj, 0.0);
  inventory.forEach(function(child) {
    if(child.material) {
      child.material.transparent = true;
    }
  });

  var rayDirections = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, -1),
  ];


  var makePlayer = function(terrainColliders) {

    var playerObj = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial());
    playerObj.geometry.computeBoundingBox();
    playerObj.position.y = 4.5;

    var movespeed = 3.5;
    controller.addEventListener('leftstickmoved', function(event) {
      if(event.message.length() < 0.2) return;
      var rotation = -45 * Math.PI / 180;
      var dx = event.message.x * event.delta * Math.cos(rotation) + event.message.y * event.delta * -Math.sin(rotation);
      var dz = event.message.x * event.delta * Math.sin(rotation) + event.message.y * event.delta * Math.cos(rotation);
      var movement = new THREE.Vector3(dx * movespeed, 0, dz * movespeed);

      var raycaster = new THREE.Raycaster(playerObj.position, rayDirections[0].clone(), 0, 0.5);
      rayDirections.forEach(function(dir) {
        raycaster.set(playerObj.position, dir);
        var hits = raycaster.intersectObjects(terrainColliders, true);
        hits.forEach(function(collision) {
          if(collision.distance === 0.5) return;
          movement.projectOnVector(collision.face.normal.clone().cross(playerObj.up));
          movement.add(dir.clone().setLength(collision.distance-0.5));
        });
      });

      playerObj.position.add(movement);
    });

    playerObj.add(inventoryObj);
    inventoryObj.position.x = 1;
    inventoryObj.position.y = 2;

    controller.addEventListener('x', function(event) {
      if(!event.message) return;
      // rotate the board
      var ticker = 0;
      if(currentFade) actions.remove(currentFade);
      currentFade = actions.do(function(delta) {
        ticker += delta;
        if(ticker > 1.0) {
          currentOpacity -= delta * 2.0;
          if(currentOpacity <= 0.0) {
            currentOpacity = 0.0;
            setOpacity(inventoryObj, currentOpacity);
            currentFade = null;
            return true;
          }
          setOpacity(inventoryObj, currentOpacity);
        } else {
          currentOpacity += delta * 10.0;
          if(currentOpacity >= 1.0) {
            currentOpacity = 1.0;
          }
          setOpacity(inventoryObj, currentOpacity);
        }
        return false;
      });

      selectedItem = (selectedItem + 1) % inventory.length;
      setInvPositions(selectedItem);

      /*
      var temp = inventory.children[inventory.children.length-1].position.clone();
      for (var i = inventory.children.length - 1; i >= 1; i--) {
        inventory.children[i].position.copy(inventory.children[i-1].position);
      };
      inventory.children[0].position.copy(temp);
      selectedItem = (selectedItem + 1) % inventory.children.length;
      */
    });

    controller.addEventListener('a', function(event) {
      if(!event.message) return;
      console.log('using', inventory[selectedItem].name);
    });

    return playerObj;
  }

  return makePlayer;
})