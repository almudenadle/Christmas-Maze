import * as THREE from 'three'

import * as CSG from '../libs/three-bvh-csg.js'

class Chimenea extends THREE.Object3D {

  constructor(gui, titleGui) {
    super();

    // Se crea la parte de la interfaz que corresponde a la chimenea
    this.createGUI(gui, titleGui);

    // Material
    this.textura = new THREE.TextureLoader().load('../imgs/piedra.jpg');
    this.material = new THREE.MeshStandardMaterial({ map: this.textura });

    //como usamos extrusion para la columna hacemos que se repita la textura para que no se estire
    this.texturaColumna = new THREE.TextureLoader().load('../imgs/piedra.jpg');
    this.texturaColumna.wrapS = THREE.RepeatWrapping;
    this.texturaColumna.wrapT = THREE.RepeatWrapping;
    this.texturaColumna.repeat.set(10, 10);

    this.materialColumna = new THREE.MeshStandardMaterial({ map: this.texturaColumna });

    var tamano = 0.1;   // Las unidades son metros

    // Construimos cuerpo 
    var cuerpoInt = this.createCuerpo(tamano * 0.8, tamano * 0.4, tamano * 1.2);
    var cuerpoExt = this.createCuerpo(tamano, tamano, tamano);

    cuerpoExt.position.set(0, tamano / 3, 0);
    cuerpoInt.position.set(0, tamano / 6, 0.3 * tamano);
    cuerpoExt.updateMatrixWorld();
    cuerpoInt.updateMatrixWorld();


    //Construimos columna con extrusion de una forma plana

    var columna = this.createFormaPlana(tamano * 0.5, tamano * 0.5);
    var options = { depth: tamano * 0.9, steps: 1, bevelEnabled: false };
    var columnaExtrusion = new THREE.ExtrudeGeometry(columna, options);
    var columnaBrush = new CSG.Brush(columnaExtrusion, this.materialColumna);

    var huecoColumna = this.createFormaPlana(tamano * 0.3, tamano * 0.3);
    var optionsHueco = { depth: tamano * 1.7, steps: 1, bevelEnabled: false };
    var huecoColumnaExtrusion = new THREE.ExtrudeGeometry(huecoColumna, optionsHueco);
    var huecoColumnaBrush = new CSG.Brush(huecoColumnaExtrusion, this.materialColumna);

    columnaBrush.position.set(0, tamano * 1.6, 0);
    huecoColumnaBrush.position.set(0, (tamano * 2), 0);
    columnaBrush.rotation.x = Math.PI / 2;
    huecoColumnaBrush.rotation.x = Math.PI / 2;
    columnaBrush.updateMatrixWorld();
    huecoColumnaBrush.updateMatrixWorld();

    //Realizamos los huecos
    var evaluador = new CSG.Evaluator();
    var cuerpoChime = evaluador.evaluate(cuerpoExt, cuerpoInt, CSG.SUBTRACTION);
    var chime = evaluador.evaluate(cuerpoChime, columnaBrush, CSG.ADDITION);
    var chimenea = evaluador.evaluate(chime, huecoColumnaBrush, CSG.SUBTRACTION);

    this.add(chimenea);

    // Fuego
    this.createFuego(tamano);
  }


  createFormaPlana(ancho, largo) {
    var forma = new THREE.Shape();
    forma.moveTo(-ancho / 2, -largo / 2);
    forma.lineTo(ancho / 2, -largo / 2);
    forma.lineTo(ancho / 2, largo / 2);
    forma.lineTo(-ancho / 2, largo / 2);
    forma.lineTo(-ancho / 2, -largo / 2);
    return forma;
  }

  createCuerpo(widht, height, depth) {
    var cuerpo = new THREE.BoxGeometry(widht, height, depth);
    var brushCuerpo = new CSG.Brush(cuerpo, this.material);
    return brushCuerpo;
  }

  createGUI(gui, titleGui) {
    this.guiControls = {
      rotacion: 0
    }
    var folder = gui.addFolder(titleGui);
    folder.add(this.guiControls, 'rotacion', -0.125, 0.2, 0.001)
      .name('Apertura : ')
      .onChange((value) => this.setAngulo(-value));
  }


  createFuego(tamano) {
    this.fuego = new THREE.Object3D();
    this.llamas = []; // Array para guardar las llamas 

    // Creacion de troncos 
    var geoTronco = new THREE.CylinderGeometry(tamano * 0.04, tamano * 0.04, tamano * 0.3, 5);
    var matTronco = new THREE.MeshStandardMaterial({ color: 0x4A2F1D });

    var tronco1 = new THREE.Mesh(geoTronco, matTronco);
    tronco1.rotation.z = Math.PI / 2;
    tronco1.rotation.y = Math.PI / 4;

    var tronco2 = new THREE.Mesh(geoTronco, matTronco);
    tronco2.rotation.z = Math.PI / 2;
    tronco2.rotation.y = -Math.PI / 4;

    this.fuego.add(tronco1);
    this.fuego.add(tronco2);

    // Creamos las 3 llamas (roja, naranja, amarilla)
    const colores = [0xff0000, 0xff6600, 0xffcc00];
    const alturas = [0.4, 0.3, 0.2];
    const radios = [0.15, 0.1, 0.06];

    for (let i = 0; i < 3; i++) {
      let geoLlama = new THREE.ConeGeometry(tamano * radios[i], tamano * alturas[i], 4);

      // Movemos la geometría para que su centro esté en la base
      geoLlama.translate(0, (tamano * alturas[i]) / 2, 0);

      let matLlama = new THREE.MeshStandardMaterial({
        color: colores[i],
        // emissive: colores[i],       
        opacity: 0.7,
        depthWrite: false,          // Permite ver los conos interiores
        blending: THREE.AdditiveBlending //  Suma los colores para crear un núcleo brillante
      });

      let llama = new THREE.Mesh(geoLlama, matLlama);
      llama.rotation.y = Math.random() * Math.PI;

      this.fuego.add(llama);

      this.llamas.push({
        mesh: llama,
        velocidad: Math.random() * 0.005,
        desfase: Math.random()
      });
    }

    // Colocamos el fuego dentro del hueco de la chimenea
    this.fuego.position.set(0, tamano * 0.01, 0.1 * tamano);
    this.add(this.fuego);
  }

  update() {
    if (this.llamas) {
      const tiempo = Date.now() * 0.005;

      this.llamas.forEach((llamaData) => {
        llamaData.mesh.rotation.y += llamaData.velocidad;

        let escalaY = 1 + Math.sin(tiempo + llamaData.desfase) * 0.2;
        llamaData.mesh.scale.y = escalaY;

        let escalaXZ = 1 + Math.cos(tiempo + llamaData.desfase) * 0.1;
        llamaData.mesh.scale.x = escalaXZ;
        llamaData.mesh.scale.z = escalaXZ;
      });
    }
  }
}

export { Chimenea }