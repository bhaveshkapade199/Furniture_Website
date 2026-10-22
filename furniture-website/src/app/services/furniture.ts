import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface FurnitureItem {
  id?: number;
  _id?: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  price?: string;
  shareableLink?: string;
  dateAdded?: Date;
}

export interface Feedback {
  id?: number;
  _id?: string;
  name: string;
  email: string;
  message: string;
  rating: number;
  date?: Date;
  status?: 'new' | 'read' | 'replied';
}

export interface WorkInfo {
  id?: number;
  _id?: string;
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
  videoUrl?: string;
  order?: number;
}

export interface TeamMember {
  id?: number;
  _id?: string;
  name: string;
  role: string;
  experience: string;
  description: string;
  specialty?: string;
  emoji?: string;
  imageUrl?: string;
  phone?: string;
  order?: number;
}

export interface VideoItem {
  id?: number;
  _id?: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category?: string;
  dateAdded?: Date;
}

export interface CustomOrder {
  id?: number;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  furnitureType: string;
  woodType?: string;
  dimensions?: string;
  colorFinish?: string;
  description: string;
  budgetRange?: string;
  urgency?: 'flexible' | 'within_month' | 'urgent';
  homeVisitNeeded?: boolean;
  referenceImageUrl?: string;
  status?: 'new' | 'contacted' | 'quoted' | 'in_progress' | 'completed' | 'cancelled';
  adminNotes?: string;
  quotedPrice?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SiteStat {
  id?: number;
  _id?: string;
  value: string;
  label: string;
  order?: number;
}

const LS = 'bhavesh_furniture_';

/**
 * Dynamically resolves the API base URL whether running locally,
 * accessed via LAN IP on phone, or deployed on a live server.
 */
export function resolveApiUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('rk_furniture_api_url');
    if (custom) return custom.replace(/\/$/, '');

    const { hostname, port, protocol } = window.location;

    // Local Angular dev server on port 4200
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && port === '4200') {
      return 'http://localhost:5000/api';
    }

    // Accessing dev server from mobile / LAN IP (e.g. 192.168.1.15:4200)
    if (port === '4200') {
      return `${protocol}//${hostname}:5000/api`;
    }

    // Live deployment (served from backend or reverse proxied domain)
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5000/api';
}

@Injectable({ providedIn: 'root' })
export class FurnitureService {
  private adminPassword = '';
  private channel: BroadcastChannel | null = null;

  // ── Reactive In-Memory State Stores (Instant UI Updating) ──────
  private furnitureSubject = new BehaviorSubject<FurnitureItem[]>([]);
  public furniture$ = this.furnitureSubject.asObservable();

  private workInfoSubject = new BehaviorSubject<WorkInfo[]>([]);
  public workInfo$ = this.workInfoSubject.asObservable();

  private teamSubject = new BehaviorSubject<TeamMember[]>([]);
  public team$ = this.teamSubject.asObservable();

  private videosSubject = new BehaviorSubject<VideoItem[]>([]);
  public videos$ = this.videosSubject.asObservable();

  private customOrdersSubject = new BehaviorSubject<CustomOrder[]>([]);
  public customOrders$ = this.customOrdersSubject.asObservable();

  private feedbacksSubject = new BehaviorSubject<Feedback[]>([]);
  public feedbacks$ = this.feedbacksSubject.asObservable();

  private statsSubject = new BehaviorSubject<SiteStat[]>([]);
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {
    localStorage.removeItem(LS + 'admin_logged_in');

    // 1. Immediately hydrate subjects from local cache so UI is instantaneous
    this.furnitureSubject.next(this.getLocalItems());
    this.workInfoSubject.next(this.getLocalWorkInfo());
    this.teamSubject.next(this.getLocalTeamMembers());
    this.videosSubject.next(this.getLocalVideos());
    this.customOrdersSubject.next(this.getLocalCustomOrders());
    this.feedbacksSubject.next(this.getLocalFeedbacks());
    this.statsSubject.next(this.getLocalStats());

    // 2. Setup real-time cross-tab synchronization channel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('rk_furniture_channel');
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'SYNC') {
            this.fetchAllFromDatabase();
          }
        };
      } catch (_) {}
    }

    // 3. Immediately fetch live data from MongoDB database
    this.fetchAllFromDatabase();

    // 4. Background sync on window focus and periodic auto-refresh (every 10s)
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => this.fetchAllFromDatabase());
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) this.fetchAllFromDatabase();
      });
      setInterval(() => {
        if (typeof document !== 'undefined' && !document.hidden) {
          this.fetchAllFromDatabase();
        }
      }, 10000);
    }
  }

  get apiUrl(): string {
    return resolveApiUrl();
  }

  setCustomApiUrl(url: string) {
    if (url) {
      localStorage.setItem('rk_furniture_api_url', url);
    } else {
      localStorage.removeItem('rk_furniture_api_url');
    }
    this.fetchAllFromDatabase();
  }

  private notifySync() {
    try {
      this.channel?.postMessage({ type: 'SYNC', time: Date.now() });
    } catch (_) {}
  }

  private isMatch(item: { _id?: string; id?: any }, id: string): boolean {
    return String(item._id || item.id) === String(id);
  }

  // ── Database Fetching ─────────────────────────────────────────
  public fetchAllFromDatabase(): void {
    const api = this.apiUrl;

    this.http.get<FurnitureItem[]>(`${api}/furniture`).pipe(
      catchError(() => of(this.getLocalItems()))
    ).subscribe(items => {
      if (items && items.length) {
        this.furnitureSubject.next(items);
        localStorage.setItem(LS + 'items', JSON.stringify(items));
      }
    });

    this.http.get<WorkInfo[]>(`${api}/workinfo`).pipe(
      catchError(() => of(this.getLocalWorkInfo()))
    ).subscribe(items => {
      if (items && items.length) {
        this.workInfoSubject.next(items);
        localStorage.setItem(LS + 'workinfo', JSON.stringify(items));
      }
    });

    this.http.get<TeamMember[]>(`${api}/team`).pipe(
      catchError(() => of(this.getLocalTeamMembers()))
    ).subscribe(items => {
      if (items && items.length) {
        this.teamSubject.next(items);
        localStorage.setItem(LS + 'team', JSON.stringify(items));
      }
    });

    this.http.get<VideoItem[]>(`${api}/videos`).pipe(
      catchError(() => of(this.getLocalVideos()))
    ).subscribe(items => {
      if (items && items.length) {
        this.videosSubject.next(items);
        localStorage.setItem(LS + 'videos', JSON.stringify(items));
      }
    });

    this.http.get<SiteStat[]>(`${api}/stats`).pipe(
      catchError(() => of(this.getLocalStats()))
    ).subscribe(stats => {
      if (stats && stats.length) {
        this.statsSubject.next(stats);
        localStorage.setItem(LS + 'site_stats', JSON.stringify(stats));
      }
    });

    if (this.isAdminLoggedIn()) {
      this.http.get<CustomOrder[]>(`${api}/custom-orders`, { headers: this.adminHeaders }).pipe(
        catchError(() => of(this.getLocalCustomOrders()))
      ).subscribe(orders => {
        if (orders) {
          this.customOrdersSubject.next(orders);
          localStorage.setItem(LS + 'custom_orders', JSON.stringify(orders));
        }
      });

      this.http.get<Feedback[]>(`${api}/feedback`, { headers: this.adminHeaders }).pipe(
        catchError(() => of(this.getLocalFeedbacks()))
      ).subscribe(fbs => {
        if (fbs) {
          this.feedbacksSubject.next(fbs);
          localStorage.setItem(LS + 'feedbacks', JSON.stringify(fbs));
        }
      });
    }
  }

  // ── Admin Auth ────────────────────────────────────────────────
  setAdminPassword(pwd: string) { this.adminPassword = pwd; }
  clearAdminPassword() { this.adminPassword = ''; }

  private get adminHeaders(): HttpHeaders {
    return new HttpHeaders({ 'x-admin-password': this.adminPassword });
  }

  isAdminLoggedIn(): boolean {
    return sessionStorage.getItem(LS + 'admin_logged_in') === 'true' && !!this.adminPassword;
  }

  adminLogin(password: string): boolean {
    if (password === 'bhavesh@admin123') {
      sessionStorage.setItem(LS + 'admin_logged_in', 'true');
      this.setAdminPassword(password);
      this.fetchAllFromDatabase();
      return true;
    }
    return false;
  }

  adminLogout(): void {
    sessionStorage.removeItem(LS + 'admin_logged_in');
    localStorage.removeItem(LS + 'admin_logged_in');
    this.clearAdminPassword();
  }

  // ── File Upload (Photos & Videos) ─────────────────────────────
  uploadFile(file: File): Observable<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string; filename: string }>(`${this.apiUrl}/upload`, formData, {
      headers: this.adminHeaders
    });
  }

  // ════════════════════════════════════════════════════════════════
  // FURNITURE ITEMS (Optimistic + Live DB Save)
  // ════════════════════════════════════════════════════════════════
  getFurnitureItems(): Observable<FurnitureItem[]> {
    return this.furniture$;
  }

  addFurnitureItem(item: Partial<FurnitureItem>): Observable<FurnitureItem> {
    const tempId = 'temp_' + Date.now();
    const optimisticItem: FurnitureItem = {
      _id: tempId,
      name: item.name || '',
      category: item.category || 'Sofa Set',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      videoUrl: item.videoUrl || '',
      price: item.price || '',
      dateAdded: new Date()
    };

    // 1. Instant optimistic update across website & admin
    const current = this.furnitureSubject.value;
    const updated = [optimisticItem, ...current];
    this.furnitureSubject.next(updated);
    localStorage.setItem(LS + 'items', JSON.stringify(updated));
    this.notifySync();

    // 2. Persist to MongoDB database
    return this.http.post<FurnitureItem>(`${this.apiUrl}/furniture`, item, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.furnitureSubject.value.map(i => i._id === tempId ? saved : i);
          this.furnitureSubject.next(list);
          localStorage.setItem(LS + 'items', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError(() => of(optimisticItem))
    );
  }

  updateFurnitureItem(id: string, item: Partial<FurnitureItem>): Observable<FurnitureItem> {
    // 1. Instant optimistic update in memory & cache
    const current = this.furnitureSubject.value;
    const updated = current.map(i => this.isMatch(i, id) ? { ...i, ...item } : i);
    this.furnitureSubject.next(updated);
    localStorage.setItem(LS + 'items', JSON.stringify(updated));
    this.notifySync();

    // 2. Persist update to MongoDB database
    return this.http.put<FurnitureItem>(`${this.apiUrl}/furniture/${id}`, item, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.furnitureSubject.value.map(i => this.isMatch(i, id) ? { ...i, ...saved } : i);
          this.furnitureSubject.next(list);
          localStorage.setItem(LS + 'items', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError(() => of(item as FurnitureItem))
    );
  }

  deleteFurnitureItem(id: string): Observable<any> {
    // 1. Instant optimistic delete
    const current = this.furnitureSubject.value;
    const updated = current.filter(i => !this.isMatch(i, id));
    this.furnitureSubject.next(updated);
    localStorage.setItem(LS + 'items', JSON.stringify(updated));
    this.notifySync();

    // 2. Delete from MongoDB database
    return this.http.delete(`${this.apiUrl}/furniture/${id}`, { headers: this.adminHeaders }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  // ════════════════════════════════════════════════════════════════
  // WORK INFO (Optimistic + Live DB Save)
  // ════════════════════════════════════════════════════════════════
  getWorkInfo(): Observable<WorkInfo[]> {
    return this.workInfo$;
  }

  addWorkInfo(item: Partial<WorkInfo>): Observable<WorkInfo> {
    const tempId = 'temp_' + Date.now();
    const optimisticItem: WorkInfo = {
      _id: tempId,
      title: item.title || '',
      description: item.description || '',
      icon: item.icon || '🪑',
      imageUrl: item.imageUrl || '',
      videoUrl: item.videoUrl || '',
      order: item.order ?? (this.workInfoSubject.value.length + 1)
    };

    const current = this.workInfoSubject.value;
    const updated = [...current, optimisticItem];
    this.workInfoSubject.next(updated);
    localStorage.setItem(LS + 'workinfo', JSON.stringify(updated));
    this.notifySync();

    return this.http.post<WorkInfo>(`${this.apiUrl}/workinfo`, item, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.workInfoSubject.value.map(i => i._id === tempId ? saved : i);
          this.workInfoSubject.next(list);
          localStorage.setItem(LS + 'workinfo', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError(() => of(optimisticItem))
    );
  }

  updateWorkInfo(id: string, item: Partial<WorkInfo>): Observable<WorkInfo> {
    const current = this.workInfoSubject.value;
    const updated = current.map(i => this.isMatch(i, id) ? { ...i, ...item } : i);
    this.workInfoSubject.next(updated);
    localStorage.setItem(LS + 'workinfo', JSON.stringify(updated));
    this.notifySync();

    return this.http.put<WorkInfo>(`${this.apiUrl}/workinfo/${id}`, item, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.workInfoSubject.value.map(i => this.isMatch(i, id) ? { ...i, ...saved } : i);
          this.workInfoSubject.next(list);
          localStorage.setItem(LS + 'workinfo', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError(() => of(item as WorkInfo))
    );
  }

  deleteWorkInfo(id: string): Observable<any> {
    const current = this.workInfoSubject.value;
    const updated = current.filter(i => !this.isMatch(i, id));
    this.workInfoSubject.next(updated);
    localStorage.setItem(LS + 'workinfo', JSON.stringify(updated));
    this.notifySync();

    return this.http.delete(`${this.apiUrl}/workinfo/${id}`, { headers: this.adminHeaders }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  // ════════════════════════════════════════════════════════════════
  // TEAM MEMBERS (Optimistic + Live DB Save)
  // ════════════════════════════════════════════════════════════════
  getTeamMembers(): Observable<TeamMember[]> {
    return this.team$;
  }

  addTeamMember(member: Partial<TeamMember>): Observable<TeamMember> {
    const tempId = 'temp_' + Date.now();
    const optimisticMember: TeamMember = {
      _id: tempId,
      name: member.name || '',
      role: member.role || '',
      experience: member.experience || '',
      description: member.description || '',
      specialty: member.specialty || '',
      emoji: member.emoji || '👨‍💼',
      imageUrl: member.imageUrl || '',
      phone: member.phone || '',
      order: member.order ?? (this.teamSubject.value.length + 1)
    };

    const current = this.teamSubject.value;
    const updated = [...current, optimisticMember];
    this.teamSubject.next(updated);
    localStorage.setItem(LS + 'team', JSON.stringify(updated));
    this.notifySync();

    return this.http.post<TeamMember>(`${this.apiUrl}/team`, member, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.teamSubject.value.map(m => m._id === tempId ? saved : m);
          this.teamSubject.next(list);
          localStorage.setItem(LS + 'team', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError(() => of(optimisticMember))
    );
  }

  updateTeamMember(id: string, member: Partial<TeamMember>): Observable<TeamMember> {
    const current = this.teamSubject.value;
    const updated = current.map(m => this.isMatch(m, id) ? { ...m, ...member } : m);
    this.teamSubject.next(updated);
    localStorage.setItem(LS + 'team', JSON.stringify(updated));
    this.notifySync();

    return this.http.put<TeamMember>(`${this.apiUrl}/team/${id}`, member, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.teamSubject.value.map(m => this.isMatch(m, id) ? { ...m, ...saved } : m);
          this.teamSubject.next(list);
          localStorage.setItem(LS + 'team', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError(() => of(member as TeamMember))
    );
  }

  deleteTeamMember(id: string): Observable<any> {
    const current = this.teamSubject.value;
    const updated = current.filter(m => !this.isMatch(m, id));
    this.teamSubject.next(updated);
    localStorage.setItem(LS + 'team', JSON.stringify(updated));
    this.notifySync();

    return this.http.delete(`${this.apiUrl}/team/${id}`, { headers: this.adminHeaders }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  // ════════════════════════════════════════════════════════════════
  // VIDEOS SHOWCASE (Optimistic + Live DB Save)
  // ════════════════════════════════════════════════════════════════
  getVideos(): Observable<VideoItem[]> {
    return this.videos$;
  }

  addVideo(video: Partial<VideoItem>): Observable<VideoItem> {
    const tempId = 'temp_' + Date.now();
    const optimisticVid: VideoItem = {
      _id: tempId,
      title: video.title || '',
      description: video.description || '',
      videoUrl: video.videoUrl || '',
      thumbnailUrl: video.thumbnailUrl || '',
      category: video.category || 'Workshop',
      dateAdded: new Date()
    };

    const current = this.videosSubject.value;
    const updated = [optimisticVid, ...current];
    this.videosSubject.next(updated);
    localStorage.setItem(LS + 'videos', JSON.stringify(updated));
    this.notifySync();

    return this.http.post<VideoItem>(`${this.apiUrl}/videos`, video, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.videosSubject.value.map(v => v._id === tempId ? saved : v);
          this.videosSubject.next(list);
          localStorage.setItem(LS + 'videos', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError(() => of(optimisticVid))
    );
  }

  updateVideo(id: string, video: Partial<VideoItem>): Observable<VideoItem> {
    const current = this.videosSubject.value;
    const updated = current.map(v => this.isMatch(v, id) ? { ...v, ...video } : v);
    this.videosSubject.next(updated);
    localStorage.setItem(LS + 'videos', JSON.stringify(updated));
    this.notifySync();

    return this.http.put<VideoItem>(`${this.apiUrl}/videos/${id}`, video, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.videosSubject.value.map(v => this.isMatch(v, id) ? { ...v, ...saved } : v);
          this.videosSubject.next(list);
          localStorage.setItem(LS + 'videos', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError(() => of(video as VideoItem))
    );
  }

  deleteVideo(id: string): Observable<any> {
    const current = this.videosSubject.value;
    const updated = current.filter(v => !this.isMatch(v, id));
    this.videosSubject.next(updated);
    localStorage.setItem(LS + 'videos', JSON.stringify(updated));
    this.notifySync();

    return this.http.delete(`${this.apiUrl}/videos/${id}`, { headers: this.adminHeaders }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  // ════════════════════════════════════════════════════════════════
  // CUSTOM ORDERS (Make Furniture)
  // ════════════════════════════════════════════════════════════════
  submitCustomOrder(order: Partial<CustomOrder>): Observable<CustomOrder> {
    const tempId = 'temp_' + Date.now();
    const optimisticOrder: CustomOrder = {
      ...order,
      _id: tempId,
      status: 'new',
      createdAt: new Date(),
      furnitureType: order.furnitureType || 'Custom Furniture',
      name: order.name || '',
      email: order.email || '',
      phone: order.phone || '',
      description: order.description || ''
    };

    const current = this.customOrdersSubject.value;
    const updated = [optimisticOrder, ...current];
    this.customOrdersSubject.next(updated);
    localStorage.setItem(LS + 'custom_orders', JSON.stringify(updated));
    this.notifySync();

    return this.http.post<CustomOrder>(`${this.apiUrl}/custom-orders`, order).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.customOrdersSubject.value.map(o => o._id === tempId ? saved : o);
          this.customOrdersSubject.next(list);
          localStorage.setItem(LS + 'custom_orders', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError(() => of(optimisticOrder))
    );
  }

  getCustomOrders(status?: string): Observable<CustomOrder[]> {
    if (status) {
      return this.customOrders$.pipe(
        tap(() => {}),
        catchError(() => of([]))
      );
    }
    return this.customOrders$;
  }

  updateCustomOrder(id: string, update: Partial<CustomOrder>): Observable<CustomOrder> {
    const current = this.customOrdersSubject.value;
    const updated = current.map(o => this.isMatch(o, id) ? { ...o, ...update, updatedAt: new Date() } : o);
    this.customOrdersSubject.next(updated);
    localStorage.setItem(LS + 'custom_orders', JSON.stringify(updated));
    this.notifySync();

    return this.http.patch<CustomOrder>(`${this.apiUrl}/custom-orders/${id}`, update, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.customOrdersSubject.value.map(o => this.isMatch(o, id) ? { ...o, ...saved } : o);
          this.customOrdersSubject.next(list);
          localStorage.setItem(LS + 'custom_orders', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError(() => of(update as CustomOrder))
    );
  }

  deleteCustomOrder(id: string): Observable<any> {
    const current = this.customOrdersSubject.value;
    const updated = current.filter(o => !this.isMatch(o, id));
    this.customOrdersSubject.next(updated);
    localStorage.setItem(LS + 'custom_orders', JSON.stringify(updated));
    this.notifySync();

    return this.http.delete(`${this.apiUrl}/custom-orders/${id}`, { headers: this.adminHeaders }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  // ════════════════════════════════════════════════════════════════
  // FEEDBACK
  // ════════════════════════════════════════════════════════════════
  getFeedbacks(): Observable<Feedback[]> {
    return this.feedbacks$;
  }

  addFeedback(fb: Partial<Feedback>): Observable<Feedback> {
    const tempId = 'temp_' + Date.now();
    const optimisticFb: Feedback = {
      _id: tempId,
      name: fb.name || '',
      email: fb.email || '',
      message: fb.message || '',
      rating: fb.rating || 5,
      status: 'new',
      date: new Date()
    };

    const current = this.feedbacksSubject.value;
    const updated = [optimisticFb, ...current];
    this.feedbacksSubject.next(updated);
    localStorage.setItem(LS + 'feedbacks', JSON.stringify(updated));
    this.notifySync();

    return this.http.post<Feedback>(`${this.apiUrl}/feedback`, fb).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.feedbacksSubject.value.map(f => f._id === tempId ? saved : f);
          this.feedbacksSubject.next(list);
          localStorage.setItem(LS + 'feedbacks', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError(() => of(optimisticFb))
    );
  }

  markFeedbackRead(id: string): Observable<any> {
    const current = this.feedbacksSubject.value;
    const updated = current.map(f => this.isMatch(f, id) ? { ...f, status: 'read' as const } : f);
    this.feedbacksSubject.next(updated);
    localStorage.setItem(LS + 'feedbacks', JSON.stringify(updated));
    this.notifySync();

    return this.http.patch(`${this.apiUrl}/feedback/${id}/read`, {}, { headers: this.adminHeaders }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  deleteFeedback(id: string): Observable<any> {
    const current = this.feedbacksSubject.value;
    const updated = current.filter(f => !this.isMatch(f, id));
    this.feedbacksSubject.next(updated);
    localStorage.setItem(LS + 'feedbacks', JSON.stringify(updated));
    this.notifySync();

    return this.http.delete(`${this.apiUrl}/feedback/${id}`, { headers: this.adminHeaders }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SITE STATS (Instant UI Sync + Live DB Save)
  // ════════════════════════════════════════════════════════════════
  getStats(): Observable<SiteStat[]> {
    return this.stats$;
  }

  addStat(stat: Partial<SiteStat>): Observable<SiteStat> {
    const tempId = 'temp_' + Date.now();
    const optimisticStat: SiteStat = {
      _id: tempId,
      value: stat.value || '',
      label: stat.label || '',
      order: stat.order !== undefined ? stat.order : this.statsSubject.value.length + 1
    };

    const current = this.statsSubject.value;
    const updated = [...current, optimisticStat];
    this.statsSubject.next(updated);
    localStorage.setItem(LS + 'site_stats', JSON.stringify(updated));
    this.notifySync();

    return this.http.post<SiteStat>(`${this.apiUrl}/stats`, stat, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.statsSubject.value.map(s => s._id === tempId ? saved : s);
          this.statsSubject.next(list);
          localStorage.setItem(LS + 'site_stats', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError(() => of(optimisticStat))
    );
  }

  updateStat(id: string, stat: Partial<SiteStat>): Observable<SiteStat> {
    const current = this.statsSubject.value;
    const updated = current.map(s => this.isMatch(s, id) ? { ...s, ...stat } : s);
    this.statsSubject.next(updated);
    localStorage.setItem(LS + 'site_stats', JSON.stringify(updated));
    this.notifySync();

    return this.http.put<SiteStat>(`${this.apiUrl}/stats/${id}`, stat, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.statsSubject.value.map(s => this.isMatch(s, id) ? { ...s, ...saved } : s);
          this.statsSubject.next(list);
          localStorage.setItem(LS + 'site_stats', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError(() => of(stat as SiteStat))
    );
  }

  saveAllStats(stats: SiteStat[]): Observable<SiteStat[]> {
    this.statsSubject.next([...stats]);
    localStorage.setItem(LS + 'site_stats', JSON.stringify(stats));
    this.notifySync();

    return this.http.put<SiteStat[]>(`${this.apiUrl}/stats`, stats, { headers: this.adminHeaders }).pipe(
      tap((savedList) => {
        if (savedList && Array.isArray(savedList)) {
          this.statsSubject.next(savedList);
          localStorage.setItem(LS + 'site_stats', JSON.stringify(savedList));
          this.notifySync();
        }
      }),
      catchError(() => of(stats))
    );
  }

  deleteStat(id: string): Observable<any> {
    const current = this.statsSubject.value;
    const updated = current.filter(s => !this.isMatch(s, id));
    this.statsSubject.next(updated);
    localStorage.setItem(LS + 'site_stats', JSON.stringify(updated));
    this.notifySync();

    return this.http.delete(`${this.apiUrl}/stats/${id}`, { headers: this.adminHeaders }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  getCategories(): string[] {
    return ['Sofa Set', 'Bedroom', 'TV Unit', 'Kitchen', 'Temple / Mandir', 'Dining Room', 'Office'];
  }

  // ════════════════════════════════════════════════════════════════
  // INITIAL CACHE LOADERS
  // ════════════════════════════════════════════════════════════════
  private getLocalItems(): FurnitureItem[] {
    try {
      const d = localStorage.getItem(LS + 'items');
      if (d) return JSON.parse(d);
    } catch (_) {}
    const defaults: FurnitureItem[] = [
      { _id: '1', name: 'Royal Sofa Set 5-Seater', category: 'Sofa Set', description: 'Premium 5-seater sofa set with velvet finish.', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', price: '₹45,000' },
      { _id: '2', name: 'L-Shape Corner Sofa', category: 'Sofa Set', description: 'Modern L-shaped sectional sofa.', imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600', price: '₹62,000' },
      { _id: '3', name: '3-Seater Recliner Sofa', category: 'Sofa Set', description: 'Luxury 3-seater recliner with cup holders.', imageUrl: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=600', price: '₹55,000' },
      { _id: '4', name: 'Fabric Sofa Set', category: 'Sofa Set', description: 'Elegant 6-seater fabric sofa.', imageUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600', price: '₹38,000' },
      { _id: '5', name: 'King Size Bed', category: 'Bedroom', description: 'King-size bed with hydraulic storage.', imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600', price: '₹38,000' },
      { _id: '6', name: 'Modern TV Unit', category: 'TV Unit', description: 'Sleek wall-mounted TV unit.', imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4e62a?w=600', price: '₹18,500' },
      { _id: '7', name: 'Modular Kitchen', category: 'Kitchen', description: 'Full modular kitchen with granite top.', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', price: '₹1,20,000' },
      { _id: '8', name: 'Pooja Mandir', category: 'Temple / Mandir', description: 'Hand-carved wooden temple.', imageUrl: 'https://images.unsplash.com/photo-1609766418204-94aae0ecfdfc?w=600', price: '₹15,000' },
    ];
    try {
      localStorage.setItem(LS + 'items', JSON.stringify(defaults));
    } catch (_) {}
    return defaults;
  }

  private getLocalFeedbacks(): Feedback[] {
    try {
      const d = localStorage.getItem(LS + 'feedbacks');
      return d ? JSON.parse(d) : [];
    } catch (_) { return []; }
  }

  private getLocalWorkInfo(): WorkInfo[] {
    try {
      const d = localStorage.getItem(LS + 'workinfo');
      if (d) return JSON.parse(d);
    } catch (_) {}
    return [
      { _id: '1', title: 'Home Space Visit & Measurement', description: 'Our specialist visits your house, inspects the exact space, and provides a customized quotation for just ₹200 visit charge.', icon: '🏠', order: 1 },
      { _id: '2', title: 'Full Team On-Site Crafting', description: 'Once confirmed, our entire specialized artisan team visits your home with materials to build and complete furniture on-site.', icon: '👥', order: 2 },
      { _id: '3', title: '100% Custom Tailored Furniture', description: 'Every furniture piece is built specifically for your room layout, dimensions, and preferred wood.', icon: '🪑', order: 3 },
      { _id: '4', title: 'Premium Termite-Treated Wood', description: 'Grade-A Sheesham, Teak, and Pine with heavy-duty Italian hardware and luxury finishes.', icon: '🌳', order: 4 },
      { _id: '5', title: 'Fine Artisan Woodworking', description: 'Handcrafted with traditional joinery, premium hardware, and durable multi-coat polish finish.', icon: '🪵', order: 5 },
      { _id: '6', title: 'Transparent Honest Quotation', description: 'Clear upfront pricing with no hidden surprises. Complete material and labour breakdown.', icon: '📋', order: 6 },
    ];
  }

  private getLocalTeamMembers(): TeamMember[] {
    try {
      const d = localStorage.getItem(LS + 'team');
      if (d) return JSON.parse(d);
    } catch (_) {}
    return [
      { _id: '1', name: 'Bhavesh Patel', role: 'Founder & Master Craftsman', experience: '15+ Years', specialty: 'All Custom Woods', emoji: '👨‍🔨', description: 'Visionary behind every piece of furniture we craft.', phone: '+91 9225576095', order: 1 },
      { _id: '2', name: 'Ramesh Kumar', role: 'Head of Design', experience: '12 Years', specialty: 'Sofa & Bedroom', emoji: '🎨', description: 'Expert in modern sofa sets and luxury bedroom furniture.', phone: '+91 92255 76095', order: 2 },
      { _id: '3', name: 'Sunita Devi', role: 'Kitchen & Interior Specialist', experience: '10 Years', specialty: 'Modular Kitchens', emoji: '🍳', description: 'Specializes in ergonomic modular kitchens and TV units.', phone: '+91 92255 76095', order: 3 },
      { _id: '4', name: 'Kiran Shah', role: 'Temple & Decor Artisan', experience: '8 Years', specialty: 'Hand Carving', emoji: '🛕', description: 'Master carver of wooden temples and artistic pooja units.', phone: '+91 92255 76095', order: 4 },
      { _id: '5', name: 'Mahesh Parmar', role: 'Sales & Client Relations', experience: '6 Years', specialty: 'Custom Orders', emoji: '🤝', description: 'Your personal advisor for custom orders and quotes.', phone: '+91 92255 76095', order: 5 },
      { _id: '6', name: 'Deepa Joshi', role: 'Quality Control Manager', experience: '9 Years', specialty: 'Quality Assurance', emoji: '✅', description: 'Ensures every product meets our highest standards.', phone: '+91 92255 76095', order: 6 }
    ];
  }

  private getLocalVideos(): VideoItem[] {
    try {
      const d = localStorage.getItem(LS + 'videos');
      if (d) return JSON.parse(d);
    } catch (_) {}
    return [
      {
        _id: '1',
        title: 'Master Sofa Crafting Process',
        description: 'Watch how our skilled artisans handcraft our bestselling Royal Sofa from solid wood frame to premium fabric stitching.',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
        category: 'Workshop'
      },
      {
        _id: '2',
        title: 'Modular Kitchen Installation Walkthrough',
        description: 'Complete walkthrough of a luxury modular kitchen installed with hydraulic hinges and granite countertop.',
        videoUrl: 'https://www.w3schools.com/html/movie.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
        category: 'Installation'
      }
    ];
  }

  private getLocalCustomOrders(): CustomOrder[] {
    try {
      const d = localStorage.getItem(LS + 'custom_orders');
      return d ? JSON.parse(d) : [];
    } catch (_) { return []; }
  }

  private getLocalStats(): SiteStat[] {
    try {
      const d = localStorage.getItem(LS + 'site_stats');
      if (d) return JSON.parse(d);
    } catch (_) {}
    return [
      { _id: '1', value: '15+', label: 'Years Experience', order: 1 },
      { _id: '2', value: '5000+', label: 'Happy Clients', order: 2 },
      { _id: '3', value: '200+', label: 'Furniture Designs', order: 3 },
      { _id: '4', value: '50+', label: 'Cities Delivered', order: 4 }
    ];
  }
}
