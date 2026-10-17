import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FurnitureService, WorkInfo, TeamMember } from '../../services/furniture';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About implements OnInit {
  workInfo: WorkInfo[] = [];
  team: TeamMember[] = [];

  timeline = [
    { year: '2010', event: 'Founded Rk Furniture in Ahmedabad with a small workshop' },
    { year: '2013', event: 'Expanded to serving 500+ happy customers across Gujarat' },
    { year: '2016', event: 'Launched custom furniture design service and interior consultation' },
    { year: '2019', event: 'Opened second showroom and started pan-India delivery' },
    { year: '2022', event: 'Introduced online gallery and custom on-site crafting services' },
    { year: '2024', event: '5000+ satisfied clients across 50+ cities in India' }
  ];

  constructor(private furnitureService: FurnitureService) {}

  ngOnInit() {
    this.furnitureService.getWorkInfo().subscribe(info => {
      this.workInfo = info;
    });
    this.furnitureService.getTeamMembers().subscribe(members => {
      this.team = members;
    });
  }
}
