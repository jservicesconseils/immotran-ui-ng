export interface ProvinceOption {
  label: string;
  value: string;
}

/** Provinces et territoires canadiens (cahier des charges, §7 : juridiction par province/territoire). */
export const CANADIAN_PROVINCES: ProvinceOption[] = [
  { label: 'QC — Québec', value: 'QC' },
  { label: 'ON — Ontario', value: 'ON' },
  { label: 'BC — Colombie-Britannique', value: 'BC' },
  { label: 'AB — Alberta', value: 'AB' },
  { label: 'MB — Manitoba', value: 'MB' },
  { label: 'SK — Saskatchewan', value: 'SK' },
  { label: 'NS — Nouvelle-Écosse', value: 'NS' },
  { label: 'NB — Nouveau-Brunswick', value: 'NB' },
  { label: 'PE — Île-du-Prince-Édouard', value: 'PE' },
  { label: 'NL — Terre-Neuve-et-Labrador', value: 'NL' },
  { label: 'YT — Yukon', value: 'YT' },
  { label: 'NT — Territoires du Nord-Ouest', value: 'NT' },
  { label: 'NU — Nunavut', value: 'NU' },
];
