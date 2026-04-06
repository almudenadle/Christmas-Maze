import * as THREE from 'three'

import * as CSG from '../libs/three-bvh-csg.js'

class Puerta extends THREE.Object3D {
  constructor() {
    super();
    // this.createRosco();
    this.createPuerta();
  }

  createPuerta() {
    const lado = 0.3;
    const puntosHaciaArriba = [];
    const puntos2 = [];

    //hacemos rectangulo de la puerta en si, barrido
    const rectangulo = this.createRectangulo(lado);

    for (let i = 0; i < lado * 2.75; i += 0.03) {
      puntosHaciaArriba.push(new THREE.Vector3(0, i, 0));
    }
    const caminoHacer = new THREE.CatmullRomCurve3(puntosHaciaArriba);

    const options = { steps: 1, extrudePath: caminoHacer };

    const geometriaPuerta = new THREE.ExtrudeGeometry(rectangulo, options);

    this.texturaPuerta = new THREE.TextureLoader().load('../imgs/wood.jpg');

    const materialPuerta = new THREE.MeshStandardMaterial({ map: this.texturaPuerta });

    this.puerta = new THREE.Mesh(geometriaPuerta, materialPuerta);

    //hacemos un relieve para que la puerta parezca mas puerta
    const rectangulo1 = this.createRectangulo(lado - lado * 0.2);

    for (let i = 0; i < lado * 2.4; i += 0.03) {
      puntos2.push(new THREE.Vector3(0, i, 0));
    }
    const caminoHacerRelieve = new THREE.CatmullRomCurve3(puntos2);
    const optionsRelieve = { steps: 1, extrudePath: caminoHacerRelieve };

    const geometriaRelieve1 = new THREE.ExtrudeGeometry(rectangulo1, optionsRelieve);

    geometriaRelieve1.translate(0.01, 0.06, 0);

    this.texturaRelieve = new THREE.TextureLoader().load('../imgs/wood_oscura.jpg');

    const materialRelieve = new THREE.MeshStandardMaterial({ map: this.texturaRelieve });

    this.rectangulo1 = new THREE.Mesh(geometriaRelieve1, materialRelieve);

    const rectangulo2 = this.createRectangulo(lado - lado * 0.25);
    const geometriaRelieve2 = new THREE.ExtrudeGeometry(rectangulo1, optionsRelieve);
        geometriaRelieve2.translate(0.08, 0.06, 0);

    this.rectangulo2 = new THREE.Mesh(geometriaRelieve2, materialRelieve);

    this.add(this.rectangulo1);
    this.add(this.rectangulo2);

    //AHORA MISMO SON EXACTAMENTE IGUALES LOS RECTANFULOSSSSS
    // Añadimos la puerta a la clase
    this.add(this.puerta);
  }

  createRectangulo(lado) {
    const rectangulo = new THREE.Shape();
    rectangulo.moveTo(-lado, 0);
    rectangulo.lineTo(lado, 0);
    rectangulo.lineTo(lado, lado / 3);
    rectangulo.lineTo(-lado, lado / 3);
    return rectangulo;
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
    caminoBarrer.closed = true;                                                   //HACE FALTAAAAAAAAAAAA?


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

    // 4. MATERIAL

    this.texturaRosco = new THREE.TextureLoader().load('../imgs/hojas.jpg');

    // TRUCO PARA BARRIDOS: Hacemos que la textura se repita en lugar de estirarse
    this.texturaRosco.wrapS = THREE.RepeatWrapping;
    this.texturaRosco.wrapT = THREE.RepeatWrapping;
    // El primer número (8) es cuántas veces se repite a lo largo del rosco. 
    // El segundo (1) es cuántas veces se repite a lo ancho. 
    // ¡Juega con el 8 hasta que veas que la textura cuadra bien!
    this.texturaRosco.repeat.set(60, 130);

    const materialRosco = new THREE.MeshStandardMaterial({ map: this.texturaRosco });

    this.mallaRosco = new THREE.Mesh(geometriaRosco, materialRosco);

    // Añadimos el rosco a la clase
    this.add(this.mallaRosco);
  }

  update() {
  }
}

export { Puerta }