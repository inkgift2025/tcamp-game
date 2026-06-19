import Phaser from 'phaser';
import './styles/global.css';
import './styles/ui.css';
import { gameConfig } from './game/config/gameConfig';
import { BootScene } from './game/scenes/BootScene';
import { StartScene } from './game/scenes/StartScene';
import { RunScene } from './game/scenes/RunScene';
import { ResultScene } from './game/scenes/ResultScene';

new Phaser.Game({
  ...gameConfig,
  scene: [BootScene, StartScene, RunScene, ResultScene],
});
