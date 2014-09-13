/**
GAME MODULE
*/

define(function(require, exports) {
  
  var actions = require('actions');
  var colliders = require('colliders');
  var controller = require('controller');
  var fishingController = require('fishing');
  var houseController = require('house');
  var load = require('load');
  var player = require('player');

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(1294, 800);
  document.body.appendChild(renderer.domElement);

  var clock = new THREE.Clock(true);

  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-19.4, 19.4, 16, -8, 1, 1000);

  var gridHelper = new THREE.GridHelper(10, 1);
  scene.add(gridHelper);


  camera.position.set(100, 75, 100);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.x = -1;
  light.position.y = 1;
  light.position.z = 1;
  scene.add(light);
  light = new THREE.HemisphereLight(0xffffff, 0x404040, 0.5);
  scene.add(light);

  var useShader = function(model, name) {
    model.material = new THREE.ShaderMaterial({
      vertexShader: load.vertex(name),
      fragmentShader: load.fragment(name)
    });
    model.material.shading = THREE.FlatShading;
  }

  var playerObj;
  var sceneLoader = new THREE.SceneLoader();
  sceneLoader.load('./models/scene.js', function(model) {

    Object.keys(model.objects).forEach(function(objKey) {
      var obj = model.objects[objKey];
      obj.rotation.x += Math.PI/2;
      var flipYZ = new THREE.Matrix4().makeRotationX(-Math.PI/2);
      obj.geometry.applyMatrix(flipYZ);
    });

    model.groups['TerrainCollision'].forEach(load.buildVolume(scene, model, colliders.terrainColliders));

    // add player
    playerObj = player.build();
    scene.add(playerObj);

    houseController.build(scene, model, playerObj);

    fishingController.build(scene, model, playerObj);

    //farmingController.build(scene, model, playerObj);

    var terrain = model.objects['Terrain'];
    terrain.material = new THREE.ShaderMaterial({
      vertexShader: load.vertex('terrain'),
      fragmentShader: load.fragment('terrain')
    });
    terrain.material.shading = THREE.FlatShading;
    scene.add(terrain);
  });

  var update = function(delta) {
    controller.update(delta);
    actions.update(delta);
  }

  var render = function() {
    requestAnimationFrame(render);
    var delta = clock.getDelta();
    update(delta);
    renderer.render(scene, camera);
  }
  render();


});