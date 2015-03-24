var camera, scene, renderer;
var points;
var mouse, raycaster;
var plane;
var group;
var floating;

init();
animate();

function init() {
    // Basic Setup
    camera = new THREE.PerspectiveCamera(75,
                                         window.innerWidth / window.innerHeight,
                                         0.1,
                                         4000);
    camera.position.z = 1000;
    camera.position.y = -800;
    camera.rotateZ(0.05);
    camera.rotateX(0.8);
    scene     = new THREE.Scene();
    renderer  = new THREE.WebGLRenderer();
    raycaster = new THREE.Raycaster();
    mouse     = new THREE.Vector3();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xff0000);
    document.body.appendChild(renderer.domElement);

    // Constants
    var extrude = 50;

    // Get vertext data.
    points = createOutlines();
    points.gunter.geometry.computeBoundingBox();
    var gunterBB = points.gunter.geometry.boundingBox;
    var width    = gunterBB.max.x - gunterBB.min.x;
    var height   = gunterBB.max.y - gunterBB.min.y;

    // Create Extruded Mesh
    var outline = new THREE.Shape(points.gunter.geometry.vertices);
    var extrGeom = new THREE.ExtrudeGeometry(outline, {
        bevelEnabled: false
    });
    var extrMatr = new THREE.MeshBasicMaterial({
        color: 0x636668
    });
    gunterBlock = new THREE.Mesh(extrGeom, extrMatr);
    gunterBlock.position.x = - width  / 2;
    gunterBlock.position.y =   height / 2;
    gunterBlock.position.z = -101;
    gunterBlock.name = "3D shape for gunter";
    // scene.add(gunterBlock);

    var coverGeo = new THREE.PlaneGeometry(width, height);
    console.log(points.gunter.path);
    var coverMat = new THREE.MeshBasicMaterial({
        map:  THREE.ImageUtils.loadTexture(points.gunter.path),
        transparent: true,
        side: THREE.DoubleSide
    });
    var cover = new THREE.Mesh(coverGeo, coverMat);
    cover.name = "Texture to sit on top of 3D shape";

    // Group together
    group = new THREE.Group();
    group.add(gunterBlock);
    group.add(cover);
    scene.add(group);

    // Create Pointing Plane
    var pGeom = new THREE.PlaneGeometry(10000, 10000);
    var pMatr = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0
    });
    plane = new THREE.Mesh(pGeom, pMatr);
    plane.name = "Plane to use to be able to calculate pointing";
    scene.add(plane);

    window.addEventListener('mousemove', function(event) {
        var scale = 250;
        var flatten = 0.001;
        var coords = getWorldCoords(event);
        if (!coords) return;
        var distance = Math.sqrt(Math.pow(coords.x - gunterBlock.position.x - width  / 2, 2)
                               + Math.pow(coords.y - gunterBlock.position.y + height / 2, 2));
        var gaussDis = Math.pow(Math.E, -Math.PI * Math.pow(distance * flatten, 2));
        floating = scale * gaussDis;
    }, false);

    window.addEventListener('resize', function() {
        var WIDTH  = window.innerWidth;
        var HEIGHT = window.innerHeight;
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
    });
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

var t = 0;
function render() {
    // Setup rendering
    t += 0.02;
    group.position.z = 34 * Math.cos(t) + floating;
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
            return alpha > 1;
        }
        var points = contour(imageDefinition);
        var geometry = new THREE.Geometry();

        for (var j = 0; j < points.length; ++j) {
            geometry.vertices.push(new THREE.Vector3(
                points[j][0] - magic,
               -points[j][1] - magic, 0
            ));
        }
        vertices[imgs[i].id] = {
            geometry: geometry,
            path:     imgs[i].src
        }
    }
    return vertices;
}

function getWorldCoords(event) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x =   ( event.clientX / window.innerWidth  ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // update the picking ray with the camera and mouse position
    raycaster.set( mouse, camera );

    // calculate objects intersecting the picking ray
    raycaster.set(camera.position, mouse);
    raycaster.ray.direction.unproject(camera).sub( camera.position ).normalize();

    var intersects = raycaster.intersectObjects(scene.children, true);

    for (var i = 0; i < intersects.length; ++i) {
        if (intersects[i].object.id == plane.id) {
            return {
                x: intersects[i].point.x,
                y: intersects[i].point.y
            }
        }
    }
}
