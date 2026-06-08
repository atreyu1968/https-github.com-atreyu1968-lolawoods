import { SiteConfig, Book, AuthorEvent } from '../types';

export const defaultSiteConfig: SiteConfig = {
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
  profileImage: "", // empty so it renders an elegant placeholder or default CSS portrait
  agentName: "Representaciones Literarias Mundiales",
  agentContact: "contacto@lolawoods-literary.com",
  socialTwitter: "https://twitter.com/LolaWoodsWriter",
  socialInstagram: "https://instagram.com/LolaWoodsOficial",
  socialFacebook: "https://facebook.com/LolaWoodsLibros",
  socialGoodreads: "https://goodreads.com/author/lola_woods",
  themeColor: "rose",
  adminPasscode: "lola2026",
  footerRights: "© 2026 Lola Woods. Todos los derechos reservados. Todas las novelas de amor, risas y enredos son de su exclusiva propiedad.",
  genres: ["Romance Histórico", "Intriga Romántica", "Romance Contemporáneo", "Comedia Romántica", "Fantasía Romántica"]
};

export const defaultBooks: Book[] = [
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
    coverImage: "", // Will use beautiful procedurally generated book cover
    buyLinks: {
      amazon: "https://amazon.com",
      kobo: "https://kobo.com",
      editorial: "https://woods-editorial.com",
      other: "https://casadellibro.com"
    },
    isFeatured: false,
    rating: 4.8,
    reviews: [
      { id: "rev1", author: "Marta G.", rating: 5, comment: "Una de las mejores novelas escocesas que he leído. Catherine tiene una fuerza arrolladora.", date: "2026-04-10" },
      { id: "rev2", author: "Carlos Ruiz", rating: 4, comment: "Excelente ambientación histórica y química magnífica entre los protagonistas.", date: "2026-05-02" }
    ]
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
    coverImage: "", // Generates stunning book cover
    buyLinks: {
      amazon: "https://amazon.com",
      kobo: "https://kobo.com",
      editorial: "https://woods-editorial.com"
    },
    isFeatured: true,
    rating: 4.9,
    reviews: [
      { id: "rev3", author: "Laura M.", rating: 5, comment: "¡Me tuvo en vela hasta las tres de la mañana! Giro tras giro y un romance de infarto.", date: "2025-11-25" },
      { id: "rev4", author: "Sofía Martínez", rating: 5, comment: "La tensión en este libro es sencillamente insoportable. Lola Woods se supera con cada obra.", date: "2025-12-05" }
    ]
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
    coverImage: "", // Generated book cover Color: Rose Romantic
    buyLinks: {
      amazon: "https://amazon.com",
      kobo: "https://kobo.com",
      other: "https://fnac.es"
    },
    isFeatured: false,
    rating: 4.7,
    reviews: [
      { id: "rev5", author: "Elena Beltrán", rating: 4, comment: "Dulce, reconfortante y llena de olor a pan caliente y libros antiguos. Me encantó.", date: "2025-03-01" }
    ]
  }
];

export const defaultEvents: AuthorEvent[] = [
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
