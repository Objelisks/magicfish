define(function(require, exports) {
  var colliders = require('colliders');
  var controller = require('controller');


  var rayDirections = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, -1),
  ];


  var build = function() {

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
        var hits = raycaster.intersectObjects(colliders.terrainColliders, true);
        hits.forEach(function(collision) {
          if(collision.distance === 0.5) return;
          movement.projectOnVector(collision.face.normal.clone().cross(playerObj.up));
          movement.add(dir.clone().setLength(collision.distance-0.5));
        });
      });

      playerObj.position.add(movement);
    });

    return playerObj;
  }

  return {
    'build': build
  };
})