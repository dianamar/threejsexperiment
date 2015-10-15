
///////////// AUDIO API : creation of the audio context /////////////


var average = 0.01;

if (! window.AudioContext) {
    if (! window.webkitAudioContext) {
        alert('no audiocontext found');
    }
    window.AudioContext = window.webkitAudioContext;
}
var context = new AudioContext(),
    audioBuffer,
    sourceNode,
    splitter,
    analyser, 
    analyser2,
    javascriptNode,
    group;

// load the sound
setupAudioNodes();
//loadSound("./ressources/song.mp3");


function setupAudioNodes() {

    // setup a javascript node
    javascriptNode = context.createScriptProcessor(2048, 1, 1);
    // connect to destination, else it isn't called
    javascriptNode.connect(context.destination);

    // setup : analyzer
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;

    analyser2 = context.createAnalyser();
    analyser2.smoothingTimeConstant = 0.0;
    analyser2.fftSize = 1024;

    // creation of a buffer source node
    sourceNode = context.createBufferSource();
    splitter = context.createChannelSplitter();

    // connect the source to the analyser and the splitter
    sourceNode.connect(splitter);

    // connect one of the outputs from the splitter to the analyser
    splitter.connect(analyser,0,0);
    splitter.connect(analyser2,1,0);

    // connect the splitter to the javascriptnode
    analyser.connect(javascriptNode);

    // connect to destination
    sourceNode.connect(context.destination);
}

// load the specified sound
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // When loaded decode the data
    request.onload = function() {

        // decode the data
        context.decodeAudioData(request.response, function(buffer) {
            // when the audio is decoded play the sound
            playSound(buffer);
        }, onError);
    }
    request.send();
}


function playSound(buffer) {
    sourceNode.buffer = buffer;
    sourceNode.start(0);
    sourceNode.onended = onEnded;
}

function onEnded() {
  console.log('playback finished');
  var soundavg = 0;
}

function onError(e) {
    console.log(e);
}

javascriptNode.onaudioprocess = function() {

    // get the average for the first channel
    var array =  new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    average = getAverageVolume(array);

}

function getAverageVolume(array) {
    var values = 0;
    var length = array.length;

    // get all the frequency amplitudes
    for (var i = 0; i < length; i++) {
        values += array[i];
    }

    average = values / length;
    return average;
}





///////////// THREE JS : AUDIO EQUALIZER //////////////////////////
function audioEqualizer() {

    loadSound("./ressources/song.mp3");

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
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.set(0, 0, 0);
    scene.add(plane);

    // Second plane x position
    setTimeout(planeCircle, 8000);

    function planeDna(){
      plane.rotation.y = -0.5 * Math.PI;
      setTimeout(planeWater, 8000);
    }

    function planeCircle() {
      plane.rotation.x = -0.5 * Math.PI/2;
      setTimeout(planeDna, 8000);
    }

    function planeWater() {
      plane.rotation.x = -0.5 * Math.PI;
      plane.rotation.y = 0;
      planeCircle();
    }




    ///// Line creation /////
    var material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: .6
    });

    // Creating several vertices dynamically for the line movement
    var countVertices = 100,
        step = 10,
        min = -( countVertices / 2 ) * step,
        vertices = [];

    for( var i = 0; i < countVertices; i++ ) {
        vertices.push( new THREE.Vector3( min + i * step, 0, 0 ) )
    }

    var geometry = new THREE.Geometry();
    geometry.vertices = vertices

    var line = new THREE.Line( geometry, material );
    scene.add( line );


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


    document.body.appendChild(renderer.domElement);

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
            magnitude = average/3;

            toVz = Math.sin(dist.length()/-size + (ts/500)) * magnitude;

            // Ease effect with prev and current plane position 
            if( toVz != NaN ) {
              v.z += ( toVz - v.z ) * .1;
            }

        }
        plane.geometry.verticesNeedUpdate = true;



        ///// LINE ANIMATION  /////

        // Number of line vertices
        var lineLength = line.geometry.vertices.length,
          l,
          dist,
          magnitudeLine,
          toLz;

        // Loop for line motion
        for (var cpt = 0; cpt < lineLength; cpt++) {

            l = line.geometry.vertices[cpt];
            dist = new THREE.Vector2(l.x, l.y).sub(center);
            magnitudeLine = average/3;
            toLz = Math.sin(dist.length()/-size + (ts/800)) * magnitudeLine;

            // Ease effect with prev and current line position 
            if( toLz != NaN ) {
              l.y += ( toLz - l.y ) * .1;
            }

        }
        line.geometry.verticesNeedUpdate = true;


        renderer.render(scene, camera);
        composer.render();

    }());

}





audioEqualizer();

