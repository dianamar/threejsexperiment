const loop = require( "core/loop" )
const stage = require( "core/stage" )

class Engine {

  constructor() {
    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera( 75, 0, 1, 10000 )
    this.camera.position.z = 1000

    this.renderer = new THREE.WebGLRenderer( { antialias: false, alpha: true } )
    this.renderer.setPixelRatio( window.devicePixelRatio )

    this.dom = this.renderer.domElement

    this._binds = {}
    this._binds.onUpdate = this._onUpdate.bind( this )
    this._binds.onResize = this._onResize.bind( this )
  }

  _onUpdate() {
    this.renderer.render( this.scene, this.camera )
  }

  _onResize() {
    const w = stage.width
    const h = stage.height

    this.renderer.setSize( w, h )

    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  init() {
    loop.add( this._binds.onUpdate )
    stage.on( "resize", this._binds.onResize )
    this._onResize()
  }

}

module.exports = new Engine()
