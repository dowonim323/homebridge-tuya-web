import { CharacteristicGetCallback } from "homebridge";
import { TuyaWebCharacteristic } from "./base";
import { BaseAccessory } from "../BaseAccessory";
import { ClimateAccessory } from "../ClimateAccessory";
import { DeviceState } from "../../api/response";

export class CurrentTemperatureCharacteristic extends TuyaWebCharacteristic {
  public static Title = "Characteristic.CurrentTemperature";

  public static HomekitCharacteristic(accessory: BaseAccessory) {
    return accessory.platform.Characteristic.CurrentTemperature;
  }

  public static isSupportedByAccessory(accessory): boolean {
    return accessory.deviceConfig.data.current_temperature;
  }

  public getRemoteValue(callback: CharacteristicGetCallback): void {
    this.accessory
      .getDeviceState()
      .then((data) => {
        this.debug("[GET] %s", data?.current_temperature);
        this.updateValue(data, callback);
      })
      .catch(this.accessory.handleError("GET", callback));
  }

  updateValue(data: DeviceState, callback?: CharacteristicGetCallback): void {
    const currentTemperature = data?.current_temperature
      ? Number(data?.current_temperature) *
        (this.accessory as ClimateAccessory).currentTemperatureFactor
      : undefined;
    if (currentTemperature) {
      this.debug("[UPDATE] %s", currentTemperature);
      this.accessory.setCharacteristic(
        this.homekitCharacteristic,
        currentTemperature,
        !callback
      );
      callback && callback(null, currentTemperature);
    } else {
      callback && callback(new Error("Could not get temperature from data"));
    }
  }
}
