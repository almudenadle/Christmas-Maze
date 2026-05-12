// MyScene.js
// Clases de la biblioteca
import * as THREE from 'three'
import { GUI } from 'gui'
import { TrackballControls } from 'trackball'

// Clases de mi proyecto
import { Laberinto } from './Laberinto.js'
import { coponieve } from '../pickups/coponieve/coponieve.js'
import { Regalo } from '../pickups/regalo/regalo.js'
import { Chimenea } from '../pickups/chimenea/chimenea.js'
import { Campana } from '../pickups/campana/campana.js'
import { Player } from '../player/player.js'
import { Puerta } from '../pickups/puerta/Puerta.js'


class MyScene extends THREE.Scene {
  constructor (myCanvas) { 
    super();
    this.fog = new THREE.FogExp2(0x0a1628, 0.02);
    // Lo primero, crear el visualizador
    this.renderer = this.createRenderer(myCanvas);
    
    // Se crea la interfaz gráfica de usuario
    this.gui = this.createGUI();
    
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    window.addEventListener('click', (event) => { this.onMouseClick(event); });
    
    this.createLights();
    
    // Cámaras
    this.camaraActiva = null;
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'c' || e.key === 'C') && this.camaraActiva) {
        this.toggleCamera();
      }
    });

    // Tecla E: recoger pickup
    window.addEventListener('keydown', (e) => {
      if( e.key === 'e' || e.key === 'E') {
        this.recogerPickup();
      }
    });

    // Tecla Q: abrir puerta
    window.addEventListener('keydown', (e) => {
      if( e.key === 'q' || e.key === 'Q') {
        this.abrirPuerta();
      }
    });

    this.teclasPulsadas = {};
    window.addEventListener('keydown', e => this.teclasPulsadas[e.key] = true);
    window.addEventListener('keyup', e => this.teclasPulsadas[e.key] = false);

    // Ejes
    this.axis = new THREE.AxesHelper(0.1);
    this.add(this.axis);
    
    // --- Panel de estado de pickups ---
    this.createPickupUI();
    
    // Cargar laberinto
    var laberintoCargado = $.Deferred();
    this.laberinto = new Laberinto("./laberinto.txt", laberintoCargado);
    this.add(this.laberinto);
    this.pickups = [];
    this.obstaculos = [];

    laberintoCargado.done(() => {
      const posIncio = this.laberinto.getPosInicial();
      const posFinal = this.laberinto.getPosFinal();
      const anchoTotal = this.laberinto.xNumBloques * this.laberinto.anchoBloque;
      const largoTotal = this.laberinto.zNumBloques * this.laberinto.anchoBloque;

      // Recoger todos los muros como obstáculos
      this.laberinto.traverse((hijo) => {
        if (hijo.isMesh) {
          this.obstaculos.push(hijo);
        }
      });
      this.pickups = this.laberinto.posicionesPickUp;
      this.tengoLlave = false;

      // --- Inicializar estado de pickups ---
      this.pickupStatus = [];
      this.pickups.forEach(pickup => {
        let nombre = '';
        if (pickup instanceof coponieve) nombre = '🔑 Llave';
        else if (pickup instanceof Regalo) nombre = '🎁 Regalo';
        else if (pickup instanceof Chimenea) nombre = '🔥 Chimenea';
        else if (pickup instanceof Campana) nombre = '🔔 Campana';
        if (nombre) {
          this.pickupStatus.push({ nombre, collected: false, objeto: pickup });
        }
      });
      this.updatePickupUI();  // mostrar panel inicial

      // Cámaras y jugador
      this.createCamera();
      this.jugador = new Player();
      this.jugador.position.copy(posIncio);
      this.add(this.jugador);

      // Puerta de salida
      this.puerta = new Puerta();
      this.puerta.position.copy(posFinal);
      this.add(this.puerta);
      this.puertaAbierta = false;

      // Suelo y ambiente
      this.createNieve(500, anchoTotal, largoTotal);
      const geometriaSuelo = new THREE.BoxGeometry(anchoTotal, 0.02, largoTotal);
      const materialSuelo = new THREE.MeshStandardMaterial({ color: 0xFFFAFA });
      const suelo = new THREE.Mesh(geometriaSuelo, materialSuelo);
      suelo.position.x = this.laberinto.position.x + anchoTotal/2 - this.laberinto.anchoBloque/2;
      suelo.position.z = this.laberinto.position.z + largoTotal/2 - this.laberinto.anchoBloque/2;
      suelo.position.y = -0.01;
      this.add(suelo);
    });
  }

//panel
  createPickupUI() {
    this.uiDiv = document.createElement('div');
    this.uiDiv.style.position = 'absolute';
    this.uiDiv.style.top = '20px';
    this.uiDiv.style.left = '20px';        // Cambiado a izquierda
    this.uiDiv.style.backgroundColor = 'rgba(82, 90, 124, 0.7)';
    this.uiDiv.style.color = 'white';
    this.uiDiv.style.fontFamily = 'Arial, sans-serif';
    this.uiDiv.style.fontSize = '18px';
    this.uiDiv.style.padding = '10px 20px';
    this.uiDiv.style.borderRadius = '8px';
    this.uiDiv.style.border = '1px solid #aaa';
    this.uiDiv.style.backdropFilter = 'blur(4px)';
    this.uiDiv.style.zIndex = '100';
    this.uiDiv.style.pointerEvents = 'none'; // para no bloquear clics
    this.uiDiv.style.minWidth = '180px';
    document.body.appendChild(this.uiDiv);
  }

  updatePickupUI() {
    if (!this.uiDiv || !this.pickupStatus) return;
    let html = '<strong>🎄 Objetos:</strong><ul style="margin:5px 0 0 20px; padding:0;">';
    this.pickupStatus.forEach(item => {
      const estado = item.collected ? '✅' : '❌';
      html += `<li style="list-style:none;">${estado} ${item.nombre}</li>`;
    });
    const totalColeccionados = this.pickupStatus.filter(i => i.collected).length;
    const total = this.pickupStatus.length;
    html += `</ul><div style="margin-top:8px; font-size:14px;">Progreso: ${totalColeccionados}/${total}</div>`;
    if (totalColeccionados === total && total > 0) {
      html += '<div style="color:#ffd966;"> ¡Completado! </div>';
    }
    this.uiDiv.innerHTML = html;
  }


  recogerPickup() {
    if (!this.jugador || !this.pickups) return;
    const distanciaRecogida = 3.0;

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pickup = this.pickups[i];
      if (!pickup || !pickup.position) continue;

      const posPickup = new THREE.Vector3();
      pickup.getWorldPosition(posPickup);
      const distancia = this.jugador.position.distanceTo(posPickup);

      if (distancia < distanciaRecogida) {
        let tipoEncontrado = null;
        // Identificar tipo y actualizar estado
        if (pickup instanceof coponieve) {
          this.tengoLlave = true;
          tipoEncontrado = '🔑 Llave';
          console.log(' ¡Has recogido la llave!');
        } else if (pickup instanceof Regalo) {
          tipoEncontrado = '🎁 Regalo';
          console.log(' ¡Has recogido un regalo!');
        } else if (pickup instanceof Chimenea) {
          tipoEncontrado = '🔥 Chimenea';
          console.log('¡Has encontrado la chimenea!');
        } else if (pickup instanceof Campana) {
          tipoEncontrado = '🔔 Campana';
          console.log('¡Has recogido la campana!');
        }

        if (tipoEncontrado && this.pickupStatus) {
          const estado = this.pickupStatus.find(item => item.objeto === pickup);
          if (estado && !estado.collected) {
            estado.collected = true;
            this.updatePickupUI();
          }
        }

        // Eliminar físicamente el objeto
        this.laberinto.remove(pickup);
        this.pickups.splice(i, 1);
      }
    }
  }

  /********************************
   * ABRIR PUERTA (con llave)
   ********************************/
  abrirPuerta() {
    if (!this.jugador || !this.laberinto || !this.tengoLlave) return;
    const distanciaApertura = 10.5;
    const posSalida = this.laberinto.getPosFinal();
    const distanciaJugadorSalida = this.jugador.position.distanceTo(posSalida);
    if (distanciaJugadorSalida < distanciaApertura) {
      this.puerta.abrirPuerta();
      this.puertaAbierta = true;
      console.log('🚪 Puerta abierta!');
    }
  }

  /********************************
   * CLICK SOBRE PUERTA
   ********************************/
  onMouseClick(event) {
    if (!this.jugador || !this.camaraJugador || !this.laberinto) return;
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camaraJugador);
    const intersects = this.raycaster.intersectObjects([this.puerta], true);
    if (intersects.length > 0) {
      this.abrirPuerta();
    }
  }

  /********************************
   * NIEVE CAYENDO
   ********************************/
  createNieve(n = 500, anchoX = 2, anchoZ = 2, centroX = 0, centroZ = 0) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    const vel = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i*3]   = centroX + (Math.random() - 0.5) * anchoX;
      pos[i*3+1] = Math.random() * 5;
      pos[i*3+2] = centroZ + (Math.random() - 0.5) * anchoZ;
      vel[i] = 0.01 + Math.random() * 0.02;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('vel', new THREE.BufferAttribute(vel, 1));
    this.nieve = new THREE.Points(geo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.8 })
    );
    this.add(this.nieve);
  }


  createGround() {
    // (se deja por compatibilidad)
  }

  
  createGUI() {
    var gui = new GUI();
    this.guiControls = {
      lightPower : 500.0,
      ambientIntensity : 0.5,
      axisOnOff : true
    }
    var folder = gui.addFolder('Luz y Ejes');
    folder.add(this.guiControls, 'lightPower', 0, 1000, 20)
      .name('Luz puntual : ')
      .onChange( (value) => this.setLightPower(value) );
    folder.add(this.guiControls, 'ambientIntensity', 0, 1, 0.05)
      .name('Luz ambiental: ')
      .onChange( (value) => this.setAmbientIntensity(value) );
    folder.add(this.guiControls, 'axisOnOff')
      .name('Mostrar ejes : ')
      .onChange( (value) => this.setAxisVisible(value) );
    return gui;
  }

  //luces
  createLights() {
    this.ambientLight = new THREE.AmbientLight('white', this.guiControls.ambientIntensity);
    this.add(this.ambientLight);
    this.pointLight = new THREE.SpotLight(0xffffff);
    this.pointLight.power = this.guiControls.lightPower;
    this.pointLight.position.set(2, 9, 1);
    this.add(this.pointLight);
  }

  setLightPower(valor) { this.pointLight.power = valor; }
  setAmbientIntensity(valor) { this.ambientLight.intensity = valor; }
  setAxisVisible(valor) { this.axis.visible = valor; }

//Renderer
  createRenderer(myCanvas) {
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0x0a1628), 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    $(myCanvas).append(renderer.domElement);
    return renderer;
  }

//camaras
  createCamera() {
    const aspecto = window.innerWidth / window.innerHeight;
    this.camaraJugador = new THREE.PerspectiveCamera(75, aspecto, 0.01, 1000);
    this.add(this.camaraJugador);
    this.camaraArriba = new THREE.OrthographicCamera(
      -10 * aspecto, 10 * aspecto, 10, -10, 0.1, 200
    );
    this.camaraArriba.position.set(0, 30, 0);
    this.camaraArriba.lookAt(new THREE.Vector3(0, 0, 0));
    this.add(this.camaraArriba);
    this.cameraControl = new TrackballControls(this.camaraArriba, this.renderer.domElement);
    this.cameraControl.rotateSpeed = 5;
    this.cameraControl.zoomSpeed = -2;
    this.cameraControl.panSpeed = 0.5;
    this.camaraActiva = 'jugador';
  }

  toggleCamera() {
    const orden = ['jugador', 'cenital'];
    const idx = orden.indexOf(this.camaraActiva);
    this.camaraActiva = orden[(idx + 1) % orden.length];
    this.cameraControl.object = this.camaraArriba;
    console.log('Cámara activa:', this.camaraActiva);
  }

  getCamera() {
    switch(this.camaraActiva){
      case 'jugador':
        if (this.pickups) {
          this.pickups.forEach(p => { p.rotation.x = 0; });
        }
        return this.camaraJugador;
      case 'cenital':
        if (this.pickups) {
          this.pickups.forEach(p => { p.rotation.x = -Math.PI / 2; });
        }
        return this.camaraArriba;
      default:
        return this.camaraJugador;
    }
  }

  actualizarCamara() {
    if (!this.jugador || !this.camaraJugador) return;
    const alturaOjos = 1;
    this.camaraJugador.position.set(
      this.jugador.position.x,
      this.jugador.position.y + alturaOjos,
      this.jugador.position.z
    );
    this.camaraJugador.rotation.y = this.jugador.angulo;
  }

  onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    if (this.camaraJugador) {
      this.camaraJugador.aspect = aspect;
      this.camaraJugador.updateProjectionMatrix();
    }
    if (this.camaraArriba) {
      this.camaraArriba.left = -10 * aspect;
      this.camaraArriba.right = 10 * aspect;
      this.camaraArriba.updateProjectionMatrix();
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }


  update() {
    if (!this.camaraActiva) {
      requestAnimationFrame(() => this.update());
      return;
    }
    if (this.camaraActiva === 'cenital') this.cameraControl.update();
    this.renderer.render(this, this.getCamera());
    
    if (this.jugador) {
      this.jugador.update(this.teclasPulsadas, this.laberinto, this.obstaculos);
      this.actualizarCamara();
    }
    if (this.puertaAbierta && this.puerta) this.puerta.update();
    if (this.laberinto) this.laberinto.update();

    // Animación de la nieve
    if (this.nieve) {
      const pos = this.nieve.geometry.attributes.position.array;
      const vel = this.nieve.geometry.attributes.vel.array;
      for (let i = 0; i < vel.length; i++) {
        pos[i*3+1] -= vel[i];
        if (pos[i*3+1] < 0) pos[i*3+1] = 5;
      }
      this.nieve.geometry.attributes.position.needsUpdate = true;
    }
    requestAnimationFrame(() => this.update());
  }
}

/// Función principal
$(function () {
  var scene = new MyScene("#WebGL-output");
  window.addEventListener("resize", () => scene.onWindowResize());
  scene.update();
});