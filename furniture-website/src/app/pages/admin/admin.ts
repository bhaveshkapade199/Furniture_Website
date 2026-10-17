import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FurnitureService, FurnitureItem, Feedback, WorkInfo, TeamMember, VideoItem, CustomOrder } from '../../services/furniture';

type AdminTab = 'gallery' | 'videos' | 'workinfo' | 'team' | 'feedback' | 'orders';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit, OnDestroy {
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

  constructor(private furnitureService: FurnitureService) {}

  ngOnInit() {
    // For strict security: always require password authentication upon opening Admin Panel
    this.furnitureService.adminLogout();
    this.isLoggedIn = false;
    this.categories = this.furnitureService.getCategories();
  }

  ngOnDestroy() {
    // Automatically revoke admin session when leaving the admin panel
    this.logout();
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
    this.furnitureService.getFurnitureItems().subscribe(items => this.furnitureItems = items);
    this.furnitureService.getVideos().subscribe(vids => this.videos = vids);
    this.furnitureService.getWorkInfo().subscribe(info => this.workInfoItems = info);
    this.furnitureService.getTeamMembers().subscribe(team => this.teamMembers = team);
    this.furnitureService.getFeedbacks().subscribe(fbs => this.feedbacks = fbs);
    this.furnitureService.getCustomOrders().subscribe(orders => this.customOrders = orders);
  }

  // ---- Tabs ----
  setTab(tab: AdminTab) {
    this.activeTab = tab;
    this.cancelItemForm();
    this.cancelVideoForm();
    this.cancelWorkForm();
    this.cancelTeamForm();
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
  // ════════════════════════════════════════════════════════════════
  blankItem() {
    return { name: '', category: 'Sofa Set', description: '', imageUrl: '', videoUrl: '', price: '' };
  }

  openAddItemForm() {
    this.showAddItemForm = true;
    this.editingItem = null;
    this.newItem = this.blankItem();
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
      videoUrl: item.videoUrl || '',
      price: item.price
    };
    this.previewImage = item.imageUrl;
    this.previewVideo = item.videoUrl || '';
    this.showAddItemForm = true;
    this.itemSaved = false;
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

  saveItem() {
    if (!this.newItem.name || !this.newItem.imageUrl || !this.newItem.price) return;
    const id = this.editingItem?._id || (this.editingItem?.id as any);
    if (this.editingItem && id) {
      this.furnitureService.updateFurnitureItem(String(id), this.newItem).subscribe(() => {
        this.furnitureService.getFurnitureItems().subscribe(items => this.furnitureItems = items);
        this.itemSaved = true;
        setTimeout(() => this.cancelItemForm(), 1200);
      });
    } else {
      this.furnitureService.addFurnitureItem(this.newItem).subscribe(() => {
        this.furnitureService.getFurnitureItems().subscribe(items => this.furnitureItems = items);
        this.itemSaved = true;
        setTimeout(() => this.cancelItemForm(), 1200);
      });
    }
  }

  deleteItem(item: FurnitureItem) {
    const id = String(item._id || item.id);
    if (confirm(`Delete "${item.name}"?`)) {
      this.furnitureService.deleteFurnitureItem(id).subscribe(() => {
        this.furnitureService.getFurnitureItems().subscribe(items => this.furnitureItems = items);
      });
    }
  }

  cancelItemForm() {
    this.showAddItemForm = false;
    this.editingItem = null;
    this.newItem = this.blankItem();
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
    if (this.editingVideo && id) {
      this.furnitureService.updateVideo(String(id), this.newVideo).subscribe(() => {
        this.furnitureService.getVideos().subscribe(vids => this.videos = vids);
        this.videoSaved = true;
        setTimeout(() => this.cancelVideoForm(), 1200);
      });
    } else {
      this.furnitureService.addVideo(this.newVideo).subscribe(() => {
        this.furnitureService.getVideos().subscribe(vids => this.videos = vids);
        this.videoSaved = true;
        setTimeout(() => this.cancelVideoForm(), 1200);
      });
    }
  }

  deleteVideo(vid: VideoItem) {
    const id = String(vid._id || vid.id);
    if (confirm(`Delete video "${vid.title}"?`)) {
      this.furnitureService.deleteVideo(id).subscribe(() => {
        this.furnitureService.getVideos().subscribe(vids => this.videos = vids);
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
    if (this.editingWork && id) {
      this.furnitureService.updateWorkInfo(String(id), this.newWork).subscribe(() => {
        this.furnitureService.getWorkInfo().subscribe(info => this.workInfoItems = info);
        this.workSaved = true;
        setTimeout(() => this.cancelWorkForm(), 1200);
      });
    } else {
      this.furnitureService.addWorkInfo(this.newWork).subscribe(() => {
        this.furnitureService.getWorkInfo().subscribe(info => this.workInfoItems = info);
        this.workSaved = true;
        setTimeout(() => this.cancelWorkForm(), 1200);
      });
    }
  }

  deleteWork(item: WorkInfo) {
    const id = String(item._id || item.id);
    if (confirm(`Delete service "${item.title}"?`)) {
      this.furnitureService.deleteWorkInfo(id).subscribe(() => {
        this.furnitureService.getWorkInfo().subscribe(info => this.workInfoItems = info);
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
      phone: '+91 98765 43210',
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
    if (this.editingTeam && id) {
      this.furnitureService.updateTeamMember(String(id), this.newTeam).subscribe(() => {
        this.furnitureService.getTeamMembers().subscribe(team => this.teamMembers = team);
        this.teamSaved = true;
        this.teamActionMsg = `✓ Team member "${this.newTeam.name}" updated successfully!`;
        setTimeout(() => {
          this.cancelTeamForm();
          this.teamActionMsg = '';
        }, 1500);
      });
    } else {
      this.furnitureService.addTeamMember(this.newTeam).subscribe(() => {
        this.furnitureService.getTeamMembers().subscribe(team => this.teamMembers = team);
        this.teamSaved = true;
        this.teamActionMsg = `✓ New team member "${this.newTeam.name}" added successfully!`;
        setTimeout(() => {
          this.cancelTeamForm();
          this.teamActionMsg = '';
        }, 1500);
      });
    }
  }

  deleteTeam(member: TeamMember) {
    const id = String(member._id || member.id);
    if (confirm(`Are you sure you want to remove team member "${member.name}"?`)) {
      this.teamMembers = this.teamMembers.filter(m => String(m._id || m.id) !== id);
      this.furnitureService.deleteTeamMember(id).subscribe({
        next: () => {
          this.teamActionMsg = `✓ Team member "${member.name}" was removed successfully.`;
          setTimeout(() => this.teamActionMsg = '', 3000);
          this.furnitureService.getTeamMembers().subscribe(team => this.teamMembers = team);
        },
        error: () => {
          this.furnitureService.getTeamMembers().subscribe(team => this.teamMembers = team);
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
}
