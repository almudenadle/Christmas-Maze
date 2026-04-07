import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'
import { GUI } from 'gui'

class coponieve extends THREE.Object3D{
    constructor(gui,titleGui){
        super();

        this.createGui(titleGui);

        this.materialLlave = new THREE.MeshStandardMaterial({
            color: 0x87CEEB,   
            metalness: 0.9,   
            roughness: 0.35,   
            emissive: 0x111100 
        });
        
        this.materialBaston = new THREE.MeshStandardMaterial({
            color: 0xDAA520,  
            metalness: 0.9,   
            roughness: 0.35,   
            emissive: 0x111100 
        });

        const llave = this.createLlave();

        llave.scale.set(0.025,0.025,0.025);
        llave.position.y = 0;

        this.add(llave);
    }

    createLlave(){
        var evaluador = new CSG.Evaluator();
        var base = this.createBaseCopoNieve();
        var cuerpo_llave = this.createCuerpoLlave();
        var sierra = this.createSierraLlave();

        // updateMatrixWorld obligatorio antes de evaluate
        base.updateMatrixWorld();
        cuerpo_llave.updateMatrixWorld();
        sierra.updateMatrixWorld();

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
    crearBrush(geometria,material = this.materialLlave){
        var brush = new CSG.Brush(geometria,material);
        return brush;
    } 
 
    createBaseCopoNieve() {
        const nBranches = this.guiControls.numBrazos;
        const r         = this.guiControls.longBrazos;
        const depth     = this.guiControls.depth;
        const bevel     = this.guiControls.bevel;
 
        const shape = new THREE.Shape();
 
        const angulo = Math.PI/4;

        for(let i = 0; i <= nBranches; i++){
            const angle = i * angulo

            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);


            //Mejorar para cuando funcione el nBranches
            if(i != 6){
                shape.lineTo(x,y)
                shape.moveTo(0, 0);
            }
        }
 
        const extrudeSettings = {
            depth:          depth,
            bevelEnabled:   true,
            bevelThickness: 0.05,
            bevelSize:      bevel,
            bevelSegments:  2
        };
 
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
 
        return this.crearBrush(geometry);
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

        const cuerpo_llave_brush = this.crearBrush(latheGeometry,this.materialBaston);

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
        sierra1.moveTo(0.45,-3.7);
        sierra1.lineTo(0.45,-3.9);
        sierra1.lineTo(0.15,-3.9);
        sierra1.lineTo(0.15,-3.7);
        sierra1.lineTo(0.45,-3.7);
        shape.holes.push(sierra1);

        const sierra2 = new THREE.Shape();
        sierra2.moveTo(0.45,-4.1);
        sierra2.lineTo(0.45,-4.3);
        sierra2.lineTo(0.15,-4.3);
        sierra2.lineTo(0.15,-4.1);
        sierra2.lineTo(0.45,-4.1);
        shape.holes.push(sierra2);
        
         const extrudeSettings = {
            depth: 0.1,
            bevelEnabled: true,
            bevelThickness: 0.05, 
            bevelSize: 0.15,
            bevelSegments: 2
        }

        const geometry = new THREE.ExtrudeGeometry(shape,extrudeSettings);

        const sierra = this.crearBrush(geometry,this.materialBaston);

        return sierra;
    }


    createGui(titleGui){
        var gui = new GUI();

        this.guiControls = {
            numBrazos: 8,
            longBrazos: 0.75,
            depth: 0.15,
            bevel: 0.15
        };

        var folder = gui.addFolder(titleGui);

        folder.add(this.guiControls,"numBrazos",4,8,1)
            .name("Número de Brazos del Copo: ")
            .onChange(() => this.createLlave());

        folder.add(this.guiControls,"longBrazos",0.5,1.3,0.1)
            .name("Longitud de los brazos Copo: ")
            .onChange(() => this.createLlave());
        
        folder.add(this.guiControls,"depth",0.05,0.35,0.1)
            .name("Profundidad: ")
            .onChange(() => this.createLlave());
        
        folder.add(this.guiControls,"bevel",0.03,0.05,0.01)
            .name("Número de Brazos del Copo: ")
            .onChange(() => this.createLlave());
    }


    update() {
        //No se actualiza nada porque no hace nada
    }
}

export{coponieve}