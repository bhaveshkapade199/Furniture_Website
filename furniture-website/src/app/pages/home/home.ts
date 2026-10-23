import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FurnitureService, FurnitureItem, WorkInfo, TeamMember, VideoItem, SiteStat } from '../../services/furniture';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation';


export interface ShowcaseSlide {
  url: string;
  name: string;
  category: 'Sofa Set' | 'TV Unit' | string;
  price?: string;
  photoLabel?: string;
  photoIndex?: number;
  totalPhotos?: number;
  isDetail?: boolean;
  item?: FurnitureItem;
}

export interface HeroSlide {
  url: string;
  title: string;
  tag: string;
  price?: string;
}

@Component({
  selector: 'app-home',
openSlideLightbox(_t215: ShowcaseSlide) {
throw new Error('Method not implemented.');
}
  imports: [RouterLink, CommonModule, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  sofaPhotos: FurnitureItem[] = [];
  featuredItems: FurnitureItem[] = [];
  workInfo: WorkInfo[] = [];
  team: TeamMember[] = [];
  videos: VideoItem[] = [];
  isPaused = false;
  activeShowcaseFilter: 'all' | 'TV Unit' | 'Sofa Set' = 'all';

  // Lightbox for Home Screen Detail Photos
  selectedHomeItem: FurnitureItem | null = null;
  activeHomeModalImage = '';

  // Auto-scrolling Hero Carousel Slides
  heroSlides: HeroSlide[] = [
    {
      url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900',
      title: 'Royal Velvet Sofa Set',
      tag: '⭐ Master Upholstery',
      price: '₹45,000'
    },
    {
      url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4e62a?w=900',
      title: 'Modern Wall-Mounted TV Unit',
      tag: '📺 Sleek LED Entertainment',
      price: '₹18,500'
    },
    {
      url: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=900',
      title: 'King Size Solid Wood Storage Bed',
      tag: '🛏️ Hydraulic Teak Wood',
      price: '₹38,000'
    },
    {
      url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900',
      title: 'Luxury Modular Kitchen',
      tag: '🍳 Granite Top & Italian Fittings',
      price: '₹1,20,000'
    },
    {
      url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900',
      title: 'L-Shape Corner Sectional Sofa',
      tag: '🛋️ Custom Fit for Your Living Room',
      price: '₹62,000'
    }
  ];

  currentHeroIndex = 0;
  private heroTimer: any = null;
  isHeroPaused = false;

  stats: SiteStat[] = [
    { value: '15+', label: 'Years Experience' },
    { value: '5000+', label: 'Happy Clients' },
    { value: '200+', label: 'Furniture Designs' },
    { value: '50+', label: 'Cities Delivered' }
  ];

  categories = [
    { name: 'Sofa Set', emoji: '🛋️', count: 20 },
    { name: 'Bedroom', emoji: '🛏️', count: 35 },
    { name: 'TV Unit', emoji: '📺', count: 15 },
    { name: 'Kitchen', emoji: '🍳', count: 18 },
    { name: 'Temple / Mandir', emoji: '🛕', count: 12 },
    { name: 'Dining Room', emoji: '🍽️', count: 10 },
    { name: 'Office', emoji: '🖥️', count: 14 }
  ];

  // Auto-scrollable TV Units & Sofa Set Slides
  showcaseSlides: ShowcaseSlide[] = [
    { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700', name: 'Royal Velvet Sofa Set', category: 'Sofa Set', price: '₹45,000', photoLabel: '🛋️ Sofa Set' },
    { url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4e62a?w=700', name: 'Modern Wall-Mounted TV Unit', category: 'TV Unit', price: '₹18,500', photoLabel: '📺 TV Unit' },
    { url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=700', name: 'L-Shape Corner Sectional Sofa', category: 'Sofa Set', price: '₹62,000', photoLabel: '🛋️ Sofa Set' },
    { url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=700', name: 'Luxury Wooden TV Entertainment Console', category: 'TV Unit', price: '₹24,000', photoLabel: '📺 TV Unit' },
    { url: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=700', name: '3-Seater Recliner Sofa', category: 'Sofa Set', price: '₹55,000', photoLabel: '🛋️ Sofa Set' },
    { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=700', name: 'Minimalist Floating TV Cabinet with LED', category: 'TV Unit', price: '₹22,500', photoLabel: '📺 TV Unit' },
    { url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=700', name: 'Fabric Sofa Set 6-Seater', category: 'Sofa Set', price: '₹38,000', photoLabel: '🛋️ Sofa Set' },
    { url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=700', name: 'Chesterfield Leather Sofa', category: 'Sofa Set', price: '₹72,000', photoLabel: '🛋️ Sofa Set' },
    { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700', name: 'Contemporary Italian TV Unit', category: 'TV Unit', price: '₹29,000', photoLabel: '📺 TV Unit' }
  ];

  get filteredShowcaseSlides(): ShowcaseSlide[] {
    if (this.activeShowcaseFilter === 'all') {
      return this.showcaseSlides;
    }
    return this.showcaseSlides.filter(s => s.category === this.activeShowcaseFilter);
  }

  get autoScrollSlides(): ShowcaseSlide[] {
    const list = this.filteredShowcaseSlides;
    if (list.length === 0) return [];
    if (list.length < 5) {
      return [...list, ...list, ...list, ...list];
    }
    return [...list, ...list];
  }

  setShowcaseFilter(filter: 'all' | 'TV Unit' | 'Sofa Set') {
    this.activeShowcaseFilter = filter;
  }

  constructor(
    private furnitureService: FurnitureService,
    public langService: TranslationService
  ) { }

  getCategoryName(name: string | undefined): string {
    return this.langService.translateCategory(name || '');
  }

  ngOnInit() {
    this.startHeroAutoplay();

    this.furnitureService.getFurnitureItems().subscribe(items => {
      this.featuredItems = items.slice(0, 3);

      // Extract all TV Units, Sofa Sets, and all items with multiple/detail photos
      const dynamicSlides: ShowcaseSlide[] = [];

      items.forEach(item => {
        const isTvOrSofa = item.category === 'TV Unit' || item.category === 'Sofa Set';
        const hasExtra = item.additionalImages && item.additionalImages.length > 0;

        if (isTvOrSofa || hasExtra) {
          const total = 1 + (item.additionalImages?.length || 0);

          // 1. Add Main Cover Photo
          dynamicSlides.push({
            url: item.imageUrl,
            name: item.name,
            category: item.category,
            price: item.price,
            photoLabel: total > 1 ? `1 of ${total} • Main Cover` : (item.category === 'TV Unit' ? '📺 TV Unit' : '🛋️ Sofa Set'),
            photoIndex: 1,
            totalPhotos: total,
            isDetail: false,
            item: item
          });

          // 2. Add EACH Additional / Detail Photo of this TV Unit or Sofa Set!
          if (item.additionalImages && item.additionalImages.length > 0) {
            item.additionalImages.forEach((photoUrl, idx) => {
              dynamicSlides.push({
                url: photoUrl,
                name: `${item.name} (Detail #${idx + 1})`,
                category: item.category,
                price: item.price,
                photoLabel: `${idx + 2} of ${total} • Detail Shot`,
                photoIndex: idx + 2,
                totalPhotos: total,
                isDetail: true,
                item: item
              });
            });
          }
        }
      });

      if (dynamicSlides.length > 0) {
        const dynamicUrls = new Set(dynamicSlides.map(d => d.url));
        this.showcaseSlides = [
          ...dynamicSlides,
          ...this.showcaseSlides.filter(s => !dynamicUrls.has(s.url))
        ];
      }

      // Merge top items from DB into hero slides
      if (items.length > 0) {
        const dbHero = items.slice(0, 4).map(i => ({
          url: i.imageUrl,
          title: i.name,
          tag: `✨ ${i.category}`,
          price: i.price
        }));
        const heroUrls = new Set(dbHero.map(h => h.url));
        this.heroSlides = [...dbHero, ...this.heroSlides.filter(h => !heroUrls.has(h.url))];
      }
    });

    this.furnitureService.getWorkInfo().subscribe(info => {
      this.workInfo = info.slice(0, 6);
    });

    this.furnitureService.getTeamMembers().subscribe(members => {
      this.team = members;
    });

    this.furnitureService.getVideos().subscribe(vids => {
      this.videos = vids.slice(0, 2);
    });

    this.furnitureService.getStats().subscribe(stats => {
      if (stats && stats.length > 0) {
        this.stats = stats;
      }
    });
  }

  ngOnDestroy() {
    this.stopHeroAutoplay();
  }

  // ── Hero Autoplay Methods ──────────────────────────────────────
  startHeroAutoplay() {
    this.stopHeroAutoplay();
    this.heroTimer = setInterval(() => {
      if (!this.isHeroPaused) {
        this.nextHeroSlide();
      }
    }, 4000);
  }

  stopHeroAutoplay() {
    if (this.heroTimer) {
      clearInterval(this.heroTimer);
      this.heroTimer = null;
    }
  }

  nextHeroSlide() {
    this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroSlides.length;
  }

  prevHeroSlide() {
    this.currentHeroIndex = (this.currentHeroIndex - 1 + this.heroSlides.length) % this.heroSlides.length;
  }

  setHeroSlide(index: number) {
    this.currentHeroIndex = index;
    this.startHeroAutoplay();
  }

  pauseHero() {
    this.isHeroPaused = true;
  }

  resumeHero() {
    this.isHeroPaused = false;
  }

  // ── Home Lightbox for Full Multi-Photo Details ─────────────────
  openSlideLightbox(slide: ShowcaseSlide) {
    if (slide.item) {
      this.selectedHomeItem = slide.item;
      this.activeHomeModalImage = slide.url;
    } else {
      this.selectedHomeItem = {
        name: slide.name,
        category: slide.category,
        description: 'Handcrafted luxury custom design crafted with premium quality materials.',
        imageUrl: slide.url,
        price: slide.price,
        additionalImages: []
      };
      this.activeHomeModalImage = slide.url;
    }
  }

  closeHomeLightbox() {
    this.selectedHomeItem = null;
    this.activeHomeModalImage = '';
  }

  setHomeModalImage(url: string) {
    this.activeHomeModalImage = url;
  }

  getAllHomeItemImages(item: FurnitureItem): string[] {
    const list: string[] = [];
    if (item.imageUrl) list.push(item.imageUrl);
    if (item.additionalImages && Array.isArray(item.additionalImages)) {
      list.push(...item.additionalImages);
    }
    return list;
  }
}
