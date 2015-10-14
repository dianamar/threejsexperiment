// creation of the audio context
var average = 0.01;

    if (! window.AudioContext) {
        if (! window.webkitAudioContext) {
            alert('no audiocontext found');
        }
        window.AudioContext = window.webkitAudioContext;
    }
    var context = new AudioContext();
    var audioBuffer;
    var sourceNode;
    var splitter;
    var analyser, analyser2;
    var javascriptNode;

    var group;
    


    // load the sound
    setupAudioNodes();
    loadSound("./ressources/song.mp3");


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

        // connect one of the outputs from the splitter to
        // the analyser
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
        /*sourceNode.loop = true;*/
    }

    function onEnded() {
      console.log('playback finished');
      var soundavg = 0;
  }

    // log if an error occurs
    function onError(e) {
        console.log(e);
    }

    // quand le noeud javascript est appelé on utilise l'information de l'analyseur pour se servir des données de volume
    javascriptNode.onaudioprocess = function() {

        // get the average for the first channel
        var array =  new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        average = getAverageVolume(array);

    }

    function getAverageVolume(array) {
        var values = 0;
        //var average;

        var length = array.length;

        // get all the frequency amplitudes
        for (var i = 0; i < length; i++) {
            values += array[i];
        }

        average = values / length;
        return average;
        console.log(average);
    }





    // THREE JS

    var scene = new THREE.Scene();
    var composer;

    var W = window.innerWidth;
    var H = window.innerHeight;

    var renderer = new THREE.WebGLRenderer();
    //renderer.setClearColor(0x17293a);
    renderer.setClearColor(0x000000);
    renderer.setSize(W, H);

    console.log(renderer);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    var camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 10000);

    var planeGeometry = new THREE.PlaneGeometry(80, 80, 20, 20);
    var planeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true, transparent:true, opacity: 0.3});
    //planeMaterial.materials[0].opacity = 0.5;


    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    controls = new THREE.OrbitControls( camera, renderer.domElement );



    // POSITION INITIALE DU PLAN //

    // Fontaine
    plane.rotation.x = -0.5 * Math.PI;

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
      console.log("change");
      planeCircle();
    }





    //CREATION D'UNE LIGNE

    var material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });

    var geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3( -100, 0, 0 ),
      new THREE.Vector3( 0, 0, 0 ),
      new THREE.Vector3( 200, 0, 0 )
    );

    var line = new THREE.Line( geometry, material );

    //line.rotation.y =   Math.PI/2;
    // line.position.y = -200;
   // line.rotation.x = -0.5 * Math.PI;
    scene.add( line );






    


    // Cercle
     //plane.rotation.x = -0.5 * Math.PI/2;


    plane.position.set(0, 0, 0);

    scene.add(plane);

    camera.position.set(0, 90, 100);
    camera.lookAt(scene.position);

    // postprocessing dots

    composer = new THREE.EffectComposer( renderer );
    composer.addPass( new THREE.RenderPass( scene, camera ) );

    var effect = new THREE.ShaderPass( THREE.DotScreenShader );
    effect.uniforms[ 'scale' ].value = 4;
    composer.addPass( effect );

    var effect = new THREE.ShaderPass( THREE.RGBShiftShader );
    effect.uniforms[ 'amount' ].value = 0.0015;
    effect.renderToScreen = true;
    composer.addPass( effect );

    // 


    document.body.appendChild(renderer.domElement);

    (function drawFrame(ts){


      
      // shape.position.y += .01;
      // shape.position.Z += .01;

      // shape.position.y += average/10000;
      // shape.position.Z += average/10000;
      // shape.position.x -= average/10000;

      // shape.rotation.x += average/5000;
      // shape.rotation.y += average/5000;



      if( !ts ) {
        window.requestAnimationFrame(drawFrame);
        return
      }

      var center = new THREE.Vector2(0,0);
      window.requestAnimationFrame(drawFrame);
      var vLength = plane.geometry.vertices.length;

      // 
      for (var i = 0; i < vLength; i++) {
        var v = plane.geometry.vertices[i];
        var dist = new THREE.Vector2(v.x, v.y).sub(center);
        //effet trampoline : var size = 50.0;
        var size = 5.0;

        //+ on augmente magnitude, plus l'amplitude est grande, haute
        //var magnitude = 40;
        var magnitude = average/3;


        // plus on divise par un grand nombre, plus la vitesse ralentie
        var toVz = Math.sin(dist.length()/-size + (ts/500)) * magnitude;
        console.log(toVz);
        if( toVz != NaN ) {
          v.z += ( toVz - v.z ) * .1;
        }
      }






      var lineLength = line.geometry.vertices.length;

      for (var cpt = 0; cpt < lineLength; cpt++) {

        var l = line.geometry.vertices[cpt];

        var dist = new THREE.Vector2(l.x, l.y).sub(center);

        var size = 5.0;

        //+ on augmente magnitude, plus l'amplitude est grande, haute
        //var magnitude = 40;
        var magnitude = average/3;


        // plus on divise par un grand nombre, plus la vitesse ralentie
        var toLz = Math.sin(dist.length()/-size + (ts/500)) * magnitude;
        if( toLz != NaN ) {
          l.x += ( toLz - l.x ) * 10;
          console.log(l.x);
        }
      }


      plane.geometry.verticesNeedUpdate = true;
      renderer.render(scene, camera);
      composer.render();

    }());








    // (function(){

    //   var geometry = new THREE.SphereGeometry(4,2,2);
    //   var material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true});

    //   group = new THREE.Object3D();

    //     for ( var i = 0; i < 10; i ++ ) {

    //         var mesh = new THREE.Mesh( geometry, material );
    //         // mesh.position.x = Math.random() * 2000 - 1000;
    //         // mesh.position.y = Math.random() * 2000 - 1000;
    //         // mesh.position.z = Math.random() * 2000 - 1000;
    //         // mesh.rotation.x = Math.random() * 2 * Math.PI;
    //         // mesh.rotation.y = Math.random() * 2 * Math.PI;

    //         mesh.position.x = window.innerWidth/6;
    //         mesh.position.y = Math.random() * 2000 - 1000;
    //         mesh.position.z = Math.random() * 2000 - 1000;
    //         mesh.rotation.x = Math.random() * 2 * Math.PI;
    //         mesh.rotation.y = Math.random() * 2 * Math.PI;

    //         mesh.opacity = 50;
    //         mesh.matrixAutoUpdate = false;
    //         mesh.updateMatrix();
    //         group.add( mesh );


    //     }
    //     scene.add( group );



    //   //render();
    // })();

