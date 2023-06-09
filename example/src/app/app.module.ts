import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { AuthenticationModule, DataService } from './shared';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    AuthenticationModule,
    AppRoutingModule,
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
  ],
  bootstrap: [
    AppComponent,
  ],
  providers: [DataService],
})
export class AppModule { }
