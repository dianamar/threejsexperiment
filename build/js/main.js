(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// const loop = require( "core/loop" )
// const stage = require( "core/stage" )
// const engine = require( "core/engine" )
// const sound = require( "core/sound" )

// stage.init()
// engine.init()

// document.getElementById( "main" ).appendChild( engine.dom )

// const xp = new ( require( "xp/Xp" ) )()
// engine.scene.add( xp )

// sound.load( "mp3/glencheck_vivid.mp3" )
// sound.on( "start", () => {
//   loop.add( () => {
//     xp.update( sound.getData() )
//   })
// })

// loop.start()

// creation of the audio context
'use strict';

if (!window.AudioContext) {
	if (!window.webkitAudioContext) {
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

// load the sound
setupAudioNodes();
loadSound("sound/audio.ogg");

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
	splitter.connect(analyser, 0, 0);
	splitter.connect(analyser2, 1, 0);

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
	request.onload = function () {

		// decode the data
		context.decodeAudioData(request.response, function (buffer) {
			// when the audio is decoded play the sound
			playSound(buffer);
		}, onError);
	};
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
javascriptNode.onaudioprocess = function () {

	// get the average for the first channel
	var array = new Uint8Array(analyser.frequencyBinCount);
	analyser.getByteFrequencyData(array);
	var average = getAverageVolume(array);

	// get the average for the second channel
	var array2 = new Uint8Array(analyser2.frequencyBinCount);
	analyser2.getByteFrequencyData(array2);
	var average2 = getAverageVolume(array2);

	console.log(average);
};

function getAverageVolume(array) {
	var values = 0;
	var average;

	var length = array.length;

	// get all the frequency amplitudes
	for (var i = 0; i < length; i++) {
		values += array[i];
	}

	average = values / length;
	return average;
}

// THREE JS

var composer;

var renderer = new THREE.WebGLRenderer({
	antialias: true
});

console.log(renderer);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* Taille totale de l'écran */
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
var onRenderFcts = [];
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.01, 1000);

/* Position de la caméra */
camera.position.z = 15;
camera.position.y = 2;

/* Filtre grisé sur l'arrière */
scene.fog = new THREE.Fog(0x000, 0, 45);
;(function () {
	// // add a ambient light
	// var light	= new THREE.AmbientLight( 0x202020 )
	// scene.add( light )
	// // add a light in front
	// var light	= new THREE.DirectionalLight('white', 5)
	// light.position.set(0.5, 0.0, 2)
	// scene.add( light )
	// add a light behind
	var light = new THREE.DirectionalLight('white', 0.75 * 0.5);
	light.position.set(-0.5, -0.5, -2);
	scene.add(light);
})();

// postprocessing dots

// composer = new THREE.EffectComposer( renderer );
// composer.addPass( new THREE.RenderPass( scene, camera ) );

// var effect = new THREE.ShaderPass( THREE.DotScreenShader );
// effect.uniforms[ 'scale' ].value = 4;
// composer.addPass( effect );

// var effect = new THREE.ShaderPass( THREE.RGBShiftShader );
// effect.uniforms[ 'amount' ].value = 0.0015;
// effect.renderToScreen = true;
// composer.addPass( effect );

//

// postprocessing glitch

composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));

glitchPass = new THREE.GlitchPass();
glitchPass.renderToScreen = true;
composer.addPass(glitchPass);

//

var heightMap = THREEx.Terrain.allocateHeightMap(256, 256);
THREEx.Terrain.simplexHeightMap(heightMap);

var geometry = THREEx.Terrain.heightMapToPlaneGeometry(heightMap);
THREEx.Terrain.heightMapToVertexColor(heightMap, geometry);

/* Couleur blanche par défaut */
var material = new THREE.MeshBasicMaterial({
	wireframe: true
});
var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
mesh.lookAt(new THREE.Vector3(0, 1, 0));

/* Création du terrain */
//mesh.scale.y	= 3.5;
mesh.scale.y = 3.5;
mesh.scale.x = 3;
mesh.scale.z = 0.20;
mesh.scale.multiplyScalar(10);

/* La caméra avance vers l'avant */
onRenderFcts.push(function (delta, now) {
	//mesh.rotation.z += 0.2 * delta;	
	mesh.position.z += 0.2 * delta;
});

onRenderFcts.push(function () {
	renderer.render(scene, camera);
});

var lastTimeMsec = null;
requestAnimationFrame(function animate(nowMsec) {
	requestAnimationFrame(animate);
	lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
	var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
	lastTimeMsec = nowMsec;
	onRenderFcts.forEach(function (onRenderFct) {
		onRenderFct(deltaMsec / 1000, nowMsec / 1000);
	});
	composer.render();
});

},{}]},{},[1]);
