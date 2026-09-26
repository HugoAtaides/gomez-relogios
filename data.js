// CATÁLOGO CENTRAL DA GOMEZ RELÓGIOS
// Edite apenas este arquivo para adicionar/remover produtos e alterar preços.

window.GOMEZ_CONFIG = {
  storeName: 'Gomez Relógios',
  whatsapp: '5561999490969', // TROQUE pelo WhatsApp da Gomez, somente números, com DDI 55.
  originCep: '71725207',      // TROQUE pelo CEP de postagem da Gomez.
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
    image: 'assets/produtos/orient-1519-frente1.jpg',
    gallery: [
  'assets/produtos/orient-1519-frente2.jpg',
  'assets/produtos/orient-1519-frente3.jpg',
  'assets/produtos/orient-1519-frente4.jpg',
  'assets/produtos/orient-1519-frente5.jpg'
],
    description: 'Relógio Orient com tecnologia Solartech e proposta esportiva elegante, pensado para quem quer praticidade sem abrir mão de presença.',
    specs: {
      'Marca': 'Orient',
      'Modelo': 'MBSS 1519 G1SX',
      'Tecnologia': 'Solartech',
      'Movimento': 'Quartzo solar',
      'Resistência à água': '100 metros',
      'Garantia': '90 dias, conforme Código de Defesa do Consumidor, e 1 ano, se acionada a garantia do fabricante.'
    },
    shipping: { weight: 0.6, width: 12, height: 8, length: 18 }
  },
  {
    id: 'orient-mgss1269-g1kx',
    brand: 'Orient',
    name: 'Orient Eternal MGSS1269 G1KX',
    category: 'Clássico',
    price: 899.00,
    compareAt: 1099.00,
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
  }
  ];

window.getProduct = function (id) {
  return window.PRODUCTS.find(p => p.id === id);
};
