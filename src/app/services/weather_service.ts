
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class WeatherService {

   public url: String;
   private apiKey: String;

   constructor(

      private _http: HttpClient
   ) {
      this.apiKey = 'f8c970cc1f1744449e2192817211908';
      this.url = `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}`;
   }

   getWeather(query: String): Observable<any> {

      const result = this._http.get(this.url + '&q=' + query);
      
      return result;
   }
}