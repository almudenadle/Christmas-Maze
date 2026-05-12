import * as THREE from '../../libs/three.module.js'

import * as CSG from '../../libs/three-bvh-csg.js'


class Regalo extends THREE.Object3D{
    constructor(gui = null, titleGui = " "){
        super();

        if(gui){
            this.createGUI(gui,titleGui);
        }else{
            this.guiControls = {
                tamano:   0.1,    // tamaño base en metros
                apertura: 0.0     // ángulo de apertura de la tapa (0 = cerrada)
            }
        }

        const textura = new THREE.TextureLoader().load('../imgs/patron.jpg');

        var tamano = 0.1;  

        const cuerpo = this.createRegalo(tamano);
        this.add(cuerpo);

        this.articulacionTapa = new THREE.Object3D();
        this.articulacionTapa.position.set(0,tamano*0.2,-tamano*0.2);
        this.add(this.articulacionTapa);

        var tapa = this.createTapa(tamano);
        this.articulacionTapa.add(tapa);

        var cintasTapa = this.createCintasTapa(tamano);
        this.articulacionTapa.add(cintasTapa);

        this.articulacionLazo = new THREE.Object3D();
        this.articulacionLazo.position.set(0, tamano *0.05, tamano * 0.2);
        this.articulacionTapa.add(this.articulacionLazo);
 
        var lazo = this.createLazo(tamano);
        this.articulacionLazo.add(lazo);
    }  
    /**
     * Se encarga de unir todos los componentes con los que conseguir crear el regalo
     * @param {*} tamano 
     * @returns 
     */
    createRegalo(tamano){
        var caja = this.createContornoCaja(tamano);
        var cinta_1 = this.createContornoCintas(tamano);
        var cinta_2 = this.createContornoCintas(tamano);
        var cajaSubstraer = this.createContornoCaja(tamano-0.01);
        
        cinta_2.rotation.y = Math.PI / 2;
        cajaSubstraer.position.set(0,0.01,0);

        cinta_2.updateMatrixWorld();
        cajaSubstraer.updateMatrixWorld();

        var evaluador = new CSG.Evaluator();
        var tmp = evaluador.evaluate(caja,cinta_1, CSG.ADDITION);
        var tmp_2 = evaluador.evaluate(tmp,cinta_2,CSG.ADDITION);
        var resultado = evaluador.evaluate(tmp_2,cajaSubstraer,CSG.SUBTRACTION);
        
        
        return resultado;
    }


    /**
     * Sirve para crear los brushes de todo, sin necesidad de escribirlo constantemente
     * @param {*} geometria 
     * @param {*} material 
     * @returns 
     */
    crearBrush(geometria,material){
        var brush = new CSG.Brush(geometria,material);
        return brush;
    }


    /**
     * Creamos contorno de la caja
     * @param {*} tamano 
     * @returns 
     */
    createContornoCaja(tamano){
        const geometria_caja = new THREE.BoxGeometry(tamano*0.4,tamano*0.4,tamano*0.4);
        const material_caja = new THREE.MeshStandardMaterial({
            color: 0xBB0000,
            side: THREE.DoubleSide,
            roughness: 0.5
        });

        var caja = this.crearBrush(geometria_caja,material_caja)

        return caja;
    }

    /**
     * Para el contorno de la cinta.
     * @param {*} tamano 
     * @returns 
     */
    createContornoCintas(tamano){
        const geometria_cintas = new THREE.BoxGeometry(tamano*0.41,tamano*0.41,tamano*0.05);
        const material_cintas = new THREE.MeshStandardMaterial({
            color: 0x00CC00,
            roughness: 0.5
        });
        
        var cinta = this.crearBrush(geometria_cintas,material_cintas);
        
        return cinta;
    }

    /**
     * Creamos el lazo, nos permite definir la forma.
     * @param {*} tamano 
     * @returns 
     */
    createLazo(tamano){
        const shape = new THREE.Shape();

        const ancho = tamano * 0.05;
        const grosor = tamano * 0.01;
        shape.moveTo(-ancho/2, -grosor/2);
        shape.lineTo(ancho/2, -grosor/2);
        shape.lineTo(ancho/2, grosor/2);
        shape.lineTo(-ancho/2, grosor/2);
        shape.closePath();

        const camino_lazo = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,tamano*0.2,tamano*0.2),
            new THREE.Vector3(0,tamano*0.4,0),
            new THREE.Vector3(0,0,0)
        );

        const extrudeSettings = {
            steps: 50,
            depth: 1,
            extrudePath: camino_lazo
        };

        const geometria_lazo = new THREE.ExtrudeGeometry(shape,extrudeSettings);
        const material_lazo = new THREE.MeshStandardMaterial({
            color: 0x00CC00,
            roughness: 0.5
        });

        const lazo = new THREE.Group();
        const lazo1 = new THREE.Mesh(geometria_lazo,material_lazo);
        lazo.add(lazo1);

        const lazo2 = new THREE.Mesh(geometria_lazo,material_lazo);
        lazo2.rotation.y = Math.PI;
        lazo.add(lazo2);

        return lazo;
    }

    createTapa(tamano){
        const geometria_tapa = new THREE.BoxGeometry(tamano*0.43,tamano*0.05,tamano*0.43);
        const material_tapa = new THREE.MeshStandardMaterial({
            color: 0xBB0000,
            roughness: 0.5
        });

        var tapa = new THREE.Mesh(geometria_tapa,material_tapa);

        tapa.position.set(0,tamano*0.025,tamano*0.2)

        return tapa;
    }

    createCintasTapa(tamano){
        var cintas = new THREE.Group();
    
        const material_cinta = new THREE.MeshStandardMaterial({
            color: 0x00CC00,
            roughness: 0.5
        });
        const geometria_cinta1 = new THREE.BoxGeometry(tamano*0.06,tamano*0.06,tamano*0.45);
        const geometria_cinta2 = new THREE.BoxGeometry(tamano*0.45,tamano*0.06,tamano*0.06);

        var cinta1 = new THREE.Mesh(geometria_cinta1,material_cinta);
        cinta1.position.set(0,tamano*0.025,tamano*0.2);
        cintas.add(cinta1);

        var cinta2 = new THREE.Mesh(geometria_cinta2,material_cinta);
        cinta2.position.set(0,tamano*0.025,tamano*0.2);
        cintas.add(cinta2)

        return cintas;
    }

    /**
     * Creamos el GUI para el regalo, con sus respectivos controles.
     * @param {*} gui 
     * @param {*} titleGui 
     */
    createGUI(gui,titleGui){
        this.guiControls = {
            tamano:   0.1,    // tamaño base en metros
            apertura: 0.0     // ángulo de apertura de la tapa (0 = cerrada)
        }

        var folder = gui.addFolder(titleGui);

        folder.add(this.guiControls, 'tamano', 0.05, 0.25, 0.01)
            .name('Tamaño caja: ')
            .onChange((value) => this.setTamano(value));

        folder.add(this.guiControls, 'apertura', 0.0, Math.PI / 2, 0.01)
            .name('Abrir tapa: ')
            .onChange((value) => this.setApertura(value));
            
        
    }

    setTamano(valor) {
        // Escalamos el regalo completo uniformemente
        this.scale.set(valor / 0.1, valor / 0.1, valor / 0.1);
    }

    setApertura(valor) {
        this.articulacionTapa.rotation.x = -valor; // Rotamos la tapa hacia atrás para abrirla
    }

    update(){

    }

}

export { Regalo }