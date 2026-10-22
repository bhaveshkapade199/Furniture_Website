import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FurnitureService, TeamMember, VideoItem } from '../../services/furniture';
import { TranslationService } from '../../services/translation';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-team',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './team.html',
  styleUrl: './team.css'
})
export class Team implements OnInit {
  langService = inject(TranslationService);
  private furnitureService = inject(FurnitureService);

  teamMembers: TeamMember[] = [];
  videos: VideoItem[] = [];
  loading = true;

  ngOnInit() {
    this.furnitureService.getTeamMembers().subscribe({
      next: (members) => {
        this.teamMembers = members;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

    this.furnitureService.getVideos().subscribe({
      next: (vids) => {
        this.videos = vids;
      }
    });
  }
}
