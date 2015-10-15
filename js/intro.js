function planeCreation() {

    var scene = new THREE.Scene(),
        composer,
        W = window.innerWidth,
        H = window.innerHeight,
        renderer = new THREE.WebGLRenderer();

    renderer.setClearColor(0x000000);
    renderer.setSize(W, H);

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    // Camera settings
    var camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 10000);

    // Controling camera rotation with the mouse
    controls = new THREE.OrbitControls( camera, renderer.domElement );

    // Camera settings
    camera.position.set(0, 90, 100);
    camera.lookAt(scene.position);


    ///// PLANE CREATION /////
    var planeGeometry = new THREE.PlaneGeometry(80, 80, 20, 20),
        planeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true, transparent:true, opacity: 0.3}),
        plane = new THREE.Mesh(planeGeometry, planeMaterial);

    // Plane initial rotation and position settings
    plane.rotation.y = -0.5 * Math.PI;
    plane.position.set(0, 0, 0);
    scene.add(plane);


    // Postprocessing dots effect
    composer = new THREE.EffectComposer( renderer );
    composer.addPass( new THREE.RenderPass( scene, camera ) );

    var effect = new THREE.ShaderPass( THREE.DotScreenShader );
    effect.uniforms[ 'scale' ].value = 4;
    composer.addPass( effect );

    var effect = new THREE.ShaderPass( THREE.RGBShiftShader );
    effect.uniforms[ 'amount' ].value = 0.0015;
    effect.renderToScreen = true;
    composer.addPass( effect );


    (function drawFrame(ts){

        if( !ts ) {
            window.requestAnimationFrame(drawFrame);
            return
        }

        // Plane center vector
        var center = new THREE.Vector2(0,0);

        // Calling animation update
        window.requestAnimationFrame(drawFrame);

      
        ///// PLANE ANIMATION  /////

        // Number of plane vertices
        var vLength = plane.geometry.vertices.length,
            v,
            dist,
            size,
            magnitude,
            toVz;

        // Loop fot plane motion 
        for (var i = 0; i < vLength; i++) {

            v = plane.geometry.vertices[i];
            dist = new THREE.Vector2(v.x, v.y).sub(center);
            size = 5.0;

            // The more the magnitude is high, the more the amplitude is important
            magnitude = 20;

            toVz = Math.sin(dist.length()/-size + (ts/500)) * magnitude;

            // Ease effect with prev and current plane position 
            if( toVz != NaN ) {
              v.z += ( toVz - v.z ) * .1;
            }

        }
        plane.geometry.verticesNeedUpdate = true;


        renderer.render(scene, camera);
        composer.render();

    }());

    
    

    renderer.render(scene, camera);
        composer.render();
}

$( document ).ready(function() {
    planeCreation();
});
