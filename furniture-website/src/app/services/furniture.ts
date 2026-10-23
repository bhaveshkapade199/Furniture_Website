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
  additionalImages?: string[];
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
  private eventSource: EventSource | null = null;

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

  private backendOnlineSubject = new BehaviorSubject<boolean>(false);
  public backendOnline$ = this.backendOnlineSubject.asObservable();

  constructor(private http: HttpClient) {
    // 0. Restore admin password from sessionStorage if user previously authenticated
    if (typeof window !== 'undefined') {
      const savedPwd = sessionStorage.getItem(LS + 'admin_pwd');
      if (savedPwd) {
        this.adminPassword = savedPwd;
      }
    }

    // Health check to test if backend on port 5000 is running
    this.checkBackendHealth();

    // 1. Immediately hydrate subjects from local cache so initial UI render has no delay
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

    // 4. Setup Live Real-Time SSE Stream with MongoDB Backend
    this.setupLiveSync();

    // 5. Background sync on window focus and visibility change
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.fetchAllFromDatabase();
        this.setupLiveSync();
      });
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.fetchAllFromDatabase();
          this.setupLiveSync();
        }
      });
      // Safety polling fallback every 5s if disconnected
      setInterval(() => {
        if (typeof document !== 'undefined' && !document.hidden) {
          if (!this.eventSource || this.eventSource.readyState === EventSource.CLOSED) {
            this.setupLiveSync();
          }
        }
      }, 5000);
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
    this.checkBackendHealth();
    this.setupLiveSync();
    this.fetchAllFromDatabase();
  }

  public checkBackendHealth(): void {
    this.http.get<{ status: string }>(`${this.apiUrl}/health`).subscribe({
      next: (res) => {
        if (res && res.status === 'ok') {
          this.backendOnlineSubject.next(true);
        }
      },
      error: () => {
        this.backendOnlineSubject.next(false);
      }
    });
  }

  private notifySync() {
    try {
      this.channel?.postMessage({ type: 'SYNC', time: Date.now() });
    } catch (_) {}
  }

  private isMatch(item: { _id?: string; id?: any }, id: string): boolean {
    return String(item._id || item.id) === String(id);
  }

  // ─── Real-Time SSE Live Synchronization ────────────────────────
  private setupLiveSync(): void {
    if (typeof window === 'undefined' || !('EventSource' in window)) return;

    try {
      if (this.eventSource) {
        if (this.eventSource.readyState === EventSource.OPEN) return;
        this.eventSource.close();
      }

      const streamUrl = `${this.apiUrl}/live-sync`;
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onopen = () => {
        console.log('⚡ Connected to Bhavesh Furniture live database stream.');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload?.type === 'CHANGE') {
            console.log(`⚡ Live change detected for [${payload.collection}]:`, payload.action);
            this.handleLiveSyncEvent(payload.collection);
          }
        } catch (_) {}
      };

      this.eventSource.onerror = () => {
        // Browser automatically attempts reconnect for SSE
      };
    } catch (e) {
      console.warn('Live sync EventSource setup notice:', e);
    }
  }

  private handleLiveSyncEvent(collection: string): void {
    switch (collection) {
      case 'team':
        this.fetchTeam();
        break;
      case 'furniture':
        this.fetchFurniture();
        break;
      case 'workinfo':
        this.fetchWorkInfo();
        break;
      case 'videos':
        this.fetchVideos();
        break;
      case 'custom-orders':
        this.fetchCustomOrders();
        break;
      case 'feedback':
        this.fetchFeedbacks();
        break;
      case 'stats':
        this.fetchStats();
        break;
      default:
        this.fetchAllFromDatabase();
        break;
    }
  }

  // ── Database Fetching ─────────────────────────────────────────
  public fetchFurniture(): void {
    this.http.get<FurnitureItem[]>(`${this.apiUrl}/furniture`).subscribe({
      next: (items) => {
        if (Array.isArray(items)) {
          this.furnitureSubject.next(items);
          localStorage.setItem(LS + 'items', JSON.stringify(items));
        }
      },
      error: (e) => console.warn('Could not fetch furniture from DB', e)
    });
  }

  public fetchWorkInfo(): void {
    this.http.get<WorkInfo[]>(`${this.apiUrl}/workinfo`).subscribe({
      next: (items) => {
        if (Array.isArray(items)) {
          this.workInfoSubject.next(items);
          localStorage.setItem(LS + 'workinfo', JSON.stringify(items));
        }
      },
      error: (e) => console.warn('Could not fetch work info from DB', e)
    });
  }

  public fetchTeam(): void {
    this.http.get<TeamMember[]>(`${this.apiUrl}/team`).subscribe({
      next: (items) => {
        if (Array.isArray(items)) {
          this.teamSubject.next(items);
          localStorage.setItem(LS + 'team', JSON.stringify(items));
        }
      },
      error: (e) => console.warn('Could not fetch team from DB', e)
    });
  }

  public fetchVideos(): void {
    this.http.get<VideoItem[]>(`${this.apiUrl}/videos`).subscribe({
      next: (items) => {
        if (Array.isArray(items)) {
          this.videosSubject.next(items);
          localStorage.setItem(LS + 'videos', JSON.stringify(items));
        }
      },
      error: (e) => console.warn('Could not fetch videos from DB', e)
    });
  }

  public fetchStats(): void {
    this.http.get<SiteStat[]>(`${this.apiUrl}/stats`).subscribe({
      next: (items) => {
        if (Array.isArray(items)) {
          this.statsSubject.next(items);
          localStorage.setItem(LS + 'site_stats', JSON.stringify(items));
        }
      },
      error: (e) => console.warn('Could not fetch stats from DB', e)
    });
  }

  public fetchCustomOrders(): void {
    if (this.isAdminLoggedIn()) {
      this.http.get<CustomOrder[]>(`${this.apiUrl}/custom-orders`, { headers: this.adminHeaders }).subscribe({
        next: (orders) => {
          if (Array.isArray(orders)) {
            this.customOrdersSubject.next(orders);
            localStorage.setItem(LS + 'custom_orders', JSON.stringify(orders));
          }
        },
        error: (e) => console.warn('Could not fetch orders from DB', e)
      });
    }
  }

  public fetchFeedbacks(): void {
    if (this.isAdminLoggedIn()) {
      this.http.get<Feedback[]>(`${this.apiUrl}/feedback`, { headers: this.adminHeaders }).subscribe({
        next: (fbs) => {
          if (Array.isArray(fbs)) {
            this.feedbacksSubject.next(fbs);
            localStorage.setItem(LS + 'feedbacks', JSON.stringify(fbs));
          }
        },
        error: (e) => console.warn('Could not fetch feedback from DB', e)
      });
    }
  }

  public fetchAllFromDatabase(): void {
    this.fetchFurniture();
    this.fetchWorkInfo();
    this.fetchTeam();
    this.fetchVideos();
    this.fetchStats();
    this.fetchCustomOrders();
    this.fetchFeedbacks();
  }

  // ── Admin Auth ────────────────────────────────────────────────
  setAdminPassword(pwd: string) {
    this.adminPassword = pwd;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(LS + 'admin_pwd', pwd);
    }
  }

  clearAdminPassword() {
    this.adminPassword = '';
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(LS + 'admin_pwd');
    }
  }

  public get adminHeaders(): HttpHeaders {
    return new HttpHeaders({
      'x-admin-password': this.adminPassword || 'bhavesh@admin123'
    });
  }

  isAdminLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    const hasFlag = sessionStorage.getItem(LS + 'admin_logged_in') === 'true';
    return hasFlag && (!!this.adminPassword || !!sessionStorage.getItem(LS + 'admin_pwd'));
  }

  adminLogin(password: string): boolean {
    if (password === 'bhavesh@admin123') {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(LS + 'admin_logged_in', 'true');
        sessionStorage.setItem(LS + 'admin_pwd', password);
      }
      this.setAdminPassword(password);
      this.fetchAllFromDatabase();
      return true;
    }
    return false;
  }

  adminLogout(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(LS + 'admin_logged_in');
      sessionStorage.removeItem(LS + 'admin_pwd');
      localStorage.removeItem(LS + 'admin_logged_in');
    }
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
  // FURNITURE ITEMS (Live DB Save + Instant UI Sync)
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
      additionalImages: item.additionalImages ? [...item.additionalImages] : [],
      videoUrl: item.videoUrl || '',
      price: item.price || '',
      dateAdded: new Date()
    };

    // Instant optimistic update
    const current = this.furnitureSubject.value;
    const updated = [optimisticItem, ...current];
    this.furnitureSubject.next(updated);
    localStorage.setItem(LS + 'items', JSON.stringify(updated));
    this.notifySync();

    // Persist to MongoDB database
    return this.http.post<FurnitureItem>(`${this.apiUrl}/furniture`, item, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.furnitureSubject.value.map(i => i._id === tempId ? saved : i);
          this.furnitureSubject.next(list);
          localStorage.setItem(LS + 'items', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError((err) => {
        console.error('Failed to save furniture in database:', err);
        this.fetchFurniture();
        throw err;
      })
    );
  }

  updateFurnitureItem(id: string, item: Partial<FurnitureItem>): Observable<FurnitureItem> {
    const current = this.furnitureSubject.value;
    const updated = current.map(i => this.isMatch(i, id) ? { ...i, ...item } : i);
    this.furnitureSubject.next(updated);
    localStorage.setItem(LS + 'items', JSON.stringify(updated));
    this.notifySync();

    let url = `${this.apiUrl}/furniture/${encodeURIComponent(id)}`;
    if (item.name) url += `?name=${encodeURIComponent(item.name)}`;

    return this.http.put<FurnitureItem>(url, item, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.furnitureSubject.value.map(i => this.isMatch(i, id) ? { ...i, ...saved } : i);
          this.furnitureSubject.next(list);
          localStorage.setItem(LS + 'items', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError((err) => {
        console.error('Failed to update furniture in database:', err);
        this.fetchFurniture();
        throw err;
      })
    );
  }

  deleteFurnitureItem(id: string, name?: string): Observable<any> {
    let url = `${this.apiUrl}/furniture/${encodeURIComponent(id)}`;
    if (name) url += `?name=${encodeURIComponent(name)}`;

    return this.http.delete(url, { headers: this.adminHeaders }).pipe(
      tap(() => {
        const current = this.furnitureSubject.value;
        const updated = current.filter(i => !this.isMatch(i, id) && (!name || i.name !== name));
        this.furnitureSubject.next(updated);
        localStorage.setItem(LS + 'items', JSON.stringify(updated));
        this.notifySync();
      }),
      catchError((err) => {
        console.error('Failed to delete furniture from database:', err);
        this.fetchFurniture();
        throw err;
      })
    );
  }

  // ════════════════════════════════════════════════════════════════
  // WORK INFO (Live DB Save + Instant UI Sync)
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
      catchError((err) => {
        console.error('Failed to add work info in database:', err);
        this.fetchWorkInfo();
        throw err;
      })
    );
  }

  updateWorkInfo(id: string, item: Partial<WorkInfo>): Observable<WorkInfo> {
    const current = this.workInfoSubject.value;
    const updated = current.map(i => this.isMatch(i, id) ? { ...i, ...item } : i);
    this.workInfoSubject.next(updated);
    localStorage.setItem(LS + 'workinfo', JSON.stringify(updated));
    this.notifySync();

    let url = `${this.apiUrl}/workinfo/${encodeURIComponent(id)}`;
    if (item.title) url += `?title=${encodeURIComponent(item.title)}`;

    return this.http.put<WorkInfo>(url, item, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.workInfoSubject.value.map(i => this.isMatch(i, id) ? { ...i, ...saved } : i);
          this.workInfoSubject.next(list);
          localStorage.setItem(LS + 'workinfo', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError((err) => {
        console.error('Failed to update work info in database:', err);
        this.fetchWorkInfo();
        throw err;
      })
    );
  }

  deleteWorkInfo(id: string, title?: string): Observable<any> {
    let url = `${this.apiUrl}/workinfo/${encodeURIComponent(id)}`;
    if (title) url += `?title=${encodeURIComponent(title)}`;

    return this.http.delete(url, { headers: this.adminHeaders }).pipe(
      tap(() => {
        const current = this.workInfoSubject.value;
        const updated = current.filter(i => !this.isMatch(i, id) && (!title || i.title !== title));
        this.workInfoSubject.next(updated);
        localStorage.setItem(LS + 'workinfo', JSON.stringify(updated));
        this.notifySync();
      }),
      catchError((err) => {
        console.error('Failed to delete work info from database:', err);
        this.fetchWorkInfo();
        throw err;
      })
    );
  }

  // ════════════════════════════════════════════════════════════════
  // TEAM MEMBERS (Live DB Save + Instant UI Sync)
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
      catchError((err) => {
        console.error('Failed to add team member in database:', err);
        this.fetchTeam();
        throw err;
      })
    );
  }

  updateTeamMember(id: string, member: Partial<TeamMember>): Observable<TeamMember> {
    const current = this.teamSubject.value;
    const updated = current.map(m => this.isMatch(m, id) ? { ...m, ...member } : m);
    this.teamSubject.next(updated);
    localStorage.setItem(LS + 'team', JSON.stringify(updated));
    this.notifySync();

    let url = `${this.apiUrl}/team/${encodeURIComponent(id)}`;
    if (member.name) url += `?name=${encodeURIComponent(member.name)}`;

    return this.http.put<TeamMember>(url, member, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.teamSubject.value.map(m => this.isMatch(m, id) ? { ...m, ...saved } : m);
          this.teamSubject.next(list);
          localStorage.setItem(LS + 'team', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError((err) => {
        console.error('Failed to update team member in database:', err);
        this.fetchTeam();
        throw err;
      })
    );
  }

  deleteTeamMember(id: string, name?: string): Observable<any> {
    let url = `${this.apiUrl}/team/${encodeURIComponent(id)}`;
    if (name) {
      url += `?name=${encodeURIComponent(name)}`;
    }

    return this.http.delete(url, { headers: this.adminHeaders }).pipe(
      tap(() => {
        const current = this.teamSubject.value;
        const updated = current.filter(m => !this.isMatch(m, id) && (!name || m.name !== name));
        this.teamSubject.next(updated);
        localStorage.setItem(LS + 'team', JSON.stringify(updated));
        this.notifySync();
      }),
      catchError((err) => {
        console.error('Failed to delete team member from database:', err);
        this.fetchTeam();
        throw err;
      })
    );
  }

  // ════════════════════════════════════════════════════════════════
  // VIDEOS SHOWCASE (Live DB Save + Instant UI Sync)
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
      catchError((err) => {
        console.error('Failed to add video in database:', err);
        this.fetchVideos();
        throw err;
      })
    );
  }

  updateVideo(id: string, video: Partial<VideoItem>): Observable<VideoItem> {
    const current = this.videosSubject.value;
    const updated = current.map(v => this.isMatch(v, id) ? { ...v, ...video } : v);
    this.videosSubject.next(updated);
    localStorage.setItem(LS + 'videos', JSON.stringify(updated));
    this.notifySync();

    let url = `${this.apiUrl}/videos/${encodeURIComponent(id)}`;
    if (video.title) url += `?title=${encodeURIComponent(video.title)}`;

    return this.http.put<VideoItem>(url, video, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.videosSubject.value.map(v => this.isMatch(v, id) ? { ...v, ...saved } : v);
          this.videosSubject.next(list);
          localStorage.setItem(LS + 'videos', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError((err) => {
        console.error('Failed to update video in database:', err);
        this.fetchVideos();
        throw err;
      })
    );
  }

  deleteVideo(id: string, title?: string): Observable<any> {
    let url = `${this.apiUrl}/videos/${encodeURIComponent(id)}`;
    if (title) url += `?title=${encodeURIComponent(title)}`;

    return this.http.delete(url, { headers: this.adminHeaders }).pipe(
      tap(() => {
        const current = this.videosSubject.value;
        const updated = current.filter(v => !this.isMatch(v, id) && (!title || v.title !== title));
        this.videosSubject.next(updated);
        localStorage.setItem(LS + 'videos', JSON.stringify(updated));
        this.notifySync();
      }),
      catchError((err) => {
        console.error('Failed to delete video from database:', err);
        this.fetchVideos();
        throw err;
      })
    );
  }

  // ════════════════════════════════════════════════════════════════
  // CUSTOM ORDERS (Live DB Save + Instant UI Sync)
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
      catchError((err) => {
        console.error('Failed to submit custom order:', err);
        this.fetchCustomOrders();
        throw err;
      })
    );
  }

  getCustomOrders(status?: string): Observable<CustomOrder[]> {
    const url = status
      ? `${this.apiUrl}/custom-orders?status=${encodeURIComponent(status)}`
      : `${this.apiUrl}/custom-orders`;
    return this.http.get<CustomOrder[]>(url, { headers: this.adminHeaders }).pipe(
      tap((orders) => {
        if (Array.isArray(orders)) {
          this.customOrdersSubject.next(orders);
          localStorage.setItem(LS + 'custom_orders', JSON.stringify(orders));
        }
      }),
      catchError(() => of(this.customOrdersSubject.value))
    );
  }

  updateCustomOrder(id: string, update: Partial<CustomOrder>): Observable<CustomOrder> {
    return this.http.patch<CustomOrder>(`${this.apiUrl}/custom-orders/${id}`, update, { headers: this.adminHeaders }).pipe(
      tap((updated) => {
        if (updated && updated._id) {
          const list = this.customOrdersSubject.value.map(o => this.isMatch(o, id) ? { ...o, ...updated } : o);
          this.customOrdersSubject.next(list);
          localStorage.setItem(LS + 'custom_orders', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError((err) => {
        console.error('Failed to update custom order:', err);
        this.fetchCustomOrders();
        throw err;
      })
    );
  }

  deleteCustomOrder(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/custom-orders/${id}`, { headers: this.adminHeaders }).pipe(
      tap(() => {
        const current = this.customOrdersSubject.value;
        const updated = current.filter(o => !this.isMatch(o, id));
        this.customOrdersSubject.next(updated);
        localStorage.setItem(LS + 'custom_orders', JSON.stringify(updated));
        this.notifySync();
      }),
      catchError((err) => {
        console.error('Failed to delete custom order:', err);
        this.fetchCustomOrders();
        throw err;
      })
    );
  }

  // ════════════════════════════════════════════════════════════════
  // FEEDBACK (Live DB Save + Instant UI Sync)
  addFeedback(fb: Partial<Feedback>): Observable<Feedback> {
    return this.submitFeedback(fb);
  }

  submitFeedback(fb: Partial<Feedback>): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.apiUrl}/feedback`, fb).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = [saved, ...this.feedbacksSubject.value];
          this.feedbacksSubject.next(list);
          localStorage.setItem(LS + 'feedbacks', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError((err) => {
        console.error('Failed to submit feedback:', err);
        this.fetchFeedbacks();
        throw err;
      })
    );
  }

  getFeedbacks(): Observable<Feedback[]> {
    return this.feedbacks$;
  }

  markFeedbackRead(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/feedback/${id}/read`, {}, { headers: this.adminHeaders }).pipe(
      tap(() => {
        const current = this.feedbacksSubject.value;
        const updated = current.map(f => this.isMatch(f, id) ? { ...f, status: 'read' as const } : f);
        this.feedbacksSubject.next(updated);
        localStorage.setItem(LS + 'feedbacks', JSON.stringify(updated));
        this.notifySync();
      }),
      catchError((err) => {
        console.error('Failed to mark feedback read:', err);
        this.fetchFeedbacks();
        throw err;
      })
    );
  }

  deleteFeedback(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/feedback/${id}`, { headers: this.adminHeaders }).pipe(
      tap(() => {
        const current = this.feedbacksSubject.value;
        const updated = current.filter(f => !this.isMatch(f, id));
        this.feedbacksSubject.next(updated);
        localStorage.setItem(LS + 'feedbacks', JSON.stringify(updated));
        this.notifySync();
      }),
      catchError((err) => {
        console.error('Failed to delete feedback:', err);
        this.fetchFeedbacks();
        throw err;
      })
    );
  }

  // ════════════════════════════════════════════════════════════════
  // HOME STATS (Live DB Save + Instant UI Sync)
  // ════════════════════════════════════════════════════════════════
  getStats(): Observable<SiteStat[]> {
    return this.stats$;
  }

  addStat(stat: Partial<SiteStat>): Observable<SiteStat> {
    return this.http.post<SiteStat>(`${this.apiUrl}/stats`, stat, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = [...this.statsSubject.value, saved];
          this.statsSubject.next(list);
          localStorage.setItem(LS + 'site_stats', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError((err) => {
        console.error('Failed to add stat:', err);
        this.fetchStats();
        throw err;
      })
    );
  }

  updateStat(id: string, stat: Partial<SiteStat>): Observable<SiteStat> {
    return this.http.put<SiteStat>(`${this.apiUrl}/stats/${id}`, stat, { headers: this.adminHeaders }).pipe(
      tap((saved) => {
        if (saved && saved._id) {
          const list = this.statsSubject.value.map(s => this.isMatch(s, id) ? { ...s, ...saved } : s);
          this.statsSubject.next(list);
          localStorage.setItem(LS + 'site_stats', JSON.stringify(list));
          this.notifySync();
        }
      }),
      catchError((err) => {
        console.error('Failed to update stat:', err);
        this.fetchStats();
        throw err;
      })
    );
  }

  saveAllStats(stats: SiteStat[]): Observable<SiteStat[]> {
    return this.http.put<SiteStat[]>(`${this.apiUrl}/stats`, stats, { headers: this.adminHeaders }).pipe(
      tap((savedList) => {
        if (savedList && Array.isArray(savedList)) {
          this.statsSubject.next(savedList);
          localStorage.setItem(LS + 'site_stats', JSON.stringify(savedList));
          this.notifySync();
        }
      }),
      catchError((err) => {
        console.error('Failed to save stats:', err);
        this.fetchStats();
        throw err;
      })
    );
  }

  deleteStat(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/stats/${id}`, { headers: this.adminHeaders }).pipe(
      tap(() => {
        const current = this.statsSubject.value;
        const updated = current.filter(s => !this.isMatch(s, id));
        this.statsSubject.next(updated);
        localStorage.setItem(LS + 'site_stats', JSON.stringify(updated));
        this.notifySync();
      }),
      catchError((err) => {
        console.error('Failed to delete stat:', err);
        this.fetchStats();
        throw err;
      })
    );
  }

  getCategories(): string[] {
    return ['Sofa Set', 'Bedroom', 'TV Unit', 'Kitchen', 'Temple / Mandir', 'Dining Room', 'Office'];
  }

  // ════════════════════════════════════════════════════════════════
  // INITIAL FALLBACK CACHE LOADERS
  // ════════════════════════════════════════════════════════════════
  private getLocalItems(): FurnitureItem[] {
    try {
      const d = localStorage.getItem(LS + 'items');
      if (d) return JSON.parse(d);
    } catch (_) {}
    return [];
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
    return [];
  }

  private getLocalTeamMembers(): TeamMember[] {
    try {
      const d = localStorage.getItem(LS + 'team');
      if (d) return JSON.parse(d);
    } catch (_) {}
    return [];
  }

  private getLocalVideos(): VideoItem[] {
    try {
      const d = localStorage.getItem(LS + 'videos');
      if (d) return JSON.parse(d);
    } catch (_) {}
    return [];
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
    return [];
  }
}
