define(function(require, exports) {
  var actions = require('actions');
  var colliders = require('colliders');
  var controller = require('controller');
  var fish = require('fish');
  var load = require('load');

  var randomPointInBox = function(box) {
    return new THREE.Vector3(Math.random() * box.max.x + box.min.x,
      Math.random() * box.max.y + box.min.y,
      Math.random() * box.max.z + box.min.z);
  }

  var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2), new THREE.MeshLambertMaterial({color:0x8888cc}));
  pole.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(1, 1, 1));
  pole.material.visible = false;

  var lure = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshLambertMaterial({color:0xff0000}));
  lure.velocity = new THREE.Vector3();
  lure.material.visible = false;
  var lureActionId = null;

  var bobLure = (function() {
    var time = 0;
    return function(delta) {
      time += delta;
      lure.position.y += Math.sin(time * 5.0) / 500.0;
    }
  })();

  var stringMaterial = new THREE.LineBasicMaterial();
  var curve = new THREE.CurvePath();
  var worldLurePos = lure.localToWorld(lure.position.clone());
  curve.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, -2, 1), worldLurePos));
  var string = new THREE.Line(curve.createSpacedPointsGeometry(10), stringMaterial);
  string.position.set(1, 2, 1);

  var fishingActive = false;



  var build = function(scene, model, player) {
    var fishSpawn = [];
    var fishingContext = [];
    model.groups['FishingContext'].forEach(load.buildVolume(scene, model, fishingContext));
    model.groups['WaterCollision'].forEach(load.buildVolume(scene, model, colliders.waterColliders));
    model.groups['FishSpawn'].forEach(load.buildVolume(scene, model, fishSpawn));

    var water = model.objects['Water'];
    water.material = new THREE.ShaderMaterial({
      vertexShader: load.vertex('water'),
      fragmentShader: load.fragment('water')
    });
    water.material.shading = THREE.FlatShading;
    water.material.transparent = true;
    scene.add(water);

    // add fish
    var fishes = [];
    for (var i = 0; i < 10; i++) {
      var newFish = fish(scene, colliders.waterColliders, fishes);
      var volume = fishSpawn[Math.floor(Math.random()*fishSpawn.length)];
      var position = randomPointInBox(volume.geometry.boundingBox);
      position.add(volume.position);
      newFish.position.copy(position);
      scene.add(newFish);
      colliders.waterColliders.push(newFish);
    };

    var lastTautness = -2;
    var updateString = function(tautness) {
      if(!fishingActive) return;
      if(tautness === undefined) tautness = lastTautness;
      var worldLurePos = string.worldToLocal(lure.position.clone());
      var curve = new THREE.CurvePath();
      curve.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, -2 * tautness, 1), worldLurePos));
      var newGeo = curve.createSpacedPointsGeometry(10);
      string.geometry.vertices = newGeo.vertices;
      string.geometry.verticesNeedUpdate = true;
      lastTautness = tautness;
    }

    controller.addEventListener('b', function(event) {
      console.log(string);
    })

    controller.addEventListener('leftstickmoved', function(event) {
      if(!fishingActive) return;
      // check distance from lure
      if(lure.position.distanceTo(player.position) > 6.0) {
        fishingActive = false;
        lure.material.visible = false;
        pole.material.visible = false;
        string.material.visible = false;
      }
      updateString();
    });

    controller.addEventListener('rightstickmoved', function(event) {
      if(!fishingActive) return;
      //move the fishing rod if out
      var rotation = -45 * Math.PI / 180;
      var dx = event.message.x * Math.cos(rotation) + event.message.y * -Math.sin(rotation);
      var dz = event.message.x * Math.sin(rotation) + event.message.y * Math.cos(rotation);
      pole.quaternion.setFromUnitVectors(pole.up, new THREE.Vector3(dx * 2.0, 1, dz).normalize());
      updateString(dz+1);
    });

    controller.addEventListener('a', function(event) {
      if(!event.message) return;
      var anyContain = false;
      fishingContext.forEach(function(box) {
        var boxBox = new THREE.Box3().setFromObject(box);
        var playerBox = new THREE.Box3().copy(player.geometry.boundingBox).translate(player.position);
        if(boxBox.isIntersectionBox(playerBox)) {
          anyContain = true;
        }
      });
      console.log('fishing attempt', anyContain);
      // throw ball
      if(anyContain) {
        player.add(pole);
        pole.material.visible = true;

        player.parent.add(lure);
        lure.position.copy(player.position.clone());
        lure.velocity.set(1, 1, 1);
        lure.material.visible = true;

        updateString();
        string.material.visible = true;
        pole.add(string);

        fishingActive = true;
        if(lureActionId) actions.remove(lureActionId);
        lureActionId = actions.do(function(delta, id) {
          lure.position.add(lure.velocity.clone().multiplyScalar(delta * 5.0));
          lure.velocity.y -= delta * 5.0;
          updateString();

          // water height
          if(lure.position.y <= 3.6) {
            lure.velocity.set(0, 0, 0);
            actions.remove(id);
            lureActionId = actions.do(bobLure);
            return;
          }
        });
      }
      // timer
      // engage battle
      // move characters
      // draw ui
      // set up turns
      // damage/health
      // hook mechanic
      // obtain magic points

      // for now just return magic points
    });
  }

  return {
    'build': build
  };
});