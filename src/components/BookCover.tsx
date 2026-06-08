import { Book } from '../types';

interface BookCoverProps {
  book: Book;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hoverEffect?: boolean;
}

export default function BookCover({ book, size = 'md', hoverEffect = true }: BookCoverProps) {
  const { title, subtitle, coverImage, genre } = book;

  // Sizing mapping
  const sizeClasses = {
    sm: 'w-24 h-36 text-xs',
    md: 'w-40 h-60 text-sm',
    lg: 'w-56 h-84 text-base',
    xl: 'w-64 h-96 text-lg',
  };

  // Determine elegant procedural backdrop colors based on genres
  const getProceduralStyles = (titleStr: string, genreStr: string) => {
    const genreLower = genreStr.toLowerCase();
    let bgGradient = 'from-amber-900 via-amber-950 to-stone-950';
    let borderColor = 'border-amber-400/40 text-amber-100';
    let accentColor = 'bg-amber-500/10 text-amber-400';
    let labelColor = 'text-amber-200';

    if (genreLower.includes('comedia') || genreLower.includes('patio') || genreLower.includes('enredo') || genreLower.includes('humor') || genreLower.includes('divertido')) {
      bgGradient = 'from-sky-400 via-rose-400 to-amber-300';
      borderColor = 'border-white/45 text-rose-950';
      accentColor = 'bg-white/40 text-rose-900 font-bold';
      labelColor = 'text-stone-800/75';
    } else if (genreLower.includes('histór')) {
      bgGradient = 'from-slate-900 via-slate-950 to-stone-950';
      borderColor = 'border-amber-500/30 text-amber-200';
      accentColor = 'bg-amber-500/10 text-amber-300';
      labelColor = 'text-yellow-100/70';
    } else if (genreLower.includes('intriga') || genreLower.includes('misterio') || genreLower.includes('thrill')) {
      bgGradient = 'from-rose-950 via-red-950 to-stone-950';
      borderColor = 'border-red-500/30 text-rose-200';
      accentColor = 'bg-rose-500/10 text-rose-400';
      labelColor = 'text-rose-200/60';
    } else if (genreLower.includes('contempor')) {
      bgGradient = 'from-teal-900 via-emerald-950 to-stone-950';
      borderColor = 'border-teal-400/30 text-teal-200';
      accentColor = 'bg-emerald-500/10 text-emerald-400';
      labelColor = 'text-emerald-100/70';
    } else {
      // Use name characters to seed a nice gradient
      const codeSum = titleStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const index = codeSum % 4;
      if (index === 0) bgGradient = 'from-purple-900 via-indigo-950 to-black';
      if (index === 1) bgGradient = 'from-stone-800 via-stone-900 to-stone-950';
      if (index === 2) bgGradient = 'from-cyan-900 via-sky-950 to-neutral-950';
      if (index === 3) bgGradient = 'from-amber-900 via-stone-900 to-zinc-950';
    }

    return { bgGradient, borderColor, accentColor, labelColor };
  };

  const { bgGradient, borderColor, accentColor, labelColor } = getProceduralStyles(title, genre);

  return (
    <div
      id={`book-cover-${book.id}`}
      className={`relative rounded-sm shadow-xl overflow-hidden group select-none ${
        sizeClasses[size]
      } ${
        hoverEffect ? 'transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:rotate-1' : ''
      }`}
      style={{ perspective: '1000px' }}
    >
      {/* 3D Spine effect overlay */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/50 via-white/10 to-transparent z-20 pointer-events-none" />
      {/* Right boundary shading for depth */}
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-black/20 z-20 pointer-events-none" />
      {/* Bottom boundary page stack effect */}
      <div className="absolute bottom-0 left-3 right-1 h-0.5 bg-neutral-200 border-t border-neutral-300 z-10 pointer-events-none opacity-40" />

      {coverImage ? (
        // RENDER PHYSICAL PORTADA
        <div className="w-full h-full relative z-10">
          <img
            src={coverImage}
            alt={`Portada de ${title}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fail-safe to procedural template if URL breaks or doesn't load
              const target = e.currentTarget;
              target.style.display = 'none';
              const placeholder = document.getElementById(`book-procedural-fallback-${book.id}`);
              if (placeholder) {
                placeholder.classList.remove('hidden');
              }
            }}
          />
          {/* Subtle glossy overlay on image covers */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/10 opacity-60 z-15" />
        </div>
      ) : null}

      {/* RENDER PROCEDURAL PORTADA TEMPLATE (Fallback or Primary) */}
      <div
        id={`book-procedural-fallback-${book.id}`}
        className={`absolute inset-0 bg-gradient-to-b ${bgGradient} border p-4 flex flex-col justify-between text-center ${
          coverImage ? 'hidden' : 'z-10'
        }`}
      >
        {/* Intricate literary vector borders */}
        <div className={`absolute inset-2 border ${borderColor} rounded-sm pointer-events-none`} />
        
        {/* Genre & Designators */}
        <div className="pt-2 z-10">
          <span className={`inline-block px-1.5 py-0.5 text-[8px] tracking-widest uppercase rounded font-mono ${accentColor}`}>
            {genre}
          </span>
        </div>

        {/* Title and Author Grouping */}
        <div className="my-auto z-10 px-2 flex flex-col items-center gap-2">
          <h4 className="font-serif font-semibold tracking-wide text-white leading-tight drop-shadow-md text-ellipsis overflow-hidden max-h-[3.5rem]">
            {title}
          </h4>
          
          {subtitle && size !== 'sm' && (
            <p className={`text-[9px] italic line-clamp-2 ${labelColor}`}>
              {subtitle}
            </p>
          )}

          <div className="w-6 h-px bg-yellow-400/50 my-1 font-mono" />
        </div>

        {/* Pseudo Author Title */}
        <div className="pb-2 z-10">
          <p className="font-serif text-[10px] uppercase font-bold tracking-widest text-amber-400 drop-shadow">
            Lola Woods
          </p>
          <span className="text-[8px] text-zinc-400 tracking-wider">Woods Editor</span>
        </div>
      </div>
    </div>
  );
}
