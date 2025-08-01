import { useEffect } from 'react';

export const useKeyboardNavigation = () => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Escape key - close modals, clear focus
      if (event.key === 'Escape') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
        
        // Close any open dropdowns or modals
        const openDropdowns = document.querySelectorAll('[data-dropdown-open="true"]');
        openDropdowns.forEach(dropdown => {
          dropdown.setAttribute('data-dropdown-open', 'false');
        });
        
        // Dispatch custom escape event for components to handle
        document.dispatchEvent(new CustomEvent('escape-pressed'));
      }

      // Tab navigation enhancement
      if (event.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          // Trap focus within modal if open
          const modal = document.querySelector('[role="dialog"]:not([hidden])');
          if (modal) {
            const modalFocusable = modal.querySelectorAll(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            
            if (modalFocusable.length > 0) {
              const firstModalElement = modalFocusable[0];
              const lastModalElement = modalFocusable[modalFocusable.length - 1];
              
              if (event.shiftKey && document.activeElement === firstModalElement) {
                event.preventDefault();
                lastModalElement.focus();
              } else if (!event.shiftKey && document.activeElement === lastModalElement) {
                event.preventDefault();
                firstModalElement.focus();
              }
            }
            return;
          }

          // Normal tab navigation
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }

      // Enter key - activate buttons/links when focused
      if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'BUTTON' || activeElement.role === 'button')) {
          event.preventDefault();
          activeElement.click();
        }
      }

      // Arrow keys for dropdown/menu navigation
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.getAttribute('role') === 'menuitem') {
          event.preventDefault();
          
          const menu = activeElement.closest('[role="menu"]');
          if (menu) {
            const menuItems = menu.querySelectorAll('[role="menuitem"]');
            const currentIndex = Array.from(menuItems).indexOf(activeElement);
            
            let nextIndex;
            if (event.key === 'ArrowDown') {
              nextIndex = (currentIndex + 1) % menuItems.length;
            } else {
              nextIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
            }
            
            menuItems[nextIndex].focus();
          }
        }
      }

      // Space key for checkbox/radio toggle
      if (event.key === ' ') {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.type === 'checkbox' || activeElement.type === 'radio')) {
          event.preventDefault();
          activeElement.click();
        }
      }

      // Ctrl/Cmd + K for search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="поиск"], input[placeholder*="search"]');
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Ctrl/Cmd + S for save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        const saveButton = document.querySelector('button[aria-label*="сохранить"], button[aria-label*="save"], button:contains("Сохранить")');
        if (saveButton && !saveButton.disabled) {
          saveButton.click();
        }
      }
    };

    // Focus management for accessibility
    const handleFocusIn = (event) => {
      // Add visual focus indicator if not using mouse
      if (!event.target.matches(':hover')) {
        event.target.classList.add('keyboard-focus');
      }
    };

    const handleFocusOut = (event) => {
      event.target.classList.remove('keyboard-focus');
    };

    // Mouse usage detection
    const handleMouseDown = () => {
      document.body.classList.add('using-mouse');
      document.body.classList.remove('using-keyboard');
    };

    const handleKeyboardUsage = () => {
      document.body.classList.add('using-keyboard');
      document.body.classList.remove('using-mouse');
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyboardUsage);

    // Add CSS for keyboard focus indicators
    const style = document.createElement('style');
    style.textContent = `
      .using-mouse *:focus {
        outline: none !important;
      }
      
      .using-keyboard *:focus,
      .keyboard-focus {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }
      
      .using-keyboard button:focus,
      .using-keyboard input:focus,
      .using-keyboard select:focus,
      .using-keyboard textarea:focus {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyboardUsage);
      document.head.removeChild(style);
    };
  }, []);

  // Helper functions for components
  return {
    // Focus the first focusable element in a container
    focusFirst: (container) => {
      const firstFocusable = container.querySelector(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (firstFocusable) {
        firstFocusable.focus();
      }
    },

    // Focus the last focusable element in a container
    focusLast: (container) => {
      const focusableElements = container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const lastFocusable = focusableElements[focusableElements.length - 1];
      if (lastFocusable) {
        lastFocusable.focus();
      }
    },

    // Check if an element is focusable
    isFocusable: (element) => {
      return element.matches(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    },

    // Get all focusable elements in a container
    getFocusableElements: (container) => {
      return container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    }
  };
};