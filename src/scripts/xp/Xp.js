class Xp extends THREE.Object3D {

  constructor() {
    super()

    this._createDummyPlane()
  }

  _createDummyPlane() {
    const geom = new THREE.PlaneBufferGeometry( 1000, 1000, 10, 10 )
    const mat = new THREE.MeshBasicMaterial( { color: 0xff00ff, wireframe: true } )
    const mesh = new THREE.Mesh( geom, mat )
    this.add( mesh )
  }

  update( data ) {
    if( !data ) {
      return
    }
    // Want to customize things ?
    // http://www.airtightinteractive.com/demos/js/uberviz/audioanalysis/
    
    // console.log( data.freq, data.time )

    let n = data.freq.length // for bar // from 0 - 256, no sound = 0
    for( var i = 0; i < n; i++ ) {
      // do your stuff here
    }

    n = data.time.length // for wave // from 0 -256, no sound = 128
    for( i = 0; i < n; i++ ) {
      // do your stuff here
    }
  }
}

module.exports = Xp
