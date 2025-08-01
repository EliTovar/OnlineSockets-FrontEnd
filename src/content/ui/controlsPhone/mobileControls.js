
export function setupTouchControls(controller) {
  const map = {
    'btn-up': 'w',
    'btn-down': 's',
    'btn-left': 'a',
    'btn-right': 'd',
    'btn-jump': 'space'
  };

  Object.entries(map).forEach(([id, key]) => {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      controller.keys[key] = true;
      if (key === 'space' && !controller.isJumping) controller.jump();
    });

    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (key !== 'space') controller.keys[key] = false;
    });
  });
}
