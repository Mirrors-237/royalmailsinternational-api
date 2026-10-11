// Editable content of the home page, stored as JSON in site_settings.homeContent

export type SampleStatus = 'COLLECTED' | 'IN_TRANSIT' | 'IN_CUSTOMS' | 'DELIVERED';
export type SampleMode = 'AIR' | 'SEA' | 'ROAD';

// Example shipment shown in the animated tracking card of the hero (illustration only)
export interface HomeSample {
  from: string;
  via?: string;
  to: string;
  mode: SampleMode;
  status: SampleStatus;
}

export interface HomeContent {
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroText: string;
  stats: { value: string; label: string }[];
  samples: HomeSample[];
}
