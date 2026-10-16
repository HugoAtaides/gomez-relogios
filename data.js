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
  freeShippingThreshold: 0, // Ex.: 1500. Use 0 para desativar.

  // SUPABASE — dados públicos do projeto; nunca coloque a chave secreta aqui.
  // Cole aqui a URL do seu projeto e a Publishable Key do Supabase.
  supabaseUrl: 'https://pdllxurhmesadtuiisfr.supabase.co',
  supabasePublishableKey: 'sb_publishable_Qd19DT_a5lmtaYJs96BFOg_VepGGuHA'
};

// Preços abaixo são exemplos editáveis.
// As fotos podem ser colocadas em /assets/produtos/ e referenciadas em image.
window.PRODUCTS = [
  {
    id: 'orient-mbss-1519-g1sx',
    brand: 'Orient',
    name: 'Solartech Elite Sea MBSS 1519 G1SX',
    category: 'Solar',
    price: 1198.00,
    compareAt: 1290.00,
    stock: 1,
    badge: 'Destaque',
    image: 'assets/produtos/orient-1519-frente1.jpg',
    gallery: ['assets/produtos/orient-1519-frente1.jpg',
              'assets/produtos/orient-1519-frente2.jpg',
              'assets/produtos/orient-1519-frente3.jpg',
              'assets/produtos/orient-1519-frente4.jpg',
              'assets/produtos/orient-1519-frente5.jpg'],
    description: 'Relógio Orient com tecnologia Solartech e proposta esportiva elegante, pensado para quem quer praticidade sem abrir mão de presença.',
    specs: {
      'Marca': 'Orient',
      'Modelo': 'MBSS 1519 G1SX',
      'Diâmetro da caixa': '40 mm',
      'Tecnologia': 'Solartech',
      'Movimento': 'Quartzo solar',
      'Resistência à água': '100m',
      'Garantia': 'Garantia conforme condições do produto'
    },
    shipping: { weight: 0.6, width: 12, height: 8, length: 18 }
  },
  {
    id: 'orient-eternal-mgss1269-g1kx',
    brand: 'Orient',
    name: 'Eternal MGSS1269 G1KX',
    category: 'Quartz',
    price: 898.00,
    compareAt: 1098.00,
    stock: 1,
    image: 'assets/produtos/orient-1269-frente2.jpg',
    gallery: ['assets/produtos/orient-1269-frente1.jpg',
              'assets/produtos/orient-1269-frente3.jpg',
              'assets/produtos/orient-1269-frente4.jpg',
              'assets/produtos/orient-1269-frente5.jpg',
              'assets/produtos/orient-1269-frente6.jpg'],
    description: 'Relógio Orient original slim, com calendário e mostrador Sunray.',
    specs: {
      'Marca': 'Orient',
      'Modelo': 'Eternal MGSS1269 G1KX',
      'Diâmetro da caixa': '40 mm',
      'Tecnologia': 'Analógico',
      'Movimento': 'Quartzo',
      'Resistência à água': '30m',
      'Garantia': 'Garantia conforme condições do produto'
    },
    shipping: { weight: 0.6, width: 12, height: 8, length: 18 }
  },
  {
    id: 'orient-mbss-c308',
    brand: 'Orient',
    name: 'MBSSC308',
    category: 'Solar',
    price: 1398.00,
    compareAt: 1498.00,
    stock: 1,
    badge: 'Destaque',
    image: 'assets/produtos/orient-c308-frente1.jpg',
    gallery: ['assets/produtos/orient-c308-frente2.jpg',
              'assets/produtos/orient-c308-frente3.jpg',
              'assets/produtos/orient-c308-frente4.jpg',
              'assets/produtos/orient-c308-frente5.jpg',
              'assets/produtos/orient-c308-frente6.jpg',
              'assets/produtos/orient-c308-frente7.jpg'],
    description: 'Relógio Orient com tecnologia Solartech e proposta esportiva elegante, pensado para quem quer praticidade sem abrir mão de presença.',
    specs: {
      'Marca': 'Orient',
      'Modelo': 'MBSS C308',
      'Diâmetro da caixa': '40 mm',
      'Tecnologia': 'Solartech',
      'Movimento': 'Quartzo solar',
      'Resistência à água': '100m',
      'Garantia': 'Garantia conforme condições do produto'
    },
    shipping: { weight: 0.6, width: 12, height: 8, length: 18 }
  },
  {
    id: 'mondaine-32951g0mvne2',
    brand: 'Mondaine',
    name: '32951G0MVNE2',
    category: 'Quartz',
    price: 328.00,
    compareAt: 448.00,
    stock: 1,
    image: 'assets/produtos/mondaine-32951g0mvne2.jpg',
    gallery: ['assets/produtos/mondaine-32951g0mvne2 (2).jpg',
              'assets/produtos/mondaine-32951g0mvne2 (3).jpg',
              'assets/produtos/mondaine-32951g0mvne2 (4).jpg',
              'assets/produtos/mondaine-32951g0mvne2 (5).jpg',
              'assets/produtos/mondaine-32951g0mvne2 (6).jpg',
              'assets/produtos/mondaine-32951g0mvne2 (7).jpg',
              'assets/produtos/mondaine-32951g0mvne2 (8).jpg',
              'assets/produtos/mondaine-32951g0mvne2 (9).jpg',
              'assets/produtos/mondaine-32951g0mvne2 (10).jpg'],
    description: 'Este modelo Mondaine masculino se destaca pela caixa robusta de 48mm em aço prata. O mostrador azul com index completo adiciona elegância e excelente legibilidade. A pulseira em aço prata oferece resistência e acabamento refinado. O calendário integrado traz funcionalidade prática ao dia a dia. Seu design robusto transmite personalidade forte e presença marcante no pulso. O fundo em rosca garante maior proteção e segurança ao mecanismo interno. Ideal para homens que buscam um acessório imponente sem abrir mão do estilo. Com resistência à água de 5 ATM, une durabilidade e sofisticação em um só relógio.',
    specs: {
      'Marca': 'Mondaine',
      'Modelo': '32951G0MVNE2',
      'Diâmetro da caixa': '48 mm',
      'Tecnologia': 'Analógico',
      'Movimento': 'Quartzo',
      'Resistência à água': '50m',
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
