import gsap from 'gsap';
import { getUiRoot, removeFromUiRoot } from './domRoot';
import { HudOverlayHandle, HudOverlayOptions, HudOverlayState } from './uiTypes';

export function createHudOverlay(options: HudOverlayOptions): HudOverlayHandle {
  const root = getUiRoot();
  const element = document.createElement('section');
  element.className = 'game-hud';
  element.innerHTML = `
    <div class="hud-bar">
      <div class="hud-stat"><span>分数</span><strong data-score>000000</strong></div>
      <div class="hud-stat"><span>时间</span><strong data-time>00:00</strong></div>
      <div class="hud-stat hud-stage"><span>阶段</span><strong data-stage>启动大厅</strong></div>
      <div class="hud-pressure">
        <div class="hud-pressure-label"><span>鹅影压力</span><strong data-pressure-value>0/100</strong></div>
        <div class="pressure-track"><div class="pressure-fill" data-pressure-fill></div></div>
      </div>
      <div class="hud-actions">
        <button type="button" data-pause>暂停</button>
        <button type="button" data-home>大厅</button>
      </div>
    </div>
    <div class="hud-hint">Space / W / ↑ 跳跃 · 空中再按一次二段跳 · S / ↓ 下滑 · R 重开</div>
  `;
  root.append(element);

  const scoreNode = element.querySelector<HTMLElement>('[data-score]');
  const timeNode = element.querySelector<HTMLElement>('[data-time]');
  const stageNode = element.querySelector<HTMLElement>('[data-stage]');
  const pressureValueNode = element.querySelector<HTMLElement>('[data-pressure-value]');
  const pressureFillNode = element.querySelector<HTMLElement>('[data-pressure-fill]');
  const pauseButton = element.querySelector<HTMLButtonElement>('[data-pause]');
  const homeButton = element.querySelector<HTMLButtonElement>('[data-home]');

  pauseButton?.addEventListener('click', options.onTogglePause);
  homeButton?.addEventListener('click', options.onReturnHome);

  gsap.fromTo(element, { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' });

  const updateScore = (score: number) => {
    if (scoreNode) {
      scoreNode.textContent = String(score).padStart(6, '0');
    }
  };

  const updateTime = (time: number) => {
    if (timeNode) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      timeNode.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  };

  const updateStage = (stageName: string) => {
    if (stageNode) {
      stageNode.textContent = stageName;
    }
  };

  const updatePressure = (value: number) => {
    const pressure = Math.max(0, Math.min(100, Math.round(value)));
    if (pressureValueNode) {
      pressureValueNode.textContent = `${pressure}/100`;
    }
    if (pressureFillNode) {
      pressureFillNode.style.width = `${pressure}%`;
    }
    element.classList.toggle('is-danger', pressure >= 75);
  };

  return {
    element,
    update: (state: HudOverlayState) => {
      updateScore(state.score);
      updateTime(state.time);
      updateStage(state.dashActive ? `${state.stageName} 警报` : state.stageName);
      updatePressure(state.pressure);
    },
    updateScore,
    updateTime,
    updateStage,
    updatePressure,
    flash: () => {
      element.classList.remove('is-flashing');
      void element.offsetWidth;
      element.classList.add('is-flashing');
    },
    setPaused: (paused: boolean) => {
      if (pauseButton) {
        pauseButton.textContent = paused ? '继续' : '暂停';
      }
    },
    hide: () => {
      element.classList.add('is-hidden');
    },
    destroy: () => {
      gsap.killTweensOf(element);
      removeFromUiRoot(element);
    },
  };
}
