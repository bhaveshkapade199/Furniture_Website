import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FurnitureService, TeamMember, VideoItem } from '../../services/furniture';

@Component({
  selector: 'app-team',
  imports: [CommonModule, RouterLink],
  templateUrl: './team.html',
  styleUrl: './team.css'
})
export class Team implements OnInit {
  teamMembers: TeamMember[] = [];
  videos: VideoItem[] = [];
  loading = true;

  constructor(private furnitureService: FurnitureService) {}

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
