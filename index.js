//ir al directorio donde esta el programa
//C:\Users\franc\OneDrive\Escritorio\MAESTRIA\SEGUNDO CUATRIMESTRE\ESPECIALIDAD I TECNOLOGIAS 4.0\Unidad 2\Inteligencia artificial\IA
//node index.js

const { SerialPort } = require('serialport');
const port = new SerialPort({
  path:"COM4",
  baudRate: 9600,
})


let Opciones={
  port:1883,
  clientId:"cetis",
  //username:"cetis",
  username:"chipgoat996",
  //password:"12345678"
  password:"1234"



}
var mqtt = require('mqtt')
//var client  = mqtt.connect("mqtt://cetis:12345678@cetis.cloud.shiftr.io/",Opciones);
var client  = mqtt.connect("mqtt://chipgoat996:1234@chipgoat996.cloud.shiftr.io/",Opciones);

client.on('connect', function () {
  client.subscribe('Cetis/clasificar', function (err) {
  console.log("MQTT activado");
  })
})

client.on('message', function (topic, message) {
  let Mensaje=message.toString();
  if(Mensaje=="1")
  {
    console.log("Posición 1");
    port.write("H");

  }
  else if(Mensaje=="2")
  {
    console.log("Posición 2");
    port.write("L");

  }
  //else if(Mensaje=="Nada")
  //{
    //console.log("Apagar");
    //port.write("N");

  //}
    console.log(message.toString())

})
