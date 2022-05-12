var capture;
var BotonesEntrenar;
var knn;
var modelo;
var Texto;
var CartaMensaje;
var Clasificando=false;
var InputTextbox;
var BotonTextBox;
var CargandoNeurona=false;

//let BrokerMQTT='cetis.cloud.shiftr.io';
let BrokerMQTT='boommask475.cloud.shiftr.io';
let PuertoMQTT=1883;
let ClienteIDMQTT="cetis";
//let UsuarioMQTT="cetis";
//let ContrasenaMQTT="12345678"
//let UsuarioMQTT="chipgoat996";
let UsuarioMQTT="boommask475";
let ContrasenaMQTT="1234"
let MensajeMQTT="";

 
 //var client=new Paho.Client("wss://chipgoat996:1234@chipgoat996.cloud.shiftr.io/",ClienteIDMQTT);
 var client=new Paho.Client("wss://boommask475:1234@boommask475.cloud.shiftr.io/",ClienteIDMQTT);
client.onConnectionLost=MQTTPerder;
client.onMessageArrived=MQTTMensaje;

client.connect({
  onSuccess:CuandoConectadoMQTT,
  userName: UsuarioMQTT,
  password: ContrasenaMQTT
});

function MQTTPerder(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("MQTT Perdio la conexión:"+responseObject.errorMessage);
  }
}

function MQTTMensaje(message) {
  console.log("Mensaje recibido:"+message.payloadString);
}

function CuandoConectadoMQTT()
{
  console.log("MQTT Conectado");
}

function setup() {
  createCanvas(480, 320);
  capture = createCapture(VIDEO);
  capture.size(480, 320);
  capture.hide();

  modelo=ml5.featureExtractor('MobileNet',Modelolisto);
  knn=ml5.KNNClassifier();

  createP('Presiona los botones para entrenar');

  var BotonArduino=createButton("Arduino");
  BotonArduino.class("BotonEntrenar");

  var BotonEsp8266=createButton("Esp8266");
  BotonEsp8266.class("BotonEntrenar");

  var BotonEsp32=createButton("Esp32");
  BotonEsp32.class("BotonEntrenar");

  var BotonNada=createButton("Nada");
  BotonNada.class("BotonEntrenar");

  createP("Entrena usando Text Box");
  InputTextbox=createInput("Cosa 2");
  BotonTextBox=createButton("Entrenar con: "+ InputTextbox.value());
  BotonTextBox.mousePressed(EntrenarTextBox);

  createP("Cargar o Guardar la neurona");
  var BotonGuardar=createButton("Guardar");
  BotonGuardar.mousePressed(GuardarNeurona);
  var BotonCargar=createButton("Cargar");
    BotonCargar.mousePressed(CargarNeurona);

  Texto=createP("Modelo no listo, esperando");



  BotonesEntrenar=selectAll(".BotonEntrenar");
  for (var B=0; B< BotonesEntrenar.length;B++)
  {
  BotonesEntrenar[B].style("margin","5px");
  BotonesEntrenar[B].style("padding","6px");
  BotonesEntrenar[B].mousePressed(PresionandoBoton);
  }

}

function draw()
 {
  background(220);
  image(capture, 0, 0, 480, 320);
  BotonTextBox.html("Entrenar con: "+InputTextbox.value());
if(knn.getNumLabels()>0 && !Clasificando)
{
  clasificar();
  setInterval(clasificar,500);
  Clasificando=true;
}
}
function PresionandoBoton()
{
  var NombreBoton=this.elt.innerHTML;
  console.log("Entrenando con  "+ NombreBoton);
  EntrenarKnn(NombreBoton);
}

function EntrenarKnn(ObjetoEntrenar)
{
  const Imagen=modelo.infer(capture);
  knn.addExample(Imagen,ObjetoEntrenar);
}

function Modelolisto()
{
  console.log("Modelolisto");
  Texto.html("Modelo listo, Empieza el entrenamiento");
}

function clasificar() {
if (Clasificando) {
var Imagen = modelo.infer(capture);
    knn.classify(Imagen, function(error, result) {
      if (error) {
        console.log("Error en clasificar");
        console.error();
      } else {
        //console.log(result);
        var Etiqueta;
        var Confianza;
        if (!CargandoNeurona) {
        Etiqueta = result.label;
        Confianza = Math.ceil(result.confidencesByLabel[result.label]*100);
        }
         else {
          Etiquetas = Object.keys(result.confidencesByLabel);
          Valores = Object.values(result.confidencesByLabel);
          var Indice = 0;
          for (var i = 0; i < Valores.length; i++) {
            if (Valores[i] > Valores[Indice]) {
            Indice = i;
            }
          }
          Etiqueta = Etiquetas[Indice];
          Confianza = Math.ceil(Valores[Indice]*100);
        }

        if (MensajeMQTT !=result.label && Confianza==100)
        {
          Texto.html("Es un: "+Etiqueta + " - " + Confianza + "%");
          MensajeMQTT=result.label;
          message= new Paho.Message(Etiqueta);
            message.destinationName="Cetis/clasificar";
            client.send(message);
            clasificar();
        }

      }
    });
  }
}

function EntrenarTextBox()
{
  const Imagen=modelo.infer(capture);
  knn.addExample(Imagen,InputTextbox.value());
}

function GuardarNeurona()
{
  if(Clasificando)
  {
    console.log("Guardando la neurona");
    knn.save("NeuronaKNN");
  }
}

function CargarNeurona()
{
  console.log("Cargando una neurona");
  knn.load("./data/NeuronaKNN.json",function()
{
console.log("Neurona cargada");
Texto.html("Neurona cargada");
CargandoNeurona=true;
});
}
