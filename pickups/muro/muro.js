import * as THREE from 'three';

class Muro extends THREE.Object3D {
    constructor(ancho = 1, alto = 2, profundidad = 1,esVertical = false, esEsquina = false) {
        super();

        this._esquina = esEsquina;
        this._vertical = esVertical;
        this._ancho = ancho;
        this._alto = alto;
        this._profundidad = profundidad;

        if(esEsquina){
            this.createEsquina();
        }else {
            this.createTroncos();
        }

        this.createLuces();
        this.createNieve();
    }

    createTroncos(){
        const materialTronco = new THREE.MeshStandardMaterial({
            color: 0x6B3C1E,
            roughness: 0.9,
            metalness: 0.0
        });
        
        const materialCorte = new THREE.MeshStandardMaterial({
            color: 0x9A5830,
            roughness: 0.85,
            metalness: 0.0 
        });

        const altura = this._alto;
        const radio = altura * 0.14;
        const longitud = this._profundidad;
        const numTroncos = Math.round(altura / (radio*2));

        const geometriaTronco = new THREE.CylinderGeometry(radio,radio*1.05,longitud,10);
        const geometriaCorte = new THREE.SphereGeometry(radio,10);

        for(let i = 0; i < numTroncos; i++){
            const y = radio + i * radio * 2;

            const tronco = new THREE.Mesh(geometriaTronco,materialTronco);
            this._vertical ? tronco.rotation.x = Math.PI / 2 : tronco.rotation.z = Math.PI / 2
            tronco.position.set(0,y,0);
            this.add(tronco);

            const cortIzq = new THREE.Mesh(geometriaCorte,materialCorte);
            const cortDch = new THREE.Mesh(geometriaCorte,materialCorte);
            

            if( this._vertical ){
                cortIzq.rotation.x = Math.PI / 2;
                cortIzq.position.set(0,y,-longitud/2);
                this.add(cortIzq);
                cortDch.rotation.x = -Math.PI / 2;
                cortDch.position.set(0,y,longitud/2);
                this.add(cortDch);
            }else{
                cortIzq.rotation.y = Math.PI / 2;
                cortIzq.position.set(-longitud/2,y,0);
                this.add(cortIzq);
                cortDch.rotation.y = -Math.PI / 2;
                cortDch.position.set(longitud/2,y,0);
                this.add(cortDch);
            }
        }
    }
    
    createLuces() {
        const colores = [0xFF2222, 0x22BB22, 0xFFDD00, 0x2266FF, 0xFF8800];
        const geoBombilla = new THREE.SphereGeometry(0.045, 6, 6);
        const numLuces = 5;

        for (let i = 0; i < numLuces; i++) {
            const color = colores[i % colores.length];

            const matBombilla = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 2.0,
                roughness: 0.2,
                metalness: 0.1,
            });

            const xPos = -this._ancho * 0.4 + i * (this._ancho * 0.8 / (numLuces - 1));
            const yPos = this._alto * 0.55 + Math.sin(i * 1.3) * this._alto * 0.12;
            const zPos = this._profundidad * 0.52;

            const bombilla = new THREE.Mesh(geoBombilla, matBombilla);
            bombilla.position.set(xPos, yPos, zPos);
            this.add(bombilla);

            const puntosCable = [
                new THREE.Vector3(xPos, this._alto * 0.98, zPos * 0.3),
                new THREE.Vector3(xPos, yPos + 0.05, zPos),
            ];
            const cable = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(puntosCable),
                new THREE.LineBasicMaterial({ color: 0x222222 })
            );
            this.add(cable);
        }
    }
    

    createEsquina(){
        const materialPoste = new THREE.MeshStandardMaterial({
            color: 0x5C3317,
            roughness: 0.9,
            metalness: 0.0,
        });
        const materialCorte = new THREE.MeshStandardMaterial({
            color: 0x9A5830,
            roughness: 0.85,
            metalness: 0.0,
        });

        const radio = this._ancho * 0.45;
        const geometriaPoste = new THREE.CylinderGeometry(radio, radio * 1.05, this._alto, 10);
        const poste = new THREE.Mesh(geometriaPoste, materialPoste);
        poste.position.y = this._alto / 2;
        this.add(poste);

        const geometriaCorte = new THREE.CircleGeometry(radio, 10);
        const corteTop = new THREE.Mesh(geometriaCorte, materialCorte);
        corteTop.rotation.x = -Math.PI / 2;
        corteTop.position.y = this._alto;
        this.add(corteTop);
    }

    createNieve(){
        const materialNieve = new THREE.MeshStandardMaterial({
            color: 0xDDEEFF,
            roughness: 1.0,
            metalness: 0.0
        })

        const geometriaNieve = new THREE.SphereGeometry(
            this._ancho * 0.52, 
            10, 8, 
            0, Math.PI*2, 
            0, Math.PI/2
        );

        const nieve = new THREE.Mesh(geometriaNieve,materialNieve);
        nieve.scale.set(1,0.3,1);
        nieve.position.y = this._alto;
        this.add(nieve);
    }

    update() {}
}

export { Muro };