import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FurnitureService, FurnitureItem } from '../../services/furniture';
import { TranslationService } from '../../services/translation';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css'
})
export class Gallery implements OnInit {
  langService = inject(TranslationService);
  private furnitureService = inject(FurnitureService);
  private route = inject(ActivatedRoute);

  allItems: FurnitureItem[] = [];
  filteredItems: FurnitureItem[] = [];
  categories: string[] = [];
  selectedCategory = 'All';
  searchText = '';
  selectedItem: FurnitureItem | null = null;
  copiedId: string | null = null;
  loading = true;

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

  getCatLabel(cat: string): string {
    if (cat === 'All') return this.langService.t('ALL_CATEGORIES');
    return this.langService.translateCategory(cat);
  }

  applyFilters() {
    this.filteredItems = this.allItems.filter(item => {
      const matchCat = this.selectedCategory === 'All' || item.category === this.selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
                          item.description.toLowerCase().includes(this.searchText.toLowerCase());
      return matchCat && matchSearch;
    });
  }

  activeModalImage: string = '';

  openItem(item: FurnitureItem) {
    this.selectedItem = item;
    this.activeModalImage = item.imageUrl;
    document.body.style.overflow = 'hidden';
  }

  closeItem() {
    this.selectedItem = null;
    this.activeModalImage = '';
    document.body.style.overflow = '';
  }

  setActiveModalImage(img: string) {
    this.activeModalImage = img;
  }

  getAllItemImages(item: FurnitureItem): string[] {
    const list: string[] = [];
    if (item.imageUrl) list.push(item.imageUrl);
    if (item.additionalImages && Array.isArray(item.additionalImages)) {
      for (const img of item.additionalImages) {
        if (img && !list.includes(img)) list.push(img);
      }
    }
    return list;
  }

  getItemId(item: FurnitureItem): string {
    return (item._id || item.id || '') as string;
  }

  getItemShareLink(item: FurnitureItem): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/gallery?id=${this.getItemId(item)}`;
  }

  copyLink(item: FurnitureItem, event: Event) {
    event.stopPropagation();
    const id = this.getItemId(item);
    const link = this.getItemShareLink(item);
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        this.copiedId = id;
        setTimeout(() => this.copiedId = null, 2000);
      });
    }
  }

  shareOnWhatsApp(item: FurnitureItem) {
    const link = this.getItemShareLink(item);
    const priceText = item.price ? ` - ${item.price}` : '';
    const msg = `Check out ${item.name}${priceText} on RK Furniture:\n${link}`;
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
  }

  isCopied(item: FurnitureItem): boolean {
    return this.copiedId === this.getItemId(item);
  }
}
