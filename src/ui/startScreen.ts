import gsap from 'gsap';
import { getUiRoot, removeFromUiRoot } from './domRoot';
import { StartScreenOptions, UiOverlayHandle } from './uiTypes';

type LobbyPanel = 'controls' | 'about';

export function createStartScreen(options: StartScreenOptions): UiOverlayHandle {
  const root = getUiRoot();
  const element = document.createElement('section');
  element.className = 'start-screen lobby-screen';
  element.innerHTML = `
    <div class="lobby-backdrop" aria-hidden="true"></div>
    <div class="lobby-glow lobby-glow-primary" aria-hidden="true"></div>
    <div class="lobby-glow lobby-glow-danger" aria-hidden="true"></div>

    <button class="lobby-hotspot lobby-start-button" type="button" aria-label="开始训练">
      <span>开始训练</span>
    </button>
    <button class="lobby-hotspot lobby-info-button" type="button" aria-label="查看操作说明">
      <span>操作说明</span>
    </button>
    <button class="lobby-hotspot lobby-about-button" type="button" aria-label="查看关于信息">
      <span>关于</span>
    </button>

    <div class="lobby-status" aria-live="polite">
      <span class="lobby-status-icon">▸</span>
      <span>训练营环境正常 · 鹅 AI 追击系统已激活</span>
    </div>

    <aside class="lobby-side-panel" aria-label="操作说明">
      <strong>操作说明</strong>
      <span><kbd>W</kbd><kbd>Space</kbd>跳跃</span>
      <span><kbd>空中再跳</kbd>二段跳</span>
      <span><kbd>S</kbd><kbd>↓</kbd>下蹲</span>
      <span><kbd>R</kbd>重开</span>
    </aside>

    <div class="lobby-modal" role="dialog" aria-modal="true" aria-hidden="true">
      <button class="lobby-modal-scrim" type="button" aria-label="关闭弹窗"></button>
      <section class="lobby-modal-card" tabindex="-1">
        <button class="lobby-modal-close" type="button" aria-label="关闭">×</button>
        <div class="lobby-modal-content"></div>
      </section>
    </div>
  `;
  root.append(element);

  const startButton = element.querySelector<HTMLButtonElement>('.lobby-start-button');
  const controlsButton = element.querySelector<HTMLButtonElement>('.lobby-info-button');
  const aboutButton = element.querySelector<HTMLButtonElement>('.lobby-about-button');
  const modal = element.querySelector<HTMLElement>('.lobby-modal');
  const modalCard = element.querySelector<HTMLElement>('.lobby-modal-card');
  const modalContent = element.querySelector<HTMLElement>('.lobby-modal-content');
  const closeButtons = element.querySelectorAll<HTMLButtonElement>('.lobby-modal-close, .lobby-modal-scrim');

  const openPanel = (panel: LobbyPanel) => {
    if (!modal || !modalCard || !modalContent) {
      return;
    }

    modalContent.innerHTML =
      panel === 'controls'
        ? `
          <p class="lobby-modal-kicker">Training Manual</p>
          <h2>操作说明</h2>
          <div class="lobby-control-grid">
            <span><kbd>W</kbd><kbd>Space</kbd><strong>跳跃</strong></span>
            <span><kbd>空中再跳</kbd><strong>二段跳</strong></span>
            <span><kbd>S</kbd><kbd>↓</kbd><strong>下蹲</strong></span>
            <span><kbd>R</kbd><strong>重开</strong></span>
          </div>
          <p>收集灵感晶体，避开数据裂缝和追击鹅影，尽量把压力值维持在安全区间。</p>
        `
        : `
          <p class="lobby-modal-kicker">About</p>
          <h2>鹅影回廊</h2>
          <p>Tcamp 逃亡测试的训练大厅已接入互动系统。点击“开始训练”或按 Space 进入跑酷关卡。</p>
          <p>企鹅学员需要在未来训练营中完成跳跃、二段跳、下蹲和收集挑战，摆脱鹅 AI 的追击。</p>
        `;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    gsap.fromTo(
      modalCard,
      { autoAlpha: 0, y: 20, scale: 0.96 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: 'power3.out' },
    );
    modalCard.focus();
  };

  const closePanel = () => {
    if (!modal || !modalCard) {
      return;
    }

    gsap.to(modalCard, {
      autoAlpha: 0,
      y: 12,
      scale: 0.98,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
      },
    });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closePanel();
      return;
    }

    if (event.key.toLowerCase() === 'i') {
      openPanel('controls');
      return;
    }

    if (event.key.toLowerCase() === 'a') {
      openPanel('about');
    }
  };

  startButton?.addEventListener('click', options.onStart);
  controlsButton?.addEventListener('click', () => openPanel('controls'));
  aboutButton?.addEventListener('click', () => openPanel('about'));
  closeButtons.forEach((button) => button.addEventListener('click', closePanel));
  window.addEventListener('keydown', onKeyDown);

  element.querySelectorAll<HTMLElement>('.lobby-hotspot').forEach((button) => {
    button.addEventListener('mouseenter', () => gsap.to(button, { scale: 1.035, duration: 0.18 }));
    button.addEventListener('mouseleave', () => gsap.to(button, { scale: 1, duration: 0.18 }));
  });

  gsap.fromTo(
    element.querySelectorAll('.lobby-hotspot, .lobby-side-panel, .lobby-status'),
    { autoAlpha: 0, y: 14 },
    { autoAlpha: 1, y: 0, duration: 0.58, stagger: 0.06, ease: 'power3.out', delay: 0.12 },
  );

  return {
    element,
    hide: () => {
      element.classList.add('is-hidden');
    },
    destroy: () => {
      window.removeEventListener('keydown', onKeyDown);
      gsap.killTweensOf(element.querySelectorAll('*'));
      removeFromUiRoot(element);
    },
  };
}
