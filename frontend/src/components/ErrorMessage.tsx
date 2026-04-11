import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  message?: string;
  linkTo?: string;
}

export function ErrorMessage({ message = 'Произошла ошибка', linkTo = '/ads' }: ErrorMessageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-destructive">{message}</p>
      <Link to={linkTo}>
        <Button variant="outline">Вернуться к списку</Button>
      </Link>
    </div>
  );
}