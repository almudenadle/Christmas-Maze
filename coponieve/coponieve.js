import * as THREE from '../libs/three.module.js'

import * as CSG from '../libs/three-bvh-csg.js'

class coponieve extends THREE.Object3D{
    constructor(){
        super();

        const base = this.createBaseCopoNieve();
        const ramas = this.createRamas();
        const cuerpo_llave = this.createCuerpoLlave();

        
        var evaluador = new CSG.Evaluator();


        // Escalar para que no sea gigante
        this.scale.set(0.1, 0.1, 0.1)
    }

    createBaseCopoNieve(){
        const shape = new THREE.Shape();

        //Por si quiero definir un nuevo centro
        const cx = 0;
        const cy = 0;

        const branches = 7; //Número de ramas que queremos.
        const r = 0.75; //Longitud de las ramas del copo de nieve

        for(let i = 0; i <= branches; i++){
            //Calculamos un ángulo de 45 grados.
            const angle = (i * Math.PI)/(4); 

            /* 
            Para comprobar el angulo de salida
            const angle_rads = angle * (180 / Math.PI);
            console.log(angle_rads);
            */

            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            
            /*
            Por si quiero mover el eje de (0,0)
            if (i == 0){
                shape.moveTo(cx,cy);
            }
            */
            shape.lineTo(x,y);
            shape.moveTo(cx,cy);
        }

        const extrudeSettings = {
            depth: 0.1,
            bevelEnabled: true,
            bevelThickness: 0.05, //Profundidad
            bevelSize: 0.15, //Tamaño hacia dentro
            bevelSegments: 2
        }

        const geometry = new THREE.ExtrudeGeometry(shape,extrudeSettings);

        const material = new THREE.MeshStandardMaterial({
            color: 0xaaddff,
            metalness: 0.3,
            roughness: 0.2,
            emissive: 0x112244
        })

        this.mesh = new THREE.Mesh(geometry,material)

        // Centrar la geometría
        geometry.center()

        //this.add(this.mesh)
        return this.mesh;
    }

    
    createRamas(){
        const branches = new THREE.Group();

        const material_branches = new THREE.MeshStandardMaterial({
            color: 0xaaddff,
            metalness: 0.3,
            roughness: 0.2,
            emissive: 0x112244
        })

        const geometry_branches = new THREE.BoxGeometry(0.2,2,0.2);
        
        const r = 1;

        for(let i = 0; i <= 7; i++){
            const angle = (i * Math.PI)/(4);

            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);

            const b1 = new THREE.Mesh(geometry_branches,material_branches);
            b1.position.set(x,y,0.05);
            b1.rotation.z = angle + Math.PI/6;
            
            const b2 = new THREE.Mesh(geometry_branches,material_branches);
            b2.position.set(x,y,0.05);
            b2.rotation.z = angle - Math.PI/6;

            branches.add(b1);
            branches.add(b2);
        }

        return branches;
    }


    createCuerpoLlave(){
        var points = [];

        // --- Cuello decorativo ---
        points.push(new THREE.Vector2(0.2,-4));   // Estrechamiento
        points.push(new THREE.Vector2(0.3,-4.2)); // Anillo decorativo 1
        points.push(new THREE.Vector2(0.2,-4.4)); 

        // --- Eje central (el "palo") ---
        points.push(new THREE.Vector2(0.1,-4.4)); // Grosor del eje
        points.push(new THREE.Vector2(0.1,-9.0)); // Largo del eje

        // --- Punta final ---
        points.push(new THREE.Vector2(0.2,-9.2)); // Un pequeño tope al final
        points.push(new THREE.Vector2(0,-9.2));   // Centro para cerrar la malla

        const latheGeometry = new THREE.LatheGeometry(points, 32);
        const material = new THREE.MeshStandardMaterial({ 
             color: 0xaaddff,
            metalness: 0.3,
            roughness: 0.2,
            emissive: 0x112244
        });

        const cuerpoLlave = new THREE.Mesh(latheGeometry, material);

        return cuerpoLlave;
    }
    

    update() {
        //No se actualiza nada porque no hace nada
    }
}

export{coponieve}