import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  SiteConfig, Book, AuthorEvent, ContactSubmission, NewsletterEmail, InfluencerApplication 
} from '../types';
import { defaultSiteConfig, defaultBooks, defaultEvents } from '../lib/initialData';

interface AppContextType {
  config: SiteConfig;
  books: Book[];
  events: AuthorEvent[];
  submissions: ContactSubmission[];
  newsletterSignups: NewsletterEmail[];
  influencerApps: InfluencerApplication[];
  updateConfig: (newConfig: Partial<SiteConfig>) => Promise<void>;
  addBook: (newBook: Book) => Promise<void>;
  updateBook: (updatedBook: Book) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  addEvent: (newEvent: AuthorEvent) => Promise<void>;
  updateEvent: (updatedEvent: AuthorEvent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  submitContact: (name: string, email: string, subject: string, message: string) => Promise<void>;
  signupNewsletter: (email: string) => Promise<boolean>;
  deleteSubmission: (id: string) => Promise<void>;
  deleteNewsletter: (id: string) => Promise<void>;
  toggleSubmissionRead: (id: string, read: boolean) => Promise<void>;
  submitInfluencerApp: (appData: Omit<InfluencerApplication, 'id' | 'date' | 'status'>) => Promise<void>;
  updateInfluencerStatus: (id: string, status: 'pendiente' | 'aprobado' | 'rechazado') => Promise<void>;
  deleteInfluencerApp: (id: string) => Promise<void>;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (val: boolean) => void;
  adminPasscode: string;
  setAdminPasscode: (val: string) => void;
  triggerLogin: (passcode: string) => Promise<boolean>;
  triggerLogout: () => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [books, setBooks] = useState<Book[]>([]);
  const [events, setEvents] = useState<AuthorEvent[]>([]);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [newsletterSignups, setNewsletterSignups] = useState<NewsletterEmail[]>([]);
  const [influencerApps, setInfluencerApps] = useState<InfluencerApplication[]>([]);
  
  // Auth state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');

  // Read passcode from storage on startup
  useEffect(() => {
    const storedPasscode = sessionStorage.getItem('lola_admin_passcode') || localStorage.getItem('lola_admin_passcode') || '';
    if (storedPasscode) {
      setAdminPasscode(storedPasscode);
      setIsAdminAuthenticated(true);
    }
  }, []);

  // Fetch all initial data
  const fetchAllData = async () => {
    try {
      // 1. Fetch Config
      const configRes = await fetch('/api/config');
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
      }

      // 2. Fetch Books
      const booksRes = await fetch('/api/books');
      if (booksRes.ok) {
        const booksData = await booksRes.json();
        setBooks(booksData);
      }

      // 3. Fetch Events
      const eventsRes = await fetch('/api/events');
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching initial public data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin-only resources if passcode is set
  const fetchAdminResources = async (pass: string) => {
    if (!pass) return;
    try {
      // Fetch Submissions
      const subsRes = await fetch('/api/submissions', {
        headers: { 'x-admin-passcode': pass }
      });
      if (subsRes.ok) {
        const subsData = await subsRes.json();
        setSubmissions(subsData);
      }

      // Fetch Newsletter subscribers
      const newsRes = await fetch('/api/newsletter', {
        headers: { 'x-admin-passcode': pass }
      });
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setNewsletterSignups(newsData);
      }

      // Fetch Influencer Applications
      const inflRes = await fetch('/api/influencers', {
        headers: { 'x-admin-passcode': pass }
      });
      if (inflRes.ok) {
        const inflData = await inflRes.json();
        setInfluencerApps(inflData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  // Trigger main data load
  useEffect(() => {
    fetchAllData();
  }, []);

  // Sync admin resources when passcode or auth status changes
  useEffect(() => {
    if (isAdminAuthenticated && adminPasscode) {
      fetchAdminResources(adminPasscode);
    } else {
      setSubmissions([]);
      setNewsletterSignups([]);
      setInfluencerApps([]);
    }
  }, [isAdminAuthenticated, adminPasscode]);

  // Helper helper to handle unauthorized api responses
  const handleApiResponse = async (res: Response) => {
    if (res.status === 401) {
      // Invalid admin passcode
      setIsAdminAuthenticated(false);
      setAdminPasscode('');
      sessionStorage.removeItem('lola_admin_passcode');
      localStorage.removeItem('lola_admin_passcode');
      throw new Error('Su sesión de administrador ha expirado o el código de acceso es incorrecto.');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error del servidor: código de estado ${res.status}`);
    }
    return res.json();
  };

  // Update Global Configurations
  const updateConfig = async (newConfig: Partial<SiteConfig>) => {
    const payload = { ...config, ...newConfig };
    
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-passcode': adminPasscode
      },
      body: JSON.stringify(payload)
    });

    await handleApiResponse(res);
    setConfig(payload);
  };

  // Add Book
  const addBook = async (newBook: Book) => {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-passcode': adminPasscode
      },
      body: JSON.stringify(newBook)
    });

    await handleApiResponse(res);
    setBooks(prev => [...prev, newBook]);
  };

  // Update Book
  const updateBook = async (updatedBook: Book) => {
    const res = await fetch(`/api/books/${updatedBook.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-passcode': adminPasscode
      },
      body: JSON.stringify(updatedBook)
    });

    await handleApiResponse(res);
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
  };

  // Delete Book
  const deleteBook = async (bookId: string) => {
    const res = await fetch(`/api/books/${bookId}`, {
      method: 'DELETE',
      headers: {
        'x-admin-passcode': adminPasscode
      }
    });

    await handleApiResponse(res);
    setBooks(prev => prev.filter(b => b.id !== bookId));
  };

  // Add Event
  const addEvent = async (newEvent: AuthorEvent) => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-passcode': adminPasscode
      },
      body: JSON.stringify(newEvent)
    });

    await handleApiResponse(res);
    setEvents(prev => [...prev, newEvent].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  // Update Event
  const updateEvent = async (updatedEvent: AuthorEvent) => {
    const res = await fetch(`/api/events/${updatedEvent.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-passcode': adminPasscode
      },
      body: JSON.stringify(updatedEvent)
    });

    await handleApiResponse(res);
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  // Delete Event
  const deleteEvent = async (eventId: string) => {
    const res = await fetch(`/api/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'x-admin-passcode': adminPasscode
      }
    });

    await handleApiResponse(res);
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  // Submit Contact Form
  const submitContact = async (name: string, email: string, subject: string, message: string) => {
    const submissionId = 'sub_' + Math.random().toString(36).substring(2, 11);
    const date = new Date().toISOString().split('T')[0];
    const newSubmission: ContactSubmission = {
      id: submissionId,
      name,
      email,
      subject,
      message,
      date,
      read: false
    };

    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSubmission)
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'No se pudo enviar el mensaje.');
    }

    // If already admin authenticated, prepopulate local list to reflect live submission
    if (isAdminAuthenticated) {
      setSubmissions(prev => [newSubmission, ...prev]);
    }
  };

  // Toggle Submission read/unread status
  const toggleSubmissionRead = async (id: string, read: boolean) => {
    const res = await fetch(`/api/submissions/${id}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-passcode': adminPasscode
      },
      body: JSON.stringify({ read })
    });

    await handleApiResponse(res);
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, read } : s));
  };

  // Signup Newsletter
  const signupNewsletter = async (email: string): Promise<boolean> => {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al suscribirse al boletín.');
    }

    const data = await res.json();
    if (data.alreadyExists) {
      return false; // already signed up
    }

    // Refresh subscribers lists for active admin sessions
    if (isAdminAuthenticated) {
      const newSignup: NewsletterEmail = {
        id: data.id,
        email,
        date: new Date().toISOString().split('T')[0]
      };
      setNewsletterSignups(prev => [newSignup, ...prev]);
    }

    return true;
  };

  // Delete Submission
  const deleteSubmission = async (id: string) => {
    const res = await fetch(`/api/submissions/${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-passcode': adminPasscode
      }
    });

    await handleApiResponse(res);
    setSubmissions(prev => prev.filter(s => s.id !== id));
  };

  // Delete Newsletter
  const deleteNewsletter = async (id: string) => {
    const res = await fetch(`/api/newsletter/${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-passcode': adminPasscode
      }
    });

    await handleApiResponse(res);
    setNewsletterSignups(prev => prev.filter(n => n.id !== id));
  };

  // Submit Influencer Application
  const submitInfluencerApp = async (appData: Omit<InfluencerApplication, 'id' | 'date' | 'status'>) => {
    const res = await fetch('/api/influencers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'No se pudo enviar la solicitud de colaboración.');
    }

    const data = await res.json();

    // If already admin authenticated, prepopulate local list to reflect live application
    if (isAdminAuthenticated) {
      const newApp: InfluencerApplication = {
        ...appData,
        id: data.id,
        date: new Date().toISOString().split('T')[0],
        status: 'pendiente'
      };
      setInfluencerApps(prev => [newApp, ...prev]);
    }
  };

  // Update Influencer Application Status
  const updateInfluencerStatus = async (id: string, status: 'pendiente' | 'aprobado' | 'rechazado') => {
    const res = await fetch(`/api/influencers/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-passcode': adminPasscode
      },
      body: JSON.stringify({ status })
    });

    await handleApiResponse(res);
    setInfluencerApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  // Delete Influencer Application
  const deleteInfluencerApp = async (id: string) => {
    const res = await fetch(`/api/influencers/${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-passcode': adminPasscode
      }
    });

    await handleApiResponse(res);
    setInfluencerApps(prev => prev.filter(a => a.id !== id));
  };

  // Login handler
  const triggerLogin = async (passcode: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });

      if (res.ok) {
        setAdminPasscode(passcode);
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('lola_admin_passcode', passcode);
        localStorage.setItem('lola_admin_passcode', passcode); // Persistence across reloads
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login action error:', e);
      return false;
    }
  };

  // Logout handler
  const triggerLogout = () => {
    setAdminPasscode('');
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('lola_admin_passcode');
    localStorage.removeItem('lola_admin_passcode');
  };

  return (
    <AppContext.Provider value={{
      config,
      books,
      events,
      submissions,
      newsletterSignups,
      influencerApps,
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
      submitInfluencerApp,
      updateInfluencerStatus,
      deleteInfluencerApp,
      isAdminAuthenticated,
      setIsAdminAuthenticated,
      adminPasscode,
      setAdminPasscode,
      triggerLogin,
      triggerLogout,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
