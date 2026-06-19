import gsap from 'gsap';
import { getUiRoot, removeFromUiRoot } from './domRoot';
import { ResultScreenOptions, UiOverlayHandle } from './uiTypes';

export function createResultScreen(options: ResultScreenOptions): UiOverlayHandle {
  const root = getUiRoot();
  const element = document.createElement('section');
  element.className = `result-screen result-screen-${options.outcome}`;
  const isSuccess = options.outcome === 'success';
  element.innerHTML = `
    <div class="result-card">
      <p class="ui-kicker">${isSuccess ? 'Test Complete' : 'Pressure Critical'}</p>
      <h1>${isSuccess ? '你完成了测试' : '别回头！鹅追上来了'}</h1>
      <p class="result-message">${isSuccess ? 'G-00SE 暂停追击，训练营出口已解锁。' : '测试未通过，但作品仍可继续提交。'}</p>
      <div class="result-score">${options.score}</div>
      <div class="result-grid">
        <span>存活时间 <strong>${options.seconds.toFixed(1)}s</strong></span>
        <span>最高分 <strong>${options.best}</strong></span>
        <span>能量球 <strong>${options.energyOrbs}</strong></span>
        <span>灵感碎片 <strong>${options.inspirationShards}</strong></span>
      </div>
      <button class="primary-ui-button" type="button">${isSuccess ? '再次测试' : '重新开始'}</button>
    </div>
  `;
  root.append(element);

  const button = element.querySelector<HTMLButtonElement>('.primary-ui-button');
  button?.addEventListener('click', options.onRestart);

  gsap.fromTo(
    element.querySelector('.result-card'),
    { autoAlpha: 0, y: 28, scale: 0.96 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.4)' },
  );

  return {
    element,
    hide: () => {
      element.classList.add('is-hidden');
    },
    destroy: () => {
      gsap.killTweensOf(element.querySelectorAll('*'));
      removeFromUiRoot(element);
    },
  };
}
