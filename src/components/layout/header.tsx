import { FlaskConical } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <div className="rounded-md bg-primary p-2 text-primary-foreground">
            <FlaskConical className="h-5 w-5" />
          </div>
          <span className="font-headline">Website Checker</span>
        </Link>
      </div>
    </header>
  );
}
