import * as THREE from 'three'

class Player extends THREE.Object3D{

    static VELOCIDAD = 0.03;
    static VEL_GIRO = 0.03;
    static RADIO = 0.4;

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

    update(teclas,laberinto,obstaculos){
        //Giros
        if( teclas['a'] || teclas['ArrowLeft']) this.angulo += Player.VEL_GIRO;
        if( teclas['d'] || teclas['ArrowRight']) this.angulo -= Player.VEL_GIRO;
        this.rotation.y = this.angulo;

        //Avanzar/Retroceder
        let dir = 0; //Lógica 1: Adelante y -1: Atrás
        if( teclas['w'] || teclas['ArrowUp']) dir = 1;
        if( teclas['s'] || teclas['ArrowDown']) dir = -1;

        if(dir != 0){
            /*
            const x = this.position.x + Math.sin(this.angulo) * Player.VELOCIDAD * dir * -1;
            const z = this.position.z + Math.cos(this.angulo) * Player.VELOCIDAD * dir * -1;
            const {fila, columna} = laberinto.getCeldaFromMundo(x,z);
            if(laberinto.esCeldaTransitable(fila,columna)){
                this.position.x = x;
                this.position.z = z;
            }
            */
            const direccion = new THREE.Vector3(
                Math.sin(this.angulo) * dir * -1,
                0,
                Math.cos(this.angulo) * dir * -1
            ).normalize();

            const origen = new THREE.Vector3();
            this.getWorldPosition(origen);
            origen.y += 1.0; // Ajustar la altura del origen del rayo

            this.raycaster.set(origen, direccion);

            const intersecciones = this.raycaster.intersectObjects(obstaculos, true);

            if (intersecciones.length === 0) {
                this.position.x += direccion.x * Player.VELOCIDAD;
                this.position.z += direccion.z * Player.VELOCIDAD;
            }
        }
    }
}

export { Player }