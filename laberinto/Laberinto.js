import * as THREE from 'three'
import { Muro } from '../pickups/muro/muro.js';
import { Puerta } from '../pickups/puerta/Puerta.js'
import { coponieve } from '../pickups/coponieve/coponieve.js'
import { Regalo } from '../pickups/regalo/regalo.js';
import { Chimenea } from '../pickups/chimenea/chimenea.js';
import { Campana } from '../pickups/campana/campana.js';
import { Reno } from '../pickups/reno/reno.js';


class Laberinto extends THREE.Object3D {
    
  static WALL   = "X";
  static FREE   = " ";
  static START  = "S";
  static END = "E";
  static LLAVE = "L";
  static REGALO = "R";
  static CHIMENEA = "C";
  static CAMPANA = "B"; //Ponemos b de bell pq la c ya esta
  static RENOS = "N";
  
  constructor (archivo, sincronizacion=null) {
    super();
    
    // Medidas de un bloque
    this.anchoBloque = 1.0;
    this.altoBloque = 2.0;
    this.posIncio = new THREE.Vector3();
    this.posFinal = new THREE.Vector3();
    this.posLlave = this.posR = new THREE.Vector3();
    this.posicionesPickUp = [];

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
      console.log("Mapa cargado:", laberintoMatriz);
      console.log("Filas:", laberintoMatriz.length, "Columnas:", laberintoMatriz[0].length);
      //laberintoMatriz.pop(); // La última fila está vacía
      this.xNumBloques = laberintoMatriz[0].length;
      this.zNumBloques = laberintoMatriz.length;
      var unBloque;

      for (let fila = 0; fila < this.zNumBloques; fila++) {
        for (let columna = 0; columna < this.xNumBloques; columna++) {
          const celda = laberintoMatriz[fila][columna];
          //if (celda === 'L') console.log("L encontrada en fila:", fila, "columna:", columna);
          switch (laberintoMatriz[fila][columna]) {
            case Laberinto.WALL :
              
              const vecinoArriba = (fila > 0) 
                ? laberintoMatriz[fila - 1][columna] === Laberinto.WALL 
                : false;

              const vecinoAbajo = (fila < this.zNumBloques - 1)
                ? laberintoMatriz[fila + 1][columna] === Laberinto.WALL
                : false;

              const vecinoIzq = (columna > 0) 
                ? laberintoMatriz[fila][columna - 1] === Laberinto.WALL
                : false;

              const vecinoDch = (columna < this.xNumBloques - 1) 
                ? laberintoMatriz[fila][columna + 1] === Laberinto.WALL
                : false;

              const esEsquina = (vecinoAbajo || vecinoArriba) && (vecinoDch || vecinoIzq);
              const esVertical = (vecinoAbajo || vecinoArriba); 

              unBloque = new Muro(this.anchoBloque,this.altoBloque,this.anchoBloque, esVertical,esEsquina);
              unBloque.position.set (columna*this.anchoBloque, 0, fila*this.anchoBloque);
              this.add(unBloque);
              break;

            case Laberinto.START :
              this.filaEntrada = fila;
              this.ColumnaEntrada = columna;
              break;

            case Laberinto.END :
              this.filaSalida = fila;
              this.ColumnaSalida = columna;
              break;

            case Laberinto.LLAVE :
              this.filaC = fila;
              this.columnaC = columna;
              unBloque = new coponieve();
              unBloque.scale.set(5,5,5);
              unBloque.position.set(columna*this.anchoBloque,0.15, fila*this.anchoBloque);
              this.add(unBloque);
              this.posicionesPickUp.push(unBloque);
              break;

            case Laberinto.CAMPANA :
              this.filaB = fila;
              this.columnaB = columna;
              unBloque = new Campana();
              unBloque.scale.set(1, 1, 1);
              unBloque.position.set(columna*this.anchoBloque,0.95,fila*this.anchoBloque);
              this.add(unBloque);
              this.posicionesPickUp.push(unBloque);
              break;

            case Laberinto.REGALO :
              this.cR = columna;
              this.fR = fila;
              unBloque = new Regalo();
              unBloque.scale.set(8,8,8);
              unBloque.position.set(columna*this.anchoBloque,0.15, fila*this.anchoBloque);
              this.add(unBloque);
              this.posicionesPickUp.push(unBloque);
              break;

            case Laberinto.CHIMENEA :
              this.cC = columna;
              this.fC = fila;
              unBloque = new Chimenea();
              unBloque.scale.set(7,7,7);
              unBloque.position.set(columna*this.anchoBloque,0.15, fila*this.anchoBloque);
              this.add(unBloque);
              this.posicionesPickUp.push(unBloque);
              break;

            case Laberinto.RENOS :
              this.fN = fila;
              this.cN = columna;
              console.log('Reno encontrado en fila:', fila, 'columna:', columna);
              this.reno = new Reno();
              this.reno.position.set(columna*this.anchoBloque,0, fila*this.anchoBloque);
              this.add(this.reno);

              this.renosPatrulla = this.renosPatrulla || [];
              this.renosPatrulla.push(this.reno);
              break;
          } 
        }
      }
      // Para centrar el laberinto completo con respecto al sistema de coordenadas
      const desfaseX = (this.xNumBloques-1)/2 * this.anchoBloque;
      const desfaseZ = (this.zNumBloques-1)/2 * this.anchoBloque;
      this.position.x = -desfaseX;
      this.position.z = -desfaseZ;
      
      this.getMundoFromCelda(this.filaEntrada,this.ColumnaEntrada,this.posIncio);
      this.getMundoFromCelda(this.filaSalida,this.ColumnaSalida,this.posFinal);

      this.laberintoMatriz = laberintoMatriz;

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

  getCeldaFromMundo(x,z){
    const columna = Math.round((x-this.position.x) / this.anchoBloque);
    const fila = Math.round((z-this.position.z) / this.anchoBloque);
    //console.log('Posiciones de la celda',fila, columna);
    return {fila,columna}
  }

  esCeldaTransitable(f,c){
    if(f == null && c == null){
      console.log('Todo mal');
      return;
    }
    if(f < 0 || f > this.zNumBloques){
      console.log('Todo mal 2');
      return;
    }
    if(c < 0 || c > this.xNumBloques){
      console.log('Todo mal 3');
      return;
    }
    const celda = this.laberintoMatriz[f][c];
    return celda !== 'X' && celda !== 'E';
  }

  getFilaEntrada(){ return this.filaEntrada }
  getColumnaEntrada(){ return this.ColumnaEntrada }
  getPosInicial(){ return this.posIncio; }
  getPosFinal(){ return this.posFinal; }

  update () {
    if(this.reno) this.reno.update();
    
    for(const reno of this.renosPatrulla){
      this.reno.update();
    }
  }

  /*
  _actualizarPosicionReno(reno){
    const patrulla = reno._patrulla;

    const objetivoX = patrulla.colObjetivo * this.anchoBloque;
    const objetivoZ = patrulla.filaObjetivo * this.anchoBloque;

    const dx = objetivoX - reno.position.x;
    const dz = objetivoZ - reno.position.z;
    const distancia = Math.sqrt(dx*dx + dz*dz);

    if (distancia < 0.05) {
      reno.filaAct = patrulla.filaObjetivo;
      reno.colAct = patrulla.colObjetivo;
      this._elegirNuevoObjetivo(patrulla);
    } else {
      const pasoX = (dx / distancia) * patrulla.velocidad;
      const pasoZ = (dz / distancia) * patrulla.velocidad;
      reno.position.x += pasoX;
      reno.position.z += pasoZ;

      reno.rotation.y = Math.atan2(pasoX, pasoZ);
    }
  }

  _elegirNuevoObjetivo(patrulla){
    const direcciones = [
      { fila: patrulla.filaAct - 1, col: patrulla.colAct}, // Arriba
      { fila: patrulla.filaAct + 1, col: patrulla.colAct}, // Abajo
      { fila: patrulla.filaAct, col: patrulla.colAct - 1}, // Izquierda
      { fila: patrulla.filaAct, col: patrulla.colAct + 1}  // Derecha
    ];
    
    const transitables = direcciones.filter(d => this.esCeldaTransitable(d.fila, d.col));
    console.log('Opciones transitables para el reno en fila:', patrulla.filaAct, 'columna:', patrulla.colAct, '->', transitables);
    const elegido = transitables[Math.floor(Math.random() * transitables.length)];
    patrulla.filaAnterior = elegido.fila;
    patrulla.colAnterior = elegido.col;
  }
  */
}

export { Laberinto }
