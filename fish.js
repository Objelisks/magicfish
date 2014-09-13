define(function(require, exports) {
  var actions = require('actions');
  var load = require('load');
  var world = require('world');
  var once = false;

  var makeFish = function(scene, waterColliders, fishes) {
    var fish = new THREE.Object3D();
    load.model('fish', function(model) {
      //set model material;
      model.material = new THREE.MeshLambertMaterial({});
      model.material.shading = THREE.FlatShading;
      model.quaternion.setFromAxisAngle(fish.up, 0);
      fish.add(model);
    });
    fish.forward = new THREE.Vector3(0, 0, 1);

    var movement = new THREE.Vector3();
    actions.do(function(delta) {
      movement.copy(fish.forward);

      var rayPosition = fish.position.clone();
      var raycaster = new THREE.Raycaster(rayPosition, fish.forward.clone(), 0.1, 0.5);
      var collisions = raycaster.intersectObjects(waterColliders, true);
      if(collisions.length > 0) {
        //fish.forward.add(collisions[0].face.normal.clone().multiplyScalar(delta));
        fish.forward.applyAxisAngle(fish.up, Math.random() * 0.4 + 0.1);
      }
      var sideCheck = fish.forward.clone().applyAxisAngle(fish.up, Math.PI/4);
      raycaster.set(rayPosition, sideCheck);
      collisions = raycaster.intersectObjects(waterColliders, true);
      if(collisions.length > 0) {
        fish.forward.applyAxisAngle(fish.up, -Math.random() * 0.2);
      }

      sideCheck.applyAxisAngle(fish.up, -Math.PI/2);
      raycaster.set(rayPosition, sideCheck);
      collisions = raycaster.intersectObjects(waterColliders, true);
      if(collisions.length > 0) {
        fish.forward.applyAxisAngle(fish.up, Math.random() * 0.2);
      }

      fish.forward = fish.forward.lerp(fish.forward.clone().normalize().multiplyScalar(1.0), 0.5);
      fish.forward.applyAxisAngle(fish.up, Math.random() * 0.1 - 0.05);

      fish.position.add(movement.multiplyScalar(delta));
      fish.quaternion.slerp(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), fish.forward), 0.2);
    });
    return fish;
  }

  return makeFish;
});