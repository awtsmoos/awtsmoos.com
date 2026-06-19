// B"H

/** Mobile editor seal: let the cartoon breathe; timeline becomes a tiny tab. */
export class NLEInteractionSeal {
  static apply(mount) {
    if (!mount) return null;
    const mobile = window.matchMedia?.('(max-width: 820px)').matches || window.innerWidth < 820;
    mount.style.position = 'absolute';
    mount.style.left = mobile ? '12px' : '8px';
    mount.style.right = mobile ? '12px' : '8px';
    mount.style.bottom = 'calc(env(safe-area-inset-bottom, 0px) + 6px)';
    mount.style.zIndex = '80';
    mount.style.pointerEvents = 'auto';
    mount.style.touchAction = 'manipulation';
    if (mobile) this.mobileTab(mount);
    return mount;
  }

  static mobileTab(mount) {
    mount.dataset.open = '0';
    mount.style.maxHeight = '28px';
    mount.style.overflow = 'hidden';
    mount.style.opacity = '0.42';
    mount.style.borderRadius = '18px';
    mount.style.transform = 'translateY(0)';
    mount.querySelectorAll('button').forEach((button, index) => {
      button.style.minHeight = '24px';
      button.style.height = '24px';
      button.style.width = index === 0 ? '48px' : '0px';
      button.style.padding = index === 0 ? '0 8px' : '0';
      button.style.margin = '0';
      if (index > 0) button.style.display = 'none';
    });
    mount.addEventListener('click', () => this.toggle(mount), { passive: true });
  }

  static toggle(mount) {
    const open = mount.dataset.open === '1';
    mount.dataset.open = open ? '0' : '1';
    mount.style.maxHeight = open ? '28px' : '26vh';
    mount.style.opacity = open ? '0.42' : '0.92';
    mount.querySelectorAll('button').forEach((button, index) => {
      button.style.display = open && index > 0 ? 'none' : '';
      button.style.width = open && index > 0 ? '0px' : '';
    });
  }
}
