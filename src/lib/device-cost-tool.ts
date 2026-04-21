export const DEVICE_COST_SESSION_KEY = "device-cost-tool:v1";

export const PRESET_DEVICE_TYPES = [
  "电脑",
  "手机",
  "平板",
  "耳机",
  "相机",
  "游戏机",
  "其他"
] as const;

export type DeviceCostCardRecord = {
  id: string;
  name: string;
  deviceType: string;
  purchasePrice: string;
  purchaseDate: string;
  calculated: boolean;
  updatedAt: string;
};
