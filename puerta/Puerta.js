import * as THREE from 'three'

import * as CSG from '../libs/three-bvh-csg.js'

class Puerta extends THREE.Object3D {
  constructor() {
    super();
    this.createRosco();
  }

  createPuerta(){
    const lado=0.5;
    const puntosHaciaArriba= [];

    for (let i=0 ; i<10;i+=3){
      puntosHaciaArriba.push(new THREE.Vector3( 0, i,0 ));
    }
    const caminoHacer=new THREE.CatmullRomCurve3(puntosHaciaArriba);

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
    caminoBarrer.closed = true;                                                   //HACE FALRAAAAAAAAAAAA?

  
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

    const materialRosco = new THREE.MeshStandardMaterial({map: this.texturaRosco});

    this.mallaRosco = new THREE.Mesh(geometriaRosco, materialRosco);

    // Añadimos el rosco a la clase
   this.add(this.mallaRosco);
  }

  update() {
  }
}

export { Puerta }