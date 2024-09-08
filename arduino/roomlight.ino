#include <ArduinoBLE.h>

const int RELAY_PIN = 1;
BLEService switchService("19B10000-E8F2-537E-4F6C-D104768A1214");
BLEUnsignedCharCharacteristic switchCharacteristic("19B10001-E8F2-537E-4F6C-D104768A1214", BLERead|BLEWrite);

void setup() {
  // configure GPIO pins
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  // start serial monitor
  Serial.begin(9600);

  // initialize BLE module
  while(!BLE.begin()){
    Serial.println("Starting BLE failed!");

    // wait 3 seconds and try again
    delay(3000);
  }

  // set Local name
  BLE.setLocalName("RoomLight");
  // set Device name
  BLE.setDeviceName("RoomLight");
  // set advertised service
  BLE.setAdvertisedService(switchService);
  switchService.addCharacteristic(switchCharacteristic);
  BLE.addService(switchService);

  // start advertising
  BLE.advertise();
  Serial.println("Bluetooth device active, waiting for connections...");
}

void loop() {
  // wait for central device
  BLEDevice central = BLE.central();

  if(central){
    // annouce connection on serial monitor
    Serial.print("Connected to central: ");
    Serial.println(central.address());
    
    // write value from central device to RELAY_PIN
    digitalWrite(RELAY_PIN, switchCharacteristic.value());
     
    Serial.println(digitalRead(RELAY_PIN));
    Serial.println(switchCharacteristic.value());
  }
}