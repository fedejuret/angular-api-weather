// import router modules
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// import components

import { HomeComponent } from "./home/home.component";
import { ResultComponent } from "./result/result.component";

// create routes array
const appRoutes: Routes = [

   { path: '', component: HomeComponent },
   { path: 'home', component: HomeComponent },
   { path: 'result', component: ResultComponent },
   { path: '**', component: HomeComponent }
];

// export configuration
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders<any> = RouterModule.forRoot(appRoutes);