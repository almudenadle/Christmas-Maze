import * as THREE from '../libs/three.module.js'

import * as CSG from '../libs/three-bvh-csg.js'

class coponieve extends THREE.Object3D{
    constructor(){
        super();

        this.materialLlave = new THREE.MeshStandardMaterial({
            color: 0xB5A642,   // Color latón/oro
            metalness: 0.9,   
            roughness: 0.35,   
            emissive: 0x111100 
        });

        const llave = this.createLlave();
        this.add(llave);
        // Escalar para que no sea gigante
        this.scale.set(0.1, 0.1, 0.1)
    }

    createLlave(){
        var base = this.createBaseCopoNieve();
        var cuerpo_llave = this.createCuerpoLlave();
        var sierra = this.createSierraLlave();
        
        var evaluador = new CSG.Evaluator();
        var tmp = evaluador.evaluate(base,cuerpo_llave,CSG.ADDITION);
        var resultado = evaluador.evaluate(tmp,sierra,CSG.ADDITION);

        return resultado;
    }

    /**
     * Sirve para crear los brushes de todo, sin necesidad de escribirlo constantemente
     * @param {*} geometria 
     * @param {*} material 
     * @returns 
     */
    crearBrush(geometria,material){
        var brush = new CSG.Brush(geometria,this.materialLlave);
        return brush;
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

            
            //Para comprobar el angulo de salida
            //const angle_rads = angle * (180 / Math.PI);
            //console.log(angle_rads);
            
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
            depth: 0,
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

        const base_brush = this.crearBrush(geometry,material);

        //this.add(this.mesh)
        return base_brush;
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
        points.push(new THREE.Vector2(0,0));   // Estrechamiento
        points.push(new THREE.Vector2(0.1, -0.2)); // Anillo decorativo 1
        points.push(new THREE.Vector2(0.1, -0.2)); 

        // --- Eje central (el "palo") ---
        points.push(new THREE.Vector2(0.1, -1.4)); // Grosor del eje
        points.push(new THREE.Vector2(0.1, -5.0)); // Largo del eje

        // --- Punta final ---
        points.push(new THREE.Vector2(0.2, -5.2)); // Un pequeño tope al final
        points.push(new THREE.Vector2(0, -5.2));   // Centro para cerrar la malla

        const latheGeometry = new THREE.LatheGeometry(points, 32);
        const material = new THREE.MeshStandardMaterial({ 
             color: 0xaaddff,
            metalness: 0.3,
            roughness: 0.2,
            emissive: 0x112244
        });

        const cuerpo_llave_brush = this.crearBrush(latheGeometry,material);

        return cuerpo_llave_brush;
    }
    
    createSierraLlave(){
        const shape = new THREE.Shape();

        //Lo primero es hacer una forma rectangular. Para ello en función de un punto medio de el cuerpo de la llave.
        shape.moveTo(0.1,-3.5);
        shape.lineTo(0.5,-3.5);
        shape.lineTo(0.5,-4.5);
        shape.lineTo(0.1,-4.5);
        shape.lineTo(0.1,-3.5);

        //Ahora vamos a hacerle dos sierras.
        const sierra1 = new THREE.Shape();
        sierra1.moveTo(0.5,-3.7);
        sierra1.lineTo(0.5,-3.9);
        sierra1.lineTo(0.1,-3.9);
        sierra1.lineTo(0.1,-3.7);
        sierra1.lineTo(0.5,-3.7);
        shape.holes.push(sierra1);

        const sierra2 = new THREE.Shape();
        sierra2.moveTo(0.5,-4.1);
        sierra2.lineTo(0.5,-4.3);
        sierra2.lineTo(0.1,-4.3);
        sierra2.lineTo(0.1,-4.1);
        sierra2.lineTo(0.5,-4.1);
        shape.holes.push(sierra2);

        //Ahora creamos la geometría y el material. Para aplicar la extrusión.
         const extrudeSettings = {
            depth: 0,
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

        const sierra = this.crearBrush(geometry,material);

        return sierra;
    }

    update() {
        //No se actualiza nada porque no hace nada
    }
}

export{coponieve}