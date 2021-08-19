
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { WeatherService } from "../services/weather_service";
import { Weather, Convert } from "../models/weather";


@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
  providers: [WeatherService]
})
export class ResultComponent implements OnInit {

  public weather: Weather[];
  public query: String;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _weatherService: WeatherService
  ) { }

  ngOnInit(): void {
    this.getData();
  }



  getData() {

    this._route.queryParams.subscribe(params => {
      let query = params['q'];

      this.query = query;
      if(query == undefined || query == "") return;

      this._weatherService.getWeather(query).subscribe(
        response => {
          this.weather = response;
        },
        error => {
          console.log(error);
        }
      );
    });

  }

}
