import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { createServer as createViteServer } from 'vite';

// Safe __dirname fallback for ESM/CJS compatibility
const getDirname = () => {
  try {
    if (typeof __dirname !== 'undefined' && __dirname) {
      return __dirname;
    }
  } catch (e) {}
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch (e) {
    return process.cwd();
  }
};

const __dirname = getDirname();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DB_PATH = path.resolve(process.cwd(), 'lola_woods.db');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Ensure the uploads directory exists on disk
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit to allow uploading larger high-quality book covers
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files statically under /uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// -------------------------------------------------------------
// DATABASE INITIALIZATION
// -------------------------------------------------------------
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS site_config (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT NOT NULL,
    synopsis TEXT NOT NULL,
    genre TEXT NOT NULL,
    isbn TEXT,
    pages INTEGER,
    publisher TEXT,
    publishDate TEXT,
    coverImage TEXT NOT NULL,
    buyLinks TEXT,
    isFeatured INTEGER DEFAULT 0,
    rating REAL,
    reviews TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    ticketUrl TEXT,
    eventType TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    date TEXT NOT NULL,
    read INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS newsletter (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS influencer_applications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    platform TEXT NOT NULL,
    handle TEXT NOT NULL,
    followers INTEGER NOT NULL,
    selectedBookId TEXT NOT NULL,
    postLink TEXT,
    message TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente'
  );
`);

// -------------------------------------------------------------
// SEEDING DEFAULT DATA
// -------------------------------------------------------------
const defaultSiteConfig = {
  authorName: "Lola Woods",
  authorPseudonym: "Lola Woods",
  tagline: "Novelas de comedia romántica llenas de enredos, risas y finales de película.",
  heroHeadline: "Encuentra el amor entre risas y enredos inesperados",
  heroSubtitle: "Descubre historias frescas donde el amor siempre gana la partida (aunque comience con el pie izquierdo y un café derramado).",
  bioHeadline: "Detrás de las sonrisas",
  bioText1: "Nacida entre cafés acogedores y tardes soleadas, Lola Woods descubrió que la risa es el camino más directo al corazón. Bajo su seudónimo, escribe novelas de comedia romántica contemporánea e histórica donde los malentendidos simpáticos, los diálogos chispeantes y el amor verdadero son siempre los protagonistas.",
  bioText2: "Con más de quince novelas que han hecho suspirar y reír a carcajadas a miles de lectoras, es una de las voces más querdas del romance feliz en español, destacando por sus personajes entrañables, un humor ágil y un optimismo contagioso.",
  quote: "Escribir comedia romántica es un recordatorio de que no importa cuán torpe o enredada sea la vida, el amor siempre tiene un final feliz esperando.",
  quoteSource: "Entrevista en Club del Lector Alegre, 2026",
  profileImage: "",
  agentName: "Representaciones Literarias Mundiales",
  agentContact: "contacto@lolawoods-literary.com",
  socialTwitter: "https://twitter.com/LolaWoodsWriter",
  socialInstagram: "https://instagram.com/LolaWoodsOficial",
  socialFacebook: "https://facebook.com/LolaWoodsLibros",
  socialGoodreads: "https://goodreads.com/author/lola_woods",
  themeColor: "patio",
  adminPasscode: "lola2026",
  footerRights: "© 2026 Lola Woods. Todos los derechos reservados. Todas las novelas de amor, risas y enredos son de su exclusiva propiedad.",
  genres: ["Romance Histórico", "Intriga Romántica", "Romance Contemporáneo", "Comedia Romántica", "Fantasía Romántica"]
};

const defaultBooks = [
  {
    id: "el-eco-de-las-colinas",
    title: "El eco de las colinas",
    subtitle: "Un juramento en Tierras Altas",
    description: "Una mujer valiente decidida a forjar su propio destino. Un terrateniente atrapado por el peso de su legado. Un secreto ancestral en Escocia.",
    synopsis: "Escocia, 1845. Catherine Campbell huye de un destino impuesto cruzando las colinas de Glencoe. Su camino se cruza con el de Ian MacDonald, un laird atormentado por las deudas y el honor de su clan. Juntos deben sellar un pacto temporal para salvar sus tierras, sin prever que un lazo mucho más profundo e indomable nacerá bajo el viento de las Highlands.",
    genre: "Romance Histórico",
    isbn: "978-84-12345-01-2",
    pages: 416,
    publisher: "Woods Editorial",
    publishDate: "2024-05-12",
    coverImage: "", 
    buyLinks: JSON.stringify({
      amazon: "https://amazon.com",
      kobo: "https://kobo.com",
      editorial: "https://woods-editorial.com",
      other: "https://casadellibro.com"
    }),
    isFeatured: 0,
    rating: 4.8,
    reviews: JSON.stringify([
      { id: "rev1", author: "Marta G.", rating: 5, comment: "Una de las mejores novelas escocesas que he leído. Catherine tiene una fuerza arrolladora.", date: "2026-04-10" },
      { id: "rev2", author: "Carlos Ruiz", rating: 4, comment: "Excelente ambientación histórica y química magnífica entre los protagonistas.", date: "2026-05-02" }
    ])
  },
  {
    id: "la-clave-de-tu-mirada",
    title: "La clave de tu mirada",
    subtitle: "El misterio tras el lienzo",
    description: "Un robo en una galería parisina, un secreto familiar sepultado por décadas y una pasión que desafía todo límite moral.",
    synopsis: "Cuando la restauradora de arte Valeria Sotomayor encuentra unas anotaciones secretas de la pintora vanguardista Leonora Carrington detrás de un lienzo robado, se convierte en el blanco de una peligrosa red internacional. Para sobrevivir, deberá confiar en Javier Moreno, un misterioso detective privado de métodos dudosos que despierta en ella una atracción tan peligrosa como el misterio que intentan resolver.",
    genre: "Intriga Romántica",
    isbn: "978-84-12345-02-9",
    pages: 368,
    publisher: "Woods Editorial",
    publishDate: "2025-11-20",
    coverImage: "", 
    buyLinks: JSON.stringify({
      amazon: "https://amazon.com",
      kobo: "https://kobo.com",
      editorial: "https://woods-editorial.com"
    }),
    isFeatured: 1,
    rating: 4.9,
    reviews: JSON.stringify([
      { id: "rev3", author: "Laura M.", rating: 5, comment: "¡Me tuvo en vela hasta las tres de la mañana! Giro tras giro y un romance de infarto.", date: "2025-11-25" },
      { id: "rev4", author: "Sofía Martínez", rating: 5, comment: "La tensión en este libro es sencillamente insoportable. Lola Woods se supera con cada obra.", date: "2025-12-05" }
    ])
  },
  {
    id: "bajo-el-cielo-de-paris",
    title: "Bajo el cielo de París",
    subtitle: "Un refugio para volver a empezar",
    description: "Una entrañable historia de superación en el barrio de Montmartre. Volver a empezar en la ciudad del amor.",
    synopsis: "Después de que su vida se desmoronara por completo en Madrid, Elena viaja a París con un único propósito: vender el pequeño taller de encuadernación artesanal que le heredó su tía abuela. Sin embargo, el encanto bohemio de Montmartre y la insistente bondad del panadero del barrio vecino, Jean-Luc, trastocarán sus planes, recordándole que a veces las vidas rotas son las más hermosas de encuadernar.",
    genre: "Romance Contemporáneo",
    isbn: "978-84-12345-03-6",
    pages: 320,
    publisher: "Woods Editorial",
    publishDate: "2025-02-14",
    coverImage: "", 
    buyLinks: JSON.stringify({
      amazon: "https://amazon.com",
      kobo: "https://kobo.com",
      other: "https://fnac.es"
    }),
    isFeatured: 0,
    rating: 4.7,
    reviews: JSON.stringify([
      { id: "rev5", author: "Elena Beltrán", rating: 4, comment: "Dulce, reconfortante y llena de olor a pan caliente y libros antiguos. Me encantó.", date: "2025-03-01" }
    ])
  }
];

const defaultEvents: any[] = [
  {
    id: "ev1",
    title: "Feria del Libro de Madrid",
    date: "2026-06-15",
    time: "18:00 - 20:30",
    location: "Parque del Retiro, Madrid - Caseta 56",
    description: "Firma de ejemplares de 'La clave de tu mirada' y mis novelas históricas más queridas. ¡No te quedes sin tu dedicatoria especial!",
    eventType: 'fair'
  },
  {
    id: "ev2",
    title: "Feria del Libro de Oviedo",
    date: "2026-07-02",
    time: "12:00 - 14:00",
    location: "Colegio de Arquitectos - Plaza de Montserrat",
    description: "Encuentro literario especial con Lola Woods. Hablaremos del proceso artesanal de creación, inspiración asturiana y responderemos las preguntas de mis queridas lectoras.",
    eventType: 'talk'
  }
];

// Seed main config
const configQuery = db.prepare("SELECT value FROM site_config WHERE key = 'site'").get();
if (!configQuery) {
  db.prepare("INSERT INTO site_config (key, value) VALUES ('site', ?)").run(JSON.stringify(defaultSiteConfig));
}

// Seed books
const bookCount = (db.prepare("SELECT COUNT(*) as count FROM books").get() as { count: number }).count;
if (bookCount === 0) {
  const insertBook = db.prepare(`
    INSERT INTO books (id, title, subtitle, description, synopsis, genre, isbn, pages, publisher, publishDate, coverImage, buyLinks, isFeatured, rating, reviews)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  defaultBooks.forEach((b) => {
    insertBook.run(
      b.id,
      b.title,
      b.subtitle || null,
      b.description,
      b.synopsis,
      b.genre,
      b.isbn || null,
      b.pages || null,
      b.publisher || null,
      b.publishDate || null,
      b.coverImage,
      b.buyLinks,
      b.isFeatured,
      b.rating,
      b.reviews
    );
  });
}

// Seed events
const eventCount = (db.prepare("SELECT COUNT(*) as count FROM events").get() as { count: number }).count;
if (eventCount === 0) {
  const insertEvent = db.prepare(`
    INSERT INTO events (id, title, date, time, location, description, ticketUrl, eventType)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  defaultEvents.forEach((e) => {
    insertEvent.run(e.id, e.title, e.date, e.time || null, e.location, e.description, e.ticketUrl || null, e.eventType);
  });
}

// Helper: Get site config
function getSiteConfig() {
  const row = db.prepare("SELECT value FROM site_config WHERE key = 'site'").get() as { value: string };
  return JSON.parse(row.value);
}

// Global Auth verification middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const passcode = req.headers['x-admin-passcode'] || req.headers['authorization']?.toString().replace('Bearer ', '');
  const activeConfig = getSiteConfig();
  if (passcode === activeConfig.adminPasscode) {
    next();
  } else {
    res.status(401).json({ error: "No autorizado. El código de administrador es incorrecto." });
  }
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// --- File Upload ---
app.post('/api/upload', requireAdmin, (req, res) => {
  try {
    const { filename, base64Data } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: "No se proporcionaron datos de imagen" });
    }

    // Match Base64 data URL patterns
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Formato de imagen Base64 inválido" });
    }

    const contentType = matches[1];
    const base64Content = matches[2];
    const dataBuffer = Buffer.from(base64Content, 'base64');

    // Get file extension from MIME type
    let ext = 'jpg';
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('webp')) ext = 'webp';
    else if (contentType.includes('gif')) ext = 'gif';
    else if (contentType.includes('svg+xml')) ext = 'svg';

    // Form safe basename
    let safeBaseName = 'cover';
    if (filename) {
      const parsed = path.parse(filename);
      safeBaseName = parsed.name.replace(/[^a-zA-Z0-9_\-]/g, '_');
    }

    // Name with timestamp to prevent browser cache collisions
    const finalFilename = `${safeBaseName}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${ext}`;
    const targetPath = path.join(UPLOADS_DIR, finalFilename);

    fs.writeFileSync(targetPath, dataBuffer);

    // Return absolute public path to access the file on the server
    res.json({ success: true, url: `/uploads/${finalFilename}` });
  } catch (err: any) {
    res.status(500).json({ error: `Error de subida: ${err.message}` });
  }
});

// --- SiteConfig ---
app.get('/api/config', (req, res) => {
  try {
    const config = getSiteConfig();
    res.json(config);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/config', requireAdmin, (req, res) => {
  try {
    const newConfig = req.body;
    db.prepare("UPDATE site_config SET value = ? WHERE key = 'site'").run(JSON.stringify(newConfig));
    res.json({ success: true, config: newConfig });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Auth ---
app.post('/api/auth/login', (req, res) => {
  try {
    const { passcode } = req.body;
    const config = getSiteConfig();
    if (passcode === config.adminPasscode) {
      res.json({ success: true, token: passcode });
    } else {
      res.status(401).json({ success: false, error: "Contraseña incorrecta" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Books ---
app.get('/api/books', (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM books").all() as any[];
    const list = rows.map((b) => ({
      ...b,
      isFeatured: !!b.isFeatured,
      buyLinks: b.buyLinks ? JSON.parse(b.buyLinks) : {},
      reviews: b.reviews ? JSON.parse(b.reviews) : []
    }));
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', requireAdmin, (req, res) => {
  try {
    const b = req.body;
    db.prepare(`
      INSERT INTO books (id, title, subtitle, description, synopsis, genre, isbn, pages, publisher, publishDate, coverImage, buyLinks, isFeatured, rating, reviews)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      b.id,
      b.title,
      b.subtitle || null,
      b.description,
      b.synopsis,
      b.genre,
      b.isbn || null,
      b.pages || null,
      b.publisher || null,
      b.publishDate || null,
      b.coverImage || '',
      JSON.stringify(b.buyLinks || {}),
      b.isFeatured ? 1 : 0,
      b.rating || 5,
      JSON.stringify(b.reviews || [])
    );
    res.json({ success: true, book: b });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/books/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body;
    db.prepare(`
      UPDATE books SET 
        title = ?, subtitle = ?, description = ?, synopsis = ?, genre = ?, 
        isbn = ?, pages = ?, publisher = ?, publishDate = ?, coverImage = ?, 
        buyLinks = ?, isFeatured = ?, rating = ?, reviews = ?
      WHERE id = ?
    `).run(
      b.title,
      b.subtitle || null,
      b.description,
      b.synopsis,
      b.genre,
      b.isbn || null,
      b.pages || null,
      b.publisher || null,
      b.publishDate || null,
      b.coverImage || '',
      JSON.stringify(b.buyLinks || {}),
      b.isFeatured ? 1 : 0,
      b.rating || 5,
      JSON.stringify(b.reviews || []),
      id
    );
    res.json({ success: true, book: b });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/books/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM books WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Events ---
app.get('/api/events', (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM events ORDER BY date ASC").all() as any[];
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', requireAdmin, (req, res) => {
  try {
    const e = req.body;
    db.prepare(`
      INSERT INTO events (id, title, date, time, location, description, ticketUrl, eventType)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(e.id, e.title, e.date, e.time || null, e.location, e.description, e.ticketUrl || null, e.eventType);
    res.json({ success: true, event: e });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/events/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const e = req.body;
    db.prepare(`
      UPDATE events SET 
        title = ?, date = ?, time = ?, location = ?, description = ?, ticketUrl = ?, eventType = ?
      WHERE id = ?
    `).run(e.title, e.date, e.time || null, e.location, e.description, e.ticketUrl || null, e.eventType, id);
    res.json({ success: true, event: e });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM events WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Submissions ---
app.get('/api/submissions', requireAdmin, (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM submissions ORDER BY date DESC").all() as any[];
    const list = rows.map((s) => ({ ...s, read: !!s.read }));
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/submissions', (req, res) => {
  try {
    const s = req.body;
    const id = s.id || 'sub_' + Math.random().toString(36).substring(2, 11);
    const date = s.date || new Date().toISOString().split('T')[0];
    db.prepare(`
      INSERT INTO submissions (id, name, email, subject, message, date, read)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).run(id, s.name, s.email, s.subject, s.message, date);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark submission as read/unread
app.put('/api/submissions/:id/read', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;
    db.prepare("UPDATE submissions SET read = ? WHERE id = ?").run(read ? 1 : 0, id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/submissions/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM submissions WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Newsletter ---
app.get('/api/newsletter', requireAdmin, (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM newsletter ORDER BY date DESC").all() as any[];
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/newsletter', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: "Correo electrónico no válido" });
    }
    
    // Check if duplicate
    const exists = db.prepare("SELECT id FROM newsletter WHERE LOWER(email) = LOWER(?)").get(email);
    if (exists) {
      return res.json({ success: true, message: "Ya registrado", alreadyExists: true });
    }

    const id = 'news_' + Math.random().toString(36).substring(2, 11);
    const date = new Date().toISOString().split('T')[0];
    db.prepare("INSERT INTO newsletter (id, email, date) VALUES (?, ?, ?)").run(id, email, date);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/newsletter/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM newsletter WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Influencer Applications ---
app.get('/api/influencers', requireAdmin, (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM influencer_applications ORDER BY date DESC").all() as any[];
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/influencers', (req, res) => {
  try {
    const s = req.body;
    const id = 'infl_' + Math.random().toString(36).substring(2, 11);
    const date = new Date().toISOString().split('T')[0];
    db.prepare(`
      INSERT INTO influencer_applications (id, name, email, platform, handle, followers, selectedBookId, postLink, message, date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')
    `).run(id, s.name, s.email, s.platform, s.handle, Number(s.followers || 0), s.selectedBookId, s.postLink || '', s.message, date);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(550).json({ error: err.message });
  }
});

app.put('/api/influencers/:id/status', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare("UPDATE influencer_applications SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/influencers/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM influencer_applications WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Serve frontend with Vite middleware in dev or static files in prod
async function boot() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Lola Woods Server] running in ${process.env.NODE_ENV || 'development'} mode on http://0.0.0.0:${PORT}`);
  });
}

boot();
