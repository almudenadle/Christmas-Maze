import * as THREE from '../libs/three.module.js'
import * as CSG from '../libs/three-bvh-csg.js'


class coponieve extends THREE.Object3D{
    constructor(gui,titleGui){
        super();

        this.createGui(gui,titleGui);

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

        this.updateLlave();
    }


    updateLlave() {
        if (this.llave) this.remove(this.llave);
        this.llave = this.createLlave();
        this.llave.scale.set(0.025, 0.025, 0.025);

        this.llave.position.y = 0.13;
        this.add(this.llave);
    }

    createLlave(){
        var evaluador = new CSG.Evaluator();
        var base = this.createBaseCopoNieve();
        var cuerpo_llave = this.createCuerpoLlave();
        var sierra = this.createSierraLlave();
        
        base.position.y = 0.15;
        cuerpo_llave.position.z = 0.05;
        sierra.position.z = 0.05;

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
 
        const angulo = (2 * Math.PI) / (nBranches * 2);
        const rInterno = 0.15;

        for(let i = 0; i <= nBranches * 2; i++){
            const angle = i * angulo;

            const radio = (i % 2 === 0) ? r : rInterno;
            const x = radio * Math.cos(angle);
            const y = radio * Math.sin(angle);

            if(i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
        }
        shape.closePath();
 
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
        const radio    = 0.10;  
        const ensanche = 1.50;  
        const yTop     = 0.50;  
        const yCabeza  = 0.20;  
        const yHombro  = 1.40;  
        const altura   = 5.00;  
        const punta    = 0.20;  

        const points = [];
        points.push(new THREE.Vector2(0,                yTop));
        points.push(new THREE.Vector2(radio,           -yCabeza));
        points.push(new THREE.Vector2(radio * ensanche,-yCabeza));
        points.push(new THREE.Vector2(radio,           -yHombro));
        points.push(new THREE.Vector2(radio,           -altura));
        points.push(new THREE.Vector2(radio * 1.2,     -(altura + punta)));
        points.push(new THREE.Vector2(0,               -(altura + punta)));

        const latheGeometry = new THREE.LatheGeometry(points, 32);
        return this.crearBrush(latheGeometry, this.materialBaston);
    }
    
    /**
     * Para simular la sierra de la llave.
     * @returns crea la sierra
     */
    createSierraLlave(){
        const radioBaston    = 0.10;  
        const anchuraSierra  = 0.40;  
        const yInicio        = -3.50; 
        const alturaTotal    = 1.00;  
        const margenX        = 0.05;  
        const margenYDiente  = 0.20; 
        const alturaDiente   = 0.20; 

        const xMin       = radioBaston;
        const xMax       = radioBaston + anchuraSierra;
        const yFin       = yInicio - alturaTotal;
        const xMinDiente = xMin + margenX;
        const xMaxDiente = xMax - margenX;

        const shape = new THREE.Shape();
        shape.moveTo(xMin, yInicio);
        shape.lineTo(xMax, yInicio);
        shape.lineTo(xMax, yFin);
        shape.lineTo(xMin, yFin);
        shape.closePath();

        // Diente 1
        const yTopD1    = yInicio   - margenYDiente;
        const yBottomD1 = yTopD1    - alturaDiente;
        const diente1 = new THREE.Shape();
        diente1.moveTo(xMaxDiente, yTopD1);
        diente1.lineTo(xMaxDiente, yBottomD1);
        diente1.lineTo(xMinDiente, yBottomD1);
        diente1.lineTo(xMinDiente, yTopD1);
        diente1.closePath();
        shape.holes.push(diente1);

        // Diente 2
        const yTopD2    = yBottomD1 - margenYDiente;
        const yBottomD2 = yTopD2    - alturaDiente;
        const diente2 = new THREE.Shape();
        diente2.moveTo(xMaxDiente, yTopD2);
        diente2.lineTo(xMaxDiente, yBottomD2);
        diente2.lineTo(xMinDiente, yBottomD2);
        diente2.lineTo(xMinDiente, yTopD2);
        diente2.closePath();
        shape.holes.push(diente2);

        const extrudeSettings = {
            depth: 0.1,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.15,
            bevelSegments: 2
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.translate(0, 0, -0.05); // Centrar la sierra en el eje Z
        return this.crearBrush(geometry, this.materialBaston);
    }


    createGui(gui,titleGui){
        this.guiControls = {
            tamano:   0.1,    
            numBrazos: 8,
            longBrazos: 0.75,
            depth: 0.15,
            bevel: 0.15
        };

        var folder = gui.addFolder(titleGui);

        folder.add(this.guiControls, 'tamano', 0.05, 0.25, 0.01)
            .name('Tamaño llave: ')
            .onChange((value) => this.setTamano(value));

        folder.add(this.guiControls,"numBrazos",4,8,1)
            .name("Bisel: ")
            .onChange(() => this.updateLlave());

        folder.add(this.guiControls,"longBrazos",0.5,1.3,0.1)
            .name("Longitud de los brazos Copo: ")
            .onChange(() => this.updateLlave());
        
        folder.add(this.guiControls,"depth",0.05,0.35,0.1)
            .name("Profundidad: ")
            .onChange(() => this.updateLlave());
        
        folder.add(this.guiControls,"bevel",0.03,0.05,0.01)
            .name("Bevel: ")
            .onChange(() => this.updateLlave());
    }

    setTamano(value){
        this.scale.set(value / 0.1, value / 0.1, value / 0.1);
    }

    update() {
        //No se actualiza nada porque no hace nada
    }
}

export{coponieve}