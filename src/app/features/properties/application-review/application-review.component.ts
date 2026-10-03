import { CurrencyPipe, Location, UpperCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';
import { ApplicationResponse, APPLICATION_STATUS_LABELS } from '../../../core/models/application.model';
import { ApplicationService } from '../../../core/services/application.service';

type ReviewSection = 'informations' | 'pieces' | 'solvabilite' | 'evaluation' | 'decision';

interface NavSection {
  key: ReviewSection;
  label: string;
  icon: string;
}

const CRITERIA = ['Revenu vs loyer', 'Historique de crédit', 'Stabilité d\'emploi', 'Références'];

/**
 * Etude du dossier -- vue gestionnaire dediee (maquette, ecran 12).
 * Remplace les dialogues ponctuels precedemment ouverts depuis
 * UnitDetailComponent : meme service/actions (review, requestAdditionalInfo,
 * decide), presentes maintenant comme une page complete.
 */
@Component({
  selector: 'app-application-review',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputNumberModule, TextareaModule, CurrencyPipe, UpperCasePipe],
  templateUrl: './application-review.component.html',
  styleUrl: './application-review.component.scss',
})
export class ApplicationReviewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);
  private readonly applicationService = inject(ApplicationService);
  private readonly messageService = inject(MessageService);

  private readonly propertyId = this.route.snapshot.paramMap.get('propertyId')!;
  private readonly unitId = this.route.snapshot.paramMap.get('unitId')!;
  private readonly applicationId = this.route.snapshot.paramMap.get('applicationId')!;

  readonly statusLabels = APPLICATION_STATUS_LABELS;
  readonly criteria = CRITERIA;

  readonly application = signal<ApplicationResponse | null>(null);
  readonly loading = signal(true);
  readonly savingReview = signal(false);
  readonly decidingAction = signal<'accepted' | 'refused' | 'info' | null>(null);

  readonly section = signal<ReviewSection>('solvabilite');
  readonly navSections: NavSection[] = [
    { key: 'informations', label: 'Informations', icon: 'pi-user' },
    { key: 'pieces', label: 'Pièces fournies', icon: 'pi-file' },
    { key: 'solvabilite', label: 'Vérification de solvabilité', icon: 'pi-chart-pie' },
    { key: 'evaluation', label: 'Évaluation', icon: 'pi-check-square' },
    { key: 'decision', label: 'Décision', icon: 'pi-flag' },
  ];

  readonly reviewForm = this.fb.nonNullable.group({
    solvencyScore: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(100)]),
    reviewComments: this.fb.control<string | null>(null, Validators.maxLength(2000)),
  });

  constructor() {
    this.load();
  }

  goBack(): void {
    this.location.back();
  }

  private load(): void {
    this.loading.set(true);
    this.applicationService.getById(this.propertyId, this.unitId, this.applicationId).subscribe({
      next: (application) => {
        this.application.set(application);
        this.reviewForm.patchValue({ solvencyScore: application.solvencyScore, reviewComments: application.reviewComments });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Dossier introuvable.' });
      },
    });
  }

  saveEvaluation(): void {
    this.savingReview.set(true);
    const value = this.reviewForm.getRawValue();
    this.applicationService.review(this.propertyId, this.unitId, this.applicationId, value).subscribe({
      next: (application) => {
        this.application.set(application);
        this.savingReview.set(false);
        this.messageService.add({ severity: 'success', summary: 'Évaluation enregistrée' });
      },
      error: () => {
        this.savingReview.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "L'enregistrement a échoué." });
      },
    });
  }

  requestInfo(): void {
    const comments = this.reviewForm.controls.reviewComments.value;
    if (!comments) {
      this.messageService.add({ severity: 'warn', summary: 'Commentaire requis', detail: 'Précisez l\'information manquante dans les commentaires.' });
      return;
    }
    this.decidingAction.set('info');
    this.applicationService.requestAdditionalInfo(this.propertyId, this.unitId, this.applicationId, { reviewComments: comments }).subscribe({
      next: (application) => {
        this.application.set(application);
        this.decidingAction.set(null);
        this.messageService.add({ severity: 'success', summary: 'Information demandée au candidat' });
      },
      error: () => {
        this.decidingAction.set(null);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'La demande a échoué.' });
      },
    });
  }

  decide(accepted: boolean): void {
    this.decidingAction.set(accepted ? 'accepted' : 'refused');
    const decisionReason = this.reviewForm.controls.reviewComments.value;
    this.applicationService.decide(this.propertyId, this.unitId, this.applicationId, { accepted, decisionReason }).subscribe({
      next: (application) => {
        this.application.set(application);
        this.decidingAction.set(null);
        this.section.set('decision');
        this.messageService.add({ severity: 'success', summary: accepted ? 'Candidature acceptée' : 'Candidature refusée' });
      },
      error: () => {
        this.decidingAction.set(null);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'La décision a échoué.' });
      },
    });
  }
}
