import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store';

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getIcon = () => {
    if (theme === 'system') return <Monitor className="h-4 w-4" />;
    return resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 px-0"
        aria-label="Переключить тему"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        {getIcon()}
        <span className="sr-only">Переключить тему</span>
      </Button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
          role="menu"
        >
          <button
            onClick={() => {
              setTheme('light');
              setIsOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-md px-1.5 py-1 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
            role="menuitem"
          >
            <span className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Светлая
            </span>
            {theme === 'light' && <Check className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              setTheme('dark');
              setIsOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-md px-1.5 py-1 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
            role="menuitem"
          >
            <span className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Тёмная
            </span>
            {theme === 'dark' && <Check className="h-4 w-4" />}
          </button>
          <div className="-mx-1 my-1 h-px bg-border" role="separator" />
          <button
            onClick={() => {
              setTheme('system');
              setIsOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-md px-1.5 py-1 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
            role="menuitem"
          >
            <span className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Системная
            </span>
            {theme === 'system' && <Check className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
