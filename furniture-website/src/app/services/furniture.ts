import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface FurnitureItem {
  id?: number;
  _id?: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  price: string;
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
  // Customer details
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  // Furniture requirements
  furnitureType: string;
  woodType?: string;
  dimensions?: string;
  colorFinish?: string;
  description: string;
  budgetRange?: string;
  urgency?: 'flexible' | 'within_month' | 'urgent';
  homeVisitNeeded?: boolean;
  referenceImageUrl?: string;
  // Admin tracking
  status?: 'new' | 'contacted' | 'quoted' | 'in_progress' | 'completed' | 'cancelled';
  adminNotes?: string;
  quotedPrice?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const API = 'http://localhost:5000/api';

// LocalStorage fallback keys
const LS = 'bhavesh_furniture_';

@Injectable({ providedIn: 'root' })
export class FurnitureService {
  private adminPassword = '';

  constructor(private http: HttpClient) {
    // Clear any obsolete localStorage admin flags for security
    localStorage.removeItem(LS + 'admin_logged_in');
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
    return this.http.post<{ url: string; filename: string }>(`${API}/upload`, formData, {
      headers: this.adminHeaders
    });
  }

  // ── Furniture Items ───────────────────────────────────────────
  getFurnitureItems(): Observable<FurnitureItem[]> {
    return this.http.get<FurnitureItem[]>(`${API}/furniture`).pipe(
      catchError(() => of(this.getLocalItems()))
    );
  }

  addFurnitureItem(item: Partial<FurnitureItem>): Observable<FurnitureItem> {
    return this.http.post<FurnitureItem>(`${API}/furniture`, item, { headers: this.adminHeaders }).pipe(
      catchError(() => { this.addLocalItem(item); return of(item as FurnitureItem); })
    );
  }

  updateFurnitureItem(id: string, item: Partial<FurnitureItem>): Observable<FurnitureItem> {
    return this.http.put<FurnitureItem>(`${API}/furniture/${id}`, item, { headers: this.adminHeaders });
  }

  deleteFurnitureItem(id: string): Observable<any> {
    this.deleteLocalItem(id);
    return this.http.delete(`${API}/furniture/${id}`, { headers: this.adminHeaders }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  // ── Work Info ─────────────────────────────────────────────────
  getWorkInfo(): Observable<WorkInfo[]> {
    return this.http.get<WorkInfo[]>(`${API}/workinfo`).pipe(
      catchError(() => of(this.getLocalWorkInfo()))
    );
  }

  addWorkInfo(item: Partial<WorkInfo>): Observable<WorkInfo> {
    return this.http.post<WorkInfo>(`${API}/workinfo`, item, { headers: this.adminHeaders });
  }

  updateWorkInfo(id: string, item: Partial<WorkInfo>): Observable<WorkInfo> {
    return this.http.put<WorkInfo>(`${API}/workinfo/${id}`, item, { headers: this.adminHeaders });
  }

  deleteWorkInfo(id: string): Observable<any> {
    const info = this.getLocalWorkInfo().filter(w => String(w._id || w.id) !== id);
    localStorage.setItem(LS + 'workinfo', JSON.stringify(info));
    return this.http.delete(`${API}/workinfo/${id}`, { headers: this.adminHeaders }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  // ── Team Members ──────────────────────────────────────────────
  getTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${API}/team`).pipe(
      catchError(() => of(this.getLocalTeamMembers()))
    );
  }

  addTeamMember(member: Partial<TeamMember>): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${API}/team`, member, { headers: this.adminHeaders }).pipe(
      catchError(() => { this.addLocalTeamMember(member); return of(member as TeamMember); })
    );
  }

  updateTeamMember(id: string, member: Partial<TeamMember>): Observable<TeamMember> {
    return this.http.put<TeamMember>(`${API}/team/${id}`, member, { headers: this.adminHeaders }).pipe(
      catchError(() => { this.updateLocalTeamMember(id, member); return of(member as TeamMember); })
    );
  }

  deleteTeamMember(id: string): Observable<any> {
    this.deleteLocalTeamMember(id);
    return this.http.delete(`${API}/team/${id}`, { headers: this.adminHeaders }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  // ── Videos Showcase ───────────────────────────────────────────
  getVideos(): Observable<VideoItem[]> {
    return this.http.get<VideoItem[]>(`${API}/videos`).pipe(
      catchError(() => of(this.getLocalVideos()))
    );
  }

  addVideo(video: Partial<VideoItem>): Observable<VideoItem> {
    return this.http.post<VideoItem>(`${API}/videos`, video, { headers: this.adminHeaders });
  }

  updateVideo(id: string, video: Partial<VideoItem>): Observable<VideoItem> {
    return this.http.put<VideoItem>(`${API}/videos/${id}`, video, { headers: this.adminHeaders });
  }

  deleteVideo(id: string): Observable<any> {
    const vids = this.getLocalVideos().filter(v => String(v._id || v.id) !== id);
    localStorage.setItem(LS + 'videos', JSON.stringify(vids));
    return this.http.delete(`${API}/videos/${id}`, { headers: this.adminHeaders }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  // ── Feedback ──────────────────────────────────────────────────
  getFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${API}/feedback`, { headers: this.adminHeaders }).pipe(
      catchError(() => of(this.getLocalFeedbacks()))
    );
  }

  addFeedback(fb: Partial<Feedback>): Observable<Feedback> {
    return this.http.post<Feedback>(`${API}/feedback`, fb).pipe(
      catchError(() => { this.addLocalFeedback(fb); return of(fb as Feedback); })
    );
  }

  markFeedbackRead(id: string): Observable<any> {
    return this.http.patch(`${API}/feedback/${id}/read`, {}, { headers: this.adminHeaders });
  }

  deleteFeedback(id: string): Observable<any> {
    const fbs = this.getLocalFeedbacks().filter(f => String(f._id || f.id) !== id);
    localStorage.setItem(LS + 'feedbacks', JSON.stringify(fbs));
    return this.http.delete(`${API}/feedback/${id}`, { headers: this.adminHeaders }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  getCategories(): string[] {
    return ['Sofa Set', 'Bedroom', 'TV Unit', 'Kitchen', 'Temple / Mandir', 'Dining Room', 'Office'];
  }

  // ── LocalStorage Fallbacks ────────────────────────────────────
  private getLocalItems(): FurnitureItem[] {
    const d = localStorage.getItem(LS + 'items');
    if (d) return JSON.parse(d);
    const defaults: FurnitureItem[] = [
      { _id: '1', name: 'Royal Sofa Set 5-Seater', category: 'Sofa Set', description: 'Premium 5-seater sofa set with velvet finish.', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', price: '₹45,000' },
      { _id: '2', name: 'L-Shape Corner Sofa',     category: 'Sofa Set', description: 'Modern L-shaped sectional sofa.', imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600', price: '₹62,000' },
      { _id: '3', name: '3-Seater Recliner Sofa',  category: 'Sofa Set', description: 'Luxury 3-seater recliner with cup holders.', imageUrl: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=600', price: '₹55,000' },
      { _id: '4', name: 'Fabric Sofa Set',          category: 'Sofa Set', description: 'Elegant 6-seater fabric sofa.', imageUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600', price: '₹38,000' },
      { _id: '5', name: 'King Size Bed',            category: 'Bedroom',  description: 'King-size bed with hydraulic storage.', imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600', price: '₹38,000' },
      { _id: '6', name: 'Modern TV Unit',           category: 'TV Unit',  description: 'Sleek wall-mounted TV unit.', imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4e62a?w=600', price: '₹18,500' },
      { _id: '7', name: 'Modular Kitchen',          category: 'Kitchen',  description: 'Full modular kitchen with granite top.', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', price: '₹1,20,000' },
      { _id: '8', name: 'Pooja Mandir',             category: 'Temple / Mandir', description: 'Hand-carved wooden temple.', imageUrl: 'https://images.unsplash.com/photo-1609766418204-94aae0ecfdfc?w=600', price: '₹15,000' },
    ];
    localStorage.setItem(LS + 'items', JSON.stringify(defaults));
    return defaults;
  }

  private addLocalItem(item: Partial<FurnitureItem>) {
    const items = this.getLocalItems();
    const newItem = { ...item, _id: Date.now().toString() } as FurnitureItem;
    items.push(newItem);
    localStorage.setItem(LS + 'items', JSON.stringify(items));
  }

  private deleteLocalItem(id: string) {
    const items = this.getLocalItems().filter(i => i._id !== id);
    localStorage.setItem(LS + 'items', JSON.stringify(items));
  }

  private getLocalFeedbacks(): Feedback[] {
    const d = localStorage.getItem(LS + 'feedbacks');
    return d ? JSON.parse(d) : [];
  }

  private addLocalFeedback(fb: Partial<Feedback>) {
    const items = this.getLocalFeedbacks();
    items.push({ ...fb, _id: Date.now().toString(), status: 'new', date: new Date() } as Feedback);
    localStorage.setItem(LS + 'feedbacks', JSON.stringify(items));
  }

  private getLocalWorkInfo(): WorkInfo[] {
    const d = localStorage.getItem(LS + 'workinfo');
    if (d) return JSON.parse(d);
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
    const d = localStorage.getItem(LS + 'team');
    if (d) return JSON.parse(d);
    return [
      { _id: '1', name: 'Bhavesh Patel',  role: 'Founder & Master Craftsman',   experience: '15+ Years', specialty: 'All Custom Woods', emoji: '👨‍🔨', description: 'Visionary behind every piece of furniture we craft.', phone: '+91 98765 43210', order: 1 },
      { _id: '2', name: 'Ramesh Kumar',   role: 'Head of Design',                experience: '12 Years',  specialty: 'Sofa & Bedroom',   emoji: '🎨', description: 'Expert in modern sofa sets and luxury bedroom furniture.', phone: '+91 98765 43211', order: 2 },
      { _id: '3', name: 'Sunita Devi',    role: 'Kitchen & Interior Specialist', experience: '10 Years',  specialty: 'Modular Kitchens', emoji: '🍳', description: 'Specializes in ergonomic modular kitchens and TV units.', phone: '+91 98765 43212', order: 3 },
      { _id: '4', name: 'Kiran Shah',     role: 'Temple & Decor Artisan',        experience: '8 Years',   specialty: 'Hand Carving',     emoji: '🛕', description: 'Master carver of wooden temples and artistic pooja units.', phone: '+91 98765 43213', order: 4 },
      { _id: '5', name: 'Mahesh Parmar',  role: 'Sales & Client Relations',      experience: '6 Years',   specialty: 'Custom Orders',    emoji: '🤝', description: 'Your personal advisor for custom orders and quotes.', phone: '+91 98765 43214', order: 5 },
      { _id: '6', name: 'Deepa Joshi',    role: 'Quality Control Manager',       experience: '9 Years',   specialty: 'Quality Assurance',emoji: '✅', description: 'Ensures every product meets our highest standards.', phone: '+91 98765 43215', order: 6 }
    ];
  }

  private addLocalTeamMember(member: Partial<TeamMember>) {
    const team = this.getLocalTeamMembers();
    const newM = { ...member, _id: Date.now().toString() } as TeamMember;
    team.push(newM);
    localStorage.setItem(LS + 'team', JSON.stringify(team));
  }

  private updateLocalTeamMember(id: string, member: Partial<TeamMember>) {
    const team = this.getLocalTeamMembers().map(m => String(m._id || m.id) === id ? { ...m, ...member } : m);
    localStorage.setItem(LS + 'team', JSON.stringify(team));
  }

  private deleteLocalTeamMember(id: string) {
    const team = this.getLocalTeamMembers().filter(m => String(m._id || m.id) !== id);
    localStorage.setItem(LS + 'team', JSON.stringify(team));
  }

  private getLocalVideos(): VideoItem[] {
    const d = localStorage.getItem(LS + 'videos');
    if (d) return JSON.parse(d);
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

  // ── Custom Orders (Make Furniture Requests) ───────────────────
  submitCustomOrder(order: Partial<CustomOrder>): Observable<CustomOrder> {
    return this.http.post<CustomOrder>(`${API}/custom-orders`, order).pipe(
      catchError(() => {
        // Save locally as fallback
        const orders = this.getLocalCustomOrders();
        const newOrder = { ...order, _id: Date.now().toString(), status: 'new' as const, createdAt: new Date() } as CustomOrder;
        orders.push(newOrder);
        localStorage.setItem(LS + 'custom_orders', JSON.stringify(orders));
        return of(newOrder);
      })
    );
  }

  getCustomOrders(status?: string): Observable<CustomOrder[]> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<CustomOrder[]>(`${API}/custom-orders${params}`, { headers: this.adminHeaders }).pipe(
      catchError(() => of(this.getLocalCustomOrders()))
    );
  }

  updateCustomOrder(id: string, update: Partial<CustomOrder>): Observable<CustomOrder> {
    return this.http.patch<CustomOrder>(`${API}/custom-orders/${id}`, update, { headers: this.adminHeaders }).pipe(
      catchError(() => {
        const orders = this.getLocalCustomOrders().map(o =>
          String(o._id || o.id) === id ? { ...o, ...update, updatedAt: new Date() } : o
        );
        localStorage.setItem(LS + 'custom_orders', JSON.stringify(orders));
        return of(update as CustomOrder);
      })
    );
  }

  deleteCustomOrder(id: string): Observable<any> {
    return this.http.delete(`${API}/custom-orders/${id}`, { headers: this.adminHeaders }).pipe(
      catchError(() => {
        const orders = this.getLocalCustomOrders().filter(o => String(o._id || o.id) !== id);
        localStorage.setItem(LS + 'custom_orders', JSON.stringify(orders));
        return of({ success: true });
      })
    );
  }

  private getLocalCustomOrders(): CustomOrder[] {
    const d = localStorage.getItem(LS + 'custom_orders');
    return d ? JSON.parse(d) : [];
  }
}
