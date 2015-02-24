var camera;
var scene;
var renderer;
var mesh;
var textures = {};

window.onload = function() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000);

    createTextures();
    init();
    animate();
}

function init() {
    //
    // var light = new THREE.DirectionalLight( 0xffffff );
    // light.position.set(0, 1, 1).normalize();
    // scene.add(light);

    var geometry = new THREE.CubeGeometry( 10, 10, 10);
    var material = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture('assets/crate.jpg')
    });

    // mesh = new THREE.Mesh(geometry, material );
    mesh = textures['crate'];
    mesh.position.z = -500;
    mesh.position.x = -300;
    mesh.position.y = -300;
    mesh.rotation.x += .01;
    mesh.rotation.y += .005;

    scene.add( mesh );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

    render();
}

function animate() {

    mesh.rotation.x += .01;
    mesh.rotation.y += .005;
    render();
    requestAnimationFrame( animate );
}

function render() {
    renderer.render( scene, camera );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
}

function createTextures(scale) {
    scale = scale || 1;
    var imgs  = document.getElementsByClassName('emboss');
    var magic = 5;

    for (var i = 0; i < imgs.length; ++i) {
        var canvas  = document.createElement('canvas');
            canvas.width  = imgs[i].width  + magic;
            canvas.height = imgs[i].height + magic;
            canvas.visibility = 'hidden';
        var context = canvas.getContext('2d');
        context.drawImage(imgs[i], magic, magic);

        imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        pixels  = imgData.data;

        var imageDefinition = function(x, y) {
            var alpha = pixels[(y * canvas.width + x) * 4 + 3];
            return alpha > 0;
        }

        var points = contour(imageDefinition);
        var vectors = [];

        for (var j = 0; j < points.length; ++j) {
            vectors.push(new THREE.Vector2(
                ( points[j][0] - magic ) * scale,
                ( points[j][1] - magic ) * scale
                ));
        }
        var shape = new THREE.Shape(vectors);
        var textr = new THREE.Texture(canvas);
        textr.needsUpdate = true;

        var geometry = new THREE.ExtrudeGeometry(shape, {
            amount: 20,
            bevelEnabled: false,
            material: 0,
            extrudeMaterial: 1
        });
        var material = new THREE.MeshBasicMaterial({
            map: textr
        });

        var uvs = [];
        uvs.push( new THREE.Vector2( 0.0, 0.0 ) );
        uvs.push( new THREE.Vector2( 1.0, 0.0 ) );
        uvs.push( new THREE.Vector2( 1.0, 1.0 ) );
        // generate faces
        geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
        geometry.faceVertexUvs[ 0 ].push( [ uvs[0], uvs[1], uvs[2] ] );

        textures[imgs[i].id] = new THREE.SceneUtils.createMultiMaterialObject(
            geometry, [material, new THREE.MeshBasicMaterial({
                    color: 0x000000,
                    wireframe: true,
                    transparent: true
                })]);
    }
}
