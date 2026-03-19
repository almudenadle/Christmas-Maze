import * as THREE from '../libs/three.module.js'

import * as CSG from '../libs/three-bvh-csg.js'

class Regalo extends THREE.Object3D{
    constructor(){
        super();

        var tamano = 0.1;   // Las unidades son metros

        const regalo = this.createRegalo(tamano);
        
        this.add(regalo);
    }  

    createRegalo(tamano){
        var caja = this.createContornoCaja(tamano);
        var cinta_1 = this.createContornoCintas(tamano);
        var cinta_2 = this.createContornoCintas(tamano);
        var lazo_1 = this.createLazo(tamano);
        var lazo_2 = this.createLazo(tamano);
        
        //Para realizar los cambios
        cinta_2.rotation.y = Math.PI / 2;
        lazo_2.rotation.y = Math.PI;

        //Para actualizar los cambios.
        cinta_2.updateMatrixWorld();
        lazo_2.updateMatrixWorld();

        var evaluador = new CSG.Evaluator();
        var tmp = evaluador.evaluate(caja,cinta_1, CSG.ADDITION);
        var tmp_2 = evaluador.evaluate(tmp,cinta_2,CSG.ADDITION);
        var tmp_3 = evaluador.evaluate(tmp_2,lazo_1,CSG.ADDITION);
        var resultado = evaluador.evaluate(tmp_3,lazo_2,CSG.ADDITION);

        return resultado;
    }

    crearBrush(geometria,material){
        var brush = new CSG.Brush(geometria,material);
        return brush;
    }

    createContornoCaja(tamano){
        const geometria_caja = new THREE.BoxGeometry(tamano*0.4,tamano*0.4,tamano*0.4);
        const material_caja = new THREE.MeshStandardMaterial({
            color: 0xBB0000,
            roughness: 0.5
        });

        var caja = this.crearBrush(geometria_caja,material_caja)

        return caja;
    }

    createContornoCintas(tamano){
        const geometria_cintas = new THREE.BoxGeometry(tamano*0.41,tamano*0.41,tamano*0.05);
        const material_cintas = new THREE.MeshStandardMaterial({
            color: 0xFF00,
            roughness: 0.5
        });
        
        var cinta = this.crearBrush(geometria_cintas,material_cintas);
        
        return cinta;
    }

    createLazo(tamano){
        //Vamos a aplicar extrusión:
        const shape = new THREE.Shape();
        
        //Hacemos la base donde se situara:
        const ancho = tamano * 0.05;
        const grosor = tamano * 0.01;
        shape.moveTo(-ancho/2, -grosor/2);
        shape.lineTo(ancho/2, -grosor/2);
        shape.lineTo(ancho/2, grosor/2);
        shape.lineTo(-ancho/2, grosor/2);
        shape.closePath();


        //Definimos el camino que vamos a seguir:
        const camino_lazo = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0,tamano*0.2,0),
            new THREE.Vector3(0,tamano*0.4,tamano*0.4),
            new THREE.Vector3(0,tamano*0.6,0),
            new THREE.Vector3(0,tamano*0.2,0)
        );

        const extrudeSettings = {
            steps: 50,
            depth: 1,
            extrudePath: camino_lazo
        };

        const geometria_lazo = new THREE.ExtrudeGeometry(shape,extrudeSettings);
        const material_lazo = new THREE.MeshStandardMaterial({
            color: 0xFF00,
            roughness: 0.5
        });

        const lazo = new CSG.Brush(geometria_lazo,material_lazo);

        return lazo;
    }
   
    update(){

    }

}

export { Regalo }