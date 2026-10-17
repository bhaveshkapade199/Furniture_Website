import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FurnitureService, FurnitureItem } from '../../services/furniture';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule, FormsModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css'
})
export class Gallery implements OnInit {
  allItems: FurnitureItem[] = [];
  filteredItems: FurnitureItem[] = [];
  categories: string[] = [];
  selectedCategory = 'All';
  searchText = '';
  selectedItem: FurnitureItem | null = null;
  copiedId: string | null = null;
  loading = true;

  constructor(
    private furnitureService: FurnitureService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.furnitureService.getFurnitureItems().subscribe(items => {
      this.allItems = items;
      this.categories = ['All', ...this.furnitureService.getCategories()];
      this.loading = false;

      // Read category filter from query param (from home page category card)
      this.route.queryParams.subscribe(params => {
        if (params['cat']) this.selectedCategory = params['cat'];
        this.applyFilters();
      });
    });
  }

  filterByCategory(cat: string) {
    this.selectedCategory = cat;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredItems = this.allItems.filter(item => {
      const matchCat = this.selectedCategory === 'All' || item.category === this.selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
                          item.description.toLowerCase().includes(this.searchText.toLowerCase());
      return matchCat && matchSearch;
    });
  }

  openItem(item: FurnitureItem) {
    this.selectedItem = item;
    document.body.style.overflow = 'hidden';
  }

  closeItem() {
    this.selectedItem = null;
    document.body.style.overflow = '';
  }

  getItemId(item: FurnitureItem): string {
    return (item._id || item.id || '') as string;
  }

  copyLink(item: FurnitureItem, event: Event) {
    event.stopPropagation();
    const id = this.getItemId(item);
    const link = window.location.origin + '/gallery?id=' + id;
    navigator.clipboard.writeText(link).then(() => {
      this.copiedId = id;
      setTimeout(() => this.copiedId = null, 2000);
    });
  }

  shareOnWhatsApp(item: FurnitureItem) {
    const id = this.getItemId(item);
    const link = window.location.origin + '/gallery?id=' + id;
    const priceText = item.price ? ` - ${item.price}` : '';
    const msg = `Check out this ${item.name}${priceText}\n${link}`;
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
  }

  isCopied(item: FurnitureItem): boolean {
    return this.copiedId === this.getItemId(item);
  }
}
