/// <reference types="web-bluetooth" />

import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  public DEVICE_NAME = 'RoomLight';
  public SERVICE_UUID = '00000000-0000-0000-0000-00000cacce00'.toLowerCase();
  public CHARACTERISTIC_UUID =
    '00000000-0000-0000-0000-00000000000a'.toLowerCase();

  public bluetoothSupported = true;
  public status: '0' | '1' = '0';

  private _server: BluetoothRemoteGATTServer | null = null;
  private _characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  get server() {
    return this._server;
  }

  public async connect() {
    this.checkBluetoothSupport();

    navigator.bluetooth
      .requestDevice({
        filters: [{ name: this.DEVICE_NAME }],
        optionalServices: [this.SERVICE_UUID],
      })
      .then((device: BluetoothDevice) => {
        console.debug(`Successfully paired with ${device.name}`);

        device.addEventListener('gattserverdisconnected', this.onDisconnected);

        if (device.gatt) {
          return device.gatt.connect();
        } else {
          throw new Error(`No GATT server found on device ${device.name}`);
        }
      })
      .then((server: BluetoothRemoteGATTServer) => {
        console.debug(
          `Successfully connected to GATT server on ${server.device.name}`
        );

        this._server = server;
        return server.getPrimaryService(this.SERVICE_UUID);
      })
      .then((service: BluetoothRemoteGATTService) => {
        console.debug(`Succesfully found GATT Service UUID: ${service.uuid}`);

        return service.getCharacteristic(this.CHARACTERISTIC_UUID);
      })
      .then((characteristic: BluetoothRemoteGATTCharacteristic) => {
        console.debug(
          `Succesfully found GATT Characteristic UUID: ${characteristic.uuid}`
        );

        this._characteristic = characteristic;
        return characteristic.readValue();
      })
      .then((value: DataView) => {
        this.status = value.getInt8(0).toString() as '0' | '1';
      })
      .catch((error) => console.error(error));
  }

  public async disconnect() {
    this.checkBluetoothSupport();

    if (this._server) {
      await this._server.disconnect();
      console.debug(`Succesfully disconnected`);

      this._server = null;
      this._characteristic = null;
      return;
    }

    console.debug(`No GATT server connected`);
  }

  public onDisconnected() {
    if (this._server) {
      console.debug(`GATT server disconnected`);

      this._server = null;
      this._characteristic = null;
      return;
    }

    console.debug(`No GATT server connected`);
  }

  public async read() {
    this.checkBluetoothSupport();

    if (this._characteristic) {
      let value = await this._characteristic.readValue();
      this.status = value.getInt8(0).toString() as '0' | '1';
      return;
    }

    console.debug('No GATT characteristic found');
  }

  public async toggle() {
    this.checkBluetoothSupport();

    if (this._characteristic) {
      let writeValue = this.status === '0' ? '1' : '0';
      await this._characteristic.writeValue(
        Uint8Array.of(parseInt(writeValue))
      );

      await this.read();
      return;
    }

    console.debug('No GATT characteristic found');
  }

  private checkBluetoothSupport() {
    if (!navigator.bluetooth?.requestDevice) {
      this.bluetoothSupported = false;
      alert(
        'Your device does not support the Web Bluetooth API. Try again on Chrome on Desktop or Android!'
      );
    }
    return;
  }

  ngOnInit(): void {
    initFlowbite();
  }
}
