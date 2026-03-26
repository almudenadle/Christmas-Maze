import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'

class coponieve extends THREE.Object3D{
    constructor(){
        super();

        this.materialLlave = new THREE.MeshStandardMaterial({
            color: 0x0000ff,   // Color latón/oro
            metalness: 0.9,   
            roughness: 0.35,   
            emissive: 0x111100 
        });

        const llave = this.createLlave();

        llave.scale.set(0.025,0.025,0.025);
        llave.position.y = 0.15;

        this.add(llave);
    }

    createLlave(){
        var evaluador = new CSG.Evaluator();
        var base = this.createBaseCopoNieve();
        var cuerpo_llave = this.createCuerpoLlave();
        var sierra = this.createSierraLlave();
        var ramas = this.createRamas();
        
        /*
        ramas.children.forEach(rama => {
            rama.updateMatrixWorld();
            // Convertimos el Mesh de la rama en un Brush temporal posicionado
            const ramaBrush = new CSG.Brush(rama.geometry, this.materialLlave);
            ramaBrush.matrix.copy(rama.matrixWorld);
            base = evaluador.evaluate(base, ramaBrush, CSG.ADDITION);
        });
        */

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
    crearBrush(geometria){
        var brush = new CSG.Brush(geometria,this.materialLlave);
        return brush;
    }


    /**
     * Permite crearnos la base de la estrella.
     * @returns la base del copo de nieve
     */
    createBaseCopoNieve(){
        const shape = new THREE.Shape();

        //Por si quiero definir un nuevo centro
        const cx = 0;
        const cy = 0;

        const branches = 8; //Número de ramas que queremos.
        const r = 0.75; //Longitud de las ramas del copo de nieve
        const angulo = Math.PI/4;

        for(let i = 0; i <= branches; i++){
            //Calculamos un ángulo de 45 grados.
            const angle = i * angulo

            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);

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

        const base_brush = this.crearBrush(geometry);

        return base_brush;
    }
    
    createRamas(){
        const branches = new THREE.Group();

        const geometry_branches = new THREE.BoxGeometry(0.2,2,0.2);
        
        const r = 1;
        const branche = 7;
        const angulo =  Math.PI/4;

        for(let i = 0; i <= branche; i++){
            const angle = i * angulo

            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);

            const b1 = new THREE.Mesh(geometry_branches,this.materialLlave);
            b1.position.set(x,y,0.05);
            b1.rotation.z = angle + Math.PI/6;
            
            const b2 = new THREE.Mesh(geometry_branches,this.materialLlave);
            b2.position.set(x,y,0.05);
            b2.rotation.z = angle - Math.PI/6;

            branches.add(b1);
            branches.add(b2);
        }

        return branches;
    }

    /**
     * Para hacer el cuerpo de la llave.
     * @returns El cuerpo de la llave
     */
    createCuerpoLlave(){
        var points = [];
        
        //Vamos a definir los parámetros.
        const radio = 0.1;
        const segmento = 0.1;
        const altura = 5;

        points.push(new THREE.Vector2(0,0.5));  
        points.push(new THREE.Vector2(radio, -(segmento+0.1))); 
        points.push(new THREE.Vector2(radio*1.5, -(segmento+0.1))); 

        points.push(new THREE.Vector2(radio, -1.4));
        points.push(new THREE.Vector2(radio, -altura)); 

        // --- Punta final ---
        points.push(new THREE.Vector2(radio*1.2, -(altura+0.2))); 
        points.push(new THREE.Vector2(0, -(altura+0.2)));  

        const latheGeometry = new THREE.LatheGeometry(points, 32);

        const cuerpo_llave_brush = this.crearBrush(latheGeometry);

        return cuerpo_llave_brush;
    }
    
    /**
     * Para simular la sierra de la llave.
     * @returns crea la sierra
     */
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
        
         const extrudeSettings = {
            depth: 0.1,
            bevelEnabled: true,
            bevelThickness: 0.05, 
            bevelSize: 0.15,
            bevelSegments: 2
        }

        const geometry = new THREE.ExtrudeGeometry(shape,extrudeSettings);

        const sierra = this.crearBrush(geometry);

        return sierra;
    }

    update() {
        //No se actualiza nada porque no hace nada
    }
}

export{coponieve}