var camera, scene, renderer, meta;
var line, points;
var mouse, raycaster;
var hover, plane;
var testMass;

init();
animate();

function init() {
    // Basic Setup
    camera = new THREE.PerspectiveCamera(75,
                                         window.innerWidth / window.innerHeight,
                                         0.1,
                                         4000);
    camera.position.z = 500;
    camera.position.y = -500;
    camera.rotateZ(0.05);
    camera.rotateX(0.8);
    scene     = new THREE.Scene();
    renderer  = new THREE.WebGLRenderer();
    raycaster = new THREE.Raycaster();
    mouse     = new THREE.Vector3();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    meta = {};

    // Get vertext data.
    points = createOutlines();

    var material = new THREE.LineBasicMaterial({
        color: 0xe8bd07,
        linewidth: 500,
        linejoin: 'bevel'
    });

    points.gunter.computeBoundingBox();
    var gunterBB = points.gunter.boundingBox;
    var width    = gunterBB.max.x - gunterBB.min.x;
    var height   = gunterBB.max.y - gunterBB.min.y;



    // var outline  = new THREE.Shape([
    //     new THREE.Vector2(0, 0),
    //     new THREE.Vector2(100, 0),
    //     new THREE.Vector2(100, 100),
    //     new THREE.Vector2(0, 100)
    // ]);
    var outline = new THREE.Shape(points.gunter.vertices);
    var extrGeom = new THREE.ExtrudeGeometry(outline, {

    });
    var extrMatr = new THREE.MeshBasicMaterial({
        map:  THREE.ImageUtils.loadTexture('assets/argonisotope-flat.png')
    });
    testMass = new THREE.Mesh(extrGeom, extrMatr);
    // extrGeom.faceUvs = [[]];
    // extrGeom.faceUvs[0].push(new THREE.Vector2(0, 1));
    extrGeom.faceVertexUvs = [[]];
    extrGeom.faceVertexUvs[0] = [];
    var arFaces = [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(1, 0),
        new THREE.Vector2(1, 1),
        new THREE.Vector2(0, 1)
    ];
    extrGeom.faceVertexUvs[0][0] = [ arFaces[0], arFaces[1], arFaces[3] ];
    extrGeom.faceVertexUvs[0][1] = [ arFaces[1], arFaces[2], arFaces[3] ];

    extrGeom.faceVertexUvs[0][2] = [ arFaces[3], arFaces[0], arFaces[1] ];
    extrGeom.faceVertexUvs[0][3] = [ arFaces[1], arFaces[2], arFaces[3] ];
    // var vu = [];
    // for (var i = 0; i < points.gunter.vertices.length; ++i) {
    //     var x = points.gunter.vertices[i] / width;
    //     var y = points.gunter.vertices[i] / height;
    //     vu.push(new THREE.Vector2(x, y));
    // }
    // extrGeom.faceVertexUvs[0][0] = vu;
    // extrGeom.faceVertexUvs[0][1] = vu;
    // extrGeom.faceVertexUvs[0][2] = vu;
    // extrGeom.faceVertexUvs[0][3] = vu;

    // extrGeom.faceVertexUvs[0][4] = [ arFaces[0], arFaces[1], arFaces[3] ];
    // extrGeom.faceVertexUvs[0][5] = [ arFaces[1], arFaces[2], arFaces[3] ];
    //
    // extrGeom.faceVertexUvs[0][6] = [ arFaces[0], arFaces[1], arFaces[3] ];
    // extrGeom.faceVertexUvs[0][7] = [ arFaces[1], arFaces[2], arFaces[3] ];
    //
    // extrGeom.faceVertexUvs[0][8] = [ arFaces[0], arFaces[1], arFaces[3] ];
    // extrGeom.faceVertexUvs[0][9] = [ arFaces[1], arFaces[2], arFaces[3] ];
    //
    // extrGeom.faceVertexUvs[0][10] = [ arFaces[0], arFaces[1], arFaces[3] ];
    // extrGeom.faceVertexUvs[0][11] = [ arFaces[1], arFaces[2], arFaces[3] ];
    testMass.position.x = - width  / 2;
    testMass.position.y =   height / 2;
    testMass.position.z =   -300;
    scene.add(testMass);



    var geometry = new THREE.Geometry();
    geometry.vertices = points.gunter.vertices;
    line = new THREE.Line(geometry, material);
    line.position.x = - width  / 2;
    line.position.y =   height / 2;
    scene.add( line );

    var pGeom = new THREE.PlaneGeometry(width, height);
    var pMatr = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0
    });

    plane = new THREE.Mesh(pGeom, pMatr);
    scene.add(plane);

    // window.addEventListener('mousemove', function(event) {
    //     var coords = getWorldCoords(event);
    //     if (coords) hover = true;
    //     else        hover = false;
    // }, false);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

var i = 0;
function render() {
    // Setup rendering
    // if (hover) console.log('Hovering!');
    // else       console.log('Not!');
    i += 0.01;
    testMass.position.z = 80 * Math.cos(i);
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
        if (intersects[i].object.id == plane.id) {
            return {
                x: intersects[i].point.x,
                y: intersects[i].point.y
            };
        }
    }
}
