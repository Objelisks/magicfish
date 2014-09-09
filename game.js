/**
GAME MODULE
*/

define(function(require, exports) {
  
  var controller = require('controller');
  var player = require('player');
  var actions = require('actions');
  var load = require('load');
  var fish = require('fish');
  var updates = require('updates');
  var world = require('world');

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(1294, 800);
  document.body.appendChild(renderer.domElement);

  var clock = new THREE.Clock(true);

  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-19.4, 19.4, 16, -8, 1, 1000);

  var gridHelper = new THREE.GridHelper(10, 1);
  gridHelper.position.y -= 0.001;
  scene.add(gridHelper);
  var axisHelper = new THREE.AxisHelper();
  scene.add(axisHelper);

  camera.position.set(100, 75, 100);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.x = -1;
  light.position.y = 1;
  light.position.z = 1;
  scene.add(light);
  light = new THREE.HemisphereLight(0xffffff, 0x404040, 0.5);
  scene.add(light);

  var setTransparent = function(model) {
    model.material.transparent = true;
  }
  var addModel = function(model) {
    scene.add(model);
  }
  var useShader = function(model, name) {
    model.material = new THREE.ShaderMaterial({
      vertexShader: load.vertex(name),
      fragmentShader: load.fragment(name)
    });
    model.material.shading = THREE.FlatShading;
  }
  var buildVolume = function(model, array, debugDraw) {
    debugDraw = debugDraw || false;
    return function(objName) {
      var volume = model.objects[objName];
      volume.geometry.computeBoundingBox();
      volume.material = new THREE.MeshBasicMaterial({visible: debugDraw});
      array.push(volume);
      scene.add(volume);
    }
  }
  var randomPointInBox = function(box) {
    return new THREE.Vector3(Math.random() * box.max.x + box.min.x,
      Math.random() * box.max.y + box.min.y,
      Math.random() * box.max.z + box.min.z);
  }

  var terrainColliders = [];
  var waterColliders = [];
  var sceneLoader = new THREE.SceneLoader();
  sceneLoader.load('./models/scene.js', function(model) {

    Object.keys(model.objects).forEach(function(objKey) {
      var obj = model.objects[objKey];
      obj.rotation.x += Math.PI/2;
      var flipYZ = new THREE.Matrix4().makeRotationX(-Math.PI/2);
      obj.geometry.applyMatrix(flipYZ);
    })

    var fishSpawn = [];
    model.groups['TerrainCollision'].forEach(buildVolume(model, terrainColliders));
    model.groups['WaterCollision'].forEach(buildVolume(model, waterColliders));
    model.groups['FishSpawn'].forEach(buildVolume(model, fishSpawn, false));

    scene.add(model.objects['Farm']);
    scene.add(model.objects['House']);

    var terrain = model.objects['Terrain'];
    useShader(terrain, 'terrain');
    scene.add(terrain);

    var water = model.objects['Water'];
    useShader(water, 'water');
    setTransparent(water);
    scene.add(water);


    // add fish
    for (var i = 0; i < 10; i++) {
      var newFish = fish(scene, waterColliders);
      var volume = fishSpawn[Math.floor(Math.random()*fishSpawn.length)];
      var position = randomPointInBox(volume.geometry.boundingBox);
      position.add(volume.position);
      newFish.position.copy(position);
      console.log(position);
      scene.add(newFish);
    };
  });

  // add player
  scene.add(player(terrainColliders));


  var update = function(delta) {
    controller.update(delta);
    actions.update(delta);
    updates.update(delta);
  }

  var render = function() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    var delta = clock.getDelta();
    update(delta);
  }
  render();


});