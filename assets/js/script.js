// ...existing code...
(() => {
  const ready = (fn) =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn)
      : fn();

  ready(() => {
    const body = document.body;
    const burger = document.querySelector('.hamburger');
    const drawer = document.getElementById('sideMenu') || document.querySelector('.drawer');
    if (!burger || !drawer) return;

    if (!drawer.id) drawer.id = 'sideMenu';

    const OPEN_CLASSES = ['drawer-open', 'draw-open']; // compat
    const isOpen = () => OPEN_CLASSES.some(c => body.classList.contains(c));
    const addOpen = () => OPEN_CLASSES.forEach(c => body.classList.add(c));
    const removeOpen = () => OPEN_CLASSES.forEach(c => body.classList.remove(c));

    burger.setAttribute('aria-controls', drawer.id);
    burger.setAttribute('aria-expanded', String(isOpen()));
    drawer.setAttribute('aria-hidden', String(!isOpen()));
    drawer.setAttribute('role', 'dialog');
    drawer.hidden = !isOpen();

    let lastFocused = null;

    const getFocusable = (root) =>
      Array.from(
        root.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), details, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => el.offsetParent !== null || el === document.activeElement);

    const trapFocus = (e) => {
      if (!isOpen() || e.key !== 'Tab') return;
      const focusables = getFocusable(drawer);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };

    const onDocClick = (e) => {
      if (!isOpen()) return;
      const t = e.target;
      if (!drawer.contains(t) && !burger.contains(t)) close();
    };

    const onKey = (e) => {
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
    };

    function open() {
      if (isOpen()) return;
      lastFocused = document.activeElement;
      addOpen();
      body.style.overflow = 'hidden';
      burger.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      drawer.hidden = false;

      const focusables = getFocusable(drawer);
      (focusables[0] || drawer).focus({ preventScroll: true });

      document.addEventListener('keydown', trapFocus, true);
      document.addEventListener('keydown', onKey, true);
      document.addEventListener('mousedown', onDocClick, true);
      document.addEventListener('touchstart', onDocClick, { passive: true, capture: true });
    }

    function close() {
      if (!isOpen()) return;
      removeOpen();
      body.style.overflow = '';
      burger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      drawer.hidden = true;

      document.removeEventListener('keydown', trapFocus, true);
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('mousedown', onDocClick, true);
      document.removeEventListener('touchstart', onDocClick, true);

      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus({ preventScroll: true });
      } else {
        burger.focus({ preventScroll: true });
      }
    }

    burger.addEventListener('click', (e) => {
      e.preventDefault();
      isOpen() ? close() : open();
    });

    drawer.addEventListener('click', (e) => {
      if (e.target.closest('a, button[data-close-drawer]')) close();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && isOpen()) close();
    });

    if (isOpen()) {
      burger.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      drawer.hidden = false;
    }
  });
})();