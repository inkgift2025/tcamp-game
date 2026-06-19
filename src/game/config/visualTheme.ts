import Phaser from 'phaser';

export const theme = {
  nightBlue: 0x07143a,
  mainBlue: 0x1d6bff,
  cyan: 0x4debff,
  paleSky: 0xbdefff,
  purple: 0x6c4dff,
  warningOrange: 0xff9a3d,
  dangerRed: 0xff4d6d,
  white: 0xf8fbff,
  ink: 0x020714,
};

export const cssTheme = {
  nightBlue: '#07143A',
  mainBlue: '#1D6BFF',
  cyan: '#4DEBFF',
  paleSky: '#BDEFFF',
  purple: '#6C4DFF',
  warningOrange: '#FF9A3D',
  dangerRed: '#FF4D6D',
  white: '#F8FBFF',
};

export function colorString(color: number): string {
  return Phaser.Display.Color.IntegerToColor(color).rgba;
}
