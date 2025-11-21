
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

    const OPEN_CLASSES = ['drawer-open', 'draw-open'];
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



/* Formulário de Contato do projeto*/
(() => {
  const init = () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const nameEl = form.querySelector('#name');
    const emailEl = form.querySelector('#email');
    const msgEl = form.querySelector('#message');
    const statusEl = document.getElementById('contact-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    const setStatus = (text, type = 'info') => {
      if (!statusEl) return;
      statusEl.textContent = text;
      statusEl.className = type;
    };

    const clearInvalid = (el) => {
      el.removeAttribute('aria-invalid');
      el.classList.remove('is-invalid');
    };
    const markInvalid = (el) => {
      el.setAttribute('aria-invalid', 'true');
      el.classList.add('is-invalid');
    };
    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

    const validate = () => {
      let ok = true;
      clearInvalid(nameEl); clearInvalid(emailEl); clearInvalid(msgEl);

      if (!nameEl.value.trim() || nameEl.value.trim().length < 2) {
        ok = false; markInvalid(nameEl);
      }
      if (!isEmail(emailEl.value.trim())) {
        ok = false; markInvalid(emailEl);
      }
      if (!msgEl.value.trim() || msgEl.value.trim().length < 10) {
        ok = false; markInvalid(msgEl);
      }
      if (!ok) setStatus('Verifique os campos destacados.', 'error');
      return ok;
    };

    nameEl.addEventListener('blur', () => { if (nameEl.value.trim().length >= 2) clearInvalid(nameEl); });
    emailEl.addEventListener('blur', () => { if (isEmail(emailEl.value.trim())) clearInvalid(emailEl); });
    msgEl.addEventListener('blur', () => { if (msgEl.value.trim().length >= 10) clearInvalid(msgEl); });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate()) {
        (form.querySelector('.is-invalid') || nameEl).focus();
        return;
      }

      const payload = {
        name: nameEl.value.trim(),
        email: emailEl.value.trim(),
        message: msgEl.value.trim(),
        sentAt: new Date().toISOString()
      };

      submitBtn.disabled = true;
      setStatus('Enviando...', 'pending');

      try {
        if (form.action) {
          const res = await fetch(form.action, {
            method: (form.method || 'POST').toUpperCase(),
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Falha no envio');
        } else {
          const key = 'starbound-rank:contact';
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          list.push(payload);
          localStorage.setItem(key, JSON.stringify(list));
          await new Promise(r => setTimeout(r, 600));
        }

        setStatus('Mensagem enviada com sucesso. Obrigado pelo contato!', 'success');
        form.reset();
      } catch (err) {
        console.error(err);
        setStatus('Não foi possível enviar agora. Tente novamente mais tarde.', 'error');
      } finally {
        submitBtn.disabled = false;
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();