'use client';
import { Badge } from '../ui/badge';

function RepetitiveWords({
  title,
  icon,
  words,
}: {
  title: string;
  icon: React.ReactNode;
  words: string[];
}) {
  return (
    <div>
      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
        <span className="text-primary">{icon}</span> {title}
      </h4>
      {words.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {words.map((word, index) => (
            <Badge key={index} variant="secondary">
              {word}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">None found.</p>
      )}
    </div>
  );
}

export default RepetitiveWords;
