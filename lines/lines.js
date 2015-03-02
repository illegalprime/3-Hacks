var camera, scene, renderer;

init();
animate();

function init() {
    // Basic Setup
    camera = new THREE.PerspectiveCamera(75,
                                         window.innerWidth / window.innerHeight,
                                         0.1,
                                         4000);
    camera.position.z = 300;
    scene  = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Adding Meshes
    var geometry = new THREE.SphereGeometry(50, 16, 16);
    var material = new THREE.MeshBasicMaterial({
        color: 0xffff00
    });
    var sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    var material = new THREE.LineBasicMaterial({
        color: 0x0000ff,
        linewidth: 20
    });

    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3( -100, 0, 0 ),
        new THREE.Vector3( 0, 100, 0 ),
        new THREE.Vector3( 100, 0, 0 )
    );

    var line = new THREE.Line( geometry, material );
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
