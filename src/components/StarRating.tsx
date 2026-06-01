import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'keto-site-rating';
const HAS_RATED_KEY = 'keto-user-rated';

export function useSiteRating() {
  const [ratings, setRatings] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
  });
  const [hasRated, setHasRated] = useState(() => localStorage.getItem(HAS_RATED_KEY) === 'true');

  const average = ratings.length > 0
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : null;

  const totalRatings = ratings.length;

  const addRating = (score: number) => {
    if (hasRated) {
      toast.info('You already rated! Thanks for your support 💚');
      return;
    }
    const updated = [...ratings, score];
    setRatings(updated);
    setHasRated(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(HAS_RATED_KEY, 'true');
    toast.success(`Thanks for rating! ⭐ (${score}/5)`);
  };

  return { average, totalRatings, hasRated, addRating };
}

export default function StarRating({ compact }: { compact?: boolean }) {
  const { average, totalRatings, hasRated, addRating } = useSiteRating();
  const [hover, setHover] = useState(0);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1 text-sm text-gray-500">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span>{average || '—'} ({totalRatings} ratings)</span>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h4 className="font-semibold text-gray-900 mb-1">Rate this site</h4>
      <div className="flex items-center justify-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => addRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={`p-1 transition-all duration-150 ${hasRated ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
            disabled={hasRated}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                (hover || hasRated ? star <= (hover || 5) : star <= 0)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      {average && (
        <p className="text-xs text-gray-500 mt-1">
          {average}/5 ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
        </p>
      )}
      {hasRated && (
        <p className="text-xs text-emerald-600 mt-1">✓ You rated this site</p>
      )}
    </div>
  );
}
