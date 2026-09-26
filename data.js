// CATÁLOGO CENTRAL DA GOMEZ RELÓGIOS
// Edite apenas este arquivo para adicionar/remover produtos e alterar preços.

window.GOMEZ_CONFIG = {
  storeName: 'Gomez Relógios',
  whatsapp: '5561999999999', // TROQUE pelo WhatsApp da Gomez, somente números, com DDI 55.
  originCep: '70000000',      // TROQUE pelo CEP de postagem da Gomez.
  city: 'Brasília - DF',
  currency: 'BRL',
  shippingEnabled: true,
  mercadoPagoEnabled: true,
  freeShippingThreshold: 0 // Ex.: 1500. Use 0 para desativar.
};

// Preços abaixo são exemplos editáveis.
// As fotos podem ser colocadas em /assets/produtos/ e referenciadas em image.
window.PRODUCTS = [
  {
    id: 'orient-mbss-1519-g1sx',
    brand: 'Orient',
    name: 'Solartech Elite Sea MBSS 1519 G1SX',
    category: 'Solar',
    price: 1190.00,
    compareAt: 1290.00,
    stock: 1,
    badge: 'Destaque',
    image: 'assets/produtos/orient-mbss-1519-g1sx.jpg',
    gallery: ['assets/produtos/orient-mbss-1519-g1sx.jpg'],
    description: 'Relógio Orient com tecnologia Solartech e proposta esportiva elegante, pensado para quem quer praticidade sem abrir mão de presença.',
    specs: {
      'Marca': 'Orient',
      'Modelo': 'MBSS 1519 G1SX',
      'Tecnologia': 'Solartech',
      'Movimento': 'Quartzo solar',
      'Resistência à água': 'Consulte a ficha do fabricante',
      'Garantia': 'Garantia conforme condições do produto'
    },
    shipping: { weight: 0.6, width: 12, height: 8, length: 18 }
  },
  {
    id: 'orient-mgss1269-g1kx',
    brand: 'Orient',
    name: 'Orient MGSS1269 G1KX',
    category: 'Clássico',
    price: 899.00,
    compareAt: null,
    stock: 1,
    badge: '',
    image: 'assets/produtos/orient-mgss1269-g1kx.jpg',
    gallery: ['assets/produtos/orient-mgss1269-g1kx.jpg'],
    description: 'Design clássico Orient para composições sociais e uso cotidiano.',
    specs: {
      'Marca': 'Orient',
      'Modelo': 'MGSS1269 G1KX',
      'Movimento': 'Quartzo',
      'Garantia': 'Garantia conforme condições do produto'
    },
    shipping: { weight: 0.6, width: 12, height: 8, length: 18 }
  },
  {
    id: 'orient-c288-d1sx',
    brand: 'Orient',
    name: 'Solartech Elite Sea MBSS C288 D1SX',
    category: 'Solar',
    price: 1390.00,
    compareAt: 1490.00,
    stock: 1,
    badge: 'Solartech',
    image: 'assets/produtos/orient-c288-d1sx.jpg',
    gallery: ['assets/produtos/orient-c288-d1sx.jpg'],
    description: 'Modelo Solartech com visual marcante e proposta esportiva.',
    specs: {
      'Marca': 'Orient',
      'Modelo': 'MBSS C288 D1SX',
      'Tecnologia': 'Solartech',
      'Movimento': 'Quartzo solar',
      'Garantia': 'Garantia conforme condições do produto'
    },
    shipping: { weight: 0.6, width: 12, height: 8, length: 18 }
  },
  {
    id: 'orient-eternal-mgss1258',
    brand: 'Orient',
    name: 'Orient Eternal MGSS 1258',
    category: 'Clássico',
    price: 799.00,
    compareAt: null,
    stock: 1,
    badge: '',
    image: 'assets/produtos/orient-eternal-mgss1258.jpg',
    gallery: ['assets/produtos/orient-eternal-mgss1258.jpg'],
    description: 'Relógio Orient de estética clássica e versátil.',
    specs: {
      'Marca': 'Orient',
      'Modelo': 'MGSS 1258',
      'Movimento': 'Quartzo',
      'Garantia': 'Garantia conforme condições do produto'
    },
    shipping: { weight: 0.6, width: 12, height: 8, length: 18 }
  },
  {
    id: 'technos-golf-2115udk',
    brand: 'Technos',
    name: 'Technos Golf 2115UDK',
    category: 'Esportivo',
    price: 566.00,
    compareAt: null,
    stock: 1,
    badge: 'Oportunidade',
    image: 'assets/produtos/technos-golf-2115udk.jpg',
    gallery: ['assets/produtos/technos-golf-2115udk.jpg'],
    description: 'Technos Golf com perfil esportivo e visual contemporâneo.',
    specs: {
      'Marca': 'Technos',
      'Modelo': 'Golf 2115UDK',
      'Movimento': 'Quartzo',
      'Garantia': 'Garantia conforme condições do produto'
    },
    shipping: { weight: 0.6, width: 12, height: 8, length: 18 }
  }
];

window.getProduct = function (id) {
  return window.PRODUCTS.find(p => p.id === id);
};
