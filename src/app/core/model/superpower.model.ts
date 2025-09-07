export interface Superpower {
  id: number;
  name: string;
  description: string;
}

export interface HeroSuperpower {
  heroId: number;
  superpowerId: number;
}