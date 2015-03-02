var camera, scene, renderer, meta;
var line;
var points;

init();
animate();

function init() {
    // Basic Setup
    camera = new THREE.PerspectiveCamera(75,
                                         window.innerWidth / window.innerHeight,
                                         0.1,
                                         4000);
    camera.position.z = 500;
    scene  = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    meta = {};

    // Get vertext data.
    points = createOutlines();

    // Adding Meshes
    var geometry = new THREE.SphereGeometry(50, 16, 16);
    var material = new THREE.MeshBasicMaterial({
        color: 0xffff00
    });
    var sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    var material = new THREE.LineBasicMaterial({
        color: 0x0000ff,
        linewidth: 200,
        linejoin: 'bevel'
    });

    line = new THREE.Line(points.gunter, material);
    line.position.x = -250;
    line.position.y = 375;
    scene.add( line );
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    // Setup rendering

    // Render
    renderer.render(scene, camera);
}

function createOutlines(scale) {
    scale = scale || 1;
    var imgs  = document.querySelectorAll('img.outline');
    var magic = 5;
    var vertices = {};

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
        var geometry = new THREE.Geometry();

        for (var j = 0; j < points.length; ++j) {
            geometry.vertices.push(new THREE.Vector3(
                ( points[j][0] - magic ) *  scale,
                ( points[j][1] - magic ) * -scale, 0
            ));
        }
        vertices[imgs[i].id] = geometry;
    }
    return vertices;
}
