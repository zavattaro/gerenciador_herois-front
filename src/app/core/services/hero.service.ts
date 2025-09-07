import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Hero } from '../model/hero.model';
import { HttpClient } from '@angular/common/http';
import { Superpower } from '../model/superpower.model';

/**
 * Serviço para gerenciamento de heróis e superpoderes
 * @description Responsável pela comunicação com a API backend
 * @injectable ProvidedIn: 'root'
 */
@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private readonly BASE_URL = 'http://localhost:8080/api/Hero'; 
  private readonly SUPERPOWERS_URL = 'http://localhost:8080/api/Superpowers'; 
  
  private _http = inject(HttpClient);

  // Métodos para Heróis
  getAll(): Observable<Hero[]> { 
    return this._http.get<Hero[]>(this.BASE_URL);
  }

  // Busca Herói por id
  getById(id: number): Observable<Hero> {
    return this._http.get<Hero>(`${this.BASE_URL}/${id}`);
  }

  // Criar Herói
  createHero(hero: Hero): Observable<Hero> {
    return this._http.post<Hero>(this.BASE_URL, hero);
  }

  // Atualizar Herói pelo id
  updateHero(id: number, hero: Hero): Observable<Hero> {
    return this._http.put<Hero>(`${this.BASE_URL}/${id}`, hero);
  }

  // Deletar Herói pelo id
  deleteHero(id: number): Observable<void> {
    return this._http.delete<void>(`${this.BASE_URL}/${id}`);
  }

  // Métodos para Superpoderes
  getAllSuperpowers(): Observable<Superpower[]> {
    return this._http.get<Superpower[]>(this.SUPERPOWERS_URL);
  }
}