import * as THREE from 'three'

//imports para el knob
import { MTLLoader } from '../libs/MTLLoader.js';
import { OBJLoader } from '../libs/OBJLoader.js';

import * as CSG from '../libs/three-bvh-csg.js'

class Puerta extends THREE.Object3D {
  constructor() {
    super();
    this.abierta = false;
    this.rotacionObjetivo = 0;
    //this.createRosco();
    this.createPuerta();
    this.cargarKnob();
    setInterval(() => {
      this.alternarPuerta();
    }, 2000);
  }


  createPuerta() {
    const lado = 0.3; // Grosor de la puerta
    const altoRecto = 0.8; // Altura de los tramos verticales
    const radioArco = 0.7; // Radio del arco superior
    const puntos = []; //Recorrido del marco de la puerta
    const puntosPuerta = []; //Recorrido de la puerta interior 

    //Hacemos el marco de la puerta con un barrido a lo largo de una curva que es un recto + un arco + otro recto
    // Tramo que sube recto 1
    for (let i = 0; i <= altoRecto; i += 0.05) {
      puntos.push(new THREE.Vector3(radioArco, i, 0));
    }

    // El arco
    for (let angulo = 0; angulo <= Math.PI; angulo += 0.1) {
      const x = Math.cos(angulo) * radioArco;
      const y = altoRecto + Math.sin(angulo) * radioArco;
      puntos.push(new THREE.Vector3(x, y, 0));
    }

    // Tramo que baja recto 2
    for (let i = altoRecto; i >= -0.05; i -= 0.05) {
      puntos.push(new THREE.Vector3(-radioArco, i, 0));
    }

    const caminoHacer = new THREE.CatmullRomCurve3(puntos);
    const rectangulo = this.createCuadrado(lado);

    const options = {
      steps: 100,
      extrudePath: caminoHacer,
      bevelEnabled: false // para que las juntas del marco sean limpias
    };

    const geometriaMarcoPuerta = new THREE.ExtrudeGeometry(rectangulo, options);

    const loader = new THREE.TextureLoader();

    //hacemos la puerta roja en vez de usar imagen 
    const materialPuerta = new THREE.MeshStandardMaterial({color: 0x870821});
    this.marcoPuerta = new THREE.Mesh(geometriaMarcoPuerta, materialPuerta);


    //La puerta interior

    const radioArcoInterior = radioArco - (lado / 2); // Hacemos el arco un poco más pequeño que el marco para que quede dentro
    const siluetaPuerta = new THREE.Shape();
    siluetaPuerta.moveTo(-radioArcoInterior, 0);
    siluetaPuerta.lineTo(radioArcoInterior, 0);
    siluetaPuerta.lineTo(radioArcoInterior, altoRecto);
    // Añadimos el arco a la forma para que sea una sola cara sólida, lo hacemos con absarc
    //los parametros serian x,y,radio,anguloInicial,anguloFinal,siEsEnSentidoHorario
    siluetaPuerta.absarc(0, altoRecto, radioArcoInterior, 0, Math.PI, false);
    siluetaPuerta.lineTo(-radioArcoInterior, 0);

    //El camino para la puerta interior es solo una línea recta que le da el "grosor"
    //Hubiese sido bueno hacer esta puerta con un extrude sencillamente, pero queriamos practicar el extrudePath, 
    // así que hacemos un camino recto hacia adelante y barrimos la silueta de la puerta a lo largo de ese camino.
    puntosPuerta.push(new THREE.Vector3(0, 0, 0));
    puntosPuerta.push(new THREE.Vector3(0, 0, lado));



    const caminoHacerPuerta = new THREE.CatmullRomCurve3(puntosPuerta);

    const optionsPuerta = {
      steps: 1, // Al ser línea recta, no necesita muchos pasos          
      extrudePath: caminoHacerPuerta,
      bevelEnabled: false
    };

    const geometriaPuerta = new THREE.ExtrudeGeometry(siluetaPuerta, optionsPuerta);

    geometriaPuerta.rotateZ(Math.PI / 2);
    geometriaPuerta.translate(0, 0, -lado / 2);

    //Bisagra
    geometriaPuerta.translate(-radioArcoInterior, 0, 0);

    const texturaPuertaInterior = loader.load('../imgs/patron.jpg');
    //hacemos que se repita
    texturaPuertaInterior.wrapS = THREE.RepeatWrapping;
    texturaPuertaInterior.wrapT = THREE.RepeatWrapping;
    texturaPuertaInterior.repeat.set(1, 1);
    const materialPuertaInterior = new THREE.MeshStandardMaterial({ map: texturaPuertaInterior });


    this.puertaInterior = new THREE.Mesh(geometriaPuerta, materialPuertaInterior);

    //como movimos la geometria,movemos el mesh
    this.puertaInterior.position.x = radioArcoInterior;

    this.createRosco();
    this.add(this.marcoPuerta);

    this.cargarKnob();
    this.add(this.puertaInterior);

  }


  createCuadrado(lado) {
    const rectangulo = new THREE.Shape();
    rectangulo.moveTo(-lado / 2, -lado / 2);
    rectangulo.lineTo(lado / 2, -lado / 2);
    rectangulo.lineTo(lado / 2, lado / 2);
    rectangulo.lineTo(-lado / 2, lado / 2);
    return rectangulo;
  }

  cargarKnob() {
    var materialLoader = new MTLLoader();
    var objectLoader = new OBJLoader();
    materialLoader.load('../models/knob/Blank.mtl', (materials) => {
      objectLoader.setMaterials(materials);
      objectLoader.load('../models/knob/Knob.obj', (object) => {
        object.scale.set(0.01, 0.01, 0.01);
        //rotamos el knob para que quede orientado como una manilla de puerta
        //si pusiesemos pi/2 quedaria del reves,asi que no ponemos eso
        object.rotation.x = Math.PI / 2;
        object.rotation.z = Math.PI;
        //lo situamos acorde a la puerta, para eso lo movemos a la mitad de la altura de la puerta y un poco hacia afuera
        object.position.set(-0.9, 0.6, 0.175);

        this.puertaInterior.add(object);
      });
    });
  }

  abrirPuerta() {
    // Alternamos entre abierta (-90 grados) y cerrada (0 grados)
    if (this.rotacionObjetivo === 0) {
      this.rotacionObjetivo = -Math.PI / 2; // Hacia adentro
    } else {
      this.rotacionObjetivo = 0; // Cerrada
    }
  }


  createRosco() {

    const radioRecorrido = 0.5;
    const puntosCamino = [];

    // Generamos puntos en círculo 
    for (let i = 0; i < 12; i++) {
      //recorremos los angulos
      const angulo = (i / 12) * Math.PI * 2;
      //añadimos el punto a la curva 
      puntosCamino.push(new THREE.Vector3(
        Math.cos(angulo) * radioRecorrido, //en x sera el coseno por el radio
        Math.sin(angulo) * radioRecorrido,
        0,
      ));
    }

    // Creamos curva cerrada a partir de los puntos
    const caminoBarrer = new THREE.CatmullRomCurve3(puntosCamino);
    caminoBarrer.closed = true;  //Para que termine el recorrido


    // Hexágono 2D 
    const radioForma = 0.2; // Grosor de la masa del rosco
    const formaRosco = new THREE.Shape();

    for (let i = 0; i < 6; i++) {
      const angulo = (i / 6) * Math.PI * 2;
      const x = Math.cos(angulo) * radioForma;
      const y = Math.sin(angulo) * radioForma;

      if (i === 0) {
        formaRosco.moveTo(x, y);
      } else {
        formaRosco.lineTo(x, y);
      }
    }

    const opcionesBarrido = {
      steps: 90,
      extrudePath: caminoBarrer,
    };

    const geometriaRosco = new THREE.ExtrudeGeometry(formaRosco, opcionesBarrido);


    this.texturaRosco = new THREE.TextureLoader().load('../imgs/hojas.jpg');

    this.texturaRosco.wrapT = THREE.RepeatWrapping;
    this.texturaRosco.wrapS = THREE.RepeatWrapping;
    this.texturaRosco.repeat.set(8, 10);

    const materialRosco = new THREE.MeshStandardMaterial({ map: this.texturaRosco });

    this.mallaRosco = new THREE.Mesh(geometriaRosco, materialRosco);

    this.mallaRosco.scale.set(0.3, 0.3, 0.3);
    this.mallaRosco.position.set(-0.55, 0.9, 0.22);

    this.crearBolasNavidad(caminoBarrer);

    this.puertaInterior.add(this.mallaRosco);
  }

  crearBolasNavidad(camino) {
    const geoBola = new THREE.SphereGeometry(0.06, 16, 16);

    const matRojo = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      metalness: 0.9, 
      roughness: 0.1  // Muy liso
    });
    const matOro = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1
    });
    const materiales = [matRojo, matOro];

    const numBolas = 8; 

    for (let i = 0; i < numBolas; i++) {
      const t = i / numBolas;

      const posicion = camino.getPointAt(t);

      const material = materiales[i % materiales.length];
      const bola = new THREE.Mesh(geoBola, material);

      bola.position.set(posicion.x, posicion.y, posicion.z + 0.2);

      this.mallaRosco.add(bola);
    }
  }

  alternarPuerta() {
    this.abierta = !this.abierta;
    // Si está abierta, el objetivo es 90 grados (PI/2), si no, es 0.
    this.rotacionObjetivo = this.abierta ? Math.PI / 2 : 0;
  }
  update() {
    // MathUtils.lerp mueve suavemente el valor actual hacia el valor objetivo.
    // El '0.1' es la velocidad.
    this.puertaInterior.rotation.y = THREE.MathUtils.lerp(
      this.puertaInterior.rotation.y,
      this.rotacionObjetivo,
      0.1
    );
  }

}

export { Puerta }