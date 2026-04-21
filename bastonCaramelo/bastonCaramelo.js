import * as THREE from '../libs/three.module.js'



class BastonCaramelo extends THREE.Object3D {
    constructor(gui, titleGui) {
        super();
        //this.createGUI(gui, titleGui);

        this.textura = new THREE.TextureLoader().load('../imgs/baston-caramelo.jpg');
        this.materialBaston = new THREE.MeshPhongMaterial({ 
            map: this.textura,
            emissive: new THREE.Color(0x222222)  // luz propia mínima
        });

        var baston = this.createTrayectory();

        this.add(baston);

        // Escalar para que quepa en la escena
        this.scale.set(0.05, 0.05, 0.05);
    }

    createTrayectory() {
        const alturaBaston = 1;
        const radio = 0.05;
        const radioArco = 0.3; 


        var baseCircular = new THREE.Shape();
        baseCircular.absarc(0, 0, radio, 0, 2 * Math.PI, false);

        const puntos = [];
        for(let i = 0; i <= alturaBaston; i += 0.05) {
            puntos.push(new THREE.Vector3(0, i, 0));
        }

        for (let angulo = Math.PI; angulo >= -Math.PI / 12; angulo -= 0.05) {
            const x = radioArco + Math.cos(angulo) * radioArco;
            const y = alturaBaston + Math.sin(angulo) * radioArco;
            puntos.push(new THREE.Vector3(x, y, 0));
        }

        const path = new THREE.CatmullRomCurve3(puntos);

        const geometry = new THREE.ExtrudeGeometry(baseCircular, {
            steps: 200,
            bevelEnabled: false,
            extrudePath: path
        });

        this.remapUVsByArcLength(geometry, path, 200);

        var tube = new THREE.Mesh(geometry, this.materialBaston);

        return tube;
    }
    
    remapUVsByArcLength(geometry, path, steps) {
        // Calcula las posiciones reales a lo largo del camino
        const arcLengths = path.getLengths(steps);      // array de longitudes acumuladas
        const totalLength = arcLengths[arcLengths.length - 1];

        const uvAttr = geometry.attributes.uv;
        const posAttr = geometry.attributes.position;

        // Para cada vértice, buscamos a qué "t" del camino corresponde su Z
        // ExtrudeGeometry con extrudePath pone el progreso en el eje local del path
        // Podemos recalcular U usando el índice del step al que pertenece el vértice
        const totalVerts = posAttr.count;
        const vertsPerStep = totalVerts / (steps + 1); // vértices del perfil por cada step

        for (let i = 0; i < totalVerts; i++) {
            const stepIndex = Math.floor(i / vertsPerStep);
            const arcLen = arcLengths[Math.min(stepIndex, arcLengths.length - 1)];
            const uNuevo = arcLen / totalLength;

            // Mantenemos V tal como está (coordenada "radial" del perfil circular)
            uvAttr.setX(i, uNuevo);
        }

        uvAttr.needsUpdate = true;
    }


    update(){}
}

export { BastonCaramelo };