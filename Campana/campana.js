import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

class Campana extends THREE.Object3D {
    constructor(gui, titleGui) {
        super();
    
        var material = new THREE.MeshPhongMaterial({color: 0xFF0000});
        var materialInterior = new THREE.MeshPhongMaterial({color: 0x0000FF});
        
        var cil = new CSG.Brush(new THREE.CylinderGeometry(0.25, 0.5, 0.5,32), material);
        var cilindro = new CSG.Brush(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32), materialInterior); 
       
        cilindro.position.x = 0.5; // Ajusta la posición del cilindro para que se superponga con el cubo

        cilindro.updateWorldMatrix(); // Asegúrate de actualizar la matriz del cilindro después de cambiar su posición

        var evaluador = new CSG.Evaluator();

        var resultado = evaluador.evaluate(cilindro, cil, CSG.SUBTRACTION); // Realiza la operación de unión entre el cubo y el cilindro


        this.add(resultado);
        
        //var campana = this.createCampana();
        //var interior = this.createInterior();
        
        //this.add(campana);
        //this.add(interior);

        // Escalar para que quepa en la escena
        this.scale.set(0.25, 0.25, 0.25);
    }


    createCampana() {
        const radioBase = 0.25;
        const altura = 0.5;
        //Vamos a crearla por revolución.
        const puntos = [
            new THREE.Vector2(radioBase,0),
            new THREE.Vector2(0.15,0.2),
            new THREE.Vector2(0.15,0.3),
            new THREE.Vector2(0.15,0.4),
            new THREE.Vector2(0.10,0.45),
            new THREE.Vector2(0.05,0.475),
            new THREE.Vector2(0,altura)
        ]


        var geometria = new THREE.LatheGeometry(puntos,32);
        var material = new THREE.MeshPhongMaterial({color: 0xFF0000});
        var campana = new THREE.Mesh(geometria, material);
        return campana;
        
    }

    createInterior(){
        const radioBaseInterior = 0.2;
        const altura = 0.5;

        //Vamos a crear lo interior
        const puntosInterior = [
            new THREE.Vector2(0,0),
            new THREE.Vector2(radioBaseInterior,0),
            new THREE.Vector2(radioBaseInterior - 0.05,0.02),
            new THREE.Vector2(radioBaseInterior - 0.05,0.03),
            new THREE.Vector2(radioBaseInterior - 0.05,0.04),
            new THREE.Vector2(radioBaseInterior - 0.15,0.045),
            new THREE.Vector2(0,altura - 0.05),
            new THREE.Vector2(0,altura)
        ]

        var geometriaInterior = new THREE.LatheGeometry(puntosInterior,32);
        var materialInterior = new THREE.MeshPhongMaterial({color: 0x0000FF});
        var interior = new THREE.Mesh(geometriaInterior, materialInterior);
        return interior;
    }


    update(){}

}

export { Campana };