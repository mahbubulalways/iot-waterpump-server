export interface ISensorInfo {
  soilMoistureStart: number;
  soilMoistureEnd: number;

  temperatureStart: number;
  temperatureEnd: number;

  humidityStart: number;
  humidityEnd: number;

  waterLevelStart: number;
  waterLevelEnd: number;

  motorStart: Date;
  motorOff: Date;
}
