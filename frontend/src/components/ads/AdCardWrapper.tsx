import { ReactNode } from 'react';

interface AdCardWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * Компонент-обёртка для Card в режиме списка.
 * Обёртка без дополнительных стилей - классы применяются к Card напрямую.
 */
export function AdCardListWrapper({ children, className }: AdCardWrapperProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

/**
 * Компонент-обёртка для Card в режиме сетки.
 * Обёртка без дополнительных стилей - классы применяются к Card напрямую.
 */
export function AdCardGridWrapper({ children, className }: AdCardWrapperProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}