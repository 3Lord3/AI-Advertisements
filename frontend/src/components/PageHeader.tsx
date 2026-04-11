import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  backLink?: string;
  onBackClick?: () => void;
}

export function PageHeader({ title, backLink, onBackClick }: PageHeaderProps) {
  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    }
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {backLink ? (
            <Link to={backLink}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
      </div>
    </header>
  );
}