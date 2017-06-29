// Import Angular
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

// Import models


@Injectable()
export class InvoiceService {

  // Local API route (Example)
  // private api: String = '/api';

  /**
   * constructor for invoice service: communicates with Invoice endpoints
   * @param  {Http}   privatehttp HTTP for GET and POST
   */
  constructor(private http: Http) { }

  /**
   * Example
   */
  // getEndpoint(): Promise<Model[]> {
  //   return this.http.get(`${this.api}/Endpoint`)
  //              .toPromise()
  //              .then(response => response.json() as Model[])
  //              .catch(this.handleError);
  // }

  /**
  * Handle any errors that may occur.
  */
  private handleError (error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Promise.reject(errMsg);
  }

}
