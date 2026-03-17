import * as THREE from 'three'

class Reno extends THREE.Object3D {

  constructor() {
    super();
    this.piernasArticuladas = []; // Guardaremos las articulaciones para animarlas
    this.createReno();
  }

  createReno() {
    // 1. MATERIALES
    const matCuerpo = new THREE.MeshStandardMaterial({ color: 0x8B5A2B}); 
    const matOscuro = new THREE.MeshStandardMaterial({ color: 0x3A2311 }); 
    const matNariz = new THREE.MeshStandardMaterial({ color: 0xff0000 }); 
    const matOjo = new THREE.MeshStandardMaterial({ color: 0x111111 }); 
    
    this.renoGroup = new THREE.Group();

    // =========================================================
    // TÉCNICA 1: REVOLUCIÓN (Cuerpo principal con volumen)
    // =========================================================
    const puntosCuerpo = [
      new THREE.Vector2(0, 0),       
      new THREE.Vector2(0.18, 0.1),  
      new THREE.Vector2(0.22, 0.3),  
      new THREE.Vector2(0.18, 0.5),  
      new THREE.Vector2(0, 0.6)      
    ];
    const geoCuerpo = new THREE.LatheGeometry(puntosCuerpo, 8);
    const cuerpo = new THREE.Mesh(geoCuerpo, matCuerpo);
    
    cuerpo.rotation.x = Math.PI / 2; 
    cuerpo.position.set(0, 0.6, -0.4); 
    this.renoGroup.add(cuerpo);


    // =========================================================
    // TÉCNICA 2: EXTRUSIÓN (Patas con 2 GRADOS DE LIBERTAD)
    // =========================================================
    const formaPierna = new THREE.Shape();
    formaPierna.moveTo(-0.03, 0);
    formaPierna.lineTo(0.03, 0);
    formaPierna.lineTo(0.02, -0.25);
    formaPierna.lineTo(-0.02, -0.25);
    formaPierna.lineTo(-0.03, 0);

    const opcionesExtrusion = { depth: 0.06, steps: 1, bevelEnabled: false };
    const geoPierna = new THREE.ExtrudeGeometry(formaPierna, opcionesExtrusion);
    geoPierna.translate(0, 0, -0.03); 

    const crearPierna = (posX, posZ, desfaseAnim) => {
      const hombroGroup = new THREE.Group();
      hombroGroup.position.set(posX, 0.6, posZ);

      const muslo = new THREE.Mesh(geoPierna, matCuerpo);
      hombroGroup.add(muslo);

      const rodillaGroup = new THREE.Group();
      rodillaGroup.position.set(0, -0.23, 0); 
      hombroGroup.add(rodillaGroup);

      const pantorrilla = new THREE.Mesh(geoPierna, matCuerpo);
      rodillaGroup.add(pantorrilla);

      const pezuna = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.07), matOscuro);
      pezuna.position.set(0, -0.25, 0.01);
      rodillaGroup.add(pezuna);

      this.renoGroup.add(hombroGroup);

      this.piernasArticuladas.push({
        hombro: hombroGroup,
        rodilla: rodillaGroup,
        desfase: desfaseAnim
      });
    };

    crearPierna(0.15, 0.1, 0);         
    crearPierna(-0.15, 0.1, Math.PI);  
    crearPierna(0.15, -0.35, Math.PI); 
    crearPierna(-0.15, -0.35, 0);      


    // =========================================================
    // LA CABEZA, OJOS Y CUERNOS RAMIFICADOS
    // =========================================================
    this.cuelloGroup = new THREE.Group();
    this.cuelloGroup.position.set(0, 0.65, 0.15); 

    // Cuello
    const cuello = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.3, 0.12), matCuerpo);
    cuello.rotation.x = Math.PI / 6; 
    cuello.position.set(0, 0.1, 0);
    this.cuelloGroup.add(cuello);

    // Cabeza
    const cabeza = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.3), matCuerpo);
    cabeza.position.set(0, 0.25, 0.12); 
    this.cuelloGroup.add(cabeza);

    // Nariz
    const nariz = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), matNariz);
    nariz.position.set(0, 0.25, 0.28); 
    this.cuelloGroup.add(nariz);

    // --- NUEVO: OJOS ---
    const geoOjo = new THREE.BoxGeometry(0.03, 0.03, 0.03);
    
    const ojoIzq = new THREE.Mesh(geoOjo, matOjo);
    // Lo sacamos un poco en X, lo subimos en Y y lo adelantamos en Z
    ojoIzq.position.set(0.085, 0.28, 0.2); 
    this.cuelloGroup.add(ojoIzq);

    const ojoDer = new THREE.Mesh(geoOjo, matOjo);
    ojoDer.position.set(-0.085, 0.28, 0.2); 
    this.cuelloGroup.add(ojoDer);

    // --- NUEVO: CUERNOS RAMIFICADOS ---
    // Función para crear un cuerno con ramas
    const crearCuerno = (esIzquierdo) => {
      const cuernoGroup = new THREE.Group();
      
      // Tallo principal
      const tallo = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.25, 0.03), matOscuro);
      tallo.position.y = 0.125; // Subimos el centro para que rote desde la base
      cuernoGroup.add(tallo);

      // Rama lateral 1 (hacia afuera)
      const rama1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.02), matOscuro);
      rama1.position.set(esIzquierdo ? 0.03 : -0.03, 0.12, 0.02);
      rama1.rotation.z = esIzquierdo ? -Math.PI / 4 : Math.PI / 4;
      rama1.rotation.x = Math.PI / 8; // Inclinada un poco hacia adelante
      cuernoGroup.add(rama1);

      // Rama lateral 2 (hacia adentro y arriba)
      const rama2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.02), matOscuro);
      rama2.position.set(esIzquierdo ? -0.02 : 0.02, 0.18, -0.01);
      rama2.rotation.z = esIzquierdo ? Math.PI / 4 : -Math.PI / 4;
      cuernoGroup.add(rama2);

      return cuernoGroup;
    };

    // Añadimos y posicionamos los nuevos cuernos en la cabeza
    const cuernoIzq = crearCuerno(true);
    cuernoIzq.position.set(0.05, 0.33, 0.02);
    cuernoIzq.rotation.set(-Math.PI / 10, 0, -Math.PI / 12); // Inclinamos el bloque entero
    this.cuelloGroup.add(cuernoIzq);

    const cuernoDer = crearCuerno(false);
    cuernoDer.position.set(-0.05, 0.33, 0.02);
    cuernoDer.rotation.set(-Math.PI / 10, 0, Math.PI / 12);
    this.cuelloGroup.add(cuernoDer);

    this.renoGroup.add(this.cuelloGroup);
    this.add(this.renoGroup);
  }

  // --- ANIMACIÓN ---
  update() {
    const tiempo = Date.now() * 0.005;

    // 1. Animar la cabeza asintiendo
    if (this.cuelloGroup) {
      this.cuelloGroup.rotation.x = Math.sin(tiempo * 0.5) * 0.05; 
    }

    // 2. Animar los 2 grados de libertad de las patas
    this.piernasArticuladas.forEach((pierna) => {
      pierna.hombro.rotation.x = Math.sin(tiempo + pierna.desfase) * 0.4;

      let anguloRodilla = Math.sin(tiempo + pierna.desfase);
      if (anguloRodilla > 0) anguloRodilla = 0; 
      
      pierna.rodilla.rotation.x = -anguloRodilla * 0.8; 
    });
  }
}

export { Reno }