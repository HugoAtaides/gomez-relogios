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
    name: ' Orient Solartech Elite Sea MBSS 1519 G1SX',
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
    name: 'Orient Eternal MGSS1269 G1KX',
    category: 'Quartz',
    price: 898.00,
    compareAt: 1098.00,
    stock: 1,
    image: 'assets/produtos/orient-1269-frente2.jpg',
    gallery: ['assets/produtos/orient-1269-frente2.jpg',
              'assets/produtos/orient-1269-frente1.jpg',
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
    name: 'Orient MBSSC308',
    category: 'Solar',
    price: 1398.00,
    compareAt: 1498.00,
    stock: 1,
    badge: 'Destaque',
    image: 'assets/produtos/orient-c308-frente1.jpg',
    gallery: ['assets/produtos/orient-c308-frente1.jpg',
              'assets/produtos/orient-c308-frente2.jpg',
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
    name: 'Mondaine 32951G0MVNE2',
    category: 'Quartz',
    price: 328.00,
    compareAt: 448.00,
    stock: 1,
    image: 'assets/produtos/mondaine-32951g0mvne2.jpg',
    gallery: ['assets/produtos/mondaine-32951g0mvne2.jpg',
              'assets/produtos/mondaine-32951g0mvne2 (2).jpg',
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
    id: 'seculus-39007g0svnq5',
    brand: 'Seculus',
    name: 'Seculus 39007G0SVNQ5',
    category: 'Automático',
    price: 1450.00,
    compareAt: 1599.00,
    stock: 1,
    image: 'assets/produtos/seculus-39007g0svnq5.jpg',
    gallery: ['assets/produtos/seculus-39007g0svnq5.jpg',
              'assets/produtos/seculus-39007g0svnq5 (2).jpg',
              'assets/produtos/seculus-39007g0svnq5 (3).jpg',
              'assets/produtos/seculus-39007g0svnq5 (4).jpg',
              'assets/produtos/seculus-39007g0svnq5 (5).jpg',
              'assets/produtos/seculus-39007g0svnq5 (6).jpg',
              'assets/produtos/seculus-39007g0svnq5 (7).jpg'],
    description: 'O Relógio Masculino Automático Safira Azul Claro - Seculus (Referência: 39007G0SVNQ5) é um modelo automático com estilo esportivo e materiais de alta resistência.',
    specs: {
      'Marca': 'Seculus',
      'Modelo': '39007G0SVNQ5',
      'Diâmetro da caixa': '40 mm',
      'Tecnologia': 'Mecânico',
      'Movimento': 'Automático',
      'Resistência à água': '100m',
      'Garantia': '24 meses pelo fabricante Seculus Brasil'
    },
    shipping: { weight: 0.6, width: 12, height: 8, length: 18 }
  },
      {
    id: 'mondaine-32993g0mvnc8',
    brand: 'Mondaine',
    name: 'Mondaine 32993G0MVNC8',
    category: 'Automático',
    price: 750.00,
    compareAt: 999.00,
    stock: 1,
    image: 'assets/produtos/mondaine-32993g0mvnc8.jpg',
    gallery: ['assets/produtos/mondaine-32993g0mvnc8.jpg',
              'assets/produtos/mondaine-32993g0mvnc8 (2).jpg',
              'assets/produtos/mondaine-32993g0mvnc8 (3).jpg',
              'assets/produtos/mondaine-32993g0mvnc8 (4).jpg',
              'assets/produtos/mondaine-32993g0mvnc8 (5).jpg',
              'assets/produtos/mondaine-32993g0mvnc8 (6).jpg'],
    description: 'O Relógio Masculino Mondaine 1954 Automático celebra a rica herança suíço-brasileira da marca nesta bela edição comemorativa. Seu requintado mostrador branco traz uma combinação muito tradicional de algarismos romanos com índices completos. Com uma imponente caixa em aço inoxidável de 40mm, ele garante excelente presença e encaixe no pulso masculino. O acabamento polido do metal confere uma estética clássica e atemporal que combina perfeitamente com qualquer ocasião. Movido pela energia natural do pulso, ele traz o robusto maquinismo japonês Miyota 8215 de 21 jóias. Esse sistema de autossuficiência mecânica dispensa baterias e oferece uma excelente reserva de marcha de 42 horas. O modelo opera com frequência de 21.600 vibrações por hora e conta com um prático calendário de data no mostrador. Dispõe ainda de corda manual e da útil função Hacking para a sincronização exata do ponteiro dos segundos. A alta durabilidade da peça é assegurada pelo vidro de cristal mineral e pela estrutura altamente resistente ao desgaste. A elegante pulseira em couro legítimo preto proporciona sobriedade, extremo conforto e um ajuste perfeito ao braço. O fundo de rosca garante uma vedação totalmente precisa, oferecendo uma impressionante resistência à água de 10ATM. É a escolha definitiva para o homem moderno que aprecia a sofisticação e a verdadeira arte da energia em movimento.',
    specs: {
      'Marca': 'Mondaine',
      'Modelo': '32993G0MVNC8',
      'Diâmetro da caixa': '40 mm',
      'Tecnologia': 'Mecânico',
      'Movimento': 'Automático',
      'Resistência à água': '100m',
      'Garantia': 'Garantia conforme condições do produto'
    },
    shipping: { weight: 0.6, width: 12, height: 8, length: 18 }
  },
  {
    id: 'tissot-seastar-a660-760k',
    brand: 'Tissot',
    name: 'Tissot Seastar A660/760K',
    category: 'Automático',
    price: 1500.00,
    compareAt: 1850.00,
    stock: 1,
    badge: 'Vintage',
    image: 'assets/produtos/tissot (1).jpg',
    gallery: ['assets/produtos/tissot (1).jpg',
              'assets/produtos/tissot (2).jpg',
              'assets/produtos/tissot (3).jpg',
              'assets/produtos/tissot (4).jpg',
              'assets/produtos/tissot (5).jpg',
              'assets/produtos/tissot (6).jpg',
              'assets/produtos/tissot (7).jpg'],
    description: 'Tissot 1853 Seastar Automático A660/760K, calibre Tissot ETA 2846, relógio da década de 1980, mostrador bom, 21 jewels, relógio suíço. Relógio em excelente estado, com apenas alguns sinais de uso. Aço inoxidável, em prata e ouro, calendário day-date, cristal de safira, 30m de resistência à agua, microajuste. Não acompanha elos adicionais. As fotos são reais do produto. É possível que algumas partes do relógio tenham sido substituídas, pois é um relógio vintage.',
    specs: {
      'Marca': 'Tissot',
      'Modelo': 'Seastar A660/760K',
      'Diâmetro da caixa': '35 mm',
      'Tecnologia': 'Mecânico',
      'Movimento': 'Automático',
      'Resistência à água': '30m',
      'Garantia': 'Garantia conforme condições do produto'
    },
    shipping: { weight: 0.6, width: 12, height: 8, length: 18 }
  }
];

window.getProduct = function (id) {
  return window.PRODUCTS.find(p => p.id === id);
};
