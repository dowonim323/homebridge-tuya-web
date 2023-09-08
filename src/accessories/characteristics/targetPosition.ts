import {
  Characteristic,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  Formats,
  Units,
} from "homebridge";
import { TuyaWebCharacteristic } from "./base";
import { BaseAccessory } from "../BaseAccessory";
import { DeviceState } from "../../api/response";
import delay from "../../helpers/delay";
import { WindowAccessory } from "../WindowAccessory";

export class TargetPositionCharacteristic extends TuyaWebCharacteristic {
  public static Title = "Characteristic.TargetPosition";

  public static HomekitCharacteristic(accessory: BaseAccessory) {
    return accessory.platform.Characteristic.TargetPosition;
  }

  public setProps(char?: Characteristic): Characteristic | undefined {
    return char?.setProps({
      unit: Units.PERCENTAGE,
      format: Formats.INT,
      minValue: 0,
      maxValue: 100,
      minStep: 100,
    });
  }

  public static isSupportedByAccessory(): boolean {
    return true;
  }

  public getRemoteValue(callback: CharacteristicGetCallback): void {
    const a = <WindowAccessory>this.accessory;
    callback && callback(null, a.target);
  }

  public setRemoteValue(
    homekitValue: CharacteristicValue,
    callback: CharacteristicSetCallback
  ): void {
    const value = (homekitValue as number) === 0 ? 0 : 1;

    const windowAccessory = <WindowAccessory>this.accessory;
    const target = value ? 100 : 0;

    this.debug("Setting targetPosition to %d", target);

    this.accessory
      .setDeviceState("turnOnOff", { value }, value)
      .then(async () => {
        this.debug("[SET] turnOnOff command sent with value %s", value);
        callback();

        this.debug("Setting targetPosition to %d", target);
        windowAccessory.target = target;
        this.accessory.setCharacteristic(
          this.accessory.platform.Characteristic.TargetPosition,
          target,
          true
        );

        windowAccessory.motor = value
          ? this.accessory.platform.Characteristic.PositionState.INCREASING
          : this.accessory.platform.Characteristic.PositionState.DECREASING;
        this.accessory.setCharacteristic(
          this.accessory.platform.Characteristic.PositionState,
          windowAccessory.motor,
          true
        );

        await delay(5000);

        this.debug(
          "Setting currentPosition to %d and positionState to STOPPED",
          target
        );

        windowAccessory.position = target;
        this.accessory.setCharacteristic(
          this.accessory.platform.Characteristic.CurrentPosition,
          windowAccessory.position,
          true
        );

        windowAccessory.motor = this.accessory.platform.Characteristic.PositionState.STOPPED;
        this.accessory.setCharacteristic(
          this.accessory.platform.Characteristic.PositionState,
          this.accessory.platform.Characteristic.PositionState.STOPPED,
          true
        );
      })
      .catch(this.accessory.handleError("SET", callback));
  }

  updateValue(data: DeviceState, callback?: CharacteristicGetCallback): void {
    callback && callback(null, (<WindowAccessory>this.accessory).target);
  }
}
