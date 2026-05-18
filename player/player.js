    import * as THREE from 'three'

    class Player extends THREE.Object3D{

        static VELOCIDAD = 0.03;
        static VEL_GIRO = 0.03;
        static RADIO = 0.6;

        constructor(){
            super();
            this.angulo = 0;

            this.raycaster = new THREE.Raycaster();
            this.raycaster.far = Player.RADIO;
    

            const geometria = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 32);
            const material = new THREE.MeshStandardMaterial({color: 0x0000FF});
            const cilindro = new THREE.Mesh(geometria, material);
            cilindro.rotation.x = Math.PI / 2;
            this.add(cilindro);
        }

        update(teclas,laberinto,pickups,muros,pointerLocker){
            const locked = pointerLocker?.isLocked ?? false;

            if(!locked) {
                if( teclas['a'] || teclas['ArrowLeft']) this.angulo += Player.VEL_GIRO;
                if( teclas['d'] || teclas['ArrowRight']) this.angulo -= Player.VEL_GIRO;
                this.rotation.y = this.angulo;
            }

            //Avanzar/Retroceder
            let dir = 0; //Lógica 1: Adelante y -1: Atrás
            if( teclas['w'] || teclas['ArrowUp']) dir = 1;
            if( teclas['s'] || teclas['ArrowDown']) dir = -1;

            if (dir != 0) {
                const origen = new THREE.Vector3();
                this.getWorldPosition(origen);
                origen.y += 1.0;

                if (pointerLocker && locked) {
                    const aQueMiro = new THREE.Vector3();
                    pointerLocker.getDirection(aQueMiro);
                    aQueMiro.y = 0;
                    aQueMiro.normalize();
                    if (dir === -1) aQueMiro.negate();

                    this.raycaster.set(origen, aQueMiro);
                    const chocaMuro = this.raycaster.intersectObjects(muros, true).length > 0;
                    if (!chocaMuro){
                        pointerLocker.moveForward(Player.VELOCIDAD);    
                    }
                } else {
                    const direccion = new THREE.Vector3(
                        Math.sin(this.angulo) * dir * -1,
                        0,
                        Math.cos(this.angulo) * dir * -1
                    ).normalize();

                    this.raycaster.set(origen, direccion);
                    const chocaMuro = this.raycaster.intersectObjects(muros, true).length > 0;

                    const posJugador = new THREE.Vector3();
                    this.getWorldPosition(posJugador);

                    if (!chocaMuro) {
                        this.position.x += direccion.x * Player.VELOCIDAD;
                        this.position.z += direccion.z * Player.VELOCIDAD;
                    }
                }
            }
        }
    }

    export { Player }