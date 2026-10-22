import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FurnitureService, WorkInfo, TeamMember } from '../../services/furniture';
import { TranslationService } from '../../services/translation';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About implements OnInit {
  langService = inject(TranslationService);
  private furnitureService = inject(FurnitureService);

  workInfo: WorkInfo[] = [];
  team: TeamMember[] = [];

  timeline = [
    { year: '2010', event: 'Founded RK Furniture with our first bespoke artisan workshop' },
    { year: '2013', event: 'Expanded on-site crafting services across Gujarat and Maharashtra' },
    { year: '2016', event: 'Introduced ₹200 laser measurement & 3D space planning' },
    { year: '2019', event: 'Extended pure Sagwan (Teak) and Sheesham direct workshop crafting' },
    { year: '2022', event: 'Launched online customized furniture tracking & instant quotes' },
    { year: '2026', event: '5,000+ satisfied luxury homes completed with 10-year warranty' }
  ];

  ngOnInit() {
    this.furnitureService.getWorkInfo().subscribe(info => {
      this.workInfo = info;
    });
    this.furnitureService.getTeamMembers().subscribe(members => {
      this.team = members;
    });
  }
}
