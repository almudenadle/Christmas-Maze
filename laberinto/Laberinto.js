import * as THREE from 'three'
import { Muro } from '../pickups/muro/muro.js';
import { Puerta } from '../pickups/puerta/Puerta.js'
import { coponieve } from '../pickups/coponieve/coponieve.js'
import { Regalo } from '../pickups/regalo/regalo.js';
import { Chimenea } from '../pickups/chimenea/chimenea.js';
import { Campana } from '../pickups/campana/campana.js';
import { Reno } from '../pickups/reno/reno.js';
import { BastonCaramelo } from '../pickups/bastonCaramelo/bastonCaramelo.js'


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
  static BASTON = "P";
  
  constructor (archivo, sincronizacion=null) {
    super();
    
    // Medidas de un bloque
    this.anchoBloque = 1.0;
    this.altoBloque = 2.0;
    this.posIncio = new THREE.Vector3();
    this.posFinal = new THREE.Vector3();
    this.posLlave = this.posR = new THREE.Vector3();
    this.posicionesPickUp = [];
    this.renosPatrulla = []

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
      this.xNumBloques = laberintoMatriz[0].length;
      this.zNumBloques = laberintoMatriz.length;
      var unBloque;

      for (let fila = 0; fila < this.zNumBloques; fila++) {
        for (let columna = 0; columna < this.xNumBloques; columna++) {
          const celda = laberintoMatriz[fila][columna];
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

              const puertaDcha = (columna < this.xNumBloques - 1)
                ? laberintoMatriz[fila][columna + 1] === Laberinto.START || laberintoMatriz[fila][columna + 1] === Laberinto.END
                : false;

              const esHorizontal = (vecinoIzq || vecinoDch) && !(vecinoArriba || vecinoAbajo) && !puertaDcha;
              const esVertical = (vecinoAbajo || vecinoArriba) && !(vecinoIzq || vecinoDch) && !puertaDcha; 

              unBloque = new Muro(this.anchoBloque,this.altoBloque,this.anchoBloque, esVertical,esHorizontal);
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
              this.reno._filaAct = this.reno._filaObj = fila;
              this.reno._colAct = this.reno._colObj = columna;
              
              this.add(this.reno);
              this.posicionesPickUp.push(this.reno);
              this.renosPatrulla.push(this.reno);
              break;
            
              case Laberinto.BASTON :
                this.fB = fila;
                this.cB = columna;

                unBloque = new BastonCaramelo();
                unBloque.scale.set(0.5,0.5,0.5);
                unBloque.position.set(columna*this.anchoBloque,0.15, fila*this.anchoBloque);
                this.add(unBloque);
                this.posicionesPickUp.push(unBloque);
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
    salida.x = columna * this.anchoBloque + this.position.x;
    salida.z = fila * this.anchoBloque + this.position.z;
  }

  getCeldaFromMundo(x,z){
    const columna = Math.round((x-this.position.x) / this.anchoBloque);
    const fila = Math.round((z-this.position.z) / this.anchoBloque);
    return {fila,columna}
  }

  esCeldaTransitable(f,c){
    if(f == null && c == null){
      return;
    }else if(f < 0 || f >= this.zNumBloques){
      return;
    }else if(c < 0 || c >= this.xNumBloques){
      return;
    }else if( f == this.fR && c == this.cR){
      return;
    }else if( f == this.filaB && c == this.columnaB){
      return;
    }else if( f == this.fC && c == this.cC){
      return;
    }else if( f == this.filaC && c == this.columnaC){
      return;
    }else if( f == this.fB && c == this.cB) return;

    if(this._jugador){
       const { fila, columna } = this.getCeldaFromMundo(
            this._jugador.position.x,
            this._jugador.position.z
        );
        if (f == fila && c == columna) return;
    }
    
    const celda = this.laberintoMatriz[f][c];
    return celda !== 'X' && celda !== 'E';
  }

  getFilaEntrada(){ return this.filaEntrada }
  getColumnaEntrada(){ return this.ColumnaEntrada }
  getPosInicial(){ return this.posIncio; }
  getPosFinal(){ return this.posFinal; }

  update () {    
    for(const reno of this.renosPatrulla){
      reno.update();
      this._actualizarPosicionReno(reno);
    }
  }

  
  _actualizarPosicionReno(reno){
    if(!this.laberintoMatriz) return;

    const objetivoX = reno._colObj * this.anchoBloque;
    const objetivoZ = reno._filaObj * this.anchoBloque;

    const dX = objetivoX - reno.position.x;
    const dZ = objetivoZ - reno.position.z;
    const distancia = Math.sqrt(dX * dX + dZ * dZ);

    if(distancia < 0.05){
       reno.position.set(objetivoX, 0, objetivoZ);
        reno._filaAct = reno._filaObj;
        reno._colAct  = reno._colObj;
        this._elegirNuevoObjetivo(reno);
    } else {
        const velocidad = 0.02;
        reno.position.x += (dX / distancia) * velocidad;
        reno.position.z += (dZ / distancia) * velocidad;
        reno.renoGroup.rotation.y = Math.atan2(dX, dZ);
    }
  }

  _elegirNuevoObjetivo(reno){
    const direcciones = [
        { fila: reno._filaAct - 1, col: reno._colAct },
        { fila: reno._filaAct + 1, col: reno._colAct },
        { fila: reno._filaAct,     col: reno._colAct - 1 },
        { fila: reno._filaAct,     col: reno._colAct + 1 }
    ];

    const transitables = direcciones.filter(d => this.esCeldaTransitable(d.fila, d.col));
    if (transitables.length === 0) return;

    // Evitar volver a la celda anterior si hay otras opciones
    const sinRetroceso = transitables.filter(
        d => !(d.fila === reno._filaAnterior && d.col === reno._colAnterior)
    );
    const opciones = sinRetroceso.length > 0 ? sinRetroceso : transitables;

    const elegido = opciones[Math.floor(Math.random() * opciones.length)];
    reno._filaAnterior = reno._filaAct;
    reno._colAnterior  = reno._colAct;
    reno._filaObj = elegido.fila;
    reno._colObj  = elegido.col;
  }
  
}

export { Laberinto }
