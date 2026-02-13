// Dashboard Data - Hotels, Destinations, and Packages

const hotels = [
    {
        id: 1,
        name: 'Hotel Premium Menongue',
        category: 'premium',
        location: 'Centro de Menongue',
        distance: '2 km do aeroporto',
        rating: 4.8,
        reviews: 156,
        pricePerNight: 15000,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
            'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'
        ],
        description: 'Hotel moderno no coração de Menongue, com quartos espaçosos, ar-condicionado, Wi-Fi de alta velocidade e restaurante com culinária internacional e local.',
        amenities: [
            { icon: '🍳', name: 'Pequeno-almoço' },
            { icon: '📶', name: 'Wi-Fi Grátis' },
            { icon: '❄️', name: 'Ar-condicionado' },
            { icon: '🅿️', name: 'Estacionamento' },
            { icon: '🍽️', name: 'Restaurante' },
            { icon: '🏊', name: 'Piscina' },
            { icon: '🧹', name: 'Limpeza Diária' },
            { icon: '🔒', name: 'Cofre' }
        ],
        roomTypes: [
            { type: 'Standard', capacity: 2, price: 15000 },
            { type: 'Deluxe', capacity: 3, price: 22000 },
            { type: 'Suite', capacity: 4, price: 35000 }
        ]
    },
    {
        id: 2,
        name: 'Pousada Cubango',
        category: 'standard',
        location: 'Margem do Rio Cubango',
        distance: '5 km do centro',
        rating: 4.5,
        reviews: 98,
        pricePerNight: 8500,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
        images: [
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
            'https://images.unsplash.com/photo-1584132905271-512c958d674a?w=800',
            'https://images.unsplash.com/photo-1559599746-8c8b5b15bc3e?w=800'
        ],
        description: 'Acomodação charmosa com vista privilegiada para o Rio Cubango. Ambiente familiar e acesso direto a trilhas naturais e pontos de observação de aves.',
        amenities: [
            { icon: '🍳', name: 'Pequeno-almoço' },
            { icon: '📶', name: 'Wi-Fi' },
            { icon: '🌳', name: 'Jardim' },
            { icon: '🅿️', name: 'Estacionamento' },
            { icon: '🎣', name: 'Pesca' },
            { icon: '🚣', name: 'Canoagem' },
            { icon: '🦜', name: 'Bird Watching' },
            { icon: '🌅', name: 'Vista Rio' }
        ],
        roomTypes: [
            { type: 'Standard', capacity: 2, price: 8500 },
            { type: 'Familiar', capacity: 4, price: 14000 }
        ]
    },
    {
        id: 3,
        name: 'Lodge Safari Luiana',
        category: 'lodge',
        location: 'Parque Nacional Luiana',
        distance: '45 km de Menongue',
        rating: 4.9,
        reviews: 243,
        pricePerNight: 35000,
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        images: [
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
            'https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?w=800',
            'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
            'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'
        ],
        description: 'Lodge exclusivo em plena natureza selvagem. Inclui safaris guiados diários, observação noturna de animais e experiência gastronômica única sob as estrelas africanas.',
        amenities: [
            { icon: '🍳', name: 'Pensão Completa' },
            { icon: '🦁', name: 'Safari Incluído' },
            { icon: '🔥', name: 'Fogueira' },
            { icon: '🌟', name: 'Stargazing' },
            { icon: '👨‍🍳', name: 'Chef Privado' },
            { icon: '🚙', name: '4x4 Privativo' },
            { icon: '📷', name: 'Guia Fotográfico' },
            { icon: '🦅', name: 'Game Drives' }
        ],
        roomTypes: [
            { type: 'Tenda Safari', capacity: 2, price: 35000 },
            { type: 'Suite Panorâmica', capacity: 3, price: 50000 }
        ]
    },
    {
        id: 4,
        name: 'Residencial Cidade Alta',
        category: 'standard',
        location: 'Zona Residencial',
        distance: '3 km do centro',
        rating: 4.3,
        reviews: 67,
        pricePerNight: 6500,
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        images: [
            'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
        ],
        description: 'Opção econômica com bom custo-benefício. Quartos limpos e confortáveis, ideal para viajantes de negócios ou turistas em trânsito.',
        amenities: [
            { icon: '🍳', name: 'Pequeno-almoço' },
            { icon: '📶', name: 'Wi-Fi' },
            { icon: '❄️', name: 'Ar-condicionado' },
            { icon: '🅿️', name: 'Estacionamento' },
            { icon: '🧹', name: 'Limpeza' },
            { icon: '📺', name: 'TV a Cabo' }
        ],
        roomTypes: [
            { type: 'Single', capacity: 1, price: 6500 },
            { type: 'Double', capacity: 2, price: 9000 }
        ]
    },
    {
        id: 5,
        name: 'Boutique Hotel Savana',
        category: 'premium',
        location: 'Vista Panorâmica',
        distance: '4 km do aeroporto',
        rating: 4.7,
        reviews: 134,
        pricePerNight: 18000,
        image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
        images: [
            'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
            'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800'
        ],
        description: 'Hotel boutique com design contemporâneo africano. Rooftop bar com vista 360°, spa completo e gastronomia de alto nível.',
        amenities: [
            { icon: '🍳', name: 'Buffet Premium' },
            { icon: '📶', name: 'Wi-Fi Premium' },
            { icon: '❄️', name: 'Ar-condicionado' },
            { icon: '🍸', name: 'Rooftop Bar' },
            { icon: '💆', name: 'Spa' },
            { icon: '🏋️', name: 'Academia' },
            { icon: '🎭', name: 'Eventos' },
            { icon: '🚖', name: 'Transfer' }
        ],
        roomTypes: [
            { type: 'Deluxe', capacity: 2, price: 18000 },
            { type: 'Executive', capacity: 2, price: 25000 },
            { type: 'Presidential', capacity: 4, price: 45000 }
        ]
    }
];

const destinations = [
    {
        id: 1,
        name: 'Cataratas do Binga',
        location: 'Rio Cunene',
        image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800',
        description: 'Uma das maiores quedas d\'água de Angola, com 105 metros de altura. Um espetáculo natural de tirar o fôlego.',
        highlights: ['💧 Cascatas', '📸 Fotografia', '🥾 Trilhas'],
        featured: true
    },
    {
        id: 2,
        name: 'Parque Nacional Luiana',
        location: 'Cuando Cubango',
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
        description: 'Vasta área protegida com fauna selvagem diversificada, incluindo elefantes e búfalos.',
        highlights: ['🦁 Safari', '🐘 Elefantes', '🦜 Aves'],
        featured: true
    },
    {
        id: 3,
        name: 'Rio Cubango',
        location: 'Cuando Cubango',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        description: 'Oportunidades únicas para pesca desportiva, passeios de barco e observação da vida selvagem.',
        highlights: ['🎣 Pesca', '🚣 Canoagem', '🌅 Pôr do Sol'],
        featured: false
    },
    {
        id: 4,
        name: 'Aldeias Tradicionais',
        location: 'Región do Cubango',
        image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800',
        description: 'Visite comunidades locais e conheça os povos Cokwe, Mbunda e suas tradições autênticas.',
        highlights: ['🎨 Artesanato', '🥁 Música', '🤝 Intercâmbio'],
        featured: true
    },
    {
        id: 5,
        name: 'Reserva do Mavinga',
        location: 'Mavinga',
        image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
        description: 'Área de conservação com paisagens deslumbrantes e oportunidade de fotossafari.',
        highlights: ['🌍 Ecoturismo', '📷 Fotossafari', '🌿 Preservação'],
        featured: false
    },
    {
        id: 6,
        name: 'Centro Histórico Menongue',
        location: 'Menongue',
        image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
        description: 'Explore a história e cultura local através de monumentos, museus e arquitetura colonial.',
        highlights: ['🏛️ História', '🎭 Cultura', '🏺 Museus'],
        featured: false
    }
];

const packages = [
    {
        id: 1,
        name: 'Experiência Menongue',
        category: 'basico',
        price: 25000,
        duration: '2 dias / 1 noite',
        nights: 1,
        image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600',
        description: 'Perfeito para quem quer conhecer o essencial da capital provincial em pouco tempo.',
        includes: [
            '1 Noite no Hotel Premium',
            'Pequeno-almoço incluído',
            'City tour guiado',
            'Transfer aeroporto',
            'Guia local'
        ],
        itinerary: [
            { day: 1, activities: ['Check-in no hotel', 'City tour pela tarde', 'Jantar livre'] },
            { day: 2, activities: ['Pequeno-almoço', 'Visita ao mercado local', 'Check-out e transfer'] }
        ]
    },
    {
        id: 2,
        name: 'Experiência Cultural',
        category: 'popular',
        price: 55000,
        duration: '3 dias / 2 noites',
        nights: 2,
        image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600',
        description: 'Mergulhe na cultura angolana com tours exclusivos e experiências autênticas.',
        includes: [
            '2 Noites de hospedagem',
            'City tour completo',
            'Tour cultural às aldeias',
            'Transporte incluído',
            'Guia local especializado',
            'Jantar tradicional',
            'Show de música local'
        ],
        itinerary: [
            { day: 1, activities: ['Check-in', 'City tour', 'Jantar de boas-vindas'] },
            { day: 2, activities: ['Visita às aldeias tradicionais', 'Artesanato local', 'Show cultural'] },
            { day: 3, activities: ['Pequeno-almoço', 'Mercado artesanal', 'Check-out'] }
        ],
        featured: true
    },
    {
        id: 3,
        name: 'Safari & Natureza',
        category: 'premium',
        price: 120000,
        duration: '4 dias / 3 noites',
        nights: 3,
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600',
        description: 'Experiência completa de safari no Parque Nacional Luiana com hospedagem em lodge exclusivo.',
        includes: [
            '3 Noites no Lodge Safari Luiana',
            'Pensão completa',
            '2 Safaris diários',
            'Guia especializado em fauna',
            'Transporte 4x4 privativo',
            'Observação noturna',
            'Experiência stargazing'
        ],
        itinerary: [
            { day: 1, activities: ['Transfer ao lodge', 'Safari ao pôr do sol', 'Jantar sob as estrelas'] },
            { day: 2, activities: ['Safari matinal', 'Almoço no lodge', 'Safari vespertino', 'Observação noturna'] },
            { day: 3, activities: ['Game drive fotográfico', 'Piquenique no parque', 'Safari final'] },
            { day: 4, activities: ['Pequeno-almoço', 'Transfer de volta'] }
        ]
    },
    {
        id: 4,
        name: 'Aventura Aquática',
        category: 'medio',
        price: 45000,
        duration: '3 dias / 2 noites',
        nights: 2,
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600',
        description: 'Explore o Rio Cubango com atividades aquáticas e relaxamento na Pousada Cubango.',
        includes: [
            '2 Noites na Pousada Cubango',
            'Pensão completa',
            'Passeio de barco',
            'Pesca desportiva',
            'Canoagem guiada',
            'Bird watching',
            'Equipamentos incluídos'
        ],
        itinerary: [
            { day: 1, activities: ['Check-in', 'Passeio de barco ao pôr do sol', 'Jantar'] },
            { day: 2, activities: ['Pesca matinal', 'Canoagem', 'Observação de aves', 'Churrasco'] },
            { day: 3, activities: ['Pequeno-almoço', 'Última atividade', 'Check-out'] }
        ]
    },
    {
        id: 5,
        name: 'Experiência Completa VIP',
        category: 'premium',
        price: 250000,
        duration: '7 dias / 6 noites',
        nights: 6,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
        description: 'A experiência definitiva em Angola: combinação de cultura, natureza, conforto e exclusividade.',
        includes: [
            '2 Noites no Hotel Premium Menongue',
            '3 Noites no Lodge Safari Luiana',
            '1 Noite no Boutique Hotel Savana',
            'Pensão completa',
            'Todos os tours e safaris',
            'Guia privado dedicado',
            'Transporte premium',
            'Experiências VIP exclusivas',
            'Jantares em restaurantes selecionados'
        ],
        itinerary: [
            { day: 1, activities: ['Chegada VIP', 'Check-in Premium', 'Jantar de boas-vindas'] },
            { day: 2, activities: ['City tour privado', 'Tour cultural', 'Show exclusivo'] },
            { day: 3, activities: ['Transfer ao lodge', 'Safari vespertino', 'Jantar gourmet'] },
            { day: 4, activities: ['Safaris diários', 'Experiências exclusivas'] },
            { day: 5, activities: ['Último safari', 'Transfer hotel boutique'] },
            { day: 6, activities: ['Spa day', 'Rooftop dinner', 'Entretenimento'] },
            { day: 7, activities: ['Check-out VIP', 'Transfer aeroporto'] }
        ],
        featured: true
    }
];
