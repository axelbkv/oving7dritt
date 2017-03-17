// @flow

import 'babel-polyfill';
import 'zone.js/dist/zone'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgModule, Component }      from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  template: '<div>Menu: <a href="/#/">Customers</a></div>'
})
class MenuComponent {}

class CustomerService {
  static instance=null;
  lastId=0;
  customers=[];
  
  // Return singleton
  static get() {
    if(!CustomerService.instance)
      CustomerService.instance=new CustomerService();
    return CustomerService.instance;
  }
  
  constructor() {
    this.customers.push({id: ++this.lastId, name: "Ola", city: "Trondheim"});
    this.customers.push({id: ++this.lastId, name: "Kari", city: "Oslo"});
    this.customers.push({id: ++this.lastId, name: "Per", city: "Tromsø"});
  }
  
  // Returns a manually created promise since we are later going to use fetch(),
  // which also returns a promise, to perform an http request.
  getCustomers() {
    return new Promise((resolve, reject)=>{
      var customer_id_and_names=[];
      for(var c=0;c<this.customers.length;c++) {
        customer_id_and_names.push({id: this.customers[c].id, name: this.customers[c].name});
      }
      resolve(customer_id_and_names);
    });
  }
  
  getCustomer(customerId) {
    return new Promise((resolve, reject)=>{
      for(var c=0;c<this.customers.length;c++) {
        if(this.customers[c].id==customerId) {
          resolve(this.customers[c]);
          return;
        }
      }
      reject("Customer not found");
    });
  }
  
  addCustomer(name, city) {
    return new Promise((resolve, reject)=>{
      if(name && city) {
        this.customers.push({id: ++this.lastId, name: name, city: city});
        resolve(this.lastId);
        return;
      }
      reject("name or city empty");
    });
  }
}

@Component({
  template: `<div>status: {{status}}</div>
             <ul>
               <li *ngFor="let customer of customers">
                 <a href="#/customer/{{customer.id}}">{{customer.name}}</a>
               </li>
             </ul>
             <form (ngSubmit)="$event.preventDefault(); onNewCustomer();" #newCustomerForm="ngForm">
               <input type="text" id="name" required name="name" [(ngModel)]="newCustomerName">
               <input type="text" id="city" required name="city" [(ngModel)]="newCustomerCity">
               <button type="submit" [disabled]="!newCustomerForm.form.valid">New Customer</button>
             </form>`
})
class CustomerListComponent {
  status="";
  customers=[];
  newCustomerName="";
  newCustomerCity="";
  
  constructor() {
    CustomerService.get().getCustomers().then((result)=>{
      this.status="successfully loaded customer list";
      this.customers=result;
    }).catch((reason)=>{
      this.status="error: "+reason;
    });
  }
  
  onNewCustomer() {
    CustomerService.get().addCustomer(this.newCustomerName, this.newCustomerCity).then((result)=>{
      this.status="successfully added new customer";
      this.customers.push({id: result, name: this.newCustomerName, city: this.newCustomerCity});
      this.newCustomerName="";
      this.newCustomerCity="";
    }).catch((reason)=>{
      this.status="error: "+reason;
    });
  }
}

@Component({
  template: `<div>status: {{status}}</div>
             <ul>
               <li>name: {{customer.name}}</li>
               <li>city: {{customer.city}}</li>
             </ul>`
})
class CustomerDetailsComponent {
  status="";
  customer={};
  
  constructor(route: ActivatedRoute) {
    CustomerService.get().getCustomer(route.params.value.id).then((result)=>{
      this.status="successfully loaded customer details";
      this.customer=result;
    }).catch((reason)=>{
      this.status="error: "+reason;
    });
  }
}

@Component({
  selector: 'app',
  template: `<app-menu></app-menu>
             <router-outlet></router-outlet>`
})
class AppComponent {}

const routing = RouterModule.forRoot([
  { path: '', component: CustomerListComponent },
  { path: 'customer/:id', component: CustomerDetailsComponent },
]);

@NgModule({
  imports:      [ BrowserModule, routing, FormsModule ],
  declarations: [ MenuComponent, CustomerListComponent, CustomerDetailsComponent, AppComponent ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap:    [ AppComponent ]
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
