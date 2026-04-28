import * as THREE from 'three'

class Laberinto extends THREE.Object3D {
    
  static WALL   = "X";
  static FREE   = " ";
  
  constructor (archivo, sincronizacion=null) {
    super();
    
    // Medidas de un bloque
    this.anchoBloque = 1.0;
    this.altoBloque = 2.0;
    
    // La geometría compartida de un bloque
    const bloqueGeo = new THREE.BoxGeometry (this.anchoBloque, this.altoBloque, this.anchoBloque);
    // Para que el sistema de referencia esté en la base
    bloqueGeo.translate (0, this.altoBloque/2, 0);
    // El material compartido que vayáis a usar
    const bloqueMat = new THREE.MeshNormalMaterial();
        
    // Leemos el archivo, lo pasamos a un vector de string y lo procesamos 
    // para ir creando y añadiendo los bloques
    const loader = new THREE.FileLoader();
    loader.load( archivo, (file) => {
      const laberintoMatriz = file.split (/\r?\n/);
      laberintoMatriz.pop(); // La última fila está vacía
      this.xNumBloques = laberintoMatriz[0].length;
      this.zNumBloques = laberintoMatriz.length;
      var unBloque;
      for (let fila = 0; fila < this.zNumBloques; fila++) {
        for (let columna = 0; columna < this.xNumBloques; columna++) {
          switch (laberintoMatriz[fila][columna]) {
            case Laberinto.WALL :
              unBloque = new THREE.Mesh (bloqueGeo, bloqueMat);
              unBloque.position.set (columna*this.anchoBloque, 0, fila*this.anchoBloque);
              this.add (unBloque);
              break;
          }
        }
      }
      // Para centrar el laberinto completo con respecto al sistema de coordenadas
      const desfaseX = (this.xNumBloques-1)/2 * this.anchoBloque;
      const desfaseZ = (this.zNumBloques-1)/2 * this.anchoBloque;
      this.position.x = -desfaseX;
      this.position.z = -desfaseZ;
      if (sincronizacion)
        sincronizacion.resolve();
    });     
  }
    
  getMundoFromCelda (fila, columna, salida) {
    // Se asume que los datos de entrada son correctos
    // Salida es un Vector3, igual que el atributo  position  de un Mesh
    salida.x = columna * this.anchoBloque + this.position.x;
    salida.z = fila * this.anchoBloque + this.position.z;
  }
  
  update () {
    ;
  }
}

export { Laberinto }
