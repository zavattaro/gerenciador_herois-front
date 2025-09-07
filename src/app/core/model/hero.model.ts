import { Superpower } from "./superpower.model";

export interface Hero {
  id?: number;
  name: string;
  heroName: string;
  birthDate: string;
  height: number;
  weight: number;
  superpowerIds: number[];
  superpowers?: Superpower[];
}