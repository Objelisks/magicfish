define(function(require, exports) {
  var load = require('load');
  var updates = require('updates');
  var world = require('world');
  var once = false;

  var makeFish = function(scene, waterColliders) {
    var fish = new THREE.Object3D();
    load.model('fish', function(model) {
      //set model material;
      model.material = new THREE.MeshLambertMaterial({});
      model.material.shading = THREE.FlatShading;
      model.quaternion.setFromAxisAngle(fish.up, 0);
      fish.add(model);
    });
    fish.forward = new THREE.Vector3(0, 0, 1);
    var fishRay = new THREE.ArrowHelper(fish.forward.clone(), new THREE.Vector3(), 3);
    //fish.add(fishRay);
    //fish.add(new THREE.AxisHelper());

    var movement = new THREE.Vector3();
    updates.addEventListener('update', function(event) {
      var delta = event.message;

      movement.copy(fish.forward);

      var rayPosition = fish.position.clone();
      var raycaster = new THREE.Raycaster(rayPosition, fish.forward.clone(), 0.1, 1);
      var collisions = raycaster.intersectObjects(waterColliders, true);
      if(collisions.length > 0) {
        fishRay.setColor(0xff0000);
        //fish.forward.add(collisions[0].face.normal.clone().multiplyScalar(delta));
        fish.forward.applyAxisAngle(fish.up, Math.random() * 0.4);
        //fish.children[1].material.color.setHex(0xff0000);
      } else {
        fishRay.setColor(0x00ff00);
        //fish.children[1].material.color.setHex(0x00ff00);
      }

      fish.forward = fish.forward.lerp(fish.forward.clone().normalize().multiplyScalar(1.0), 0.5);

      fish.position.add(movement.multiplyScalar(delta));
      fish.quaternion.slerp(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), fish.forward), 0.2);
    });
    return fish;
  }

  return makeFish;
});