import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

class Campana extends THREE.Object3D {
    constructor(gui, titleGui) {
        super();
        this.createGUI(gui, titleGui);

        this.articulacionCampana = new THREE.Object3D();
        this.add(this.articulacionCampana);

        var campana = this.createCampana();
        campana.position.y = -0.5; 
        this.articulacionCampana.add(campana);

        this.articulacionBadajo = new THREE.Object3D();
        this.articulacionBadajo.position.y = -0.1; // cuelga desde la cima
        this.articulacionCampana.add(this.articulacionBadajo);

        var badajo = this.createBadajo();
        badajo.position.y = -0.25;
        this.articulacionBadajo.add(badajo);

        this.maxAnguloMovimiento = Math.PI / 6;
        this.velocidad = 0.01;
        this.anguloActual = 0;
        this.anguloBadajo = 0;   // ángulo independiente del badajo
        this.sentido = 1;

        this.scale.set(0.25, 0.25, 0.25);
        this.position.y = 0.15;
    }


    createCampana() {
        const radioBase = 0.25;
        const altura = 0.5;
   
        const puntos = [
            new THREE.Vector2(radioBase,0),
            new THREE.Vector2(0.20,0.05),
            new THREE.Vector2(0.16,0.15),
            new THREE.Vector2(0.15,0.30),
            new THREE.Vector2(0.12,0.42),
            new THREE.Vector2(0.05,0.48),
            new THREE.Vector2(0,altura)
        ]

        var geometria = new THREE.LatheGeometry(puntos,32);
        var material = new THREE.MeshPhongMaterial({
            color: 0xFFD700,
            shininess: 120,
            side: THREE.DoubleSide
        });

        var campana = new THREE.Mesh(geometria, material);
        return campana;
        
    }

    createBadajo(){
        const badajo = new THREE.Object3D();

        const cilindroGeom = new THREE.CylinderGeometry(0.008,0.008,0.50,8);
        const material = new THREE.MeshPhongMaterial({
             color: 0x8B4513,
             shininess: 120,
            side: THREE.DoubleSide
         });
        const varilla = new THREE.Mesh(cilindroGeom, material);
        badajo.add(varilla); 

        const esferaGeom = new THREE.SphereGeometry(0.02,8,8);
        const esfera = new THREE.Mesh(esferaGeom, material);
        const bola = new THREE.Mesh(esferaGeom, material);
        bola.position.y = -0.25;
        badajo.add(bola);

        return badajo; 
    }

    createGUI(gui, titleGui) {
        const folder = gui.addFolder(titleGui);

        this.guiControls = {
            'Animación': false,
            'Velocidad': 0.01,
            'Ángulo Máximo': 30
        }

        folder.add(this.guiControls, 'Animación').name('Animación');
        folder.add(this.guiControls, 'Velocidad', 0.01, 0.1, 0.01).name('Velocidad');
        folder.add(this.guiControls, 'Ángulo Máximo', 0, 90, 0.01).name('Ángulo Máximo');
    }

    update() {
        if (!this.guiControls['Animación']) return;

        const anguloMaxRad = THREE.MathUtils.degToRad(this.guiControls['Ángulo Máximo']);
        
        // La campana se balancea normalmente
        this.anguloActual += this.guiControls['Velocidad'] * this.sentido;
        if (Math.abs(this.anguloActual) >= anguloMaxRad) {
            this.sentido *= -1;
            this.anguloActual = Math.sign(this.anguloActual) * anguloMaxRad;
        }
        this.articulacionCampana.rotation.z = this.anguloActual;

        const diferencia = this.anguloActual - this.anguloBadajo;
        this.anguloBadajo += diferencia * 0.08;  // 0.08 = "peso" del badajo

        this.articulacionBadajo.rotation.z = this.anguloBadajo - this.anguloActual;
    }
}

export { Campana };