var camera, scene, renderer, meta;
var line, points;
var mouse, raycaster;
var hover, tag;
var pointerID;

init();
animate();

function init() {
    // Basic Setup
    camera = new THREE.PerspectiveCamera(75,
                                         window.innerWidth / window.innerHeight,
                                         0.1,
                                         4000);
    camera.position.z = 500;
    camera.position.y = -150;
    camera.rotateZ(0.05);
    camera.rotateX(0.2);
    scene     = new THREE.Scene();
    renderer  = new THREE.WebGLRenderer();
    raycaster = new THREE.Raycaster();
    mouse     = new THREE.Vector3();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    meta = {};

    // Get vertext data.
    points = createOutlines();

    // Adding Meshes
    var geometry = new THREE.PlaneGeometry(1020, 1320);
    var material = new THREE.MeshBasicMaterial({
        map:  THREE.ImageUtils.loadTexture('assets/LinuxTime_Poster.png'),
        side: THREE.DoubleSide
    });
    tag = new THREE.Mesh(geometry, material);
    tag.position.z = -0.2;
    tag.position.x = -193;
    tag.position.y =  238;
    scene.add(tag);

    var material = new THREE.LineBasicMaterial({
        color: 0xe8bd07,
        linewidth: 500,
        linejoin: 'bevel'
    });

    points.gunter.computeBoundingBox();
    var gunterBB = points.gunter.boundingBox;
    var width    = gunterBB.max.x - gunterBB.min.x;
    var height   = gunterBB.max.y - gunterBB.min.y;

    var geometry = new THREE.Geometry();
    var gunterVs = points.gunter.vertices;
    for (var i = 0; i < gunterVs.length; ++i) {
        geometry.vertices.push(points.gunter.vertices[0]);
    }

    line = new THREE.Line(geometry, material);
    line.position.x = - width  / 2;
    line.position.y =   height / 2;
    scene.add( line );

    var geometry = new THREE.PlaneGeometry(100, 100);
    var material = new THREE.MeshBasicMaterial({
        map:  THREE.ImageUtils.loadTexture('assets/argonisotope-flat.png'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0
    });
    tag = new THREE.Mesh(geometry, material);
    tag.position.z = -0.1;
    tag.position.x = 300;
    tag.position.y = -10;
    tag.rotation.z = Math.PI / 2;
    scene.add(tag);

    var pGeom = new THREE.PlaneGeometry(width, height);
    var pMatr = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0
    });

    var plane = new THREE.Mesh(pGeom, pMatr);
    pointerID = plane.id;
    scene.add(plane);

    window.addEventListener('mousemove', function(event) {
        var coords = getWorldCoords(event);
        if (coords) hover = true;
        else        hover = false;
    }, false);

    var i = 0;
    var speed = 2;
    setTimeout(function drawMore() {
        if (i < gunterVs.length) {
            line.geometry.vertices[i] = gunterVs[i];
            line.geometry.verticesNeedUpdate = true;
            ++i;
            setTimeout(drawMore, speed);
        }
    }, speed);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    // Setup rendering
    if (hover) {
        if (tag.material.opacity < 1) {
            tag.material.opacity += 0.1;
        }
    }
    else if (tag.material.opacity > 0) {
        tag.material.opacity -= 0.1;
    }
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

    var intersects = raycaster.intersectObjects(scene.children);

    for (i in intersects) {
        if (intersects[i].object.id == pointerID) {
            return {
                x: intersects[i].point.x,
                y: intersects[i].point.y
            };
        }
    }
}
