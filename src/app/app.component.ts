import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent implements OnInit{
  title = 'clima-app';
  public query = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ){}

  ngOnInit(): void {
    
    this.route.queryParams.subscribe(params => {
      let query = params['q'];
      this.query = query;

    });

  }

  onSubmit(f: NgForm) {
  
    return this.router.navigate(['/result'], {
      queryParams: {
        q: f.value.q
      }
    });
  }

}
