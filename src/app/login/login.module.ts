import { NgModule } from '@angular/core';

import { SharedModule } from 'app/shared/shared.module';
import { LoginComponent } from 'app/login/login.component';
import { ForgotPasswordComponent } from 'app/login/forgot-password.component';
import { ChangeForgottenPasswordComponent } from 'app/login/change-forgotten-password.component';

/**
 * Module comprising the login functionality
 */
@NgModule({
  declarations: [
    LoginComponent,
    ForgotPasswordComponent,
    ChangeForgottenPasswordComponent
  ],
  imports: [
    SharedModule
  ]
})
export class LoginModule { }
