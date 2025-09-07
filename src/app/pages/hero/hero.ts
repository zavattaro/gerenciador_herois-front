import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Hero } from '../../core/model/hero.model';
import { HeroService } from '../../core/services/hero.service';
import { Superpower } from '../../core/model/superpower.model';

function dateFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { invalidDate: 'Data inválida' };
    }

    return null;
  };
}

function notFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const selectedDate = new Date(value);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return { futureDate: 'Data não pode ser futura' };
    }

    return null;
  };
}

@Component({
  selector: 'app-hero',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class HeroPage implements OnInit {
  private _service = inject(HeroService);
  private _fb = inject(FormBuilder);

  heroes: Hero[] = [];
  superpowers: Superpower[] = [];
  heroForm!: FormGroup;
  editHero: Hero | null = null;
  isEditing = false;
  formSubmitted = false;
  isModalOpen = false;

  // ✅ VARIÁVEIS SIMPLIFICADAS
  selectedSuperpowers: number[] = [];

  // Métodos para controlar o modal
  openCreateModal(): void {
    this.isEditing = false;
    this.formSubmitted = false;
    this.resetForm();
    this.isModalOpen = true;
  }

  openEditModal(hero: Hero): void {
    this.edit(hero);
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadHeroes();
    this.loadSuperpowers();
  }

  private initForm(): void {
    this.heroForm = this._fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      heroName: ['', [Validators.required, Validators.minLength(2)]],
      birthDate: [
        null,
        [Validators.required, dateFormatValidator(), notFutureDateValidator()],
      ], // ✅ Added Validators.required
      height: [
        null,
        [Validators.required, Validators.min(0.5), Validators.max(3.0)],
      ], // ✅ Added Validators.required
      weight: [
        null,
        [Validators.required, Validators.min(0), Validators.max(500)],
      ], // ✅ Added Validators.required
    });
  }

  // ✅ MÉTODOS SIMPLIFICADOS PARA COMBOBOX
  getSuperpowerName(id: number): string {
    const superpower = this.superpowers.find((sp) => sp.id === id);
    return superpower ? superpower.name : 'Desconhecido';
  }

  removeSuperpower(id: number): void {
    this.selectedSuperpowers = this.selectedSuperpowers.filter(
      (superpowerId) => superpowerId !== id
    );
    this.heroForm.get('superpowers')?.setValue(this.selectedSuperpowers);

    // Atualiza o combobox
    this.updateComboboxSelection();
  }

  isSuperpowerSelected(superpowerId: number): boolean {
    return this.selectedSuperpowers.includes(superpowerId);
  }

  // ✅ NOVO MÉTODO PARA COMBOBOX
  onSuperpowerChange(event: any): void {
    const select = event.target as HTMLSelectElement;
    this.selectedSuperpowers = Array.from(select.selectedOptions).map(
      (option) => Number(option.value)
    );

    console.log('🎯 Superpoderes selecionados:', this.selectedSuperpowers);

    this.heroForm.get('superpowers')?.setValue(this.selectedSuperpowers);
  }

  private updateComboboxSelection(): void {
    const select = document.getElementById(
      'superpowersSelect'
    ) as HTMLSelectElement;
    if (select) {
      // Desselecionar tudo primeiro
      Array.from(select.options).forEach((option) => {
        option.selected = false;
      });

      // Selecionar os options corretos
      this.selectedSuperpowers.forEach((superpowerId) => {
        const option = select.querySelector(
          `option[value="${superpowerId}"]`
        ) as HTMLOptionElement;
        if (option) {
          option.selected = true;
        }
      });
    }
  }

  get f() {
    return this.heroForm.controls;
  }

  get name() {
    return this.heroForm.get('name');
  }
  get heroName() {
    return this.heroForm.get('heroName');
  }
  get birthDate() {
    return this.heroForm.get('birthDate');
  }
  get height() {
    return this.heroForm.get('height');
  }
  get weight() {
    return this.heroForm.get('weight');
  }
  get superpowersControl() {
    return this.heroForm.get('superpowers');
  }

  public loadHeroes(): void {
    this._service.getAll().subscribe({
      next: (res: Hero[]) => {
        this.heroes = res;
      },
      error: (error) => {
        console.error('Erro ao carregar heróis:', error);
      },
    });
  }

  public loadSuperpowers(): void {
    this._service.getAllSuperpowers().subscribe({
      next: (res: Superpower[]) => {
        this.superpowers = res;
      },
      error: (error) => {
        console.error('Erro ao carregar superpoderes:', error);
      },
    });
  }
  public onSubmit(): void {
    this.formSubmitted = true;

    if (this.heroForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    const formValue = this.heroForm.value;

    // ✅ DEBUG: Verificar o que tem no formValue e selectedSuperpowers
    console.log('formValue.superpowers:', formValue.superpowers);
    console.log('this.selectedSuperpowers:', this.selectedSuperpowers);
    console.log('Form completo:', formValue);

    const heroData: Hero = {
      name: formValue.name,
      heroName: formValue.heroName,
      birthDate: formValue.birthDate,
      height: formValue.height || 0,
      weight: formValue.weight || 0,
      superpowerIds: this.selectedSuperpowers, // ← Usa selectedSuperpowers
    };

    // ✅ DEBUG: Verificar o payload que será enviado
    console.log('Payload que será enviado:', heroData);

    delete (heroData as any).superpowers;

    if (this.isEditing && this.editHero) {
      heroData.id = this.editHero.id;

      console.log('✅ EDITANDO - Payload final:', heroData);

      this._service.updateHero(this.editHero.id!, heroData).subscribe({
        next: () => {
          console.log('✅ Herói atualizado com sucesso!');
          this.loadHeroes();
          this.resetForm();
          this.closeModal();
        },
        error: (error) => {
          console.error('❌ Erro ao atualizar herói:', error);
          console.error('Detalhes do erro:', error.error);

          if (error.error?.errors) {
            const validationErrors = error.error.errors;
            let errorMessage = 'Erro de validação:\n';

            for (const key in validationErrors) {
              if (validationErrors.hasOwnProperty(key)) {
                errorMessage += `• ${validationErrors[key].join('\n• ')}\n`;
              }
            }

            alert(errorMessage);
          } else {
            alert(
              'Erro ao atualizar herói. Verifique o console para detalhes.'
            );
          }
        },
      });
    } else {
      console.log('✅ CRIANDO - Payload final:', heroData);

      this._service.createHero(heroData).subscribe({
        next: () => {
          console.log('✅ Herói criado com sucesso!');
          this.loadHeroes();
          this.resetForm();
          this.closeModal();
        },
        error: (error) => {
          console.error('❌ Erro ao criar herói:', error);
          console.error('Detalhes do erro:', error.error);

          if (error.error?.errors) {
            const validationErrors = error.error.errors;
            let errorMessage = 'Erro de validação:\n';

            for (const key in validationErrors) {
              if (validationErrors.hasOwnProperty(key)) {
                errorMessage += `• ${validationErrors[key].join('\n• ')}\n`;
              }
            }

            alert(errorMessage);
          } else {
            alert('Erro ao criar herói. Verifique o console para detalhes.');
          }
        },
      });
    }
  }

  private markAllAsTouched(): void {
    Object.keys(this.heroForm.controls).forEach((key) => {
      this.heroForm.get(key)?.markAsTouched();
    });
  }

  public edit(hero: Hero): void {
    this.editHero = hero;
    this.isEditing = true;
    this.formSubmitted = false;
    this.selectedSuperpowers = hero.superpowers?.map((sp) => sp.id) || [];

    this.heroForm.patchValue({
      name: hero.name,
      heroName: hero.heroName,
      birthDate: hero.birthDate ? hero.birthDate.split('T')[0] : null,
      height: hero.height,
      weight: hero.weight,
      superpowers: this.selectedSuperpowers,
    });

    // ✅ ATUALIZA A SELEÇÃO VISUAL DO COMBOBOX
    setTimeout(() => {
      this.updateComboboxSelection();
    });
  }

  public delete(id: number): void {
    if (confirm('Tem certeza que deseja excluir este herói?')) {
      this._service.deleteHero(id).subscribe({
        next: () => {
          this.loadHeroes();
          if (this.editHero?.id === id) {
            this.resetForm();
          }
        },
        error: (error) => {
          console.error('Erro ao excluir herói:', error);
        },
      });
    }
  }

  public resetForm(): void {
    this.heroForm.reset();
    this.heroForm.get('superpowers')?.setValue([]);
    this.selectedSuperpowers = [];
    this.editHero = null;
    this.isEditing = false;
    this.formSubmitted = false;
  }

  shouldShowError(controlName: string): boolean {
    const control = this.heroForm.get(controlName);
    return (
      !!control && (control.touched || this.formSubmitted) && control.invalid
    );
  }

  getErrorMessage(controlName: string): string {
    const control = this.heroForm.get(controlName);

    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo é obrigatório';
    if (control.errors['minlength'])
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['maxlength'])
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    if (control.errors['futureDate']) return 'Data não pode ser futura';
    if (control.errors['max'])
      return `Valor máximo: ${control.errors['max'].max}`;

    return 'Valor inválido';
  }
}
