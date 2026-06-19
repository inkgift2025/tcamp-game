import Phaser from 'phaser';
import { balanceConfig } from '../config/balanceConfig';

export class PressureSystem {
  private value = 0;

  reset(): void {
    this.value = 0;
  }

  getValue(): number {
    return this.value;
  }

  getRatio(): number {
    return this.value / balanceConfig.pressure.max;
  }

  add(amount: number): number {
    this.value = Phaser.Math.Clamp(this.value + amount, 0, balanceConfig.pressure.max);
    return this.value;
  }

  isCritical(): boolean {
    return this.value >= balanceConfig.pressure.max;
  }
}
