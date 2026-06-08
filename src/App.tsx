/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import BookCover from './components/BookCover';
import { ChailsoftLogo } from './components/ChailsoftLogo';
import { Book, AuthorEvent, SiteConfig } from './types';
import { 
  BookOpen, 
  Calendar, 
  Mail, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Check, 
  Send, 
  ChevronRight, 
  Upload, 
  LogOut, 
  Star, 
  Info,
  Menu,
  Heart,
  Globe,
  Bell,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

function LolaWoodsSite() {
  const {
    config,
    books,
    events,
    submissions,
    newsletterSignups,
    updateConfig,
    addBook,
    updateBook,
    deleteBook,
    addEvent,
    updateEvent,
    deleteEvent,
    submitContact,
    signupNewsletter,
    deleteSubmission,
    deleteNewsletter,
    toggleSubmissionRead,
    isAdminAuthenticated,
    triggerLogin,
    triggerLogout,
    loading
  } = useApp();

  // Navigation and UI state
  const [activeTab, setActiveTab] = useState<'home' | 'books' | 'bio' | 'events' | 'contact' | 'admin'>('home');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [newGenreName, setNewGenreName] = useState('');

  // Contact form states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);

  // Newsletter states
  const [newsEmail, setNewsEmail] = useState('');
  const [newsSuccess, setNewsSuccess] = useState<string | null>(null);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Admin access states
  const [passcodeInput, setPasscodeInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Admin management states
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [bookForm, setBookForm] = useState<Partial<Book>>({
    title: '', subtitle: '', description: '', synopsis: '', genre: 'Romance Histórico',
    isbn: '', pages: 300, publisher: 'Woods Editorial', publishDate: '', coverImage: '',
    buyLinks: { amazon: '', kobo: '', editorial: '', other: '' }, isFeatured: false, rating: 5, reviews: []
  });

  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [eventForm, setEventForm] = useState<Partial<AuthorEvent>>({
    title: '', date: '', time: '', location: '', description: '', ticketUrl: '', eventType: 'sign'
  });

  const [savingConfig, setSavingConfig] = useState(false);
  const [configForm, setConfigForm] = useState<SiteConfig>({ ...config });
  const [configSuccess, setConfigSuccess] = useState(false);

  // For image upload conversion to Base64
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup visual colors based on db site configuration dynamically
  const themes = {
    gold: {
      primary: 'text-orange-600',
      primaryBg: 'bg-orange-500',
      primaryBgHover: 'hover:bg-orange-600',
      accentBg: 'bg-orange-50/70',
      borderAccent: 'border-orange-200',
      focusRing: 'focus:ring-orange-400',
      badgeBg: 'bg-orange-100 text-orange-700',
      solidHeader: 'from-orange-500 to-rose-500',
      textAccent: 'text-orange-500',
      badgeBorder: 'border-orange-300'
    },
    rose: {
      primary: 'text-pink-600',
      primaryBg: 'bg-pink-500',
      primaryBgHover: 'hover:bg-pink-600',
      accentBg: 'bg-pink-50/70',
      borderAccent: 'border-pink-200',
      focusRing: 'focus:ring-pink-400',
      badgeBg: 'bg-pink-100 text-pink-700',
      solidHeader: 'from-pink-500 to-rose-600',
      textAccent: 'text-pink-500',
      badgeBorder: 'border-pink-300'
    },
    emerald: {
      primary: 'text-teal-600',
      primaryBg: 'bg-teal-500',
      primaryBgHover: 'hover:bg-teal-600',
      accentBg: 'bg-teal-50/70',
      borderAccent: 'border-teal-200',
      focusRing: 'focus:ring-teal-400',
      badgeBg: 'bg-teal-100 text-teal-700',
      solidHeader: 'from-teal-500 to-cyan-600',
      textAccent: 'text-teal-500',
      badgeBorder: 'border-teal-300'
    },
    amber: {
      primary: 'text-amber-600',
      primaryBg: 'bg-amber-500',
      primaryBgHover: 'hover:bg-amber-600',
      accentBg: 'bg-amber-50/70',
      borderAccent: 'border-amber-200',
      focusRing: 'focus:ring-amber-400',
      badgeBg: 'bg-amber-100 text-amber-700',
      solidHeader: 'from-amber-400 to-orange-500',
      textAccent: 'text-amber-500',
      badgeBorder: 'border-amber-300'
    },
    slate: {
      primary: 'text-purple-600',
      primaryBg: 'bg-purple-500',
      primaryBgHover: 'hover:bg-purple-600',
      accentBg: 'bg-purple-50/70',
      borderAccent: 'border-purple-200',
      focusRing: 'focus:ring-purple-400',
      badgeBg: 'bg-purple-100 text-purple-700',
      solidHeader: 'from-purple-500 to-indigo-600',
      textAccent: 'text-purple-500',
      badgeBorder: 'border-purple-300'
    }
  };

  const activeTheme = themes[config.themeColor || 'gold'] || themes.gold;

  // Initialize config form once loaded from db
  React.useEffect(() => {
    setConfigForm({ ...config });
  }, [config]);

  // Handle Cover Art File Upload -> Base64
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1200000) { // Limit to ~1.2MB for indexed database storage limit
      alert("La imagen seleccionada supera el límite recomendado de 1MB. Por favor, cargue un archivo más ligero.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBookForm(prev => ({ ...prev, coverImage: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Contact Inquiry
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactSubject || !contactMessage) {
      alert("Por favor rellene todos los campos de contacto");
      return;
    }
    setContactLoading(true);
    setContactSuccess(null);
    try {
      await submitContact(contactName, contactEmail, contactSubject, contactMessage);
      setContactSuccess("¡Muchas gracias! Tu mensaje ha sido enviado con éxito a Lola Woods. Nos pondremos en contacto contigo lo antes posible.");
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    } catch (err: any) {
      alert(err.message || "No se pudo enviar el mensaje.");
    } finally {
      setContactLoading(false);
    }
  };

  // Submit Newsletter Signup Form
  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsSuccess(null);
    setNewsError(null);
    if (!newsEmail || !newsEmail.includes('@')) {
      setNewsError("Por favor ingrese un correo válido.");
      return;
    }
    try {
      const added = await signupNewsletter(newsEmail);
      if (added) {
        setNewsSuccess("¡Encantados de tenerte! Te has registrado en el boletín informativo oficial de Lola Woods.");
        setNewsEmail('');
      } else {
        setNewsError("Esta dirección de correo ya está registrada en nuestro club literario.");
      }
    } catch (err: any) {
      setNewsError(err.message || "Error al procesar suscripción.");
    }
  };

  // Admin access login passcode check
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const success = await triggerLogin(passcodeInput);
    if (success) {
      setPasscodeInput('');
    } else {
      setLoginError("Código de acceso incorrecto. Por favor, inténtelo de nuevo.");
    }
  };

  // Save modified main config texts of administration
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setConfigSuccess(false);
    try {
      await updateConfig(configForm);
      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || "Error al actualizar la configuración");
    } finally {
      setSavingConfig(false);
    }
  };

  // Create or Update Book Record
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.description || !bookForm.synopsis) {
      alert("Por favor complete los apartados esenciales del libro (Título, descripción y sinopsis).");
      return;
    }

    try {
      if (editingBook) {
        // Edit flow
        const updated: Book = {
          ...editingBook,
          ...(bookForm as Book)
        };
        await updateBook(updated);
        setEditingBook(null);
        setIsAddingBook(false);
      } else {
        // Create new book record
        const id = (bookForm.title || '')
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-'); // make safe ID slug
          
        const newBook: Book = {
          ...(bookForm as Book),
          id: id || 'book_' + Math.random().toString(36).substring(2, 9),
          rating: bookForm.rating || 5,
          reviews: []
        };
        await addBook(newBook);
        setIsAddingBook(false);
      }
      // Reset form
      setBookForm({
        title: '', subtitle: '', description: '', synopsis: '', genre: 'Romance Histórico',
        isbn: '', pages: 300, publisher: 'Woods Editorial', publishDate: '', coverImage: '',
        buyLinks: { amazon: '', kobo: '', editorial: '', other: '' }, isFeatured: false, rating: 5, reviews: []
      });
    } catch (err: any) {
      alert(err.message || "Error al guardar el registro del libro");
    }
  };

  // Prepare Book Form for Editing
  const startEditBook = (book: Book) => {
    setEditingBook(book);
    setBookForm(book);
    setIsAddingBook(true); // opens form panel
  };

  // Create new event
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date || !eventForm.location || !eventForm.description) {
      alert("Por favor rellene los campos obligatorios del evento.");
      return;
    }

    try {
      const id = 'ev_' + Math.random().toString(36).substring(2, 9);
      const newEvent: AuthorEvent = {
        ...(eventForm as AuthorEvent),
        id
      };
      await addEvent(newEvent);
      // Reset Form
      setEventForm({ title: '', date: '', time: '', location: '', description: '', ticketUrl: '', eventType: 'sign' });
      setIsAddingEvent(false);
    } catch (err: any) {
      alert(err.message || "Error al añadir el evento.");
    }
  };

  // Featured books array filter
  const featuredBook = books.find(b => b.isFeatured) || books[0];

  return (
    <div className="min-h-screen font-sans text-neutral-800 bg-neutral-50/60 selection:bg-amber-100 selection:text-amber-900">
      
      {/* -------------------------------------------------------------
          TOP BAR NAVIGATION & MARQUEE TITLE
          ------------------------------------------------------------- */}
      <nav id="navbar" className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
                <Heart className={`h-5 w-5 ${activeTheme.primary} fill-current animate-pulse`} />
                <span className="font-serif text-xl font-bold tracking-widest uppercase">
                  {config.authorPseudonym}
                </span>
              </span>
            </div>

            {/* Desktop Menu links */}
            <div className="hidden md:flex space-x-1 items-center">
              {[
                { label: 'Inicio', tab: 'home' },
                { label: 'Obras', tab: 'books' },
                { label: 'Biografía', tab: 'bio' },
                { label: 'Eventos', tab: 'events' },
                { label: 'Contacto', tab: 'contact' },
              ].map((item) => (
                <button
                  id={`nav-tab-${item.tab}`}
                  key={item.tab}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded ${
                    activeTab === item.tab
                      ? `${activeTheme.primary} bg-neutral-100/80 font-bold`
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                  onClick={() => {
                    setActiveTab(item.tab as any);
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile menu toggle */}
            <div className="flex md:hidden items-center gap-2">
              <button
                id="mobile-menu-toggle"
                className="p-1 text-neutral-500 hover:text-neutral-900"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown list */}
        {mobileMenuOpen && (
          <div id="mobile-drawer" className="md:hidden px-2 pt-2 pb-4 space-y-1 bg-white border-b border-stone-200 shadow-lg">
            {[
              { label: 'Inicio', tab: 'home' },
              { label: 'Obras & Catálogo', tab: 'books' },
              { label: 'Biografía', tab: 'bio' },
              { label: 'Eventos & Firmas', tab: 'events' },
              { label: 'Contacto Directo', tab: 'contact' },
            ].map((item) => (
              <button
                id={`drawer-tab-${item.tab}`}
                key={item.tab}
                className={`block w-full text-left px-4 py-2.5 rounded text-base font-medium ${
                  activeTab === item.tab
                    ? `${activeTheme.primary} bg-neutral-50 font-bold`
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
                onClick={() => {
                  setActiveTab(item.tab as any);
                  setMobileMenuOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* -------------------------------------------------------------
          BODY AND PAGES SWITCHING
          ------------------------------------------------------------- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <RefreshCw className="w-12 h-12 text-stone-400 animate-spin" />
            <p className="text-stone-500 font-serif">Estableciendo conexión la base de datos SQLITE...</p>
          </div>
        ) : (
          <>
            {/* -------------------------------------------------------------
                TAB 1: INICIO (HOME PORTAL EXAMPLE)
                ------------------------------------------------------------- */}
            {activeTab === 'home' && (
              <div id="section-home" className="space-y-16 animate-fade-in duration-300">
                
                {/* Hero Showcase Frame */}
                <div className="relative rounded-2xl bg-gradient-to-br from-neutral-900 via-stone-900 to-amber-950 text-white p-8 md:p-14 overflow-hidden shadow-2xl">
                  {/* Decorative background vectors representing pages */}
                  <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-8 space-y-6">
                      <span className={`inline-block text-xs uppercase tracking-widest font-mono ${activeTheme.textAccent} font-bold`}>
                        {config.tagline}
                      </span>
                      <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-wide drop-shadow-sm">
                        {config.heroHeadline}
                      </h1>
                      <p className="text-neutral-300 text-base md:text-lg max-w-2xl leading-relaxed font-light">
                        {config.heroSubtitle}
                      </p>
                      
                      <div className="pt-4 flex flex-wrap gap-4">
                        <button
                          id="hero-see-catalog-btn"
                          className={`px-6 py-3 rounded-lg text-sm font-semibold tracking-wider uppercase transition-colors shadow-lg ${activeTheme.primaryBg} ${activeTheme.primaryBgHover} text-white`}
                          onClick={() => setActiveTab('books')}
                        >
                          Explorar Catálogo
                        </button>
                        <button
                          id="hero-bio-btn"
                          className="px-6 py-3 rounded-lg text-sm font-semibold tracking-wider uppercase bg-white/10 hover:bg-white/20 border border-white/25 transition-colors text-white"
                          onClick={() => setActiveTab('bio')}
                        >
                          Conocer a Lola
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-4 flex justify-center">
                      {featuredBook ? (
                        <div 
                          className="cursor-pointer flex flex-col items-center gap-3 group"
                          onClick={() => setSelectedBook(featuredBook)}
                        >
                          <BookCover book={featuredBook} size="xl" />
                          <span className="text-yellow-400 text-xs tracking-widest uppercase font-semibold font-mono opacity-80 group-hover:opacity-100 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" /> NOVEDAD DESTACADA
                          </span>
                        </div>
                      ) : (
                        <div className="w-48 h-72 border border-white/10 flex items-center justify-center rounded bg-stone-900 text-zinc-500">
                          Sin libros
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Literary Quote Section */}
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto py-8 px-4 border-y border-neutral-200">
                  <span className="text-neutral-300 font-serif text-5xl leading-none">“</span>
                  <p className="font-serif italic text-2xl md:text-3xl font-medium text-neutral-800 leading-relaxed -mt-3">
                    {config.quote}
                  </p>
                  <p className="text-xs uppercase font-mono text-zinc-500 tracking-widest mt-4">
                    — {config.quoteSource}
                  </p>
                </div>

                {/* Grid Showcase of Novedades / Destacados */}
                <div className="space-y-8">
                  <div className="flex justify-between items-end border-b border-neutral-200 pb-3">
                    <h2 className="font-serif text-3xl font-medium tracking-wide">
                      Últimas Publicaciones
                    </h2>
                    <button
                      id="view-all-books-home-btn"
                      className={`text-sm font-semibold flex items-center gap-1 ${activeTheme.primary} hover:underline`}
                      onClick={() => setActiveTab('books')}
                    >
                      Ver todo el catálogo <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {books.slice(0, 4).map((book) => (
                      <div
                        id={`home-book-card-${book.id}`}
                        key={book.id}
                        className="group flex flex-col items-center text-center bg-white p-4 rounded-xl border border-neutral-200 hover:shadow-xl hover:border-neutral-300 transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedBook(book)}
                      >
                        <div className="mb-4">
                          <BookCover book={book} size="md" />
                        </div>
                        <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-500 bg-neutral-100 px-2 py-0.5 rounded">
                          {book.genre}
                        </span>
                        <h3 className="font-serif font-bold text-neutral-800 text-sm mt-2 leading-snug line-clamp-1 group-hover:text-amber-700 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-neutral-500 text-xs mt-1 italic line-clamp-1">
                          {book.subtitle}
                        </p>
                        <div className="flex gap-0.5 mt-2 justify-center text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < Math.round(book.rating || 5) ? 'fill-current' : 'opacity-25'}`} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Newsletter Club Box */}
                <div className="rounded-xl border border-neutral-200 bg-stone-50 p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                  <div className="flex-1 space-y-3">
                    <h3 className="font-serif text-2xl font-bold">Únete al Club de Lectura de Lola Woods</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      Sigue de cerca los nuevos lanzamientos literarios de Lola Woods. Suscríbete para recibir en tu correo adelantos exclusivos de capítulos, sorteos especiales de portadas firmadas, entrevistas íntimas y notificaciones de firmas en tu ciudad antes que nadie.
                    </p>
                  </div>
                  
                  <div className="w-full md:w-auto min-w-[280px] space-y-2">
                    <form onSubmit={handleNewsletterSignup} className="flex gap-2 w-full">
                      <input
                        id="newsletter-email-input"
                        type="email"
                        placeholder="Tu dirección de correo..."
                        className="flex-grow px-4 py-3 rounded-lg text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        value={newsEmail}
                        onChange={(e) => setNewsEmail(e.target.value)}
                        required
                      />
                      <button
                        id="newsletter-submit-btn"
                        type="submit"
                        className={`px-5 py-3 rounded-lg text-sm font-semibold tracking-wider uppercase transition-colors text-white ${activeTheme.primaryBg} ${activeTheme.primaryBgHover}`}
                      >
                        Unirme
                      </button>
                    </form>
                    {newsSuccess && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium bg-emerald-50 p-2 rounded border border-emerald-100">
                        <Check className="w-3.5 h-3.5 shrink-0" /> {newsSuccess}
                      </p>
                    )}
                    {newsError && (
                      <p className="text-xs text-rose-600 flex items-center gap-1 font-medium bg-rose-50 p-2 rounded border border-rose-100">
                        <X className="w-3.5 h-3.5 shrink-0" /> {newsError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 2: OBRAS & CATÁLOGO
                ------------------------------------------------------------- */}
            {activeTab === 'books' && (
              <div id="section-books" className="space-y-8 animate-fade-in duration-300">
                <div className="text-center space-y-2">
                  <h1 className="font-serif text-4xl font-bold tracking-wide">Bibliografía Oficial</h1>
                  <p className="text-neutral-500 text-sm max-w-xl mx-auto">
                    Sumérgete en universos inolvidables. Novelas de época inspiradas en paisajes salvajes, intrigas románticas contemporáneas y secretos de familia.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center border-b border-neutral-200 pb-4">
                  {['Todos', ...Array.from(new Set(books.map(b => b.genre).filter(Boolean)))].map((g) => {
                    const active = g === selectedCategory;
                    return (
                      <span
                        key={g}
                        onClick={() => setSelectedCategory(g)}
                        className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          active
                            ? `${activeTheme.badgeBg} ${activeTheme.badgeBorder} border shadow-xs scale-102`
                            : 'bg-neutral-100 hover:bg-neutral-200 text-stone-600'
                        }`}
                      >
                        {g}
                      </span>
                    );
                  })}
                </div>

                {books.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500">
                    No hay novelas registradas en este momento. Visite el panel de administración para añadir libros persistentemente.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {books.filter(b => selectedCategory === 'Todos' || b.genre === selectedCategory).map((book) => (
                      <div
                        id={`catalog-book-card-${book.id}`}
                        key={book.id}
                        className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                        onClick={() => setSelectedBook(book)}
                      >
                        <div className="p-5 flex flex-col items-center">
                          <div className="mb-5">
                            <BookCover book={book} size="lg" />
                          </div>
                          
                          <span className={`text-[10px] tracking-wider font-mono font-bold uppercase rounded-md px-2 py-0.5 mt-2 ${activeTheme.badgeBg}`}>
                            {book.genre}
                          </span>
                          
                          <h3 className="font-serif text-lg font-bold text-neutral-800 text-center mt-3 line-clamp-1 group-hover:text-amber-700 transition-colors">
                            {book.title}
                          </h3>
                          
                          {book.subtitle && (
                            <p className="text-neutral-500 text-xs italic text-center mt-1 line-clamp-1">
                              {book.subtitle}
                            </p>
                          )}

                          <p className="text-neutral-600 text-xs text-center mt-3 leading-relaxed line-clamp-3">
                            {book.description}
                          </p>
                        </div>

                        <div className="bg-neutral-50 px-5 py-4 border-t border-neutral-100 flex items-center justify-between">
                          <span className="text-neutral-400 font-mono text-xs">
                            {book.pages ? `${book.pages} págs` : 'Varias'}
                          </span>
                          
                          <span className="text-xs font-bold text-neutral-700 hover:underline inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Ver detalles <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 3: BIOGRAFÍA (ABOUT SECUNDARY)
                ------------------------------------------------------------- */}
            {activeTab === 'bio' && (
              <div id="section-bio" className="space-y-12 animate-fade-in duration-300 max-w-5xl mx-auto">
                <div className="grid md:grid-cols-12 gap-10 items-start">
                  
                  {/* Portrait Column */}
                  <div className="md:col-span-4 flex flex-col items-center gap-4">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-[3/4] w-full max-w-[280px] bg-neutral-900 group">
                      {config.profileImage ? (
                        <img
                          src={config.profileImage}
                          alt="Lola Woods Portrait"
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const placeholder = document.getElementById('bio-img-fallback');
                            if (placeholder) placeholder.classList.remove('hidden');
                          }}
                        />
                      ) : null}

                      {/* Fallback Portrait if empty */}
                      <div
                        id="bio-img-fallback"
                        className={`absolute inset-0 bg-gradient-to-tr from-stone-900 via-rose-950 to-amber-950 flex flex-col items-center justify-center text-center p-6 ${
                          config.profileImage ? 'hidden' : ''
                        }`}
                      >
                        <Heart className="w-12 h-12 text-rose-500 fill-current mb-3 opacity-80 animate-pulse" />
                        <span className="font-serif font-black text-2xl tracking-widest text-amber-100 uppercase">
                          {config.authorPseudonym}
                        </span>
                        <span className="text-xs text-neutral-400 italic mt-1 font-mono">Autora OficiaL</span>
                        <div className="absolute inset-x-2 bottom-2 py-1 text-[9px] font-mono border border-amber-600/30 text-amber-200/50 rounded uppercase tracking-widest">
                          Woods Editorial
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="font-serif font-bold text-lg text-stone-800">{config.authorName}</h3>
                      <p className="text-xs text-zinc-500 tracking-wider uppercase font-mono mt-0.5">Seudónimo Literario</p>
                    </div>

                    <div className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-2 text-xs">
                      <p className="font-semibold text-stone-700 uppercase tracking-widest font-mono border-b pb-1 text-[10px]">Agencia Literaria</p>
                      <p className="font-serif text-[13px] font-bold text-stone-800">{config.agentName}</p>
                      <a href={`mailto:${config.agentContact}`} className={`hover:underline block font-mono text-[11px] ${activeTheme.primary}`}>
                        {config.agentContact}
                      </a>
                    </div>
                  </div>

                  {/* Biography text content */}
                  <div className="md:col-span-8 space-y-6">
                    <span className="text-xs font-mono uppercase tracking-widest bg-stone-100 text-stone-600 px-2 py-1 rounded">
                      La Autora
                    </span>
                    <h1 className="font-serif text-4xl font-bold text-stone-900 leading-tight">
                      {config.bioHeadline}
                    </h1>

                    <div className="w-20 h-1 bg-amber-500 rounded" />

                    <div className="space-y-5 text-neutral-700 text-base md:text-lg leading-relaxed font-light">
                      <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-amber-600 select-none">
                        {config.bioText1}
                      </p>
                      <p>
                        {config.bioText2}
                      </p>
                    </div>

                    {/* Social connection handles */}
                    <div className="pt-6 border-t border-neutral-200 space-y-3">
                      <p className="text-xs uppercase font-semibold text-zinc-500 tracking-widest font-mono">Contacta en Redes Sociales</p>
                      <div className="flex flex-wrap gap-3">
                        {config.socialInstagram && (
                          <a href={config.socialInstagram} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold uppercase font-mono border px-3 py-1.5 rounded-lg bg-white border-neutral-300 hover:bg-neutral-100 transition-colors">
                            Instagram
                          </a>
                        )}
                        {config.socialTwitter && (
                          <a href={config.socialTwitter} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold uppercase font-mono border px-3 py-1.5 rounded-lg bg-white border-neutral-300 hover:bg-neutral-100 transition-colors">
                            Twitter / X
                          </a>
                        )}
                        {config.socialFacebook && (
                          <a href={config.socialFacebook} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold uppercase font-mono border px-3 py-1.5 rounded-lg bg-white border-neutral-300 hover:bg-neutral-100 transition-colors">
                            Facebook
                          </a>
                        )}
                        {config.socialGoodreads && (
                          <a href={config.socialGoodreads} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold uppercase font-mono border px-3 py-1.5 rounded-lg bg-white border-neutral-300 hover:bg-neutral-100 transition-colors">
                            Goodreads
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 4: EVENTOS & FIRMAS
                ------------------------------------------------------------- */}
            {activeTab === 'events' && (
              <div id="section-events" className="space-y-8 animate-fade-in duration-300 max-w-4xl mx-auto">
                <div className="text-center space-y-2">
                  <h1 className="font-serif text-4xl font-bold tracking-wide">Agenda de Encuentros</h1>
                  <p className="text-neutral-500 text-sm max-w-lg mx-auto">
                    Ven a por tu ejemplar firmado de las novelas de Lola Woods y comparte una tarde especial de confidencias y literatura.
                  </p>
                </div>

                {events.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-xl">
                    No hay firmas o eventos organizados actualmente en la agenda. ¡Suscríbete al boletín para recibir avisos de fechas próximamente!
                  </div>
                ) : (
                  <div className="space-y-6">
                    {events.map((ev) => {
                      const typeLabels = {
                        sign: { label: 'Firma de Libros', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
                        fair: { label: 'Feria del Libro', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
                        talk: { label: 'Presentación / Charla', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
                        other: { label: 'Encuentro Especial', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
                      };
                      const type = typeLabels[ev.eventType as keyof typeof typeLabels] || typeLabels.other;

                      // Elegant date format converter
                      const formatEventDate = (dateStr: string) => {
                        try {
                          const dateObj = new Date(dateStr);
                          const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                          return {
                            day: dateObj.getUTCDate(),
                            month: months[dateObj.getUTCMonth()],
                            year: dateObj.getUTCFullYear()
                          };
                        } catch (e) {
                          return { day: '?', month: 'Fecha', year: '' };
                        }
                      };

                      const { day, month, year } = formatEventDate(ev.date);

                      return (
                        <div
                          id={`event-item-${ev.id}`}
                          key={ev.id}
                          className="bg-white border border-neutral-200 rounded-xl overflow-hidden p-6 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Calendar date card */}
                          <div className="flex sm:flex-col items-center justify-center p-4 bg-stone-50 border border-stone-200 rounded-lg text-center shrink-0 w-24 h-24 sm:w-28 sm:h-28 mx-auto">
                            <span className="text-xs uppercase tracking-widest text-stone-500 font-bold font-mono">{month}</span>
                            <span className="text-3xl font-serif font-black text-stone-800 my-0.5">{day}</span>
                            <span className="text-[10px] text-stone-400 font-mono">{year}</span>
                          </div>

                          {/* Event info */}
                          <div className="flex-grow space-y-3">
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase font-mono ${type.bg}`}>
                                {type.label}
                              </span>
                              {ev.time && (
                                <span className="text-xs text-neutral-500 font-mono bg-neutral-100 px-2 py-0.5 rounded flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" /> {ev.time}
                                </span>
                              )}
                            </div>

                            <h3 className="font-serif text-xl font-bold text-neutral-800">
                              {ev.title}
                            </h3>

                            <p className="text-xs font-semibold text-neutral-700 flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5 text-stone-400 shrink-0" /> {ev.location}
                            </p>

                            <p className="text-neutral-600 text-sm leading-relaxed">
                              {ev.description}
                            </p>
                          </div>

                          {/* Action ticket link */}
                          {ev.ticketUrl && (
                            <div className="flex items-center justify-center shrink-0">
                              <a
                                href={ev.ticketUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`px-4 py-2 border rounded-lg text-xs font-bold uppercase font-mono tracking-widest transition-colors ${activeTheme.primary} border-stone-300 hover:bg-stone-50`}
                              >
                                Reservar Plaza
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 5: CONTACTO (READER INQUIRY FORM)
                ------------------------------------------------------------- */}
            {activeTab === 'contact' && (
              <div id="section-contact" className="space-y-8 animate-fade-in duration-300 max-w-4xl mx-auto">
                <div className="text-center space-y-2">
                  <h1 className="font-serif text-4xl font-bold tracking-wide">Escríbeme</h1>
                  <p className="text-neutral-500 text-sm max-w-lg mx-auto">
                    ¿Te ha gustado alguna de mis novelas? ¿Tienes alguna propuesta editorial o te gustaría dejar tu opinión? Estaré encantada de leerte.
                  </p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden p-6 md:p-10 shadow-sm grid md:grid-cols-12 gap-8">
                  {/* Info sidebar */}
                  <div className="md:col-span-4 space-y-6">
                    <div className="bg-stone-100 p-5 rounded-lg border border-stone-200 space-y-4">
                      <h4 className="font-serif text-base font-bold text-stone-800">Buzón Lola Woods</h4>
                      <p className="text-stone-600 text-xs leading-relaxed">
                        Leo todos y cada uno de los mensajes de mis lectoras. Aunque a veces tarde unos días por estar inmersa en la escritura de mi próximo libro, siempre respondo de corazón.
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <p className="font-semibold text-stone-600 font-mono tracking-widest uppercase">Contacto Prensa / Negocios</p>
                      <p className="font-serif text-sm font-semibold">{config.agentName}</p>
                      <a href={`mailto:${config.agentContact}`} className={`hover:underline font-mono ${activeTheme.primary}`}>
                        {config.agentContact}
                      </a>
                    </div>
                  </div>

                  {/* Message form */}
                  <form onSubmit={handleContactSubmit} className="md:col-span-8 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-600 font-mono uppercase">Tu Nombre / Seudónimo *</label>
                        <input
                          id="contact-name-input"
                          type="text"
                          required
                          className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-600 font-mono uppercase">Tu Correo Electrónico *</label>
                        <input
                          id="contact-email-input"
                          type="email"
                          required
                          className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600 font-mono uppercase">Asunto *</label>
                      <input
                        id="contact-subject-input"
                        type="text"
                        required
                        className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600 font-mono uppercase">Mensaje Literario *</label>
                      <textarea
                        id="contact-message-input"
                        rows={6}
                        required
                        className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                      />
                    </div>

                    <button
                      id="contact-submit-btn"
                      type="submit"
                      disabled={contactLoading}
                      className={`w-full py-3 rounded-lg text-sm font-semibold tracking-wider uppercase transition-colors text-white flex items-center justify-center gap-2 ${
                        contactLoading ? 'bg-amber-300 cursor-not-allowed' : `${activeTheme.primaryBg} ${activeTheme.primaryBgHover}`
                      }`}
                    >
                      {contactLoading ? (
                        <>Iniciando envío...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Enviar Mensaje a Lola</>
                      )}
                    </button>

                    {contactSuccess && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex gap-2">
                        <Check className="w-5 h-5 shrink-0 text-emerald-600" />
                        <span>{contactSuccess}</span>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 6: PANEL ADMIN (THE HEART CONFIGURATION)
                ------------------------------------------------------------- */}
            {activeTab === 'admin' && (
              <div id="section-admin" className="space-y-8 animate-fade-in duration-300 max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-4 gap-4">
                  <div>
                    <h1 className="font-serif text-3xl font-black text-rose-900 tracking-wide uppercase flex items-center gap-2">
                      <Settings className="w-7 h-7 text-rose-600 animate-spin" /> Panel de Escritora
                    </h1>
                    <p className="text-xs text-neutral-500 font-mono mt-1">
                      Servidor SQLITE activo persistentemente • {submissions.length} mensajes • {books.length} novelas en base de datos
                    </p>
                  </div>

                  {isAdminAuthenticated && (
                    <button
                      id="admin-logout-btn"
                      className="px-4 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-stone-700 text-xs font-mono font-bold uppercase rounded-lg flex items-center gap-1"
                      onClick={triggerLogout}
                    >
                      <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
                    </button>
                  )}
                </div>

                {!isAdminAuthenticated ? (
                  /* -------------------------------------------------------------
                      UNAUTHENTICATED: Admin Login Passcode Block
                      ------------------------------------------------------------- */
                  <div className="max-w-md mx-auto bg-white border border-stone-200 rounded-xl p-8 shadow-xl text-center space-y-6">
                    <div className="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                      <Settings className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <h2 className="font-serif text-2xl font-bold text-stone-800">Acceso Privado</h2>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Este panel permite configurar en tiempo real todos los contenidos públicos, novelas y correos de Lola Woods. Por favor introduzca la contraseña de administración provista.
                      </p>
                    </div>

                    <form onSubmit={handleAdminLogin} className="space-y-4">
                      <div>
                        <input
                          id="admin-passcode-input"
                          type="password"
                          required
                          placeholder="Código de acceso administrador..."
                          className="w-full px-4 py-3 border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-rose-500"
                          value={passcodeInput}
                          onChange={(e) => setPasscodeInput(e.target.value)}
                        />
                        <span className="text-[10px] text-zinc-400 font-mono block mt-2">(Código por defecto en DB: <code className="bg-stone-100 px-1 py-0.5 rounded text-neutral-700">lola2026</code>)</span>
                      </div>

                      <button
                        id="admin-login-submit-btn"
                        type="submit"
                        className="w-full py-3 bg-stone-900 hover:bg-stone-850 text-white font-semibold text-sm rounded-lg uppercase tracking-wider transition-colors shadow"
                      >
                        Autenticar con SQLITE
                      </button>

                      {loginError && (
                        <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded border border-rose-100 flex items-center justify-center gap-1">
                          <X className="w-3.5 h-3.5" /> {loginError}
                        </p>
                      )}
                    </form>
                  </div>
                ) : (
                  /* -------------------------------------------------------------
                      AUTHENTICATED: Full Administration Controls Dashboard
                      ------------------------------------------------------------- */
                  <div className="grid lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: GLOBAL TEXT CONFIGURATIONS FORM */}
                    <form onSubmit={handleSaveConfig} className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-6">
                      <div className="flex justify-between items-center border-b pb-3 border-neutral-100">
                        <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-1.5 text-amber-700">
                          <Edit3 className="w-5 h-5 text-amber-600" /> 1. Contenidos de Lola Woods
                        </h3>
                        <button
                          id="admin-save-config-btn"
                          type="submit"
                          disabled={savingConfig}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold uppercase rounded shadow flex items-center gap-1"
                        >
                          {savingConfig ? 'Guardando...' : <><Save className="w-3.5 h-3.5" /> Guardar Todo</>}
                        </button>
                      </div>

                      {configSuccess && (
                        <div id="admin-config-success-banner" className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-1.5 font-medium animate-pulse">
                          <Check className="w-4 h-4 text-emerald-600" /> ¡Configuración actualizada de forma persistente en SQLite!
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-600 font-mono uppercase">Seudónimo Público</label>
                          <input
                            type="text"
                            className="w-full text-xs px-3 py-2 border rounded"
                            value={configForm.authorPseudonym || ''}
                            onChange={(e) => setConfigForm({ ...configForm, authorPseudonym: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-600 font-mono uppercase">Nombre de Nacimiento</label>
                          <input
                            type="text"
                            className="w-full text-xs px-3 py-2 border rounded"
                            value={configForm.authorName || ''}
                            onChange={(e) => setConfigForm({ ...configForm, authorName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-600 font-mono uppercase">Eslogan de Cabecera (Slogan / Sello)</label>
                        <input
                          type="text"
                          className="w-full text-xs px-3 py-2 border rounded"
                          value={configForm.tagline || ''}
                          onChange={(e) => setConfigForm({ ...configForm, tagline: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-600 font-mono uppercase">Cabecera Principal Hero</label>
                          <input
                            type="text"
                            className="w-full text-xs px-3 py-2 border rounded"
                            value={configForm.heroHeadline || ''}
                            onChange={(e) => setConfigForm({ ...configForm, heroHeadline: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-600 font-mono uppercase">Subtítulo Descriptivo Hero</label>
                          <input
                            type="text"
                            className="w-full text-xs px-3 py-2 border rounded"
                            value={configForm.heroSubtitle || ''}
                            onChange={(e) => setConfigForm({ ...configForm, heroSubtitle: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="border-t border-neutral-100 pt-4 space-y-4">
                        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-widest font-mono">Biografía & Filosofía</h4>
                        
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-600 font-mono uppercase">Título de Biografía</label>
                          <input
                            type="text"
                            className="w-full text-xs px-3 py-2 border rounded"
                            value={configForm.bioHeadline || ''}
                            onChange={(e) => setConfigForm({ ...configForm, bioHeadline: e.target.value })}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-600 font-mono uppercase">Párrafo Introductorio 1</label>
                          <textarea
                            rows={4}
                            className="w-full text-xs px-3 py-2 border rounded leading-relaxed font-light"
                            value={configForm.bioText1 || ''}
                            onChange={(e) => setConfigForm({ ...configForm, bioText1: e.target.value })}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-600 font-mono uppercase">Párrafo Trayectoria 2</label>
                          <textarea
                            rows={4}
                            className="w-full text-xs px-3 py-2 border rounded leading-relaxed font-light"
                            value={configForm.bioText2 || ''}
                            onChange={(e) => setConfigForm({ ...configForm, bioText2: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-stone-600 font-mono uppercase font-semibold">Cita Inspiracional Favorita</label>
                            <input
                              type="text"
                              className="w-full text-xs px-3 py-2 border rounded italic"
                              value={configForm.quote || ''}
                              onChange={(e) => setConfigForm({ ...configForm, quote: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-stone-600 font-mono uppercase">Origen / Fuente de la Cita</label>
                            <input
                              type="text"
                              className="w-full text-xs px-3 py-2 border rounded"
                              value={configForm.quoteSource || ''}
                              onChange={(e) => setConfigForm({ ...configForm, quoteSource: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-600 font-mono uppercase">Imagen de Perfil Artística (URL o Base64 string)</label>
                          <input
                            type="text"
                            className="w-full text-xs px-3 py-2 border rounded"
                            placeholder="URL de foto o deje en blanco para retrato por defecto..."
                            value={configForm.profileImage || ''}
                            onChange={(e) => setConfigForm({ ...configForm, profileImage: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Social handles */}
                      <div className="border-t border-neutral-100 pt-4 space-y-3">
                        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-widest font-mono">Redes Sociales & Enlaces</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 font-mono">INSTAGRAM</label>
                            <input
                              type="text"
                              className="w-full text-[11px] px-2.5 py-1.5 border rounded"
                              value={configForm.socialInstagram || ''}
                              onChange={(e) => setConfigForm({ ...configForm, socialInstagram: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 font-mono">TWITTER / X</label>
                            <input
                              type="text"
                              className="w-full text-[11px] px-2.5 py-1.5 border rounded"
                              value={configForm.socialTwitter || ''}
                              onChange={(e) => setConfigForm({ ...configForm, socialTwitter: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 font-mono">FACEBOOK</label>
                            <input
                              type="text"
                              className="w-full text-[11px] px-2.5 py-1.5 border rounded"
                              value={configForm.socialFacebook || ''}
                              onChange={(e) => setConfigForm({ ...configForm, socialFacebook: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 font-mono">GOODREADS</label>
                            <input
                              type="text"
                              className="w-full text-[11px] px-2.5 py-1.5 border rounded"
                              value={configForm.socialGoodreads || ''}
                              onChange={(e) => setConfigForm({ ...configForm, socialGoodreads: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Admin security settings */}
                      <div className="border-t border-red-100 bg-red-50/30 p-4 rounded-lg space-y-3">
                        <h4 className="text-xs font-bold text-rose-800 uppercase tracking-widest font-mono">Seguridad & Tema Visual</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-stone-600 font-mono uppercase">Contraseña del Panel de Control</label>
                            <input
                              type="text"
                              className="w-full text-xs px-3 py-2 border border-red-200 rounded font-mono bg-white text-rose-800"
                              value={configForm.adminPasscode || ''}
                              onChange={(e) => setConfigForm({ ...configForm, adminPasscode: e.target.value })}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-stone-600 font-mono uppercase">Tema de Color del Sitio</label>
                            <select
                              className="w-full text-xs px-3 py-2 border rounded"
                              value={configForm.themeColor || 'rose'}
                              onChange={(e) => setConfigForm({ ...configForm, themeColor: e.target.value as any })}
                            >
                              <option value="rose">Fucsia Romántico (Chicle & Enredos)</option>
                              <option value="gold">Melocotón Divertido (Coral & Risas)</option>
                              <option value="emerald">Menta Fresca (Amigas & Confusiones)</option>
                              <option value="amber">Girasol Risas (Sol & Finales Felices)</option>
                              <option value="slate">Lavanda Dulce (Suspiros & Cafeterías)</option>
                            </select>
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[11px] font-bold text-stone-600 font-mono uppercase">Texto de Derechos de Autor (Pie de Página)</label>
                            <textarea
                              rows={2}
                              className="w-full text-xs px-3 py-2 border rounded leading-relaxed bg-white font-mono text-zinc-700 font-light"
                              placeholder="© 2026 Lola Woods. Todos los derechos reservados..."
                              value={configForm.footerRights || ''}
                              onChange={(e) => setConfigForm({ ...configForm, footerRights: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Genres Management Panel */}
                      <div className="border border-neutral-200 bg-stone-50/50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-widest font-mono flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-rose-600" /> 1.2 Gestión de Géneros Literarios
                          </h4>
                          <span className="text-[10px] text-zinc-500 font-mono">{(configForm.genres || ["Romance Histórico", "Intriga Romántica", "Romance Contemporáneo", "Comedia Romántica", "Fantasía Romántica"]).length} géneros</span>
                        </div>
                        
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
                          Modifica los nombres de los géneros o elimina los que no utilices. Recuerda que <strong className="font-semibold text-stone-700">solo los géneros con novelas asignadas</strong> se muestran en los botones de filtro públicos de la biblioteca.
                        </p>

                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 bg-white p-2 rounded border border-neutral-200 shadow-inner">
                          {(configForm.genres || ["Romance Histórico", "Intriga Romántica", "Romance Contemporáneo", "Comedia Romántica", "Fantasía Romántica"]).map((g, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <input
                                type="text"
                                className="w-full text-xs px-2.5 py-1.5 border border-stone-200 rounded leading-none bg-stone-50 text-stone-800 font-mono hover:bg-white focus:bg-white focus:ring-1 focus:ring-rose-500 transition-all font-medium"
                                value={g}
                                onChange={(e) => {
                                  const updated = [...(configForm.genres || ["Romance Histórico", "Intriga Romántica", "Romance Contemporáneo", "Comedia Romántica", "Fantasía Romántica"])];
                                  updated[idx] = e.target.value;
                                  setConfigForm({ ...configForm, genres: updated });
                                }}
                              />
                              <button
                                type="button"
                                className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-neutral-100 rounded transition"
                                title="Eliminar Género"
                                onClick={() => {
                                  const updated = (configForm.genres || ["Romance Histórico", "Intriga Romántica", "Romance Contemporáneo", "Comedia Romántica", "Fantasía Romántica"]).filter((_, i) => i !== idx);
                                  setConfigForm({ ...configForm, genres: updated });
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add new genre option */}
                        <div className="flex gap-2 items-center pt-1.5">
                          <input
                            type="text"
                            placeholder="Nuevo género literario... Ej: Comedia Romántica"
                            className="flex-1 text-xs px-3 py-1.5 border border-stone-200 rounded font-mono"
                            value={newGenreName}
                            onChange={(e) => setNewGenreName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const trimmed = newGenreName.trim();
                                if (trimmed) {
                                  const current = configForm.genres || ["Romance Histórico", "Intriga Romántica", "Romance Contemporáneo", "Comedia Romántica", "Fantasía Romántica"];
                                  if (!current.includes(trimmed)) {
                                    setConfigForm({ ...configForm, genres: [...current, trimmed] });
                                    setNewGenreName('');
                                  } else {
                                    alert("El género ya existe");
                                  }
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-white inline-flex items-center gap-1 transition-all ${
                              newGenreName.trim() ? 'bg-amber-600 hover:bg-amber-700' : 'bg-stone-300 text-stone-500 pointer-events-none'
                            }`}
                            onClick={() => {
                              const trimmed = newGenreName.trim();
                              if (trimmed) {
                                const current = configForm.genres || ["Romance Histórico", "Intriga Romántica", "Romance Contemporáneo", "Comedia Romántica", "Fantasía Romántica"];
                                if (!current.includes(trimmed)) {
                                  setConfigForm({ ...configForm, genres: [...current, trimmed] });
                                  setNewGenreName('');
                                } else {
                                  alert("El género ya existe");
                                }
                              }
                            }}
                          >
                            <Plus className="w-3.5 h-3.5" /> Añadir
                          </button>
                        </div>
                        <p className="text-[10px] text-stone-400 italic">
                          * Presiona el botón verde "Guardar Todo" arriba para guardar permanentemente todos tus cambios.
                        </p>
                      </div>

                    </form>

                    {/* RIGHT COLUMN: BOOK CATALOG CRUD ENGINE & MAIL INBOX */}
                    <div className="lg:col-span-5 space-y-8">
                      
                      {/* SUB-SECTION A: BOOS LIST IN THE DB */}
                      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b pb-2 border-neutral-100">
                          <h3 className="font-serif text-base font-bold text-stone-850 flex items-center gap-1">
                            <BookOpen className="w-5 h-5 text-rose-600" /> 2. Gestor de Novelas ({books.length})
                          </h3>
                          <button
                            id="admin-add-book-trigger-btn"
                            className="px-2.5 py-1 bg-neutral-900 text-white hover:bg-neutral-800 rounded font-mono tracking-wider font-bold text-[10px] uppercase flex items-center gap-1"
                            onClick={() => {
                              setEditingBook(null);
                              setBookForm({
                                title: '', subtitle: '', description: '', synopsis: '', genre: 'Romance Histórico',
                                isbn: '', pages: 350, publisher: 'Woods Editorial', publishDate: '', coverImage: '',
                                buyLinks: { amazon: '', kobo: '', editorial: '', other: '' }, isFeatured: false, rating: 5, reviews: []
                              });
                              setIsAddingBook(true);
                            }}
                          >
                            <Plus className="w-3.5 h-3.5" /> Añadir Novela
                          </button>
                        </div>

                        {/* POP-UP PANEL: BOOK ADDITION/EDIT FORM */}
                        {isAddingBook && (
                          <div className="p-4 bg-stone-50 border rounded-lg space-y-4 shadow-sm border-stone-300">
                            <div className="flex justify-between items-center border-b pb-1">
                              <span className="text-xs font-bold uppercase text-stone-600 font-mono">
                                {editingBook ? 'Editando Novela' : 'Nueva Novela en Base de Datos'}
                              </span>
                              <button onClick={() => setIsAddingBook(false)}>
                                <X className="w-4 h-4 text-stone-400" />
                              </button>
                            </div>

                            <form onSubmit={handleBookSubmit} className="space-y-3 text-xs">
                              <div className="space-y-1">
                                <label className="font-bold text-stone-500 font-mono uppercase">Título de la Novela *</label>
                                <input
                                  id="admin-book-title-input"
                                  type="text"
                                  required
                                  placeholder="Ej: El eco de las colinas"
                                  className="w-full p-2 border rounded"
                                  value={bookForm.title || ''}
                                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-stone-500 font-mono uppercase">Subtítulo o Frase Clave</label>
                                <input
                                  id="admin-book-subtitle-input"
                                  type="text"
                                  placeholder="Ej: Un juramento en Tierras Altas"
                                  className="w-full p-2 border rounded"
                                  value={bookForm.subtitle || ''}
                                  onChange={(e) => setBookForm({ ...bookForm, subtitle: e.target.value })}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="font-bold text-stone-500 font-mono uppercase">Género Literario</label>
                                  <select
                                    className="w-full p-2 border rounded bg-white text-xs"
                                    value={bookForm.genre || (config.genres && config.genres[0]) || 'Romance Histórico'}
                                    onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })}
                                  >
                                    {(config.genres || ["Romance Histórico", "Intriga Romántica", "Romance Contemporáneo", "Comedia Romántica", "Fantasía Romántica"]).map((g) => (
                                      <option key={g} value={g}>{g}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="font-bold text-stone-500 font-mono uppercase">Páginas de la Novela</label>
                                  <input
                                    type="number"
                                    className="w-full p-2 border rounded"
                                    value={bookForm.pages || ''}
                                    onChange={(e) => setBookForm({ ...bookForm, pages: Number(e.target.value) })}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-stone-500 font-mono uppercase">Resumen Corto Tarjeta *</label>
                                <textarea
                                  rows={2}
                                  required
                                  placeholder="Resumen corto para las tarjetas públicas..."
                                  className="w-full p-2 border rounded leading-relaxed"
                                  value={bookForm.description || ''}
                                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-stone-500 font-mono uppercase">Sinopsis Grande Completa *</label>
                                <textarea
                                  rows={4}
                                  required
                                  placeholder="Sinopsis completa que ven los lectores al abrir la ficha..."
                                  className="w-full p-2 border rounded leading-relaxed"
                                  value={bookForm.synopsis || ''}
                                  onChange={(e) => setBookForm({ ...bookForm, synopsis: e.target.value })}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="font-bold text-stone-500 font-mono uppercase">Editorial</label>
                                  <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={bookForm.publisher || ''}
                                    onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="font-bold text-stone-500 font-mono uppercase">Fecha Publicación</label>
                                  <input
                                    type="date"
                                    className="w-full p-2 border rounded"
                                    value={bookForm.publishDate || ''}
                                    onChange={(e) => setBookForm({ ...bookForm, publishDate: e.target.value })}
                                  />
                                </div>
                              </div>

                              {/* ENLACES DE COMPRA */}
                              <div className="border border-stone-200 rounded p-2.5 bg-white space-y-1.5">
                                <span className="text-[10px] font-bold text-stone-500 block uppercase font-mono border-b pb-0.5">Enlaces de Adquisición (Tiendas)</span>
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Enlace Amazon..."
                                    className="p-1.5 border rounded text-[11px]"
                                    value={bookForm.buyLinks?.amazon || ''}
                                    onChange={(e) => setBookForm({ ...bookForm, buyLinks: { ...bookForm.buyLinks, amazon: e.target.value } })}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Enlace Kobo..."
                                    className="p-1.5 border rounded text-[11px]"
                                    value={bookForm.buyLinks?.kobo || ''}
                                    onChange={(e) => setBookForm({ ...bookForm, buyLinks: { ...bookForm.buyLinks, kobo: e.target.value } })}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Enlace Editorial..."
                                    className="p-1.5 border rounded text-[11px]"
                                    value={bookForm.buyLinks?.editorial || ''}
                                    onChange={(e) => setBookForm({ ...bookForm, buyLinks: { ...bookForm.buyLinks, editorial: e.target.value } })}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Enlace Casa del libro..."
                                    className="p-1.5 border rounded text-[11px]"
                                    value={bookForm.buyLinks?.other || ''}
                                    onChange={(e) => setBookForm({ ...bookForm, buyLinks: { ...bookForm.buyLinks, other: e.target.value } })}
                                  />
                                </div>
                              </div>

                              {/* PORTADA IMAGE FILE UPLOAD CO-ENGINES */}
                              <div className="border border-stone-200 rounded p-3 bg-white space-y-2 text-center">
                                <span className="text-[10px] font-bold text-stone-500 block uppercase font-mono text-left">Subir Imagen de Portada (PNG / JPG)</span>
                                
                                {bookForm.coverImage ? (
                                  <div className="relative inline-block w-20 h-28 border rounded shadow overflow-hidden group">
                                    <img src={bookForm.coverImage} className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                      onClick={() => setBookForm({ ...bookForm, coverImage: '' })}
                                    >
                                      ELIMINAR
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    className="border-2 border-dashed border-neutral-300 rounded-lg p-4 hover:bg-neutral-50 cursor-pointer flex flex-col items-center gap-1 text-[11px] text-zinc-500"
                                    onClick={() => fileInputRef.current?.click()}
                                  >
                                    <Upload className="w-6 h-6 text-neutral-400" />
                                    <span className="font-semibold text-neutral-600 block">Pulse para examinar portada</span>
                                    <span>Formato JPG/PNG menor de 1MB</span>
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={handleCoverUpload}
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2 items-center">
                                <input
                                  type="checkbox"
                                  id="isFeaturedBookCheck"
                                  className="w-4 h-4 text-amber-500"
                                  checked={!!bookForm.isFeatured}
                                  onChange={(e) => setBookForm({ ...bookForm, isFeatured: e.target.checked })}
                                />
                                <label htmlFor="isFeaturedBookCheck" className="text-[11px] font-bold text-stone-600 uppercase font-mono">
                                  Novela Novedad Destacada (Hero Banner Principal)
                                </label>
                              </div>

                              <button
                                id="admin-book-save-button"
                                type="submit"
                                className="w-full p-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono uppercase font-black text-xs tracking-widest rounded shadow"
                              >
                                Guardar Registro en SQLITE
                              </button>
                            </form>
                          </div>
                        )}

                        {/* List representation of Books database */}
                        <div className="divide-y divide-neutral-100 max-h-[300px] overflow-y-auto pr-1">
                          {books.map((book) => (
                            <div key={book.id} className="py-2.5 flex items-center justify-between text-xs gap-4">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-12 bg-stone-100 rounded border overflow-hidden shrink-0">
                                  {book.coverImage ? (
                                    <img src={book.coverImage} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full text-[6px] shrink-0 font-serif leading-none flex items-center justify-center p-0.5 text-stone-400 uppercase text-center bg-zinc-950">
                                      L Woods
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-stone-800 truncate leading-tight">{book.title}</p>
                                  <p className="text-[10px] text-zinc-400 capitalize truncate mt-0.5 font-mono">{book.genre} • {book.pages} págs</p>
                                </div>
                              </div>

                              <div className="flex gap-1 shrink-0">
                                <button
                                  id={`edit-book-btn-${book.id}`}
                                  className="p-1 px-2 border rounded bg-neutral-50 hover:bg-neutral-100 hover:text-amber-700 text-stone-500 transition-colors"
                                  onClick={() => startEditBook(book)}
                                >
                                  Editar
                                </button>
                                <button
                                  id={`delete-book-btn-${book.id}`}
                                  className="p-1 px-2 border border-red-100 rounded bg-red-50 hover:bg-red-100 hover:text-red-700 text-red-500 transition-colors"
                                  onClick={async () => {
                                    if (confirm(`¿Seguro que desea eliminar '${book.title}'? Esta acción es irreversible.`)) {
                                      await deleteBook(book.id);
                                    }
                                  }}
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SUB-SECTION B: SCHEDULING SYSTEM (EVENTS ENGINE) */}
                      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h3 className="font-serif text-base font-bold text-stone-850 flex items-center gap-1.5">
                            <Calendar className="w-5 h-5 text-amber-600" /> 3. Agenda de Eventos ({events.length})
                          </h3>
                          <button
                            id="admin-add-event-trigger-btn"
                            className="px-2 py-0.5 border border-dashed rounded font-mono font-bold text-[9px] uppercase hover:bg-stone-50"
                            onClick={() => setIsAddingEvent(!isAddingEvent)}
                          >
                            Nuevo Evento
                          </button>
                        </div>

                        {isAddingEvent && (
                          <form onSubmit={handleEventSubmit} className="p-3.5 bg-neutral-50 border rounded-lg space-y-3 fs-xs text-xs">
                            <div className="space-y-1">
                              <label className="font-bold text-stone-500 font-mono">Título del Encuentro *</label>
                              <input
                                id="admin-event-title"
                                type="text"
                                required
                                placeholder="Ej: Firma de Libros - El Corte Inglés"
                                className="w-full p-2 border rounded"
                                value={eventForm.title || ''}
                                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="font-bold text-stone-500 font-mono">Fecha *</label>
                                <input
                                  id="admin-event-date"
                                  type="date"
                                  required
                                  className="w-full p-2 border rounded"
                                  value={eventForm.date || ''}
                                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-bold text-stone-500 font-mono">Horario (Detalles)</label>
                                <input
                                  id="admin-event-time"
                                  type="text"
                                  placeholder="Ej: 18:00 - 20:30"
                                  className="w-full p-2 border rounded"
                                  value={eventForm.time || ''}
                                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-stone-500 font-mono">Tipo de Actividad</label>
                              <select
                                className="w-full p-2 border rounded bg-white"
                                value={eventForm.eventType}
                                onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value as any })}
                              >
                                <option value="sign">Firmas de Libros (Sign)</option>
                                <option value="fair">Feria del Libro (Fair)</option>
                                <option value="talk">Coloquio / Charla (Talk)</option>
                                <option value="other">Otro (Other)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-stone-500 font-mono">Localización (Caseta, Sala, Ciudad) *</label>
                              <input
                                id="admin-event-location"
                                type="text"
                                required
                                placeholder="Ej: Parque del Retiro, Madrid - Caseta 56"
                                className="w-full p-2 border rounded"
                                value={eventForm.location || ''}
                                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-stone-500 font-mono">Descripción para Lectores *</label>
                              <textarea
                                id="admin-event-description"
                                rows={2}
                                required
                                placeholder="Notas breves sobre ejemplares a firmar..."
                                className="w-full p-2 border rounded leading-relaxed"
                                value={eventForm.description || ''}
                                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-stone-500 font-mono font-semibold">URL de Confirmación / Reservas</label>
                              <input
                                type="text"
                                placeholder="Deje en blanco si no se requiere entrada..."
                                className="w-full p-2 border rounded"
                                value={eventForm.ticketUrl || ''}
                                onChange={(e) => setEventForm({ ...eventForm, ticketUrl: e.target.value })}
                              />
                            </div>

                            <button
                              id="admin-event-save-button"
                              type="submit"
                              className="w-full p-2 bg-neutral-900 border text-white font-mono uppercase font-bold text-xs"
                            >
                              Programar Evento
                            </button>
                          </form>
                        )}

                        <div className="divide-y divide-neutral-100 max-h-[220px] overflow-y-auto">
                          {events.map((ev) => (
                            <div key={ev.id} className="py-2.5 flex justify-between items-center text-xs gap-3">
                              <div className="min-w-0">
                                <p className="font-bold text-stone-800 font-serif leading-tight">{ev.title}</p>
                                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{ev.date} • {ev.location}</p>
                              </div>
                              <button
                                id={`delete-event-btn-${ev.id}`}
                                className="p-1 px-2 border text-red-500 hover:bg-neutral-50 rounded shrink-0 transition-colors"
                                onClick={() => deleteEvent(ev.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SUB-SECTION C: INBOX MESSAGES SUBMISSIONS */}
                      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h3 className="font-serif text-base font-bold text-stone-850 flex items-center gap-1.5">
                            <Mail className="w-5 h-5 text-rose-500" /> 4. Correspondencia de Lectores ({submissions.length})
                          </h3>
                          <span className="text-[9px] uppercase tracking-wider font-mono font-bold bg-rose-50 border border-rose-200 text-rose-700 px-2 rounded">
                            Buzón
                          </span>
                        </div>

                        {submissions.length === 0 ? (
                          <div className="text-center py-6 text-neutral-400 text-xs italic">
                            El buzón está vacío en este momento.
                          </div>
                        ) : (
                          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                            {submissions.map((sub) => (
                              <div
                                id={`submission-item-${sub.id}`}
                                key={sub.id}
                                className={`p-3.5 border rounded-lg space-y-2 text-xs relative ${
                                  sub.read ? 'bg-neutral-50/50 border-neutral-200' : 'bg-rose-50/20 border-rose-100 font-medium'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <p className="font-black text-stone-800 leading-tight">
                                      {sub.name} <span className="font-normal text-neutral-400 font-mono text-[10px]">({sub.email})</span>
                                    </p>
                                    <p className="text-[10px] text-zinc-400 mt-0.5">Asunto: <span className="font-semibold text-zinc-600">{sub.subject}</span> • {sub.date}</p>
                                  </div>

                                  <div className="flex gap-1.5 shrink-0">
                                    <button
                                      id={`toggle-read-sub-${sub.id}`}
                                      className={`p-1 border rounded transition-colors ${
                                        sub.read 
                                          ? 'border-neutral-200 text-neutral-400 hover:text-stone-700' 
                                          : 'border-rose-200 text-rose-500 hover:text-rose-600'
                                      }`}
                                      onClick={() => toggleSubmissionRead(sub.id, !sub.read)}
                                      title={sub.read ? "Marcar como no leído" : "Marcar como leído"}
                                    >
                                      {sub.read ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                      id={`delete-sub-btn-${sub.id}`}
                                      className="p-1 border border-neutral-200 rounded text-stone-400 hover:text-red-700 transition"
                                      onClick={() => deleteSubmission(sub.id)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <p className="text-stone-600 font-light leading-relaxed whitespace-pre-wrap font-serif text-[13px] border-t border-dotted border-stone-200 pt-2 bg-white/40 p-2 rounded">
                                  {sub.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* SUB-SECTION D: NEWSLETTER SUBSCRIBERS LIST */}
                      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h3 className="font-serif text-base font-bold text-stone-850 flex items-center gap-1.5">
                            <Bell className="w-5 h-5 text-indigo-500" /> 5. Boletín de Novedades ({newsletterSignups.length})
                          </h3>
                        </div>

                        {newsletterSignups.length === 0 ? (
                          <div className="text-center py-4 text-neutral-400 text-xs italic">
                            No hay suscriptores de correo registrados actualmente.
                          </div>
                        ) : (
                          <div className="divide-y divide-neutral-100 max-h-[180px] overflow-y-auto">
                            {newsletterSignups.map((sub) => (
                              <div key={sub.id} className="py-2.5 flex justify-between items-center text-xs">
                                <div className="min-w-0">
                                  <p className="font-mono font-bold text-stone-700 truncate">{sub.email}</p>
                                  <p className="text-[10px] text-zinc-400 mt-0.5">Suscrito el: {sub.date}</p>
                                </div>
                                <button
                                  id={`delete-news-btn-${sub.id}`}
                                  className="p-1 px-2 border text-neutral-400 hover:text-red-500 transition-colors"
                                  onClick={() => deleteNewsletter(sub.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------------
                DETAILS MODAL DIALOG SHEET
                ------------------------------------------------------------- */}
            {selectedBook && (
              <div id="book-detail-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xl max-w-3xl w-full relative max-h-[90vh] flex flex-col">
                  
                  {/* Floating close x trigger button */}
                  <button
                    id="close-book-detail-btn"
                    className="absolute right-4 top-4 z-20 p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                    onClick={() => setSelectedBook(null)}
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="overflow-y-auto p-6 md:p-8 space-y-6">
                    <div className="grid md:grid-cols-12 gap-8 items-start">
                      
                      {/* Portada Cover Image Column */}
                      <div className="md:col-span-4 flex flex-col items-center">
                        <BookCover book={selectedBook} size="lg" hoverEffect={false} />
                        
                        <div className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-center mt-5 space-y-2">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-[#a855f7] bg-purple-50 px-2 py-0.5 border border-purple-100 rounded font-semibold">
                            Ficha Técnica
                          </span>
                          <div className="text-left text-xs space-y-1.5 pt-1 divide-y divide-dashed">
                            {selectedBook.publisher && (
                              <p className="pt-1 select-none text-neutral-600 font-mono text-[10px]">EDICIÓN: <span className="font-serif text-neutral-800 text-[11px] font-bold block">{selectedBook.publisher}</span></p>
                            )}
                            {selectedBook.publishDate && (
                              <p className="pt-1 text-neutral-600 font-mono text-[10px]">LANZAMIENTO: <span className="font-serif text-neutral-800 text-[11px] font-bold block">{selectedBook.publishDate}</span></p>
                            )}
                            {selectedBook.isbn && (
                              <p className="pt-1 text-neutral-600 font-mono text-[10px]">ISBN: <span className="font-mono text-neutral-800 block text-[11px]">{selectedBook.isbn}</span></p>
                            )}
                            {selectedBook.pages ? (
                              <p className="pt-1 text-neutral-600 font-mono text-[10px]">VOLUMEN: <span className="font-serif text-neutral-800 text-[11px] font-bold block">{selectedBook.pages} páginas</span></p>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Info & Buy links & Synopsis Column */}
                      <div className="md:col-span-8 space-y-5">
                        <div className="space-y-1.5">
                          <span className={`${activeTheme.badgeBg} border text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 rounded font-mono`}>
                            {selectedBook.genre}
                          </span>
                          <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-wide text-neutral-900 leading-tight">
                            {selectedBook.title}
                          </h2>
                          {selectedBook.subtitle && (
                            <p className="text-stone-500 text-sm md:text-base italic leading-relaxed">
                              {selectedBook.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.round(selectedBook.rating || 5) ? 'fill-current' : 'opacity-20'}`} />
                          ))}
                          <span className="text-xs text-stone-500 ml-1.5 font-mono">({selectedBook.rating} / 5)</span>
                        </div>

                        <div className="border-t border-neutral-100 pt-3 space-y-2">
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">Sinopsis Editorial</h4>
                          <p className="text-neutral-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-serif italic text-ellipsis overflow-hidden">
                            {selectedBook.synopsis}
                          </p>
                        </div>

                        {/* ACQUISISTION BUY BUTTON LINKS */}
                        <div className="pt-4 border-t border-neutral-100 space-y-3">
                          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500">Comprar Ejemplar</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedBook.buyLinks?.amazon && (
                              <a
                                href={selectedBook.buyLinks.amazon}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 rounded-lg text-xs font-bold uppercase font-mono bg-stone-900 hover:bg-stone-850 text-white transition-colors"
                              >
                                Amazon
                              </a>
                            )}
                            {selectedBook.buyLinks?.kobo && (
                              <a
                                href={selectedBook.buyLinks.kobo}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 rounded-lg text-xs font-bold uppercase font-mono bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                              >
                                Kobo Books
                              </a>
                            )}
                            {selectedBook.buyLinks?.editorial && (
                              <a
                                href={selectedBook.buyLinks.editorial}
                                target="_blank"
                                rel="noreferrer"
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase font-mono text-white transition-colors block ${activeTheme.primaryBg} ${activeTheme.primaryBgHover}`}
                              >
                                Woods Editorial
                              </a>
                            )}
                            {selectedBook.buyLinks?.other && (
                              <a
                                href={selectedBook.buyLinks.other}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 rounded-lg text-xs font-bold uppercase font-mono border border-stone-300 hover:bg-stone-100 text-stone-800 transition-colors"
                              >
                                Casa del libro
                              </a>
                            )}
                          </div>
                        </div>

                        {/* REVIEWS SEGMENT */}
                        {selectedBook.reviews && selectedBook.reviews.length > 0 && (
                          <div className="pt-4 border-t border-neutral-100 space-y-3">
                            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500">Opiniones de las Lectoras</h4>
                            <div className="space-y-3">
                              {selectedBook.reviews.map((rev) => (
                                <div key={rev.id} className="p-3 bg-stone-50 border rounded-lg space-y-1 text-xs">
                                  <div className="flex justify-between items-center text-stone-500">
                                    <span className="font-bold text-stone-700">{rev.author}</span>
                                    <span>{rev.date}</span>
                                  </div>
                                  <div className="flex text-amber-500">
                                    {Array.from({ length: rev.rating }).map((_, ri) => (
                                      <Star key={ri} className="w-3 h-3 fill-current" />
                                    ))}
                                  </div>
                                  <p className="text-stone-600 italic font-serif leading-relaxed mt-1">"{rev.comment}"</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>

                    </div>
                  </div>

                  <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-100 flex justify-end">
                    <button
                      id="close-modal-footer-btn"
                      className="px-5 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-stone-700 text-xs font-mono uppercase font-bold transition-all"
                      onClick={() => setSelectedBook(null)}
                    >
                      Cerrar Ficha
                    </button>
                  </div>

                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* -------------------------------------------------------------
          FOOTER CREDIT SIGN INDICATORS
          ------------------------------------------------------------- */}
      <footer className="border-t border-neutral-200 bg-white py-12 mt-16 text-neutral-500 text-sm select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          
          <div className="space-y-1 max-w-sm md:max-w-md">
            <p className="text-xs text-neutral-400 select-all font-light leading-relaxed">
              {config.footerRights || `© ${new Date().getUTCFullYear()} Lola Woods. Todos los derechos reservados. Todas las novelas de amor, risas y enredos son de su exclusiva propiedad.`}
            </p>
          </div>

          <div className="flex gap-4 flex-wrap justify-center">
            <button id="footer-home-btn" className="hover:text-stone-800 text-xs transition" onClick={() => setActiveTab('home')}>Inicio</button>
            <span className="text-zinc-300">•</span>
            <button id="footer-books-btn" className="hover:text-stone-800 text-xs transition" onClick={() => setActiveTab('books')}>Mis Libros</button>
            <span className="text-zinc-300">•</span>
            <button id="footer-bio-btn" className="hover:text-stone-800 text-xs transition" onClick={() => setActiveTab('bio')}>Biografía</button>
            <span className="text-zinc-300">•</span>
            <button id="footer-admin-btn" className={`hover:text-rose-600 text-xs transition font-mono ${activeTab === 'admin' ? 'text-rose-500 font-bold' : ''}`} onClick={() => setActiveTab('admin')}>Administrador</button>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1">
            <span className="text-[9px] tracking-widest text-neutral-400 font-mono uppercase font-bold">Desarrollado por</span>
            <div 
              className="inline-flex items-center"
              title="Chailsoft Software Solutions"
            >
              <ChailsoftLogo className="h-8 md:h-10 w-auto" />
            </div>
          </div>
          
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <LolaWoodsSite />
    </AppProvider>
  );
}
