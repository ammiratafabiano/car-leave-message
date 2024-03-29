import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { ResponseModel } from '../models/response.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private endpoint = 'https://ammiratafabiano.dev:3440';

  constructor(private http: HttpClient) { }

  // Handle API errors
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }

  sendMessage(sender: string, content: string, phone: string): Observable<ResponseModel<any>> {
    return this.http
      .post<ResponseModel<any>>(this.endpoint + '/car/leaveMessage', { sender, content, phone })
      .pipe(
        catchError(this.handleError)
      );
  }

}
