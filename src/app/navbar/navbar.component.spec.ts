<<<<<<< Updated upstream
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
=======
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule,
        NavbarComponent
      ],
      providers: [AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle menu state when toggleMenu is called', () => {
    component.toggleMenu();
    expect(component.menuOpen).toBe(true);
    component.toggleMenu();
    expect(component.menuOpen).toBe(false);
  });

  it('should close menu when closeNavbar is called', () => {
    component.menuOpen = true;
    component.closeNavbar();
    expect(component.menuOpen).toBe(false);
  });

  it('should update user info and roles correctly', () => {
    const mockUser = { nombre: 'Test User', rol: 'superadmin' };
    spyOn(authService, 'getUserInfo').and.returnValue(mockUser);
    component.updateUser();
    expect(component.isLoggedIn).toBe(true);
    expect(component.isSuperadmin).toBe(true);
    expect(component.isAdmin).toBe(true);
    expect(component.isProductor).toBe(true);
  });

  it('should handle logout correctly', () => {
    spyOn(authService, 'logout');
    spyOn(component['router'], 'navigate');
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
    expect(component.isLoggedIn).toBe(false);
    expect(component.menuOpen).toBe(false);
    expect(component['router'].navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should update isMobileView based on window width', () => {
    window.innerWidth = 800;
    component.checkMobileView();
    expect(component.isMobileView).toBe(true);
    window.innerWidth = 1000;
    component.checkMobileView();
    expect(component.isMobileView).toBe(false);
  });
});
>>>>>>> Stashed changes
