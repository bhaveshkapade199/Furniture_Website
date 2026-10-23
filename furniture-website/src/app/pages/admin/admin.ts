import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FurnitureService, FurnitureItem, Feedback, WorkInfo, TeamMember, VideoItem, CustomOrder, SiteStat } from '../../services/furniture';
import { TranslationService } from '../../services/translation';
import { TranslatePipe } from '../../pipes/translate.pipe';

type AdminTab = 'gallery' | 'videos' | 'workinfo' | 'team' | 'feedback' | 'orders' | 'stats';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit, OnDestroy {
  langService = inject(TranslationService);
  isLoggedIn = false;
  password = '';
  loginError = '';
  activeTab: AdminTab = 'gallery';
  isUploading = false;
  uploadMsg = '';

  // Gallery
  furnitureItems: FurnitureItem[] = [];
  showAddItemForm = false;
  editingItem: FurnitureItem | null = null;
  newItem = this.blankItem();
  newAdditionalImageUrl = '';
  categories: string[] = [];
  itemSaved = false;
  previewImage = '';
  previewVideo = '';

  // Videos
  videos: VideoItem[] = [];
  showAddVideoForm = false;
  editingVideo: VideoItem | null = null;
  newVideo = this.blankVideo();
  videoSaved = false;

  // Work Info
  workInfoItems: WorkInfo[] = [];
  showAddWorkForm = false;
  editingWork: WorkInfo | null = null;
  newWork = this.blankWork();
  workSaved = false;

  // Team
  teamMembers: TeamMember[] = [];
  showAddTeamForm = false;
  editingTeam: TeamMember | null = null;
  newTeam = this.blankTeam();
  teamSaved = false;
  teamActionMsg = '';

  // Feedback
  feedbacks: Feedback[] = [];

  // Custom Orders
  customOrders: CustomOrder[] = [];
  selectedOrder: CustomOrder | null = null;
  orderStatusFilter = '';
  orderActionMsg = '';

  // Home Stats
  siteStats: SiteStat[] = [];
  showAddStatForm = false;
  editingStat: SiteStat | null = null;
  newStat: Partial<SiteStat> = { value: '', label: '', order: 0 };
  statsSaveMsg = '';

  constructor(private furnitureService: FurnitureService) {}

  ngOnInit() {
    this.categories = this.furnitureService.getCategories();
    if (this.furnitureService.isAdminLoggedIn()) {
      this.isLoggedIn = true;
      this.loadData();
    } else {
      this.isLoggedIn = false;
    }
    this.furnitureService.checkBackendHealth();
  }

  get apiUrl(): string {
    return this.furnitureService.apiUrl;
  }

  get isBackendOnline$() {
    return this.furnitureService.backendOnline$;
  }

  formatApiError(err: any): string {
    if (err?.status === 0) {
      return '⚠️ Backend server is NOT running on port 5000!\n\nTo fix:\n1. Open terminal in the "backend" directory\n2. Run: npm start\n(Or double-click "start-all.bat" in the furniture_web folder to start both frontend & backend)';
    }
    return `⚠️ Failed: ${err?.error?.error || err?.message || 'Server connection error'}`;
  }

  get isLiveVercel(): boolean {
    if (typeof window !== 'undefined') {
      return window.location.hostname.includes('vercel.app') || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
    }
    return false;
  }

  resetToLocalhost() {
    this.furnitureService.setCustomApiUrl('');
  }

  changeApiUrl() {
    const current = localStorage.getItem('rk_furniture_api_url') || this.apiUrl;
    const nextUrl = prompt('Configure Backend API URL (for local dev or live cloud backend):\n\nLeave empty to reset to default.', current);
    if (nextUrl !== null) {
      this.furnitureService.setCustomApiUrl(nextUrl.trim());
    }
  }

  ngOnDestroy() {
    // Admin session remains active in sessionStorage until user clicks Logout
  }

  // ---- Auth ----
  login() {
    if (this.furnitureService.adminLogin(this.password)) {
      this.isLoggedIn = true;
      this.loginError = '';
      this.loadData();
    } else {
      this.loginError = 'Incorrect password. Access denied.';
    }
  }

  logout() {
    this.furnitureService.adminLogout();
    this.isLoggedIn = false;
    this.password = '';
  }

  loadData() {
    this.furnitureService.furniture$.subscribe(items => this.furnitureItems = items);
    this.furnitureService.videos$.subscribe(vids => this.videos = vids);
    this.furnitureService.workInfo$.subscribe(info => this.workInfoItems = info);
    this.furnitureService.team$.subscribe(team => this.teamMembers = team);
    this.furnitureService.feedbacks$.subscribe(fbs => this.feedbacks = fbs);
    this.furnitureService.customOrders$.subscribe(orders => this.customOrders = orders);
    this.furnitureService.stats$.subscribe(stats => this.siteStats = stats);
  }

  // ---- Tabs ----
  setTab(tab: AdminTab) {
    this.activeTab = tab;
    this.cancelItemForm();
    this.cancelVideoForm();
    this.cancelWorkForm();
    this.cancelTeamForm();
    this.cancelStatForm();
    this.selectedOrder = null;
    if (tab === 'orders') {
      this.loadOrders();
    }
  }

  // ════════════════════════════════════════════════════════════════
  // 6. CUSTOM ORDERS
  // ════════════════════════════════════════════════════════════════
  loadOrders() {
    this.furnitureService.getCustomOrders(this.orderStatusFilter || undefined)
      .subscribe(orders => this.customOrders = orders);
  }

  filterOrders() { this.loadOrders(); }

  viewOrder(order: CustomOrder) { this.selectedOrder = { ...order }; }
  closeOrderDetail() { this.selectedOrder = null; }

  updateOrderStatus(order: CustomOrder, status: string) {
    const id = String(order._id || order.id);
    this.furnitureService.updateCustomOrder(id, { status: status as any }).subscribe(() => {
      this.orderActionMsg = `✓ Order status updated to "${status}"`;
      this.loadOrders();
      if (this.selectedOrder) this.selectedOrder.status = status as any;
      setTimeout(() => this.orderActionMsg = '', 3000);
    });
  }

  saveOrderNotes(order: CustomOrder) {
    const id = String(order._id || order.id);
    this.furnitureService.updateCustomOrder(id, {
      adminNotes: order.adminNotes,
      quotedPrice: order.quotedPrice,
      status: order.status
    }).subscribe(() => {
      this.orderActionMsg = '✓ Order details saved!';
      this.loadOrders();
      setTimeout(() => this.orderActionMsg = '', 2500);
    });
  }

  deleteOrder(order: CustomOrder) {
    const id = String(order._id || order.id);
    if (confirm(`Delete order from "${order.name}"? This cannot be undone.`)) {
      this.furnitureService.deleteCustomOrder(id).subscribe(() => {
        this.loadOrders();
        if (this.selectedOrder) this.selectedOrder = null;
      });
    }
  }

  getUrgencyLabel(urgency?: string): string {
    const map: Record<string, string> = {
      flexible: '🟢 Flexible',
      within_month: '🟡 Within Month',
      urgent: '🔴 Urgent'
    };
    return urgency ? (map[urgency] || urgency) : '🟢 Flexible';
  }

  getStatusBadgeClass(status?: string): string {
    const map: Record<string, string> = {
      new: 'status-new', contacted: 'status-contacted', quoted: 'status-quoted',
      in_progress: 'status-progress', completed: 'status-completed', cancelled: 'status-cancelled'
    };
    return status ? (map[status] || 'status-new') : 'status-new';
  }

  get newOrdersCount(): number {
    return this.customOrders.filter(o => o.status === 'new').length;
  }

  // ════════════════════════════════════════════════════════════════
  // 1. GALLERY & PHOTOS
  blankItem(): FurnitureItem {
    return {
      name: '',
      category: 'Sofa Set',
      description: '',
      imageUrl: '',
      additionalImages: [],
      videoUrl: '',
      price: ''
    };
  }

  openAddItemForm() {
    this.showAddItemForm = true;
    this.editingItem = null;
    this.newItem = this.blankItem();
    this.newAdditionalImageUrl = '';
    this.previewImage = '';
    this.previewVideo = '';
    this.itemSaved = false;
  }

  editItem(item: FurnitureItem) {
    this.editingItem = { ...item };
    this.newItem = {
      name: item.name,
      category: item.category,
      description: item.description || '',
      imageUrl: item.imageUrl,
      additionalImages: item.additionalImages ? [...item.additionalImages] : [],
      videoUrl: item.videoUrl || '',
      price: item.price || ''
    };
    this.newAdditionalImageUrl = '';
    this.previewImage = item.imageUrl;
    this.previewVideo = item.videoUrl || '';
    this.showAddItemForm = true;
    this.itemSaved = false;
  }

  openAddPhotosFor(item: FurnitureItem) {
    this.editItem(item);
    setTimeout(() => {
      const el = document.querySelector('.additional-photos-group');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  }

  onImageUrlChange() { this.previewImage = this.newItem.imageUrl; }
  onVideoUrlChange() { this.previewVideo = this.newItem.videoUrl || ''; }

  onItemPhotoFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    this.isUploading = true;
    this.uploadMsg = 'Uploading photo to server...';

    this.furnitureService.uploadFile(file).subscribe({
      next: (res) => {
        this.newItem.imageUrl = res.url;
        this.previewImage = res.url;
        this.isUploading = false;
        this.uploadMsg = 'Photo uploaded successfully!';
        setTimeout(() => this.uploadMsg = '', 2000);
      },
      error: () => {
        // Fallback to base64 reader
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          this.newItem.imageUrl = result;
          this.previewImage = result;
          this.isUploading = false;
          this.uploadMsg = 'Photo attached!';
          setTimeout(() => this.uploadMsg = '', 2000);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  onItemVideoFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    this.isUploading = true;
    this.uploadMsg = 'Uploading video file...';

    this.furnitureService.uploadFile(file).subscribe({
      next: (res) => {
        this.newItem.videoUrl = res.url;
        this.previewVideo = res.url;
        this.isUploading = false;
        this.uploadMsg = 'Video uploaded successfully!';
        setTimeout(() => this.uploadMsg = '', 2000);
      },
      error: () => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          this.newItem.videoUrl = result;
          this.previewVideo = result;
          this.isUploading = false;
          this.uploadMsg = 'Video attached!';
          setTimeout(() => this.uploadMsg = '', 2000);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  onAdditionalPhotosFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const files = Array.from(input.files);
    this.isUploading = true;
    this.uploadMsg = `Uploading ${files.length} related photo(s)...`;

    if (!this.newItem.additionalImages) {
      this.newItem.additionalImages = [];
    }

    let completed = 0;
    for (const file of files) {
      this.furnitureService.uploadFile(file).subscribe({
        next: (res) => {
          this.newItem.additionalImages!.push(res.url);
          completed++;
          if (completed === files.length) {
            this.isUploading = false;
            this.uploadMsg = `All ${files.length} related photo(s) uploaded!`;
            setTimeout(() => this.uploadMsg = '', 2500);
          }
        },
        error: () => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
              this.newItem.additionalImages!.push(result);
            }
            completed++;
            if (completed === files.length) {
              this.isUploading = false;
              this.uploadMsg = 'Photos attached!';
              setTimeout(() => this.uploadMsg = '', 2500);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
    input.value = '';
  }

  addAdditionalImageUrl() {
    const url = (this.newAdditionalImageUrl || '').trim();
    if (!url) return;
    if (!this.newItem.additionalImages) {
      this.newItem.additionalImages = [];
    }
    this.newItem.additionalImages.push(url);
    this.newAdditionalImageUrl = '';
  }

  removeAdditionalImage(index: number) {
    if (this.newItem.additionalImages) {
      this.newItem.additionalImages.splice(index, 1);
    }
  }

  makePhotoPrimary(index: number) {
    if (!this.newItem.additionalImages || !this.newItem.additionalImages[index]) return;
    const selected = this.newItem.additionalImages[index];
    const oldPrimary = this.newItem.imageUrl;

    this.newItem.imageUrl = selected;
    this.previewImage = selected;

    if (oldPrimary) {
      this.newItem.additionalImages[index] = oldPrimary;
    } else {
      this.newItem.additionalImages.splice(index, 1);
    }
  }

  saveItem() {
    if (!this.newItem.name || !this.newItem.imageUrl) return;
    const id = this.editingItem?._id || (this.editingItem?.id as any);
    this.itemSaved = true;
    if (this.editingItem && id) {
      this.furnitureService.updateFurnitureItem(String(id), this.newItem).subscribe();
    } else {
      this.furnitureService.addFurnitureItem(this.newItem).subscribe();
    }
    setTimeout(() => this.cancelItemForm(), 400);
  }

  deleteItem(item: FurnitureItem) {
    const id = String(item._id || item.id);
    if (confirm(`Delete "${item.name}"?`)) {
      this.furnitureService.deleteFurnitureItem(id, item.name).subscribe({
        error: (err) => alert(this.formatApiError(err))
      });
    }
  }

  cancelItemForm() {
    this.showAddItemForm = false;
    this.editingItem = null;
    this.newItem = this.blankItem();
    this.newAdditionalImageUrl = '';
    this.previewImage = '';
    this.previewVideo = '';
    this.itemSaved = false;
  }

  copyShareLink(item: FurnitureItem) {
    const id = item._id || item.id;
    const link = window.location.origin + '/gallery?id=' + id;
    navigator.clipboard.writeText(link);
    alert('Share link copied to clipboard: ' + link);
  }

  // ════════════════════════════════════════════════════════════════
  // 2. VIDEOS SHOWCASE
  // ════════════════════════════════════════════════════════════════
  blankVideo() {
    return { title: '', description: '', videoUrl: '', thumbnailUrl: '', category: 'Workshop' };
  }

  openAddVideoForm() {
    this.showAddVideoForm = true;
    this.editingVideo = null;
    this.newVideo = this.blankVideo();
    this.videoSaved = false;
  }

  editVideo(vid: VideoItem) {
    this.editingVideo = { ...vid };
    this.newVideo = {
      title: vid.title,
      description: vid.description || '',
      videoUrl: vid.videoUrl,
      thumbnailUrl: vid.thumbnailUrl || '',
      category: vid.category || 'Workshop'
    };
    this.showAddVideoForm = true;
    this.videoSaved = false;
  }

  onVideoFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    this.isUploading = true;
    this.uploadMsg = 'Uploading video file (this may take a moment)...';

    this.furnitureService.uploadFile(file).subscribe({
      next: (res) => {
        this.newVideo.videoUrl = res.url;
        this.isUploading = false;
        this.uploadMsg = 'Video uploaded successfully!';
        setTimeout(() => this.uploadMsg = '', 2000);
      },
      error: () => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.newVideo.videoUrl = e.target?.result as string;
          this.isUploading = false;
          this.uploadMsg = 'Video attached locally!';
          setTimeout(() => this.uploadMsg = '', 2000);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  onVideoThumbnailFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    this.furnitureService.uploadFile(file).subscribe({
      next: (res) => { this.newVideo.thumbnailUrl = res.url; },
      error: () => {
        const reader = new FileReader();
        reader.onload = (e) => { this.newVideo.thumbnailUrl = e.target?.result as string; };
        reader.readAsDataURL(file);
      }
    });
  }

  saveVideo() {
    if (!this.newVideo.title || !this.newVideo.videoUrl) return;
    const id = this.editingVideo?._id || (this.editingVideo?.id as any);
    this.videoSaved = true;
    if (this.editingVideo && id) {
      this.furnitureService.updateVideo(String(id), this.newVideo).subscribe();
    } else {
      this.furnitureService.addVideo(this.newVideo).subscribe();
    }
    setTimeout(() => this.cancelVideoForm(), 400);
  }

  deleteVideo(vid: VideoItem) {
    const id = String(vid._id || vid.id);
    if (confirm(`Delete video "${vid.title}"?`)) {
      this.furnitureService.deleteVideo(id, vid.title).subscribe({
        error: (err) => alert(this.formatApiError(err))
      });
    }
  }

  cancelVideoForm() {
    this.showAddVideoForm = false;
    this.editingVideo = null;
    this.newVideo = this.blankVideo();
    this.videoSaved = false;
  }

  // ════════════════════════════════════════════════════════════════
  // 3. WORK INFORMATION
  // ════════════════════════════════════════════════════════════════
  blankWork() {
    return { title: '', description: '', icon: '🪑', imageUrl: '', videoUrl: '', order: 1 };
  }

  openAddWorkForm() {
    this.showAddWorkForm = true;
    this.editingWork = null;
    this.newWork = this.blankWork();
    this.workSaved = false;
  }

  editWork(item: WorkInfo) {
    this.editingWork = { ...item };
    this.newWork = {
      title: item.title,
      description: item.description,
      icon: item.icon,
      imageUrl: item.imageUrl || '',
      videoUrl: item.videoUrl || '',
      order: item.order ?? 1
    };
    this.showAddWorkForm = true;
    this.workSaved = false;
  }

  onWorkPhotoFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    this.furnitureService.uploadFile(file).subscribe({
      next: (res) => { this.newWork.imageUrl = res.url; },
      error: () => {
        const reader = new FileReader();
        reader.onload = (e) => { this.newWork.imageUrl = e.target?.result as string; };
        reader.readAsDataURL(file);
      }
    });
  }

  saveWork() {
    if (!this.newWork.title || !this.newWork.description) return;
    const id = this.editingWork?._id || (this.editingWork?.id as any);
    this.workSaved = true;
    if (this.editingWork && id) {
      this.furnitureService.updateWorkInfo(String(id), this.newWork).subscribe();
    } else {
      this.furnitureService.addWorkInfo(this.newWork).subscribe();
    }
    setTimeout(() => this.cancelWorkForm(), 400);
  }

  deleteWork(item: WorkInfo) {
    const id = String(item._id || item.id);
    if (confirm(`Delete service "${item.title}"?`)) {
      this.furnitureService.deleteWorkInfo(id, item.title).subscribe({
        error: (err) => alert(this.formatApiError(err))
      });
    }
  }

  cancelWorkForm() {
    this.showAddWorkForm = false;
    this.editingWork = null;
    this.newWork = this.blankWork();
    this.workSaved = false;
  }

  // ════════════════════════════════════════════════════════════════
  // 4. TEAM MEMBERS
  // ════════════════════════════════════════════════════════════════
  blankTeam() {
    return {
      name: '',
      role: '',
      experience: '5+ Years',
      description: '',
      specialty: 'Custom Woodwork',
      emoji: '👨‍💼',
      imageUrl: '',
      phone: '+91 92255 76095',
      order: 1
    };
  }

  openAddTeamForm() {
    this.showAddTeamForm = true;
    this.editingTeam = null;
    this.newTeam = this.blankTeam();
    this.teamSaved = false;
  }

  editTeam(member: TeamMember) {
    this.editingTeam = { ...member };
    this.newTeam = {
      name: member.name,
      role: member.role,
      experience: member.experience,
      description: member.description,
      specialty: member.specialty || '',
      emoji: member.emoji || '👨‍💼',
      imageUrl: member.imageUrl || '',
      phone: member.phone || '',
      order: member.order ?? 1
    };
    this.showAddTeamForm = true;
    this.teamSaved = false;
  }

  onTeamPhotoFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    this.isUploading = true;
    this.uploadMsg = 'Uploading team photo...';

    this.furnitureService.uploadFile(file).subscribe({
      next: (res) => {
        this.newTeam.imageUrl = res.url;
        this.isUploading = false;
        this.uploadMsg = 'Photo uploaded!';
        setTimeout(() => this.uploadMsg = '', 2000);
      },
      error: () => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.newTeam.imageUrl = e.target?.result as string;
          this.isUploading = false;
          this.uploadMsg = 'Photo attached!';
          setTimeout(() => this.uploadMsg = '', 2000);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  saveTeam() {
    if (!this.newTeam.name || !this.newTeam.role) return;
    const id = this.editingTeam?._id || (this.editingTeam?.id as any);
    this.teamSaved = true;
    this.teamActionMsg = `✓ Team member "${this.newTeam.name}" saved successfully!`;
    if (this.editingTeam && id) {
      this.furnitureService.updateTeamMember(String(id), this.newTeam).subscribe();
    } else {
      this.furnitureService.addTeamMember(this.newTeam).subscribe();
    }
    setTimeout(() => {
      this.cancelTeamForm();
      this.teamActionMsg = '';
    }, 400);
  }

  deleteTeam(member: TeamMember) {
    const id = String(member._id || member.id);
    if (confirm(`Are you sure you want to remove team member "${member.name}"?`)) {
      this.furnitureService.deleteTeamMember(id, member.name).subscribe({
        next: () => {
          this.teamActionMsg = `✓ Team member "${member.name}" was removed successfully.`;
          setTimeout(() => this.teamActionMsg = '', 3000);
        },
        error: (err) => {
          alert(this.formatApiError(err));
        }
      });
    }
  }

  cancelTeamForm() {
    this.showAddTeamForm = false;
    this.editingTeam = null;
    this.newTeam = this.blankTeam();
    this.teamSaved = false;
  }

  // ════════════════════════════════════════════════════════════════
  // 5. FEEDBACK
  // ════════════════════════════════════════════════════════════════
  markRead(item: Feedback) {
    const id = String(item._id || item.id);
    this.furnitureService.markFeedbackRead(id).subscribe(() => {
      this.furnitureService.getFeedbacks().subscribe(fbs => this.feedbacks = fbs);
    });
  }

  deleteFeedback(item: Feedback) {
    const id = String(item._id || item.id);
    if (confirm('Delete this feedback?')) {
      this.furnitureService.deleteFeedback(id).subscribe(() => {
        this.furnitureService.getFeedbacks().subscribe(fbs => this.feedbacks = fbs);
      });
    }
  }

  getStars(rating: number): string { return '⭐'.repeat(rating || 0); }

  get newFeedbackCount(): number {
    return this.feedbacks.filter(f => f.status === 'new').length;
  }

  // ════════════════════════════════════════════════════════════════
  // 7. SITE STATS MANAGEMENT
  // ════════════════════════════════════════════════════════════════
  saveSingleStat(stat: SiteStat) {
    const id = String(stat._id || stat.id);
    this.furnitureService.updateStat(id, { value: stat.value, label: stat.label, order: stat.order })
      .subscribe(() => {
        this.statsSaveMsg = `✓ Stat "${stat.label}" updated successfully!`;
        setTimeout(() => this.statsSaveMsg = '', 3000);
      });
  }

  saveAllStats() {
    this.furnitureService.saveAllStats(this.siteStats)
      .subscribe(() => {
        this.statsSaveMsg = '✓ All Home Stats saved successfully to database!';
        setTimeout(() => this.statsSaveMsg = '', 3500);
      });
  }

  startAddStat() {
    this.newStat = { value: '', label: '', order: this.siteStats.length + 1 };
    this.showAddStatForm = true;
    this.editingStat = null;
  }

  cancelStatForm() {
    this.showAddStatForm = false;
    this.editingStat = null;
    this.newStat = { value: '', label: '', order: 0 };
  }

  submitNewStat() {
    if (!this.newStat.value || !this.newStat.label) return;
    this.furnitureService.addStat(this.newStat).subscribe(() => {
      this.statsSaveMsg = '✓ New Stat created & published!';
      this.cancelStatForm();
      setTimeout(() => this.statsSaveMsg = '', 3000);
    });
  }

  deleteSiteStat(stat: SiteStat) {
    if (confirm(`Are you sure you want to delete "${stat.label}" (${stat.value})?`)) {
      const id = String(stat._id || stat.id);
      this.furnitureService.deleteStat(id).subscribe(() => {
        this.statsSaveMsg = '✓ Stat removed successfully.';
        setTimeout(() => this.statsSaveMsg = '', 3000);
      });
    }
  }
}
