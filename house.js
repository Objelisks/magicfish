define(function(require, exports) {
  var actions = require('actions');
  var colliders = require('colliders');
  var load = require('load');

  var build = function(scene, model, player) {
    var controller = {};
    var houseInterior = [];

    model.groups['HouseInterior'].forEach(load.buildVolume(scene, model, colliders.houseInteriorColliders));

    var houseBase = model.objects['HouseBase'];
    houseBase.material = new THREE.ShaderMaterial({
      vertexShader: load.vertex('house'),
      fragmentShader: load.fragment('house')
    });
    houseBase.material.shading = THREE.FlatShading;
    houseBase.material.uniforms.fadeOut = {type:'f', value:1.0};
    scene.add(houseBase);
    colliders.terrainColliders.push(houseBase);

    var houseTop = model.objects['HouseTop'];
    houseTop.material = new THREE.ShaderMaterial({
      vertexShader: load.vertex('house'),
      fragmentShader: load.fragment('house')
    });
    houseTop.material.shading = THREE.FlatShading;
    houseTop.material.uniforms.fadeOut = {type:'f', value:1.0};
    houseTop.material.transparent = true;
    scene.add(houseTop);

    var magicStation = model.objects['MagicStation'];
    colliders.terrainColliders.push(magicStation);
    scene.add(magicStation);

    actions.do(function(delta) {
      if(houseTop) {
        var anyContain = false;
        colliders.houseInteriorColliders.forEach(function(box) {
          var boxBox = new THREE.Box3().setFromObject(box);
          var playerBox = new THREE.Box3().copy(player.geometry.boundingBox).translate(player.position);
          if(boxBox.isIntersectionBox(playerBox)) {
            anyContain = true;
          }
        });

        if(anyContain) {
          houseTop.material.uniforms.fadeOut.value = Math.max(0.0, houseTop.material.uniforms.fadeOut.value - delta * 5.0);
        } else {
          houseTop.material.uniforms.fadeOut.value = Math.min(1.0, houseTop.material.uniforms.fadeOut.value + delta * 5.0);
        }
      }
      return false;
    });
  }

  return {
    'build': build
  }
});