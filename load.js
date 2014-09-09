define(function(require, exports) {

  var vertex = function(name) {
    return document.getElementById(name + '-vertexShader').textContent;
  }

  var fragment = function(name) {
    return document.getElementById(name + '-fragmentShader').textContent;
  }

  var jsonLoader = new THREE.JSONLoader();

  var model = function(name, callback) {
    jsonLoader.load('./models/' + name + '.js', function(geo) {
      console.log('loaded mesh:', name);
      var mesh = new THREE.Mesh(geo);
      callback(mesh);
    });
  }

  return {
    'model': model,
    'vertex': vertex,
    'fragment': fragment,
  }

});