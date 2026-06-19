import { GAME_HEIGHT, GAME_WIDTH } from '../game/config/gameConfig';

let root: HTMLDivElement | undefined;
let resizeHandler: (() => void) | undefined;

export function getUiRoot(): HTMLDivElement {
  if (root) {
    return root;
  }

  root = document.createElement('div');
  root.className = 'game-ui-root';
  document.body.append(root);

  resizeHandler = () => {
    const scale = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
    root?.style.setProperty('--ui-scale', String(scale));
  };
  resizeHandler();
  window.addEventListener('resize', resizeHandler);

  return root;
}

export function removeFromUiRoot(element: HTMLElement): void {
  element.remove();
  if (!root || root.childElementCount > 0) {
    return;
  }

  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
  }
  root.remove();
  root = undefined;
  resizeHandler = undefined;
}
