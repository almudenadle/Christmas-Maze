import * as THREE from '../../libs/three.module.js'

class coponieve extends THREE.Object3D{
    constructor(){
        super();

        const base = this.createBaseCopoNieve();
        const ramas = this.createRamaCopoNieve();

        this.add(base)
        this.add(ramas)

        // Escalar para que no sea gigante
        this.scale.set(0.1, 0.1, 0.1)
    }

    createBaseCopoNieve(){
        const shape = new THREE.Shape();

        //Quiero definir un nuevo centro.
        const cx = 0;
        const cy = 0;

        const branches = 7; //Número de ramas que queremos.
        const r = 1; //Longitud de las ramas del copo de nieve

        for(let i = 0; i <= branches; i++){
            //Calculamos un ángulo de 45 grados.
            const angle = (i * Math.PI)/(4); 

            /* 
            Para comprobar el angulo de salida
            const angle_rads = angle * (180 / Math.PI);
            console.log(angle_rads);
            */

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
            depth: 0.1,
            bevelEnabled: true,
            bevelThickness: 0.1, //Profundidad
            bevelSize: 0.15, //Tamaño hacia dentro
            bevelSegments:2
        }

        const geometry = new THREE.ExtrudeGeometry(shape,extrudeSettings);

        const material = new THREE.MeshStandardMaterial({
            color: 0xaaddff,
            metalness: 0.3,
            roughness: 0.2,
            emissive: 0x112244
        })

        this.mesh = new THREE.Mesh(geometry,material)

        // Centrar la geometría
        geometry.center()

        //this.add(this.mesh)
        return this.mesh;
    }

    
    createRamasCopoNieve(){
        const branch = new THREE.Group();

        const geometry = new THREE.BoxGeometry(0.1,2,0.1);
        const material = new THREE.MeshStandardMaterial({
            color: 0xaaddff,
            metalness: 0.3,
            roughness: 0.2,
            emissive: 0x112244
        });

        const base = new THREE.Mesh(geometry,material);
        branch.add(base)

        const branch_1 = new THREE.Mesh(geometry,material);
        branch_1.rotation.z = Math.PI/6;
        branch_1.position.y = 1;

        const branch_2 = new THREE.Mesh(geometry,material);
        branch_2.rotation.z = -Math.PI/6;
        branch_2.position.y = -1;

        branch.add(branch_1);
        branch.add(branch_2);

        return branch;
    }

    createRamaCopoNieve(){
        const branches = new THREE.Group();

        for(let i=0;i<6;i++){

            const branch = this.createRamasCopoNieve();

            branch.rotation.z = i * Math.PI/3;

            branches.add(branch);
        }

        return branches;
    }
    

    update() {
        //No se actualiza nada porque no hace nada
    }
}

export{coponieve}