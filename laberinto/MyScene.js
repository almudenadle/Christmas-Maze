
// Clases de la biblioteca

import * as THREE from 'three'
import { GUI } from 'gui'
import { TrackballControls } from 'trackball'

// Clases de mi proyecto

import { Laberinto } from './Laberinto.js'
import { coponieve } from '../pickups/coponieve/coponieve.js'
import { Player } from '../player/player.js'
import { Puerta } from '../pickups/puerta/Puerta.js'
 
/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {
  // Recibe el  div  que se ha creado en el  html  que va a ser el lienzo en el que mostrar
  // la visualización de la escena
  constructor (myCanvas) { 
    super();
    this.fog = new THREE.FogExp2(0x0a1628, 0.02);
    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);
    
    // Se crea la interfaz gráfica de usuario
    this.gui = this.createGUI ();
    
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    window.addEventListener('click', (event) => { this.onMouseClick(event); });
    
    // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
    // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
    this.createLights ();
    
    // Tendremos una cámara con un control de movimiento con el ratón
    this.camaraActiva = null;
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'c' || e.key === 'C') && this.camaraActiva) {
        this.toggleCamera();
      }
    });

    window.addEventListener('keydown', (e) => {
      if( e.key === 'e' || e.key === 'E') {
        this.recogerPickup();
      }
    });

    window.addEventListener('keydown', (e) => {
      if( e.key === 'q' || e.key === 'Q') {
        this.abrirPuerta();
      }
    });

    this.teclasPulsadas = {};
    window.addEventListener('keydown', e => this.teclasPulsadas[e.key] = true);
    window.addEventListener('keyup', e => this.teclasPulsadas[e.key] = false);

    // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
    // Todas las unidades están en metros
    this.axis = new THREE.AxesHelper (0.1);
    this.add (this.axis);
    
    // Por último creamos el modelo.
    // Le pasamos una variable de sincronizacion
    var laberintoCargado = $.Deferred();
    this.laberinto = new Laberinto ("./laberinto.txt", laberintoCargado);
    this.add (this.laberinto);
    this.pickups = [];
    this.obstaculos = [];

    laberintoCargado.done (() => {
      const posIncio = this.laberinto.getPosInicial();
      const posFinal = this.laberinto.getPosFinal();
      const anchoTotal = this.laberinto.xNumBloques * this.laberinto.anchoBloque;
      const largoTotal = this.laberinto.zNumBloques * this.laberinto.anchoBloque;

      this.laberinto.traverse((hijo) => {
        if (hijo.isMesh ) {
          this.obstaculos.push(hijo);
        }
      });
      this.pickups = this.laberinto.posicionesPickUp;
      this.tengoLlave = false;

      this.createCamera ();
      this.jugador = new Player();
      this.jugador.position.copy(posIncio);
      this.add(this.jugador);

      this.puerta = new Puerta();
      this.puerta.position.copy(posFinal);
      this.add(this.puerta);
      this.puertaAbierta = false;

      /************
       * Creación del suelo y el ambiente general de la escena  
       ************/
      this.createNieve(500, anchoTotal, largoTotal);
      const geometriaSuelo = new THREE.BoxGeometry (anchoTotal, 0.02, largoTotal);
      const materialSuelo = new THREE.MeshStandardMaterial ({
        color : 0xFFFAFA,
      });
      const suelo = new THREE.Mesh (geometriaSuelo, materialSuelo);
      
      /************
       * Modificación de posición 
       ************/
      suelo.position.x = this.laberinto.position.x + anchoTotal/2 - this.laberinto.anchoBloque/2;
      suelo.position.z = this.laberinto.position.z + largoTotal/2 - this.laberinto.anchoBloque/2;
      suelo.position.y = -0.01;
      this.add (suelo);
    });
  }

  /********************************
  * SECCION PICKUPS  
  **********************************/
  recogerPickup(){
    if(!this.jugador || !this.pickups) return;
    const distanciaRecogida = 3.0;

    for(let i=this.pickups.length - 1; i>=0; i--){
      const pickup = this.pickups[i];
      if(!pickup || !pickup.position){ 
        console.warn('Pickup sin posición:', pickup.position);
        continue;
      }
      const posPickup = new THREE.Vector3();
      pickup.getWorldPosition(posPickup);

      const distanciaJugadorPickUp = this.jugador.position.distanceTo(posPickup);
      //console.log(`Distancia al pickup:`, distanciaJugadorPickUp);

      if(distanciaJugadorPickUp < distanciaRecogida){
        if(pickup instanceof coponieve){
          this.tengoLlave = true;
          console.log('¡Has recogido la llave! Ahora puedes abrir la puerta.');
        }
        this.laberinto.remove(pickup);
        this.pickups.splice(i,1);
        //console.log('Pickup recogido! Quedan:', this.pickups.length);
      }
    }
  }

  abrirPuerta(){
    if(!this.jugador || !this.laberinto || !this.tengoLlave){
      return;
    }
    const distanciaApertura = 10.5;

    const posSalida = this.laberinto.getPosFinal();
    const distanciaJugadorSalida = this.jugador.position.distanceTo(posSalida); 

    if(distanciaJugadorSalida < distanciaApertura){
      this.puerta.abrirPuerta();
      this.puertaAbierta = true;
    } 
  }

  onMouseClick(event) {
    if(!this.jugador || !this.camaraJugador || !this.laberinto) return;

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camaraJugador);
    const intersects = this.raycaster.intersectObjects([this.puerta], true)    

    if (intersects.length > 0) {
      this.abrirPuerta();
    }
  }


  /********************************
   * SECCION SUELO
  *********************************/
  createNieve(n = 500, anchoX = 2, anchoZ = 2, centroX = 0, centroZ = 0) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(n * 3);
      const vel = new Float32Array(n);

      for (let i = 0; i < n; i++) {
          pos[i*3]   = centroX + (Math.random() - 0.5) * anchoX;
          pos[i*3+1] = Math.random() * 5;  // altura máxima de caída
          pos[i*3+2] = centroZ + (Math.random() - 0.5) * anchoZ;
          vel[i]     = 0.01 + Math.random() * 0.02;  // velocidad más visible
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('vel',      new THREE.BufferAttribute(vel, 1));

      this.nieve = new THREE.Points(geo,
          new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.8 })
      );
      this.add(this.nieve);
  }

  createGround () {
    // El suelo es un Mesh, necesita una geometría y un material.
    
    // La geometría es una caja con muy poca altura
    var geometryGround = new THREE.BoxGeometry (9,0.02,9);
    
    // El material se hará con una textura de madera
    var texture = new THREE.TextureLoader().load('../imgs/wood.jpg');
    var materialGround = new THREE.MeshStandardMaterial ({map: texture});
    
    // Ya se puede construir el Mesh
    var ground = new THREE.Mesh (geometryGround, materialGround);
    
    // Todas las figuras se crean centradas en el origen.
    // El suelo lo bajamos la mitad de su altura para que el origen del mundo se quede en su lado superior
    ground.position.y = -0.01;
    
    // Que no se nos olvide añadirlo a la escena, que en este caso es  this
    //this.add (ground);
  }
  
  /********************************
   * SECCION GUI
  *********************************/
  createGUI () {
    // Se crea la interfaz gráfica de usuario
    var gui = new GUI();
    
    // La escena le va a añadir sus propios controles. 
    // Se definen mediante un objeto de control
    // En este caso la intensidad de la luz y si se muestran o no los ejes
    this.guiControls = {
      // En el contexto de una función   this   alude a la función
      lightPower : 500.0,  // La potencia de esta fuente de luz se mide en lúmenes
      ambientIntensity : 0.5,   
      axisOnOff : true
    }

    // Se crea una sección para los controles de esta clase
    var folder = gui.addFolder ('Luz y Ejes');
    
    // Se le añade un control para la potencia de la luz puntual
    folder.add (this.guiControls, 'lightPower', 0, 1000, 20)
      .name('Luz puntual : ')
      .onChange ( (value) => this.setLightPower(value) );
    
    // Otro para la intensidad de la luz ambiental
    folder.add (this.guiControls, 'ambientIntensity', 0, 1, 0.05)
      .name('Luz ambiental: ')
      .onChange ( (value) => this.setAmbientIntensity(value) );
      
    // Y otro para mostrar u ocultar los ejes
    folder.add (this.guiControls, 'axisOnOff')
      .name ('Mostrar ejes : ')
      .onChange ( (value) => this.setAxisVisible (value) );
    
    return gui;
  }

  /********************************
   * SECCION LIGTHS
  *********************************/
  createLights () {
    // Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
    // La luz ambiental solo tiene un color y una intensidad
    // Se declara como   var   y va a ser una variable local a este método
    //    se hace así puesto que no va a ser accedida desde otros métodos
    this.ambientLight = new THREE.AmbientLight('white', this.guiControls.ambientIntensity);
    // La añadimos a la escena
    this.add (this.ambientLight);
    
    // Se crea una luz focal que va a ser la luz principal de la escena
    // La luz focal, además tiene una posición, y un punto de mira
    // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
    // En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
    this.pointLight = new THREE.SpotLight( 0xffffff );
    this.pointLight.power = this.guiControls.lightPower;
    this.pointLight.position.set( 2, 9, 1 );
    console.log (this.pointLight);
    this.add (this.pointLight);
  }
  
  setLightPower (valor) {
    this.pointLight.power = valor;
  }

  setAmbientIntensity (valor) {
    this.ambientLight.intensity = valor;
  }  
  
  setAxisVisible (valor) {
    this.axis.visible = valor;
  }
  
  /********************************
   * SECCION RENDERER
  *********************************/
  createRenderer (myCanvas) {
    // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.
    
    // Se instancia un Renderer   WebGL
    var renderer = new THREE.WebGLRenderer();
    
    // Se establece un color de fondo en las imágenes que genera el render
    renderer.setClearColor(new THREE.Color(0x0a1628), 1.0);
    
    // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);
    
    return renderer;  
  }
  
  /********************************
   * SECCION CAMARA
  *********************************/
   createCamera () {
    const aspecto = window.innerWidth / window.innerHeight;

    //Camara Jugador
    this.camaraJugador = new THREE.PerspectiveCamera(75,aspecto,0.01,1000);
    this.add(this.camaraJugador);

    //Camara Cenital
    this.camaraArriba = new THREE.OrthographicCamera(
      -10*aspecto, 10*aspecto, 10,-10,0.1,200
    );
    this.camaraArriba.position.set(0,30,0);
    this.camaraArriba.lookAt(new THREE.Vector3(0,0,0));
    this.add(this.camaraArriba);

    
    // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
    this.cameraControl = new TrackballControls (this.camaraArriba, this.renderer.domElement);
    
    // Se configuran las velocidades de los movimientos
    this.cameraControl.rotateSpeed = 5;
    this.cameraControl.zoomSpeed = -2;
    this.cameraControl.panSpeed = 0.5;
    // Debe orbitar con respecto al punto de mira de la cámara
    //this.cameraControl.target = look;
    this.camaraActiva = 'jugador';
  }

  posicionarCamaraEntrada(){
    const entrada = new THREE.Vector3();
    this.laberinto.getMundoFromCelda(
      this.laberinto.getFilaEntrada(),
      this.laberinto.getColumnaEntrada(),
      entrada
    );

    this.cameraEntrada.position.set(entrada.x,2,entrada.z+6);
    this.cameraEntrada.lookAt(new THREE.Vector3(entrada.x,1,entrada.z));
  }

  toggleCamera(){ 
    const orden = ['jugador','cenital'];
    const idx = orden.indexOf(this.camaraActiva);
    this.camaraActiva = orden[(idx + 1) % orden.length];
    this.cameraControl.object = this.camaraArriba;
    console.log('Cámara activa:', this.camaraActiva);
  }

  getCamera () {
    switch(this.camaraActiva){
      case 'jugador': {
        if (this.pickups) {
            this.pickups.forEach(p => {
                p.rotation.x = 0 ; 
            });
        }
        return this.camaraJugador;
      }
      case 'cenital': {
        if (this.pickups) {
            this.pickups.forEach(p => {
                p.rotation.x = - Math.PI / 2 ; 
            });
        }
        return this.camaraArriba;
      }
      default:        return this.camaraJugador;
    }
  }
  
  setCameraAspect (ratio) {
    // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
    // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
    this.camera.aspect = ratio;
    // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
    this.camera.updateProjectionMatrix();
  }

  actualizarCamara(){
    if(!this.jugador || !this.camaraJugador) return;

    const alturaOjos = 1;
    this.camaraJugador.position.set(
      this.jugador.position.x,
      this.jugador.position.y + alturaOjos,
      this.jugador.position.z
    );

    this.camaraJugador.rotation.y = this.jugador.angulo;
  }
    
  onWindowResize () {
    const aspect = window.innerWidth / window.innerHeight;
    if (this.camaraJugador) {
        this.camaraJugador.aspect = aspect;
        this.camaraJugador.updateProjectionMatrix();
    }
    if (this.camaraArriba) {
        this.camaraArriba.aspect = aspect;
        this.camaraArriba.updateProjectionMatrix();
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /********************************
   * SECCION UPDATE
  *********************************/
  update () {
    if (!this.camaraActiva) {      
        requestAnimationFrame(() => this.update());
        return;
    }
    if(this.camaraActiva === 'cenital') this.cameraControl.update();
    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render (this, this.getCamera());
    
    this.jugador.update(this.teclasPulsadas,this.laberinto,this.obstaculos);
    this.actualizarCamara();

    if(this.puertaAbierta) this.puerta.update();
    // Se actualiza el resto del modelo
    this.laberinto.update();
    const t = Date.now() * 0.001;

    // Nieve cayendo
    if (this.nieve) {
        const pos = this.nieve.geometry.attributes.position.array;
        const vel = this.nieve.geometry.attributes.vel.array;
        for (let i = 0; i < vel.length; i++) {
            pos[i*3+1] -= vel[i];
            if (pos[i*3+1] < 0) pos[i*3+1] = 5; 
        }
        this.nieve.geometry.attributes.position.needsUpdate = true;
    }
    // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.

    requestAnimationFrame(() => this.update())
  }
}


/// La función   main
$(function () {
  
  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");

  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener ("resize", () => scene.onWindowResize());
  
  // Que no se nos olvide, la primera visualización.
  scene.update();
});
