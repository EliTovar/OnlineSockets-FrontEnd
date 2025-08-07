// src/ui/dropdowns.js

// Lista de dropdowns: cada uno con botón, contenido y su contenedor principal
const dropdowns = [
  {
    buttonId: 'toggleMenuBtn',
    contentId: 'menuContent',
    wrapperId: 'menuDropdown',
  },
  {
    buttonId: 'toggleKeysBtn',
    contentId: 'keysText',
    wrapperId: 'helpDropdown',
  },
];

// Función de inicialización
export function initDropdowns() {
  const dropdownElements = dropdowns.map(({ buttonId, contentId, wrapperId }) => ({
    button: document.getElementById(buttonId),
    content: document.getElementById(contentId),
    wrapper: document.getElementById(wrapperId),
  }));

  dropdownElements.forEach(({ button, content, wrapper }) => {
    if (!button || !content || !wrapper) return;

    button.addEventListener('click', (event) => {
      event.stopPropagation();

      dropdownElements.forEach(({ content: otherContent }) => {
        if (otherContent !== content) {
          otherContent.classList.add('opacity-0', 'max-h-0', 'pointer-events-none');
        }
      });

      content.classList.toggle('opacity-0');
      content.classList.toggle('max-h-0');
      content.classList.toggle('pointer-events-none');
    });
  });

  document.addEventListener('click', (event) => {
    dropdownElements.forEach(({ wrapper, content }) => {
      if (!wrapper.contains(event.target)) {
        content.classList.add('opacity-0', 'max-h-0', 'pointer-events-none');
      }
    });
  });
}
