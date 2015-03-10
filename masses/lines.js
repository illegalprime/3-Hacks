var camera, scene, renderer;
var points;
var mouse, raycaster;
var plane;

var testMass;
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
    // camera.position.y = -500;
    // camera.rotateZ(0.05);
    // camera.rotateX(0.2);
    scene     = new THREE.Scene();
    renderer  = new THREE.WebGLRenderer();
    raycaster = new THREE.Raycaster();
    mouse     = new THREE.Vector3();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Get vertext data.
    points = createOutlines();
    points.gunter.computeBoundingBox();
    var gunterBB = points.gunter.boundingBox;
    var width    = gunterBB.max.x - gunterBB.min.x;
    var height   = gunterBB.max.y - gunterBB.min.y;

    // var outline = new THREE.Shape(points.gunter.vertices);
    // var extrGeom = new THREE.ExtrudeGeometry(outline, {
    //     steps: 1,
    //     bevelEnabled: false,
    //     amount: 50,
    //     material: 0,
    //     extrudeMaterial: 1,
    //     UVGenerator: THREE.ExtrudeGeometry.BoundingBoxUVGenerator
    // });
    // // var uvs = extrGeom.faceVertexUvs[0];
    // // for (var i = 0; i < uvs.length; i++) {
    // //
    // //     uv = uvs[i];
    // //
    // //     for (var j = 0; j < uv.length; j++) {
    // //         u = uv[j];
    // //         u.x = (u.x - 0) / 1024;
    // //         u.y = (u.y - 0) / 1024;
    // //     }
    // // }
    // var extrMatr = new THREE.MeshLambertMaterial({
    //     map: THREE.ImageUtils.loadTexture('assets/Gunter.png')
    // });
    // var extrSide = new THREE.MeshLambertMaterial({
    //     color: 0xff8800,
    //     ambient: 0xffffff,
    // });
    // testMass = new THREE.Mesh(extrGeom, new THREE.MeshFaceMaterial([extrMatr, extrSide]));
    //
    // testMass.position.x = - width  / 2;
    // testMass.position.y =   height / 2;
    // scene.add(testMass);

    var outline = new THREE.Shape(points.gunter.vertices);
    var outlinePoints = outline.extractAllPoints();
    var triangles = THREE.Shape.Utils.triangulateShape(outlinePoints.shape, outlinePoints.holes);

    for (var i = 0; i < triangles.length; ++i) {
        for (var j = 0; j < triangles[i].length; ++j) {
            triangles[i][j] = triangles[i][j] / 1024;
        }
    }
    console.log(triangles);

    var extrGeom = new THREE.ExtrudeGeometry(outline, {
        material: 0,
        extrudeMaterial: 1
    });
    var extrMatr = new THREE.MeshBasicMaterial({
        map:  THREE.ImageUtils.loadTexture('assets/Gunter.png')
    });
    var extrSide = new THREE.MeshLambertMaterial({
        color: 0xff8800,
        ambient: 0xffffff,
    });
    testMass = new THREE.Mesh(extrGeom, new THREE.MeshFaceMaterial([extrMatr, extrSide]));
    extrGeom.faceUvs = [[]];
    // extrGeom.faceUvs[0].push(new THREE.Vector2(0, 1));
    extrGeom.faceVertexUvs = [[]];
    extrGeom.faceVertexUvs[0] = [];
    var x = 0;
    var y = (1024 - 732) / 1024;
    var w = 501 / 1024;
    var h = 732 / 1024;
    var arFaces = [
        new THREE.Vector2(x, y),
        new THREE.Vector2(x + w, y),
        new THREE.Vector2(x + w, y + h),
        new THREE.Vector2(x, y + h)
    ];
    extrGeom.faceVertexUvs[0][0] = triangles;
    extrGeom.faceVertexUvs[0][1] = triangles;

    extrGeom.faceVertexUvs[0][2] = triangles;
    extrGeom.faceVertexUvs[0][3] = triangles;
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


    var pGeom = new THREE.PlaneGeometry(10000, 10000);
    var pMatr = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0
    });

    plane = new THREE.Mesh(pGeom, pMatr);
    scene.add(plane);

    window.addEventListener('mousemove', function(event) {
        var scale = 150;
        var flatten = 0.001;
        var coords = getWorldCoords(event);
        var distance = Math.sqrt(Math.pow(coords.x - testMass.position.x - width  / 2, 2)
                               + Math.pow(coords.y - testMass.position.y + height / 2, 2));
        var gaussDis = Math.pow(Math.E, -Math.PI * Math.pow(distance * flatten, 2));
        floating = scale * gaussDis;
    }, false);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

var i = 0;
function render() {
    // Setup rendering
    i += 0.02;
    testMass.position.z = 12 * Math.cos(i) + floating;
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
            return alpha > 50;
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

    for (var i = 0; i < intersects.length; ++i) {
        if (intersects[i].object.id == plane.id) {
            return {
                x: intersects[i].point.x,
                y: intersects[i].point.y
            }
        }
    }
}

function getGunter() {
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1024;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(document.getElementById('gunter'), 0, 0);
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}
