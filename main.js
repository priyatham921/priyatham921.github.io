window.onload = function () {
  var mqtt;
  var reconnectTimeout = 2000;
  var host = "broker-cn.emqx.io";
  var port = 8084;

  function onConnect() {
    console.log("Connected to mqtt server at ", host, ":", port);
    document.getElementById("status").innerHTML = "Connected to Mqtt Broker";

    //mqtt.send(messagex);

    navigator.permissions
      .query({ name: "accelerometer" })
      .then(function (result) {
        if (result.state == "granted") {
          console.log("Permission to access accelerometer granted");
          let sensor = new Accelerometer();

          sensor.start();

          sensor.onreading = () => {
            document.getElementById("acc_data_x").innerHTML = sensor.x;
            document.getElementById("acc_data_y").innerHTML = sensor.y;
            document.getElementById("acc_data_z").innerHTML = sensor.z;

            acc_x = new Paho.MQTT.Message(String(sensor.x));
            acc_y = new Paho.MQTT.Message(String(sensor.y));
            acc_z = new Paho.MQTT.Message(String(sensor.z));
            acc_x.destinationName = "sensornode/livestream/x";
            acc_y.destinationName = "sensornode/livestream/y";
            acc_z.destinationName = "sensornode/livestream/z";

            mqtt.send(acc_x);

            mqtt.send(acc_y);

            mqtt.send(acc_z);
          };

          sensor.onerror = (event) =>
            console.log(event.error.name, event.error.message);
        } else console.log("permission denied");
      });
  }

  function onFailure() {
    console.log("Connection to the broker failed ");
    document.getElementById("status").innerHTML =
      "Connection to the broker failed :(";
    setTimeout(MQTTconnect, reconnectTimeout);
  }

  function MQTTconnect() {
    console.log("connecting to broker at ", host, ":", port);
    document.getElementById("status").innerHTML = "Connecting to broker.....";
    mqtt = new Paho.MQTT.Client(host, port, "clientjs"); //!!Note -> host doesn't accept ip address as a parameter
    var options = {
      useSSL: true,
      timeout: 5,
      onSuccess: onConnect,
      onFailure: onFailure,
    };
    mqtt.connect(options);
  }

  MQTTconnect();
};
