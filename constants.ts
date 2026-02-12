import { Recipe, SocialQueueItem, PinterestBoardMap } from './types';

export const MOCK_RECIPES: Recipe[] = [
  {
    id: 'r-1',
    title: 'Poulet Basilic Thaï Épicé',
    cuisine_type: 'Thaï',
    badges: ['Protéiné', 'Épicé'],
    image_url: 'https://picsum.photos/400/600?random=1',
    ingredients_count: 8,
    created_at: '2023-10-01T10:00:00Z'
  },
  {
    id: 'r-2',
    title: 'Salade de Quinoa Méditerranéenne',
    cuisine_type: 'Méditerranéen',
    badges: ['Végan', 'Sans Gluten'],
    image_url: 'https://picsum.photos/400/600?random=2',
    ingredients_count: 12,
    created_at: '2023-10-02T11:30:00Z'
  },
  {
    id: 'r-3',
    title: 'Risotto aux Champignons Crémeux',
    cuisine_type: 'Italien',
    badges: ['Végétarien', 'Réconfortant'],
    image_url: 'https://picsum.photos/400/600?random=3',
    ingredients_count: 9,
    created_at: '2023-10-05T09:15:00Z'
  },
  {
    id: 'r-4',
    title: 'Toasts Avocat et Œuf Poché',
    cuisine_type: 'Petit-déjeuner',
    badges: ['Rapide', 'Bonnes Graisses'],
    image_url: 'https://picsum.photos/400/600?random=4',
    ingredients_count: 5,
    created_at: '2023-10-06T08:00:00Z'
  },
  {
    id: 'r-5',
    title: 'Tacos au Bœuf et Citron Vert',
    cuisine_type: 'Mexicain',
    badges: ['Familial'],
    image_url: 'https://picsum.photos/400/600?random=5',
    ingredients_count: 10,
    created_at: '2023-10-07T18:00:00Z'
  }
];

export const MOCK_QUEUE: SocialQueueItem[] = [
  {
    id: 'q-1',
    recipe_id: 'r-1',
    recipe_title: 'Poulet Basilic Thaï Épicé',
    image_path: 'https://picsum.photos/400/600?random=1',
    platform: 'Pinterest',
    status: 'posted',
    pin_title: 'Recette Facile de Poulet Thaï',
    pin_description: 'Un dîner prêt en 20 minutes qui a du punch ! #CuisineThai #Poulet',
    board_slug: 'recettes-thai',
    destination_url: 'https://nutrizen.app/recipe/thai-basil-chicken?utm_source=pinterest',
    utm_stats: { clicks: 1240, impressions: 45000, saves: 320 },
    published_at: '2023-10-10T14:00:00Z'
  },
  {
    id: 'q-2',
    recipe_id: 'r-2',
    recipe_title: 'Salade de Quinoa Méditerranéenne',
    image_path: 'https://picsum.photos/400/600?random=2',
    platform: 'Pinterest',
    status: 'scheduled',
    pin_title: 'Bol Santé Quinoa Méditerranéen',
    pin_description: 'Parfait pour le meal prep. Végan et sans gluten.',
    board_slug: 'salades-sante',
    destination_url: 'https://nutrizen.app/recipe/med-quinoa?utm_source=pinterest',
    utm_stats: { clicks: 0, impressions: 0, saves: 0 },
    scheduled_at: '2023-10-28T09:00:00Z'
  },
  {
    id: 'q-3',
    recipe_id: 'r-3',
    recipe_title: 'Risotto aux Champignons Crémeux',
    image_path: 'https://picsum.photos/400/600?random=3',
    platform: 'Pinterest',
    status: 'pending',
    pin_title: 'Le Meilleur Risotto Champignons',
    pin_description: 'Crémeux, onctueux et étonnamment facile à faire.',
    board_slug: 'diner-italien',
    destination_url: 'https://nutrizen.app/recipe/mushroom-risotto?utm_source=pinterest',
    utm_stats: { clicks: 0, impressions: 0, saves: 0 },
  },
  {
    id: 'q-4',
    recipe_id: 'r-4',
    recipe_title: 'Toasts Avocat et Œuf Poché',
    image_path: 'https://picsum.photos/400/600?random=4',
    platform: 'Pinterest',
    status: 'error',
    pin_title: 'L\'Ultime Avocado Toast',
    pin_description: 'Commencez la journée du bon pied.',
    board_slug: 'idees-dej',
    destination_url: 'https://nutrizen.app/recipe/avo-toast?utm_source=pinterest',
    utm_stats: { clicks: 0, impressions: 0, saves: 0 },
    error_message: 'Limite API Dépassée'
  }
];

export const MOCK_BOARDS: PinterestBoardMap[] = [
  { id: 'b-1', cuisine_key: 'Thaï', board_slug: 'recettes-thai', board_name: 'Recettes Thaï Authentiques', pinterest_board_id: '12345', is_active: true },
  { id: 'b-2', cuisine_key: 'Méditerranéen', board_slug: 'salades-sante', board_name: 'Salades & Bols Santé', pinterest_board_id: '67890', is_active: true },
  { id: 'b-3', cuisine_key: 'Italien', board_slug: 'diner-italien', board_name: 'Idées Dîner Italien', pinterest_board_id: '11223', is_active: true },
  { id: 'b-4', cuisine_key: 'Mexicain', board_slug: 'fiesta-mexicaine', board_name: 'Fiesta Mexicaine', pinterest_board_id: '44556', is_active: true },
  { id: 'b-5', cuisine_key: 'Petit-déjeuner', board_slug: 'idees-dej', board_name: 'Petits-déjeuners Sains', pinterest_board_id: '77889', is_active: false },
];