/* hier is de basis costum element geschreven voor herbruikbare knoppen in de app
overal in de app krijgen ze dezelde stijl */

class AppButton extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'type', 'variant', 'disabled', 'aria-label']
  }

  connectedCallback() {
    this.render()
  }

  attributeChangedCallback() {
    this.render()
  }

  render() {
    const label = this.getAttribute('label') || ''
    const type = this.getAttribute('type') || 'button'
    const variant = this.getAttribute('variant') || 'default'
    const ariaLabel = this.getAttribute('aria-label') || label
    const disabled = this.hasAttribute('disabled')

    this.innerHTML = `
      <button
        class="app-button app-button--${variant}"
        type="${type}"
        ${ariaLabel ? `aria-label="${ariaLabel}"` : ''}
        ${disabled ? 'disabled' : ''}
      >
        ${label}
      </button>
    `
  }
}

customElements.define('app-button', AppButton)